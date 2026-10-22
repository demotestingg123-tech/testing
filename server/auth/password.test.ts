import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword } from './password.js';

test('password hashes verify only the matching password', async () => {
	const password = 'correct-horse-system-pro';
	const hash = await hashPassword(password);

	assert.notEqual(hash, password);
	assert.equal(await verifyPassword(password, hash), true);
	assert.equal(await verifyPassword('incorrect-password', hash), false);
});

test('password verification rejects malformed or unsupported hashes', async () => {
	assert.equal(await verifyPassword('password', 'not-a-valid-hash'), false);
	assert.equal(await verifyPassword('password', 'scrypt-v1$999999999$8$1$salt$key'), false);
});