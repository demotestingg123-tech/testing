import type { AuthRepository } from '../db/auth-repository.js';
import { hashPassword } from './password.js';

export const developmentDemoCredentials = {
	username: 'admin',
	password: '1',
} as const;

type SeedOptions = {
	enabled: boolean;
	production: boolean;
};

export async function seedDevelopmentDemoUser(repository: AuthRepository, options: SeedOptions) {
	if (!options.enabled) return 'disabled' as const;
	if (options.production) throw new Error('Development demo credentials cannot be enabled in production.');
	if (repository.countUsers() > 0) return 'users-exist' as const;

	const passwordHash = await hashPassword(developmentDemoCredentials.password);
	repository.createUser(developmentDemoCredentials.username, passwordHash, 'admin');
	return 'created' as const;
}