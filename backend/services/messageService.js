const crypto = require('crypto');

const messagesRepository = require('../storage/messagesRepository');

/**
 * Message service — the single persistence seam for the app.
 * Both the REST controller and the socket handler go through here, so the
 * underlying store (now Supabase/Postgres) can change without touching them.
 */

/**
 * Get the full chat history (oldest -> newest).
 */
const getMessages = async () => {
  return messagesRepository.getAllMessages();
};

/**
 * Create + persist a message. The server owns the id and timestamp:
 * a UUID is generated here and created_at is set by the database.
 * Returns the persisted message.
 */
const saveMessage = async ({ text, sender }) => {
  return messagesRepository.insertMessage({
    id: crypto.randomUUID(),
    sender: sender.trim(),
    text: text.trim(),
  });
};

module.exports = { getMessages, saveMessage };
