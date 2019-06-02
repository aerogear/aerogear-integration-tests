const wdio = require("webdriverio");
const { Client } = require('pg');

const opts = require('../config/appium-opts');
const mobileServices = require('../config/mobile-services');

before('Initialize appium', async function() {
  this.timeout(0);

  global.client = await wdio.remote(opts);
});

before('Wait for cordova device ready', async function() {
  this.timeout(0);

  await client.executeAsync(async done => {
    const { deviceIsReady } = window.aerogear;

    if (deviceIsReady) {
      done();
    } else {
      document.addEventListener('deviceready', done, false);
    }
  });
});

before('connect to postgres', async function() {
  global.postgres = new Client({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
  });

  await global.postgres.connect();
});

before('reset metrics db', async function() {
  await postgres.query('DELETE FROM mobileappmetrics');
});


before('Initialize aerogear-js-sdk', async function() {
  client.execute(config => {
    const { init } = window.aerogear.agApp;
    window.aerogear.app = init(config);
  }, mobileServices);
});

after('Close appium session', async function() {
  await client.deleteSession();
});

after('close postgres connection', async function() {
  await postgres.end();
});
