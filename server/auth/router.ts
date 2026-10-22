import { createHash } from 'node:crypto';
import { Router, type RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import type { AuthRepository } from '../db/auth-repository.js';
import { config, isProduction } from '../config.js';
import { hashPassword, verifyPassword } from './password.js';
import { createProvisionedUser } from './provision-user.js';
import { requireAuthenticatedUser } from './session-middleware.js';
import { createSessionToken, clearSessionCookie, hashSessionToken, readSessionToken, setSessionCookie } from './session.js';
import { resolveTrustedAppOrigins } from './trusted-origins.js';

const loginSchema = z.object({
	username: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/),
	password: z.string().min(1).max(256),
});

const loginWindowMs = 15 * 60 * 1000;
const loginBlockMs = 15 * 60 * 1000;
const maxLoginAttempts = 10;
const unknownUserPasswordHash = hashPassword('system-pro-invalid-login-check');

const requireSameOrigin: RequestHandler = (request, response, next) => {
	const origin = request.get('origin');
	const host = request.get('x-forwarded-host')?.split(',')[0].trim() ?? request.get('host');
	if (!origin || !host) return response.status(403).json({ error: 'Request origin could not be verified.' });

	try {
		const originUrl = new URL(origin);
		const expectedProtocol = request.get('x-forwarded-proto')?.split(',')[0].trim() ?? request.protocol;
		const matchesForwardedRequest = originUrl.host === host && originUrl.protocol === `${expectedProtocol}:`;
		if (!matchesForwardedRequest && !resolveTrustedAppOrigins().has(originUrl.origin)) {
			return response.status(403).json({ error: 'Request origin could not be verified.' });
		}
	} catch {
		return response.status(403).json({ error: 'Request origin could not be verified.' });
	}
	next();
};

export function createAuthRouter(repository: AuthRepository) {
	const router = Router();
	const ipLoginLimiter = rateLimit({
		windowMs: loginWindowMs,
		limit: 30,
		standardHeaders: 'draft-8',
		legacyHeaders: false,
		message: { error: 'Too many login attempts. Try again later.' },
	});

	router.get('/session', (_request, response) => {
		response.set('Cache-Control', 'no-store');
		response.json({ user: response.locals.authUser ?? null });
	});

	router.get('/me', requireAuthenticatedUser, (_request, response) => {
		response.set('Cache-Control', 'no-store');
		response.json({ user: response.locals.authUser });
	});

	router.post('/login', ipLoginLimiter, requireSameOrigin, async (request, response, next) => {
		const parsed = loginSchema.safeParse(request.body);
		if (!parsed.success) return response.status(400).json({ error: 'Enter a valid username and password.' });

		const username = parsed.data.username.toLowerCase();
		const attemptKey = createHash('sha256').update(`${request.ip ?? 'unknown'}:${username}`).digest('hex');
		const now = Date.now();
		const blockedUntil = repository.getLoginBlockUntil(attemptKey, now, loginWindowMs);
		if (blockedUntil > now) {
			response.set('Retry-After', String(Math.ceil((blockedUntil - now) / 1000)));
			return response.status(429).json({ error: 'Too many login attempts. Try again later.' });
		}

		try {
			const user = repository.findUserByUsername(username);
			const storedHash = user?.password_hash ?? await unknownUserPasswordHash;
			const passwordMatches = await verifyPassword(parsed.data.password, storedHash);
			if (!user || user.is_active !== 1 || !passwordMatches) {
				repository.recordLoginFailure(attemptKey, now, loginWindowMs, maxLoginAttempts, loginBlockMs);
				return response.status(401).json({ error: 'Invalid username or password.' });
			}

			repository.clearLoginFailures(attemptKey);
			const token = createSessionToken();
			const tokenHash = hashSessionToken(token);
			repository.createSession(tokenHash, user.id, now + config.sessionTtlSeconds * 1000);
			setSessionCookie(response, token, config.sessionTtlSeconds, isProduction);
			response.set('Cache-Control', 'no-store');
			response.json({ user: { id: user.id, username: user.username, role: user.role } });
		} catch (error) {
			next(error);
		}
	});

	router.post('/logout', requireSameOrigin, (request, response, next) => {
		try {
			const token = readSessionToken(request);
			if (token) repository.revokeSession(hashSessionToken(token));
			clearSessionCookie(response, isProduction);
			response.status(204).end();
		} catch (error) {
			next(error);
		}
	});

	return router;
}