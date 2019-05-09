const wdio = require("webdriverio");

const opts = require('./appium-opts');

before('Initialize appium', async function() {
  this.timeout(0);

  global.client = await wdio.remote(opts);
  await new Promise(resolve => setTimeout(resolve, 1000));
});

after('Close appium session', async function() {
  await global.client.deleteSession();
});
