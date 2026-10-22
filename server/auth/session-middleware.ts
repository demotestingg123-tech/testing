import type { NextFunction, Request, Response } from 'express';
import type { AuthRepository } from '../db/auth-repository.js';
import { hashSessionToken, readSessionToken } from './session.js';

export function createSessionMiddleware(repository: AuthRepository) {
	return (request: Request, response: Response, next: NextFunction) => {
		const token = readSessionToken(request);
		if (!token) return next();

		const session = repository.findSession(hashSessionToken(token), Date.now());
		if (session) response.locals.authUser = session.user;
		next();
	};
}

export function requireAuthenticatedUser(_request: Request, response: Response, next: NextFunction) {
	if (!response.locals.authUser) return response.status(401).json({ error: 'Authentication required.' });
	next();
}