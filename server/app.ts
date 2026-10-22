import express from 'express';
import helmet from 'helmet';
import { resolve } from 'node:path';
import type Database from 'better-sqlite3';
import { createAuthRepository } from './db/auth-repository.js';
import { createAuthRouter } from './auth/router.js';
import { createSessionMiddleware } from './auth/session-middleware.js';
import { isProduction } from './config.js';

export function createApp(database: Database.Database) {
	const app = express();
	const repository = createAuthRepository(database);

	app.disable('x-powered-by');
	app.set('trust proxy', 1);
	app.use(helmet());
	app.use(express.json({ limit: '16kb' }));
	app.use('/api/auth', createSessionMiddleware(repository), createAuthRouter(repository));
	app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

	if (isProduction) {
		const webRoot = resolve(process.cwd(), 'dist');
		app.use(express.static(webRoot, { index: false, maxAge: '1h' }));
		app.get(/^(?!\/api(?:\/|$)).*/, (_request, response) => {
			response.sendFile(resolve(webRoot, 'index.html'));
		});
	}

	app.use((_error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
		response.status(500).json({ error: 'An unexpected server error occurred.' });
	});

	return app;
}