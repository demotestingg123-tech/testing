import 'dotenv/config';
import { createApp } from './app.js';
import { config } from './config.js';
import { isProduction } from './config.js';
import { openDatabase } from './db/database.js';
import { createAuthRepository } from './db/auth-repository.js';
import { seedDevelopmentDemoUser } from './auth/dev-demo-user.js';

const database = openDatabase(config.databasePath);
const repository = createAuthRepository(database);
const demoSeed = await seedDevelopmentDemoUser(repository, {
	enabled: process.env.SYSTEM_PRO_DEV_CREDENTIALS === 'true',
	production: isProduction,
});
if (demoSeed === 'created') {
	console.warn('Development-only demo account created. Never enable this mode in production.');
}
repository.deleteExpiredSessions(Date.now());
repository.cleanupLoginAttempts(Date.now() - 24 * 60 * 60 * 1000);

const cleanupTimer = setInterval(() => {
	const now = Date.now();
	repository.deleteExpiredSessions(now);
	repository.cleanupLoginAttempts(now - 24 * 60 * 60 * 1000);
}, 60 * 60 * 1000);
cleanupTimer.unref();

const app = createApp(database);
const host = isProduction ? '0.0.0.0' : '127.0.0.1';
const server = app.listen(config.port, host, () => {
	console.log(`System Pro server listening on port ${config.port}`);
});

function shutdown() {
	clearInterval(cleanupTimer);
	server.close(() => {
		database.close();
		process.exit(0);
	});
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);