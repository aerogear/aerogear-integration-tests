const { Client } = require('pg');

before('connect to postgres', async function() {
  global.postgres = new Client({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
  });

  await global.postgres.connect();
});

before('reset metrics db', async function() {
  await postgres.query('DELETE FROM mobileappmetrics');
});

after('close postgres connection', async function() {
  await postgres.end();
});
