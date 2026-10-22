import { resolve } from 'node:path';

function readPositiveInteger(value: string | undefined, fallback: number) {
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
	environment: process.env.NODE_ENV ?? 'development',
	port: readPositiveInteger(process.env.PORT, 3001),
	databasePath: resolve(process.env.DATABASE_PATH ?? 'data/system-pro.sqlite'),
	sessionTtlSeconds: readPositiveInteger(process.env.SESSION_TTL_HOURS, 12) * 60 * 60,
};

export const isProduction = config.environment === 'production';