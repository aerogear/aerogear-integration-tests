require('chai').should();
const { Client } = require('pg');

const mobileServices = require('../../config/mobile-services');

describe('App Metrics', function() {
  this.timeout(0);

  let client;

  before('connect to postgres', async function() {
    client = new Client({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE
    });

    await client.connect();
  });

  after('close postgres connection', async function() {
    await client.end();
  });
  
  it('should receive app metrics', async function() {
    client.execute(config => {
      const { init } = window.aerogear;
      init(config);
    }, mobileServices);

    await new Promise(resolve => setTimeout(resolve, 10 * 1000));

    const result = await client.query('SELECT * FROM mobileappmetrics');
    console.dir(result);
  });
});
