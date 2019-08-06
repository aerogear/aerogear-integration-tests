import { DataSyncConfig, OfflineClient } from "@aerogear/voyager-client";
import { ApolloOfflineClient } from "@aerogear/voyager-client/types/ApolloOfflineClient";
import { gql, VoyagerServer } from "@aerogear/voyager-server";
import { expect } from "chai";
import * as express from "express";
import * as http from "http";
import { updateNetwork } from "../../util/browserStack";
import {
    BROWSERSTACK_APP,
    MOBILE_PLATFORM,
    MobilePlatform,
    SYNC_PORT,
} from "../../util/config";
import { device } from "../../util/device";
import {
    generateMobileServices,
    generateSyncService,
} from "../../util/mobileServices";
import { ONE_SECOND, sleep } from "../../util/time";
import { ToggleNetworkStatus } from "../../util/ToggleNetworkStatus";

interface Universe {
    toggleNetworkStatus: ToggleNetworkStatus;
    itemsQuery: any;
    offlineClient: OfflineClient;
    apolloClient: ApolloOfflineClient;
    offlineChangePromise: Promise<any>;
}

describe("data sync", function() {
    this.timeout(0);

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
            device.execute(async (_, { toggleNetworkStatus }: Universe) => {
                toggleNetworkStatus.goOffline();
            });
        } else {
            updateNetwork(device.browser.sessionId, "no-network");
        }
    };

    const goOnline = () => {
        if (useToggleNetworkStatus) {
            device.execute(async (_, { toggleNetworkStatus }: Universe) => {
                toggleNetworkStatus.goOnline();
            });
        } else {
            updateNetwork(device.browser.sessionId, "reset");
        }
    };

    before("initialize offline client", async () => {
        const mobileServices = generateMobileServices([generateSyncService()]);

        await device.execute(
            async (
                modules,
                universe: Universe,
                mobileServices,
                useToggleNetworkStatus
            ) => {
                const { init } = modules["@aerogear/app"];
                const { OfflineClient } = modules["@aerogear/voyager-client"];
                const { gql } = modules["graphql-tag"];
                const { getUpdateFunction } = modules["offix-cache"];
                const { ToggleNetworkStatus } = modules[
                    "../util/ToggleNetworkStatus"
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
                    create: getUpdateFunction({
                        mutationName: "create",
                        updateQuery: itemsQuery,
                    }),
                };

                const options: DataSyncConfig = {
                    mutationCacheUpdates: cacheUpdates,
                    openShiftConfig: app.config,
                };

                if (useToggleNetworkStatus) {
                    // Use ToggleNetworkStatus when testing on local device or iOS
                    const networkStatus = new ToggleNetworkStatus();

                    universe.toggleNetworkStatus = networkStatus;
                    options.networkStatus = networkStatus;
                }

                const offlineClient = new OfflineClient(options);
                universe.apolloClient = await offlineClient.init();
                universe.offlineClient = offlineClient;
            },
            mobileServices,
            useToggleNetworkStatus
        );
    });

    it("should perform the query", async () => {
        const items = await device.execute(
            async (_, { apolloClient, itemsQuery }: Universe) => {
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

    it("should perform the offline mutation", async () => {
        goOffline();

        await sleep(5 * ONE_SECOND);

        await device.execute(async (modules, universe: Universe) => {
            const { gql } = modules["graphql-tag"];
            const { offlineClient, itemsQuery } = universe;

            try {
                await offlineClient.offlineMutate({
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

    it("should see the updated cache", async () => {
        const items = await device.execute(
            async (_, { apolloClient, itemsQuery }: Universe) => {
                const result = await apolloClient.query({
                    query: itemsQuery,
                });

                return result.data.items;
            }
        );

        expect(items).not.empty;
        expect(items[0].title).eq("test");
    });

    it("should sync the changes when going back online", async () => {
        goOnline();

        const items = await device.execute(
            async (
                modules,
                { apolloClient, itemsQuery, offlineChangePromise }: Universe
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
