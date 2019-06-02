require('chai').should();
const express = require('express');
const { VoyagerServer, gql } = require('@aerogear/voyager-server');

const { setNetwork } = require('../../util/network');

describe('Data Sync', function() {
  this.timeout(0);
  
  let expressServer;
  let serverItems = [];

  it('should run the voyager server', async function() {
    const typeDefs = gql`
      type Query {
        items: [String]
      }

      type Mutation {
        create(item: String!): String
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
          serverItems.push(args.item);
          return args.item;
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
    await client.executeAsync(async done => {
      const {
        app,
        agSync: {
          OfflineClient,
          CordovaNetworkStatus,
          CacheOperation,
          getUpdateFunction
        }
      } = window.aerogear;

      const networkStatus = new CordovaNetworkStatus();
      window.aerogear.networkStatus = networkStatus;

      // const cacheUpdates = {
      //   create: getUpdateFunction('create', 'id', GET_TASKS, CacheOperation.ADD)
      // };
    
      const options = {
        openShiftConfig: app.config,
        networkStatus
      };

      const offlineClient = new OfflineClient(options);

      window.aerogear.offlineStore = offlineClient.offlineStore;

      const apolloClient = await offlineClient.init();

      window.aerogear.apolloClient = apolloClient;

      done();
    });
  });

  it('should perform query', async function() {
    const result = await client.executeAsync(async done => {
      try {
        const { apolloClient, gql } = window.aerogear;

        const { data } = await apolloClient.query({
          fetchPolicy: 'network-only',
          query: gql`{items}`
        });

        done({ data: data.items });
      } catch (error) {
        done({ error: error.message });
      }
    });

    result.data.should.deep.equal([]);
  });

  it('should perform offline mutation', async function() {
    await setNetwork('no-network');

    await new Promise(resolve => setTimeout(resolve, 5000));

    await client.executeAsync(async done => {
      try {
        const { apolloClient, gql } = window.aerogear;

        await apolloClient.offlineMutation({
          mutation: gql`
            mutation create($item: String!) {
              create(item: $item)
            }
          `,
          variables: { item: 'test' },
          // updateQuery: gql`{items}`,
          // typeName: 'String'
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
        const { apolloClient, gql } = window.aerogear;

        const { data } = await apolloClient.query({
          query: gql`{items}`
        });

        done({ data: data.items });
      } catch (error) {
        done({ error: error.message });
      }
    });

    result.data.should.deep.equal(['test']);
    await setNetwork('reset');
  });

  it('should sync changes when going online', async function() {
    await setNetwork('reset');

    await new Promise(resolve => setTimeout(resolve, 5000));

    const result = await client.executeAsync(async done => {
      try {
        const { apolloClient, gql, offlineChangePromise } = window.aerogear;
        
        await offlineChangePromise;

        const { data } = await apolloClient.query({
          fetchPolicy: 'network-only',
          query: gql`{items}`
        });

        done({ data: data.items });
      } catch (error) {
        done({ error: error.message });
      }
    });

    result.data.should.deep.equal(['test']);
    serverItems.should.deep.equal(['test']);
  });

  it('shouold stop voyager server', async function() {
    expressServer.close();
  });
});
