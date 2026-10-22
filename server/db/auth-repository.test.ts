import assert from 'node:assert/strict';
import test from 'node:test';
import { createAuthRepository } from './auth-repository.js';
import { openDatabase } from './database.js';

test('migrations and auth repository create users, sessions, and persistent login blocks', () => {
	const database = openDatabase(':memory:');
	try {
		const repository = createAuthRepository(database);
		const user = repository.createUser('admin', 'scrypt-hash', 'admin');
		assert.equal(repository.countUsers(), 1);
		assert.equal(repository.findUserByUsername('ADMIN')?.id, user.id);

		const sessionHash = 'a'.repeat(64);
		repository.createSession(sessionHash, user.id, Date.now() + 60_000);
		assert.equal(repository.findSession(sessionHash, Date.now())?.user.id, user.id);
		repository.revokeSession(sessionHash);
		assert.equal(repository.findSession(sessionHash, Date.now()), undefined);

		const throttleKey = 'b'.repeat(64);
		const now = Date.now();
		repository.recordLoginFailure(throttleKey, now, 60_000, 2, 30_000);
		assert.equal(repository.getLoginBlockUntil(throttleKey, now + 1, 60_000), 0);
		repository.recordLoginFailure(throttleKey, now + 2, 60_000, 2, 30_000);
		assert.ok(repository.getLoginBlockUntil(throttleKey, now + 3, 60_000) > now + 3);
		repository.clearLoginFailures(throttleKey);
		assert.equal(repository.getLoginBlockUntil(throttleKey, now + 4, 60_000), 0);
	} finally {
		database.close();
	}
});