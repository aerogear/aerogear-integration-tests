const express = require('express');
const { VoyagerServer, gql } = require('@aerogear/voyager-server');
const mqtt = require('mqtt');
const { MQTTPubSub } = require('@aerogear/graphql-mqtt-subscriptions');
const { createSubscriptionServer } = require('@aerogear/voyager-subscriptions');

class SyncServer {

  constructor() {
    this.serverItems = [];
    this.numItems = 0;

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  async start() {
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

    this.mqttClient = mqtt.connect(host, mqttOptions);

    console.log(`attempting to connect to messaging service ${host}`);

    this.mqttClient.on('connect', () => {
      console.log('connected to messaging service');
    });

    this.mqttClient.on('error', (error) => {
      console.log('error with mqtt connection');
      console.log(error);
    });

    const pubSub = new MQTTPubSub({ client: this.mqttClient });

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
          return this.serverItems;
        }
      },
      
      Mutation: {
        create: (_, args) => {
          const newItem = {
            id: this.numItems++,
            title: args.title
          };
          this.serverItems.push(newItem);
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

    const expressServer = app.listen(4000, () => {
      createSubscriptionServer({
        schema: server.schema
      }, {
        path: '/graphql',
        server: expressServer
      });
    });
    this.expressServer = expressServer;
  };

  async stop() {
    this.expressServer.close();
    this.mqttClient.end();
  }
}

module.exports = SyncServer;
