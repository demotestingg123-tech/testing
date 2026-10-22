import Database from 'better-sqlite3';
import { chmodSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { initialAuthSchema } from './migrations/001-auth.js';

type Migration = {
	version: number;
	name: string;
	sql: string;
};

const migrations: Migration[] = [
	{ version: 1, name: 'initial_auth_schema', sql: initialAuthSchema },
];

function migrateDatabase(database: Database.Database) {
	database.exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version INTEGER PRIMARY KEY NOT NULL,
			name TEXT NOT NULL,
			applied_at INTEGER NOT NULL
		) STRICT;
	`);

	const applied = database.prepare('SELECT version FROM schema_migrations').all() as { version: number }[];
	const appliedVersions = new Set(applied.map(({ version }) => version));
	const insertMigration = database.prepare(
		'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)',
	);

	for (const migration of migrations) {
		if (appliedVersions.has(migration.version)) continue;

		database.transaction(() => {
			database.exec(migration.sql);
			insertMigration.run(migration.version, migration.name, Date.now());
		}).immediate();
	}
}

export function openDatabase(databasePath: string) {
	if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
	const database = new Database(databasePath);
	if (databasePath !== ':memory:') chmodSync(databasePath, 0o600);
	database.pragma('journal_mode = WAL');
	database.pragma('foreign_keys = ON');
	database.pragma('busy_timeout = 5000');
	database.pragma('synchronous = NORMAL');
	migrateDatabase(database);
	return database;
}