import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import type { ScryptOptions } from 'node:crypto';

const KEY_LENGTH = 64;
const PARAMETERS = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } satisfies ScryptOptions;

function deriveKey(password: string, salt: Buffer, options: ScryptOptions) {
	return new Promise<Buffer>((resolve, reject) => {
		scryptCallback(password, salt, KEY_LENGTH, options, (error, key) => {
			if (error) reject(error);
			else resolve(key);
		});
	});
}

export async function hashPassword(password: string) {
	const salt = randomBytes(16);
	const hash = await deriveKey(password, salt, PARAMETERS);
	return [
		'scrypt-v1',
		PARAMETERS.N,
		PARAMETERS.r,
		PARAMETERS.p,
		salt.toString('base64url'),
		hash.toString('base64url'),
	].join('$');
}

export async function verifyPassword(password: string, storedHash: string) {
	const [version, nValue, rValue, pValue, saltValue, keyValue, extra] = storedHash.split('$');
	if (version !== 'scrypt-v1' || extra !== undefined || !saltValue || !keyValue) return false;

	const N = Number(nValue);
	const r = Number(rValue);
	const p = Number(pValue);
	if (N !== PARAMETERS.N || r !== PARAMETERS.r || p !== PARAMETERS.p) return false;

	const salt = Buffer.from(saltValue, 'base64url');
	const expectedKey = Buffer.from(keyValue, 'base64url');
	if (salt.length !== 16 || expectedKey.length !== KEY_LENGTH) return false;

	const actualKey = await deriveKey(password, salt, PARAMETERS);
	return timingSafeEqual(expectedKey, actualKey);
}