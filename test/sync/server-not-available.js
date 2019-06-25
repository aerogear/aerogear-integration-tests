require('chai').should();
const express = require('express');
const { VoyagerServer, gql } = require('@aerogear/voyager-server');
const { spawn } = require('child_process');
const path = require('path');
const puppeteer = require('puppeteer');
const { PubSub } = require('apollo-server');
const mqtt = require('mqtt');
const { MQTTPubSub } = require('@aerogear/graphql-mqtt-subscriptions');
const { createSubscriptionServer } = require('@aerogear/voyager-subscriptions');

const { setNetwork } = require('../../util/network');
const { waitForDeviceReady, initJsSdk } = require('../../util/init');
const mobileServices = require('../../config/mobile-services');

const initClient = async (platform, done) => {
  try {
    const {
      app,
      agSync: {
        OfflineClient,
        CordovaNetworkStatus,
        CacheOperation,
        getUpdateFunction
      },
      gql,
      ToggleNetworkStatus
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

    if (done) {
      done();
    }
  } catch (error) {
    if (done) {
      done({ error: error.message });
    } else {
      throw error.message;
    }
  }
}

const performQuery = async done => {
  try {
    const { apolloClient, itemsQuery } = window.aerogear;

    const { data } = await apolloClient.query({
      query: itemsQuery,
      // fetchPolicy: 'network-only',
      // errorPolicy: 'none'
    });

    if (done) {
      done({ data: data.items });
    } else {
      return { data: data.items };
    }
  } catch (error) {
    if (done) {
      done({ error: error.message });
    } else {
      throw error.message;
    }
  }
}

const performMutation = async done => {
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

    if (done) {
      done();
    }
  } catch (error) {
    if (done) {
      done({ error: error.message });
    } else {
      throw error.message;
    }
  }
}

const performWatchQuery = async done => {
  try {
    debugger;

    const {
      apolloClient,
      itemsQuery,
      agSync: {
        createSubscriptionOptions,
        CacheOperation
      },
      gql
    } = window.aerogear;

    // await apolloClient.query({
    //   query: itemsQuery,
    //   fetchPolicy: 'network-only',
    //   errorPolicy: 'none'
    // });

    const getItems = apolloClient.watchQuery({
      query: itemsQuery,
      fetchPolicy: 'cache-first',
      errorPolicy: 'none'
    });

    getItems.subscribeToMore(createSubscriptionOptions({
      subscriptionQuery: gql`
        subscription itemAdded {
          itemAdded {
            id
            title
          }
        }
      `,
      cacheUpdateQuery: itemsQuery,
      operationType: CacheOperation.ADD
    }));

    await new Promise(resolve => setTimeout(resolve, 20000));

    console.log('finishing now');

    if (done) {
      done();
    }
  } catch (error) {
    if (done) {
      done({ error: error.message });
    } else {
      throw error;
    }
  }
};

