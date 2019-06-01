require('chai').should();
const { Client } = require('pg');

const mobileServices = require('../../config/mobile-services');

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
    client.execute(config => {
      const { init } = window.aerogear;
      init(config);
    }, mobileServices);

    await new Promise(resolve => setTimeout(resolve, 10 * 1000));

    const result = await postgres.query('SELECT * FROM mobileappmetrics');
    console.dir(result);
  });
});
