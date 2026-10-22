import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';

export type UserRole = 'admin' | 'operator';

export type UserRecord = {
	id: string;
	username: string;
	password_hash: string;
	role: UserRole;
	is_active: number;
	created_at: number;
	updated_at: number;
};

export type AuthenticatedUser = Pick<UserRecord, 'id' | 'username' | 'role'>;

type SessionRecord = {
	token_hash: string;
	user_id: string;
	created_at: number;
	expires_at: number;
	last_seen_at: number;
};

type LoginAttemptRecord = {
	key_hash: string;
	window_started_at: number;
	attempt_count: number;
	blocked_until: number;
};

export function createAuthRepository(database: Database.Database) {
	const findUserStatement = database.prepare(
		' SELECT id, username, password_hash, role, is_active, created_at, updated_at FROM users WHERE username = ? COLLATE NOCASE',
	);
	const findActiveSessionStatement = database.prepare(`
		SELECT sessions.token_hash, sessions.user_id, sessions.created_at, sessions.expires_at, sessions.last_seen_at,
			users.id, users.username, users.role, users.is_active
		FROM sessions
		JOIN users ON users.id = sessions.user_id
		WHERE sessions.token_hash = ? AND sessions.expires_at > ? AND users.is_active = 1
	`);
	const findLoginAttemptStatement = database.prepare(
		'SELECT key_hash, window_started_at, attempt_count, blocked_until FROM login_attempts WHERE key_hash = ?',
	);
	const saveLoginAttemptStatement = database.prepare(`
		INSERT INTO login_attempts (key_hash, window_started_at, attempt_count, blocked_until)
		VALUES (@key_hash, @window_started_at, @attempt_count, @blocked_until)
		ON CONFLICT(key_hash) DO UPDATE SET
			window_started_at = excluded.window_started_at,
			attempt_count = excluded.attempt_count,
			blocked_until = excluded.blocked_until
	`);
	const recordLoginFailure = database.transaction((keyHash: string, now: number, windowMs: number, maxAttempts: number, blockMs: number) => {
		const existing = findLoginAttemptStatement.get(keyHash) as LoginAttemptRecord | undefined;
		const windowExpired = !existing || now - existing.window_started_at >= windowMs;
		const attemptCount = windowExpired ? 1 : existing.attempt_count + 1;
		const blockedUntil = attemptCount >= maxAttempts ? now + blockMs : 0;
		saveLoginAttemptStatement.run({
			key_hash: keyHash,
			window_started_at: windowExpired ? now : existing.window_started_at,
			attempt_count: attemptCount,
			blocked_until: blockedUntil,
		});
	});

	return {
		findUserByUsername(username: string) {
			return findUserStatement.get(username) as UserRecord | undefined;
		},
		createUser(username: string, passwordHash: string, role: UserRole = 'admin') {
			const now = Date.now();
			const user = {
				id: randomUUID(),
				username,
				passwordHash,
				role,
				now,
			};
			database.prepare(`
				INSERT INTO users (id, username, password_hash, role, is_active, created_at, updated_at)
				VALUES (@id, @username, @passwordHash, @role, 1, @now, @now)
			`).run(user);
			return { id: user.id, username, role } satisfies AuthenticatedUser;
		},
		countUsers() {
			return (database.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }).count;
		},
		createSession(tokenHash: string, userId: string, expiresAt: number) {
			const now = Date.now();
			database.prepare(`
				INSERT INTO sessions (token_hash, user_id, created_at, expires_at, last_seen_at)
				VALUES (?, ?, ?, ?, ?)
			`).run(tokenHash, userId, now, expiresAt, now);
		},
		findSession(tokenHash: string, now: number) {
			const row = findActiveSessionStatement.get(tokenHash, now) as
				| (SessionRecord & AuthenticatedUser & { is_active: number })
				| undefined;
			if (!row) return undefined;
			return {
				session: {
					tokenHash: row.token_hash,
					userId: row.user_id,
					expiresAt: row.expires_at,
				},
				user: { id: row.id, username: row.username, role: row.role },
			};
		},
		revokeSession(tokenHash: string) {
			database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
		},
		deleteExpiredSessions(now: number) {
			database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
		},
		getLoginBlockUntil(keyHash: string, now: number, windowMs: number) {
			const attempt = findLoginAttemptStatement.get(keyHash) as LoginAttemptRecord | undefined;
			if (!attempt) return 0;
			if (now - attempt.window_started_at >= windowMs) {
				database.prepare('DELETE FROM login_attempts WHERE key_hash = ?').run(keyHash);
				return 0;
			}
			return attempt.blocked_until > now ? attempt.blocked_until : 0;
		},
		recordLoginFailure(keyHash: string, now: number, windowMs: number, maxAttempts: number, blockMs: number) {
			recordLoginFailure.immediate(keyHash, now, windowMs, maxAttempts, blockMs);
		},
		clearLoginFailures(keyHash: string) {
			database.prepare('DELETE FROM login_attempts WHERE key_hash = ?').run(keyHash);
		},
		cleanupLoginAttempts(before: number) {
			database.prepare('DELETE FROM login_attempts WHERE window_started_at < ?').run(before);
		},
	};
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;