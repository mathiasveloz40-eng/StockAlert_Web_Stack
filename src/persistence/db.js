const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://stockalert_user:stockalert_pass@localhost:5433/stockalert',
});

module.exports = { pool };