import { ApolloOfflineClient } from "@aerogear/voyager-client/types/ApolloOfflineClient";
import { gql, VoyagerServer } from "@aerogear/voyager-server";
import { expect } from "chai";
import * as express from "express";
import * as http from "http";
import { NetworkStatus, OfflineStore } from "offix-offline";
import { updateNetwork } from "../../util/browserStack";
import {
    BROWSERSTACK_APP,
    MOBILE_PLATFORM,
    MobilePlatform,
    SYNC_PORT,
} from "../../util/config";
import { bootstrapDevice, Device } from "../../util/device";
import {
    generateMobileServices,
    generateSyncService,
} from "../../util/mobileServices";
import { ONE_SECOND, sleep } from "../../util/time";
import { ToggleNetworkStatus } from "../../util/ToggleNetworkStatus";

// const { setNetwork } = require("../../util/network");

interface Universe {
    networkStatus: ToggleNetworkStatus;
    itemsQuery: any;
    offlineStore: OfflineStore;
    apolloClient: ApolloOfflineClient;
    offlineChangePromise: Promise<any>;
}

describe("data sync", function() {
    this.timeout(0);

    let device: Device;

    before("boot device", async () => {
        device = await bootstrapDevice();
    });

    let expressServer: http.Server;
    const serverItems = [];
    let numItems = 0;

    before("start voyager server", async () => {
        const typeDefs = gql`
            type Item {
                id: ID!
                title: String!
            }

            type Query {
                items: [Item]
            }

            type Mutation {
                create(title: String!): Item
            }
        `;

        const resolvers = {
            Query: {
                items: () => {
                    return serverItems;
                },
            },

            Mutation: {
                create: (_, args) => {
                    const newItem = {
                        id: numItems++,
                        title: args.title,
                    };
                    serverItems.push(newItem);
                    return newItem;
                },
            },
        };

        const server = VoyagerServer(
            {
                resolvers,
                typeDefs,
            },
            {}
        );

        const app = express();
        server.applyMiddleware({ app });

        expressServer = app.listen(SYNC_PORT);
    });

    after("stop voyager server", async () => {
        expressServer.close();
    });

    const useToggleNetworkStatus =
        MOBILE_PLATFORM === MobilePlatform.IOS ||
        BROWSERSTACK_APP === undefined;

    const goOffline = () => {
        if (useToggleNetworkStatus) {
            device.execute(async (_, { networkStatus }: Universe) => {
                networkStatus.goOffline();
            });
        } else {
            updateNetwork(device.browser.sessionId, "no-network");
        }
    };

    const goOnline = () => {
        if (useToggleNetworkStatus) {
            device.execute(async (_, { networkStatus }: Universe) => {
                networkStatus.goOnline();
            });
        } else {
            updateNetwork(device.browser.sessionId, "reset");
        }
    };

    before("initialize ToggleNetworkStatus", async () => {
        // Initialize ToggleNetworkStatus if testing on iOS or without BrowserStack
        if (useToggleNetworkStatus) {
            await device.execute(async (modules, universe: Universe) => {
                const { ToggleNetworkStatus } = modules[
                    "../util/ToggleNetworkStatus"
                ];

                // this is workaround for iOS as BrowserStack does not support
                // putting iOS devices offline
                universe.networkStatus = new ToggleNetworkStatus();
            });
        }
    });

    before("initialize offline client", async () => {
        const mobileServices = generateMobileServices([generateSyncService()]);

        await device.execute(
            async (modules, universe: Universe, mobileServices) => {
                const { init } = modules["@aerogear/app"];
                const { OfflineClient } = modules["@aerogear/voyager-client"];
                const { gql } = modules["graphql-tag"];
                const { CacheOperation, getUpdateFunction } = modules[
                    "offix-cache"
                ];

                const app = init(mobileServices);

                const itemsQuery = gql(`
                    query items {
                        items {
                            id
                            title
                        }
                    }
                `);
                universe.itemsQuery = itemsQuery;

                const cacheUpdates = {
                    create: getUpdateFunction(
                        "create",
                        "id",
                        CacheOperation.ADD,
                        itemsQuery
                    ),
                };

                const options = {
                    mutationCacheUpdates: cacheUpdates,
                    networkStatus: universe.networkStatus,
                    openShiftConfig: app.config,
                };

                const offlineClient = new OfflineClient(options);

                universe.offlineStore = offlineClient.offlineStore;

                universe.apolloClient = await offlineClient.init();
            },
            mobileServices
        );
    });

    it("should perform query", async () => {
        const items = await device.execute(
            async (_, { apolloClient, itemsQuery }) => {
                const result = await apolloClient.query({
                    errorPolicy: "none",
                    fetchPolicy: "network-only",
                    query: itemsQuery,
                });

                return result.data.items;
            }
        );

        expect(items).empty;
    });

    it("should perform offline mutation", async () => {
        goOffline();

        await sleep(5 * ONE_SECOND);

        await device.execute(async (modules, universe: Universe) => {
            const { gql } = modules["graphql-tag"];
            const { apolloClient, itemsQuery } = universe;

            try {
                await apolloClient.offlineMutation({
                    mutation: gql(`
                            mutation create($title: String!) {
                                create(title: $title) {
                                    id
                                    title
                                }
                            }
                        `),
                    returnType: "Item",
                    updateQuery: itemsQuery,
                    variables: { title: "test" },
                });

                throw new Error("OfflineError has not been throw");
            } catch (error) {
                if (error.networkError && error.networkError.offline) {
                    const offlineError = error.networkError;

                    universe.offlineChangePromise = offlineError.watchOfflineChange();

                    return;
                }

                throw error;
            }
        });
    });

    it("should see updated cache", async () => {
        const items = await device.execute(async (_, universe) => {
            const { apolloClient, itemsQuery } = universe;

            const result = await apolloClient.query({
                query: itemsQuery,
            });

            return result.data.items;
        });

        expect(items).not.empty;
        expect(items[0].title).eq("test");
    });

    it("should sync changes when going online", async () => {
        goOnline();

        const items = await device.execute(
            async (
                modules,
                { apolloClient, itemsQuery, offlineChangePromise }
            ) => {
                const { sleep, ONE_SECOND } = modules["../util/time"];

                await offlineChangePromise;

                sleep(ONE_SECOND);

                const result = await apolloClient.query({
                    query: itemsQuery,
                });

                return result.data.items;
            }
        );

        expect(items).deep.equal([
            {
                __typename: "Item",
                id: "0",
                title: "test",
            },
        ]);
        expect(serverItems).deep.equal([
            {
                id: 0,
                title: "test",
            },
        ]);
    });
});