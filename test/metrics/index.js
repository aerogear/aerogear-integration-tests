require('chai').should();
const { Client } = require('pg');

const appiumOpts = require('../../config/appium-opts');
const testAppConfig = require('../../testing-app/package-lock');

const expectedData = {
  app: {
    appId: 'io.cordova.hellocordova',
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

  let postgres;

  before('connect to postgres', async function() {
    postgres = new Client({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE
    });

    await postgres.connect();
  });

  after('close postgres connection', async function() {
    await postgres.end();
  });
  
  it('should receive app metrics', async function() {
    await new Promise(resolve => setTimeout(resolve, 10 * 1000));

    const result = await postgres.query('SELECT * FROM mobileappmetrics');

    result.rows.length.should.equal(1);
    result.rows[0].event_type.should.include('init');
    result.rows[0].data.should.deep.equal(expectedData);
  });
});
