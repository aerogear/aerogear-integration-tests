const opts = {
  hostname:'hub-cloud.browserstack.com',
  logLevel: 'error',
  capabilities: {
    'os_version': '8.0',
    'device': 'Google Pixel',
    'real_mobile': 'true',
    'project': 'AeroGear Integration Tests',
    'build': process.env.GIT_COMMIT_DESC,
    'name': 'device_security_test',
    'browserstack.local': 'false',
    'browserstack.user': process.env.BROWSERSTACK_USER,
    'browserstack.key': process.env.BROWSERSTACK_KEY,
    'app': process.env.BROWSERSTACK_APP,
    'autoWebview': true,
    'browserstack.appium_version': '1.9.1'
  }
};

module.exports = opts;
