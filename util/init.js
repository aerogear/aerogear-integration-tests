const mobileServices = require('../config/mobile-services');

before('Initialize appium', async function() {
  client.execute(config => {
    const { init } = window.aerogear;
    window.aerogear.app = init(config);
  }, mobileServices);
});
