// backend/src/db.js

import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // you can add ssl: { rejectUnauthorized: false } here if your host requires it
});

/**
 * Run a SQL query against your Postgres DB.
 * @param {string} text   The SQL query text, with $1, $2 placeholders
 * @param {any[]}  params Parameters array to fill placeholders
 * @returns {Promise<import('pg').QueryResult<any>>}
 */
export const query = (text, params) => {
  return pool.query(text, params);
};

export default { 
    pool,
};
