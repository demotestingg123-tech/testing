import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { createApp } from '../app.js';
import { createAuthRepository } from '../db/auth-repository.js';
import { openDatabase } from '../db/database.js';
import { hashPassword } from './password.js';

test('auth API issues, resolves, and revokes same-origin sessions', async () => {
	const database = openDatabase(':memory:');
	const repository = createAuthRepository(database);
	const username = `operator-${Date.now()}`;
	const password = 'a-unique-long-password-2026';
	const user = repository.createUser(username, await hashPassword(password), 'admin');
	const server = createApp(database).listen(0, '127.0.0.1');
	await once(server, 'listening');
	const address = server.address();
	if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');
	const origin = `http://127.0.0.1:${address.port}`;

	try {
		const anonymousResponse = await fetch(`${origin}/api/auth/session`);
		assert.equal(anonymousResponse.status, 200);
		assert.equal((await anonymousResponse.json() as { user: unknown }).user, null);
		const protectedResponse = await fetch(`${origin}/api/auth/me`);
		assert.equal(protectedResponse.status, 401);

		const crossOriginResponse = await fetch(`${origin}/api/auth/login`, {
			method: 'POST',
			headers: { Origin: 'https://untrusted.example', 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
		});
		assert.equal(crossOriginResponse.status, 403);
		const forwardedOriginResponse = await fetch(`${origin}/api/auth/login`, {
			method: 'POST',
			headers: {
				Origin: 'https://system-pro.example.test',
				'X-Forwarded-Host': 'system-pro.example.test',
				'X-Forwarded-Proto': 'https',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password }),
		});
		assert.equal(forwardedOriginResponse.status, 200);

		const loginResponse = await fetch(`${origin}/api/auth/login`, {
			method: 'POST',
			headers: {
				Origin: origin,
				'Content-Type': 'application/json',
				'X-Forwarded-For': '192.0.2.10',
			},
			body: JSON.stringify({ username, password }),
		});
		assert.equal(loginResponse.status, 200);
		assert.deepEqual((await loginResponse.json() as { user: unknown }).user, {
			id: user.id,
			username,
			role: 'admin',
		});

		const setCookie = loginResponse.headers.get('set-cookie');
		assert.ok(setCookie?.includes('HttpOnly'));
		assert.ok(setCookie?.includes('SameSite=Lax'));
		const cookie = setCookie?.split(';', 1)[0];
		assert.ok(cookie);

		const authenticatedResponse = await fetch(`${origin}/api/auth/session`, {
			headers: { Cookie: cookie },
		});
		assert.deepEqual((await authenticatedResponse.json() as { user: unknown }).user, {
			id: user.id,
			username,
			role: 'admin',
		});
		const authenticatedMe = await fetch(`${origin}/api/auth/me`, {
			headers: { Cookie: cookie },
		});
		assert.deepEqual((await authenticatedMe.json() as { user: unknown }).user, {
			id: user.id,
			username,
			role: 'admin',
		});

		const logoutResponse = await fetch(`${origin}/api/auth/logout`, {
			method: 'POST',
			headers: { Origin: origin, Cookie: cookie },
		});
		assert.equal(logoutResponse.status, 204);
		const afterLogout = await fetch(`${origin}/api/auth/session`, {
			headers: { Cookie: cookie },
		});
		assert.equal((await afterLogout.json() as { user: unknown }).user, null);
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => error ? reject(error) : resolve());
		});
		database.close();
	}
});