describe('Data Sync - Server not available', function() {
  this.timeout(0);
  
  let mqttClient;

  let expressServer;
  let serverItems = [];
  let numItems = 0;

  let cordovaProc;
  let browser;
  let page;

  let watchPromise;

  before('start browser client', async function() {
    cordovaProc = spawn('cordova', ['serve'], { cwd: path.resolve(__dirname, '../../testing-app') });
    await new Promise(resolve => {
      cordovaProc.stdout.on('data', data => {
        if (data.includes('Static file server running')) {
          resolve();
        }
      })
    });
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.goto('http://localhost:8000/browser/www/index.html');
    await page.evaluate(waitForDeviceReady);
    mobileServices.services[1].url = 'http://localhost:4000/graphql';
    mobileServices.services[1].config.websocketUrl = 'ws://localhost:4000/graphql';
    await page.evaluate(initJsSdk, mobileServices);
  });

  after('close browser client', async function() {
    // await browser.close();
    // cordovaProc.kill();
  });

  it('should run the voyager server', async function() {
    const host = process.env.MQTT_HOST || 'localhost';

    const mqttOptions = {
      host: host,
      servername: host,
      username: process.env.MQTT_USERNAME || '',
      password: process.env.MQTT_PASSWORD || '' ,
      port: process.env.MQTT_PORT || '1883',
      protocol: process.env.MQTT_PROTOCOL || 'mqtt',
      rejectUnauthorized: false
    };

    mqttClient = mqtt.connect(host, mqttOptions);

    console.log(`attempting to connect to messaging service ${host}`);

    mqttClient.on('connect', () => {
      console.log('connected to messaging service');
    });

    mqttClient.on('error', (error) => {
      console.log('error with mqtt connection');
      console.log(error);
    });

    const pubSub = new MQTTPubSub({ client: mqttClient });

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

      type Subscription {
        itemAdded: Item
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
          pubSub.publish('item/added', { itemAdded: newItem });
          return newItem;
        }
      },

      Subscription: {
        itemAdded: {
          subscribe: () => pubSub.asyncIterator('item/added')
        }
      }
    };

    const server = VoyagerServer({
      typeDefs,
      resolvers
    });

    const app = express();
    server.applyMiddleware({ app });

    expressServer = app.listen(4000, () => {
      createSubscriptionServer({
        schema: server.schema
      }, {
        path: '/graphql',
        server: expressServer
      });
    });
  });

  it('should initialize mobile client', async function() {
    await client.executeAsync(initClient, process.env.MOBILE_PLATFORM);
  });

  it('should initialize browser client', async function() {
    await page.evaluate(initClient, process.env.MOBILE_PLATFORM);
  });

  it('should perform query in browser', async function() {
    // const result = await page.evaluate(performQuery);
    // result.data.should.deep.equal([]);
    watchPromise = page.evaluate(performWatchQuery);
  });

  // it('should perform query on mobile', async function() {
  //   const result = await client.executeAsync(performQuery);
  //   result.data.should.deep.equal([]);
  // });

  it('should perform mutation on mobile', async function() {
    await new Promise(resolve => setTimeout(resolve, 10000));
    await client.executeAsync(performMutation);
  });

  it('should see the change in browser', async function() {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await watchPromise;
    const result = await page.evaluate(performQuery);
    result.data.should.deep.equal([{
      __typename: 'Item',
      id: '0',
      title: 'test'
    }]);
  });

  // it('should perform offline mutation', async function() {
  //   if (process.env.MOBILE_PLATFORM === 'ios') {
  //     client.execute(() => {
  //       const { networkStatus } = window.aerogear;
  //       networkStatus.setOnline(false);
  //     });
  //   } else {
  //     await setNetwork('no-network');
  //   }

  //   await new Promise(resolve => setTimeout(resolve, 5000));

  //   await client.executeAsync(async done => {
  //     try {
  //       const { apolloClient, gql, itemsQuery } = window.aerogear;

  //       await apolloClient.offlineMutation({
  //         mutation: gql`
  //           mutation create($title: String!) {
  //             create(title: $title) {
  //               id
  //               title
  //             }
  //           }
  //         `,
  //         variables: { title: 'test' },
  //         updateQuery: itemsQuery,
  //         typeName: 'Item'
  //       });

  //       done({ error: 'network error offline was not thrown' });
  //     } catch (error) {
  //       if (error.networkError && error.networkError.offline) {
  //         const offlineError = error.networkError;
  //         window.aerogear.offlineChangePromise = offlineError.watchOfflineChange();
  //         done();
  //         return;
  //       }

  //       done({ error: error.message });
  //     }
  //   });
  // });

  // it('should see updated cache', async function() {
  //   const result = await client.executeAsync(async done => {
  //     try {
  //       const { apolloClient, itemsQuery } = window.aerogear;

  //       const { data } = await apolloClient.query({
  //         query: itemsQuery
  //       });

  //       done({ data: data.items });
  //     } catch (error) {
  //       done({ error: error.message });
  //     }
  //   });

  //   result.data.length.should.equal(1);
  //   result.data[0].title.should.equal('test');
  // });

  // it('should sync changes when going online', async function() {
  //   if (process.env.MOBILE_PLATFORM === 'ios') {
  //     client.execute(() => {
  //       const { networkStatus } = window.aerogear;
  //       networkStatus.setOnline(true);
  //     });
  //   } else {
  //     await setNetwork('reset');
  //   }

  //   const result = await client.executeAsync(async done => {
  //     try {
  //       const { apolloClient, itemsQuery, offlineChangePromise } = window.aerogear;
        
  //       await offlineChangePromise;

  //       await new Promise(resolve => setTimeout(resolve, 1000));

  //       const { data } = await apolloClient.query({
  //         query: itemsQuery
  //       });

  //       done({ data: data.items });
  //     } catch (error) {
  //       done({ error: error.message });
  //     }
  //   });

    // result.data.should.deep.equal([{
    //   __typename: 'Item',
    //   id: '0',
    //   title: 'test'
    // }]);
  //   serverItems.should.deep.equal([{
  //     id: 0,
  //     title: 'test'
  //   }]);
  // });

  it('shouold stop voyager server', async function() {
    expressServer.close();
    mqttClient.end();
  });
});
