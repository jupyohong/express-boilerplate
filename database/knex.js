const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    timezone: '-09:00',
  },
  asyncStackTraces: true,
  pool: { min: 2, max: 10 }, // default
  acquireConnectionTimeout: 5000,
});

module.exports = knex;
