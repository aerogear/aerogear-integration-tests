const opts = {
  hostname:'hub-cloud.browserstack.com',
  logLevel: 'error',
  capabilities: {
    'device' : 'Google Pixel',
    'browserstack.user' : process.env.BROWSERSTACK_USER,
    'browserstack.key' : process.env.BROWSERSTACK_KEY,
    'app' : process.env.BROWSERSTACK_APP,
    'autoWebview': true,
    'browserstack.appium_version' : '1.9.1'
  }
};

module.exports = opts;
