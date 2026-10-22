import { createHash, randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';

export const SESSION_COOKIE_NAME = 'system_pro_session';

export function createSessionToken() {
	return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string) {
	return createHash('sha256').update(token).digest('hex');
}

export function readSessionToken(request: Request) {
	const cookieHeader = request.headers.cookie;
	if (!cookieHeader) return null;

	for (const cookie of cookieHeader.split(';')) {
		const separatorIndex = cookie.indexOf('=');
		if (separatorIndex < 0) continue;
		if (cookie.slice(0, separatorIndex).trim() !== SESSION_COOKIE_NAME) continue;
		const value = cookie.slice(separatorIndex + 1).trim();
		return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
	}
	return null;
}

export function setSessionCookie(response: Response, token: string, maxAgeSeconds: number, secure: boolean) {
	const secureAttribute = secure ? '; Secure' : '';
	response.append(
		'Set-Cookie',
		`${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureAttribute}`,
	);
}

export function clearSessionCookie(response: Response, secure: boolean) {
	const secureAttribute = secure ? '; Secure' : '';
	response.append('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureAttribute}`);
}