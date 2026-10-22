import type { AuthRepository, AuthenticatedUser } from '../db/auth-repository.js';
import { hashPassword } from './password.js';

export const passwordPolicy = {
	minimumLength: 12,
	maximumLength: 128,
};

export async function createProvisionedUser(repository: AuthRepository, username: string, password: string) {
	const normalizedUsername = username.trim().toLowerCase();
	if (!/^[a-z0-9][a-z0-9._-]{2,63}$/.test(normalizedUsername)) {
		throw new Error('Username must be 3-64 letters, numbers, dots, underscores, or hyphens.');
	}
	if (password.length < passwordPolicy.minimumLength || password.length > passwordPolicy.maximumLength) {
		throw new Error(`Password must be ${passwordPolicy.minimumLength}-${passwordPolicy.maximumLength} characters long.`);
	}
	if (repository.findUserByUsername(normalizedUsername)) throw new Error('A user with that username already exists.');
	return repository.createUser(normalizedUsername, await hashPassword(password), 'admin') satisfies AuthenticatedUser;
}