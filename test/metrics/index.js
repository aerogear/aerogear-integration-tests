require('chai').should();
const { Client } = require('pg');

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
    console.dir(result.rows[0].data);
  });
});
