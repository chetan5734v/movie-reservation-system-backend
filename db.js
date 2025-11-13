const { Pool } = require('pg');

const pool = new Pool({
  user: 'root',
  password: 'chetan',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'moviesystem'
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};