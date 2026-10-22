import 'dotenv/config';
import { openDatabase } from '../server/db/database.js';
import { createAuthRepository } from '../server/db/auth-repository.js';
import { createProvisionedUser } from '../server/auth/provision-user.js';
import { config } from '../server/config.js';

const username = process.env.SYSTEM_PRO_BOOTSTRAP_USERNAME;
const password = process.env.SYSTEM_PRO_BOOTSTRAP_PASSWORD;

if (!username || !password) {
	console.error('Set SYSTEM_PRO_BOOTSTRAP_USERNAME and SYSTEM_PRO_BOOTSTRAP_PASSWORD before provisioning an administrator.');
	process.exitCode = 1;
} else {
	const database = openDatabase(config.databasePath);
	try {
		const user = await createProvisionedUser(createAuthRepository(database), username, password);
		console.log(`Administrator ${user.username} created.`);
	} catch (error) {
		console.error(error instanceof Error ? error.message : 'Unable to create administrator.');
		process.exitCode = 1;
	} finally {
		database.close();
	}
}