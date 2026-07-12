-- Schema for the chat application (Supabase / PostgreSQL).
-- The backend also creates this automatically on startup via storage/db.js
-- (ensureSchema). This file is kept as documentation / for manual setup.

CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  sender     TEXT NOT NULL,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at);
