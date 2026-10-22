import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveTrustedAppOrigins } from './trusted-origins.js';

test('trusted origins include APP_URL and the exact configured Codespaces web origin', () => {
	const origins = resolveTrustedAppOrigins({
		APP_URL: 'https://system-pro.example.test/workspace',
		CODESPACE_NAME: 'bookish-winner',
		GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: 'app.github.dev',
	});

	assert.deepEqual([...origins].sort(), [
		'https://bookish-winner-3000.app.github.dev',
		'https://system-pro.example.test',
	]);
	assert.equal(origins.has('https://other-codespace-3000.app.github.dev'), false);
});