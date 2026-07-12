const { query } = require('./db');

/**
 * Map a raw DB row to the message shape used across the app.
 * `pg` returns TIMESTAMPTZ as a JS Date, which we normalize to an ISO string.
 */
const mapRow = (row) => ({
  id: row.id,
  sender: row.sender,
  text: row.text,
  createdAt:
    row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
});

/**
 * Return all messages ordered oldest -> newest.
 */
const getAllMessages = async () => {
  const { rows } = await query(
    'SELECT id, sender, text, created_at FROM messages ORDER BY created_at ASC'
  );
  return rows.map(mapRow);
};

/**
 * Insert a message and return the persisted row (created_at set by the DB).
 */
const insertMessage = async ({ id, sender, text }) => {
  const { rows } = await query(
    'INSERT INTO messages (id, sender, text) VALUES ($1, $2, $3) RETURNING id, sender, text, created_at',
    [id, sender, text]
  );
  return mapRow(rows[0]);
};

module.exports = { getAllMessages, insertMessage };
