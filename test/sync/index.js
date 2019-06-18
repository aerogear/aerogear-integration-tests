require('chai').should();
const express = require('express');
const { VoyagerServer, gql } = require('@aerogear/voyager-server');

const { setNetwork } = require('../../util/network');

describe('Data Sync', function() {
  this.timeout(0);
  
  let expressServer;
  let serverItems = [];
  let numItems = 0;

  it('should run the voyager server', async function() {
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
        }
      },
      
      Mutation: {
        create: (_, args) => {
          const newItem = {
            id: numItems++,
            title: args.title
          };
          serverItems.push(newItem);
          return newItem;
        }
      }
    };

    const server = VoyagerServer({
      typeDefs,
      resolvers
    });

    const app = express();
    server.applyMiddleware({ app });

    expressServer = app.listen(4000);
  });

  it('should initialize voyager client', async function() {
    await client.executeAsync(async (platform, done) => {
      try {
        const {
          app,
          agSync: {
            OfflineClient,
            CordovaNetworkStatus
          },
          gql,
          ToggleNetworkStatus,
          offixCache: {
            CacheOperation,
            getUpdateFunction
          }
        } = window.aerogear;

        let networkStatus;

        if (platform === 'ios') {
          // this is workaround for iOS as BrowserStack does not support
          // putting iOS devices offline
          networkStatus = new ToggleNetworkStatus();
        } else {
          networkStatus = new CordovaNetworkStatus();
        }
        
        window.aerogear.networkStatus = networkStatus;

        const itemsQuery = gql`
          query items {
            items {
              id
              title
            }
          }
        `;
        window.aerogear.itemsQuery = itemsQuery;

        const cacheUpdates = {
          create: getUpdateFunction('create', 'id', itemsQuery, CacheOperation.ADD)
        };
      
        const options = {
          openShiftConfig: app.config,
          networkStatus,
          mutationCacheUpdates: cacheUpdates
        };

        const offlineClient = new OfflineClient(options);

        window.aerogear.offlineStore = offlineClient.offlineStore;

        const apolloClient = await offlineClient.init();

        window.aerogear.apolloClient = apolloClient;

        done();
      } catch (error) {
        done({ error: error.message });
      }
    }, process.env.MOBILE_PLATFORM);
  });

  it('should perform query', async function() {
    const result = await client.executeAsync(async done => {
      try {
        const { apolloClient, itemsQuery } = window.aerogear;

        const { data } = await apolloClient.query({
          query: itemsQuery,
          fetchPolicy: 'network-only',
          errorPolicy: 'none'
        });

        done({ data: data.items });
      } catch (error) {
        done({ error: error.message });
      }
    });

    result.data.should.deep.equal([]);
  });

  it('should perform offline mutation', async function() {
    if (process.env.MOBILE_PLATFORM === 'ios') {
      client.execute(() => {
        const { networkStatus } = window.aerogear;
        networkStatus.setOnline(false);
      });
    } else {
      await setNetwork('no-network');
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    await client.executeAsync(async done => {
      try {
        const { apolloClient, gql, itemsQuery } = window.aerogear;

        await apolloClient.offlineMutation({
          mutation: gql`
            mutation create($title: String!) {
              create(title: $title) {
                id
                title
              }
            }
          `,
          variables: { title: 'test' },
          updateQuery: itemsQuery,
          typeName: 'Item'
        });

        done({ error: 'network error offline was not thrown' });
      } catch (error) {
        if (error.networkError && error.networkError.offline) {
          const offlineError = error.networkError;
          window.aerogear.offlineChangePromise = offlineError.watchOfflineChange();
          done();
          return;
        }

        done({ error: error.message });
      }
    });
  });

  it('should see updated cache', async function() {
    const result = await client.executeAsync(async done => {
      try {
        const { apolloClient, itemsQuery } = window.aerogear;

        const { data } = await apolloClient.query({
          query: itemsQuery
        });

        done({ data: data.items });
      } catch (error) {
        done({ error: error.message });
      }
    });

    result.data.length.should.equal(1);
    result.data[0].title.should.equal('test');
  });

  it('should sync changes when going online', async function() {
    if (process.env.MOBILE_PLATFORM === 'ios') {
      client.execute(() => {
        const { networkStatus } = window.aerogear;
        networkStatus.setOnline(true);
      });
    } else {
      await setNetwork('reset');
    }

    const result = await client.executeAsync(async done => {
      try {
        const { apolloClient, itemsQuery, offlineChangePromise } = window.aerogear;
        
        await offlineChangePromise;

        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data } = await apolloClient.query({
          query: itemsQuery
        });

        done({ data: data.items });
      } catch (error) {
        done({ error: error.message });
      }
    });

    result.data.should.deep.equal([{
      __typename: 'Item',
      id: '0',
      title: 'test'
    }]);
    serverItems.should.deep.equal([{
      id: 0,
      title: 'test'
    }]);
  });

  it('shouold stop voyager server', async function() {
    expressServer.close();
  });
});
