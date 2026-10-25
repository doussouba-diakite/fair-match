-- Fair Match database. Three tables: people, login sessions, and messages.

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           TEXT UNIQUE,                 -- NULL for demo profiles
  password_hash   TEXT,                        -- bcrypt hash; we never store the real password
  name            TEXT NOT NULL,
  city            TEXT NOT NULL DEFAULT 'New York',
  willing_to_move BOOLEAN NOT NULL DEFAULT FALSE,
  bio             TEXT NOT NULL DEFAULT '',
  answers         JSONB,                       -- quiz answers, e.g. {"routine": 5, "faith": 2, ...}; NULL until the quiz is done
  is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
  audit_group     TEXT,                        -- demo profiles only: A/B/C for the fairness audit; matching never reads it
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,                 -- random 32-byte token stored in an httpOnly cookie
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  from_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_pair ON messages (LEAST(from_id, to_id), GREATEST(from_id, to_id), created_at);
