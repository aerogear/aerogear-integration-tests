const mobileServices = require('../config/mobile-services');

before('Initialize aerogear-js-sdk', async function() {
  client.execute(config => {
    const { init } = window.aerogear.agApp;
    window.aerogear.app = init(config);
  }, mobileServices);
});
