const wdio = require("webdriverio");
const { Client } = require('pg');

const opts = require('../config/appium-opts');
const mobileServices = require('../config/mobile-services');

const waitForDeviceReady = async done => {
  const { deviceIsReady } = window.aerogear;

  if (deviceIsReady) {
    if (done) {
      done();
    }
  } else {
    await new Promise(resolve =>
      document.addEventListener('deviceready', resolve, false)
    );
    if (done) {
      done();
    }
  }
};

const initJsSdk = config => {
  const { init } = window.aerogear.agApp;
  window.aerogear.app = init(config);
};

before('Initialize appium', async function() {
  this.timeout(0);

  global.client = await wdio.remote(opts);
  global.client.setAsyncTimeout(30000);
});

before('Wait for cordova device ready', async function() {
  this.timeout(0);

  await client.executeAsync(waitForDeviceReady);
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
  client.execute(initJsSdk, mobileServices);
});

after('Close appium session', async function() {
  await client.deleteSession();
});

after('close postgres connection', async function() {
  await postgres.end();
});

module.exports = {
  waitForDeviceReady,
  initJsSdk
};
