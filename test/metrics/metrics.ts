require('chai').should();

const appiumOpts = require('../../config/appium-opts');
const testAppConfig = require('../../testing-app/package-lock');

const expectedData = {
  app: {
    appId: 'org.aerogear.integrationtests',
    framework: 'cordova',
    appVersion: '1.0.0',
    sdkVersion: testAppConfig.dependencies['@aerogear/app'].version
  },
 device: {
   platform: appiumOpts.capabilities.device.includes('iPhone') ? 'ios' : 'android',
   platformVersion: appiumOpts.capabilities.os_version
  }
};

describe('App Metrics', function() {
  this.timeout(0);

  it('should receive app metrics', async function() {
    await new Promise(resolve => setTimeout(resolve, 10 * 1000));

    const result = await postgres.query('SELECT * FROM mobileappmetrics');

    result.rows.length.should.equal(1);
    result.rows[0].event_type.should.be.a('string').and.satisfy(v => v.startsWith('init'));
    result.rows[0].data.device.platformVersion.should.be.a('string').and.satisfy(
      v => v.startsWith(appiumOpts.capabilities.os_version) || appiumOpts.capabilities.os_version.startsWith(v)
    );
    result.rows[0].data.device.platformVersion = appiumOpts.capabilities.os_version;
    result.rows[0].data.should.deep.equal(expectedData);
  });
});
