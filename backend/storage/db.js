const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    'FATAL: DATABASE_URL is not set. Copy backend/.env.example to backend/.env and set your Supabase connection string.'
  );
}

// SSL is required by Supabase. It is only disabled for a local Postgres
// (e.g. Docker) that has no SSL configured, via DB_SSL=false.
const disableSsl = process.env.DB_SSL === 'false';

const pool = new Pool({
  connectionString,
  ssl: disableSsl ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

/**
 * Run a parameterized query against the pool.
 */
const query = (text, params) => pool.query(text, params);

/**
 * Create the messages table + index if they don't exist.
 * Called once at startup, before the server begins listening.
 */
const ensureSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id         TEXT PRIMARY KEY,
      sender     TEXT NOT NULL,
      text       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(
    'CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at);'
  );
};

module.exports = { pool, query, ensureSchema };
