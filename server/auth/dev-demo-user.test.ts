import assert from 'node:assert/strict';
import test from 'node:test';
import { createAuthRepository } from '../db/auth-repository.js';
import { openDatabase } from '../db/database.js';
import { verifyPassword } from './password.js';
import { developmentDemoCredentials, seedDevelopmentDemoUser } from './dev-demo-user.js';

test('demo credentials seed only an empty non-production database', async () => {
	const database = openDatabase(':memory:');
	try {
		const repository = createAuthRepository(database);
		assert.equal(await seedDevelopmentDemoUser(repository, { enabled: false, production: false }), 'disabled');
		assert.equal(repository.countUsers(), 0);
		await assert.rejects(
			seedDevelopmentDemoUser(repository, { enabled: true, production: true }),
			/ cannot be enabled in production/,
		);
		assert.equal(repository.countUsers(), 0);

		assert.equal(await seedDevelopmentDemoUser(repository, { enabled: true, production: false }), 'created');
		const user = repository.findUserByUsername('ADMIN');
		assert.ok(user);
		assert.equal(await verifyPassword(developmentDemoCredentials.password, user.password_hash), true);
		assert.equal(await seedDevelopmentDemoUser(repository, { enabled: true, production: false }), 'users-exist');
		assert.equal(repository.countUsers(), 1);
	} finally {
		database.close();
	}
});