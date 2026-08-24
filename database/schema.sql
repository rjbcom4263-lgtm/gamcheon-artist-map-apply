-- 감천 작가 지도 신청 사이트 / Cloudflare D1 (SQLite)
-- 실행 예: wrangler d1 execute <DATABASE_NAME> --file=database/schema.sql --remote

CREATE TABLE IF NOT EXISTS artist_applications (
  id TEXT PRIMARY KEY NOT NULL,
  artist_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'reviewing', 'approved', 'hold', 'rejected', 'cancelled')),
  payload_json TEXT NOT NULL,
  image_keys_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_artist_applications_created_at
  ON artist_applications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_artist_applications_status
  ON artist_applications (status);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY NOT NULL,
  login_id TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'artist')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  display_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_accounts_role
  ON accounts (role);

CREATE INDEX IF NOT EXISTS idx_accounts_status
  ON accounts (status);
