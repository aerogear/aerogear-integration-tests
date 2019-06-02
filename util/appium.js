const wdio = require("webdriverio");

const opts = require('../config/appium-opts');

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

after('Close appium session', async function() {
  await client.deleteSession();
});
