export const initialAuthSchema = `
CREATE TABLE users (
	id TEXT PRIMARY KEY NOT NULL,
	username TEXT NOT NULL COLLATE NOCASE UNIQUE,
	password_hash TEXT NOT NULL,
	role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'operator')),
	is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
) STRICT;

CREATE TABLE sessions (
	token_hash TEXT PRIMARY KEY NOT NULL,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at INTEGER NOT NULL,
	expires_at INTEGER NOT NULL,
	last_seen_at INTEGER NOT NULL
) STRICT;

CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expiration_idx ON sessions(expires_at);

CREATE TABLE login_attempts (
	key_hash TEXT PRIMARY KEY NOT NULL,
	window_started_at INTEGER NOT NULL,
	attempt_count INTEGER NOT NULL CHECK (attempt_count >= 0),
	blocked_until INTEGER NOT NULL DEFAULT 0
) STRICT;

CREATE INDEX login_attempts_window_idx ON login_attempts(window_started_at);
`;