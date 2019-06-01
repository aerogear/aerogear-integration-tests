require('chai').should();
const express = require('express');
const { VoyagerServer, gql } = require('@aerogear/voyager-server');

const mobileServices = require('../../config/mobile-services');

describe('Data Sync', function() {
  this.timeout(0);
  
  let expressServer;

  it('should run the voyager server', async function() {
    const typeDefs = gql`
      type Query {
        hello: String
      }
    `;

    const resolvers = {
      Query: {
        hello: () => {
          return 'Hello world';
        }
      }
    };

    const server = VoyagerServer({
      typeDefs,
      resolvers
    });

    const app = express();
    server.applyMiddleware({ app });

    expressServer = app.listen(4000, () =>
      console.log(`🚀 Server ready at http://localhost:4000/graphql`)
    );
  });

  it('should initialize voyager client', async function() {
    await client.executeAsync(async (config, done) => {
      const { init, OfflineClient } = window.aerogear;

      const app = init(config);

      const options = {
        openShiftConfig: app.config
      };

      const offlineClient = new OfflineClient(options);

      const apolloClient = await offlineClient.init();

      window.aerogear.apolloClient = apolloClient;

      done();
    }, mobileServices);
  });

  it('should successfully perform query', async function() {
    const result = await client.executeAsync(async done => {
      try {
        const { apolloClient, gql } = window.aerogear;

        const { data } = await apolloClient.query({
          fetchPolicy: 'network-only',
          query: gql`{hello}`
        });

        done({ data: data.hello });
      } catch (error) {
        done({ error: error.message });
      }
    });

    result.data.should.equal('Hello world');
  });

  it('shouold stop voyager server', async function() {
    expressServer.close();
  });
});
