# System Pro

React, TypeScript, Vite, React Router, and shadcn/ui admin workspace with persistent light and dark themes.

## Development

```sh
npm install
npm run dev
```

The web app runs on port `3000`; Vite proxies `/api` to the Express API on port `3001`.

## Authentication and database

The API uses SQLite at `data/system-pro.sqlite` by default. The database is created and migrated on server start. Passwords are stored as salted scrypt hashes; sessions use random HttpOnly cookies with only token hashes stored in SQLite. There is no public registration or default account.

`npm run dev` enables a local-only demo account (`admin` / `1`) only when the database is empty. The login form prefills those credentials in Vite development mode. This seed refuses production mode, does not overwrite an existing user database, and is not enabled by `npm start` or `npm run preview`. Never deploy the demo credentials.

Provision the first administrator through a secure environment injection (do not commit the password):

```sh
read -rsp 'Admin password: ' SYSTEM_PRO_BOOTSTRAP_PASSWORD; printf '\n'
export SYSTEM_PRO_BOOTSTRAP_USERNAME=admin SYSTEM_PRO_BOOTSTRAP_PASSWORD
npm run create-admin
unset SYSTEM_PRO_BOOTSTRAP_PASSWORD
```

For production, build with `npm run build`, set `NODE_ENV=production`, configure `DATABASE_PATH` to persistent storage and serve over HTTPS, then run `npm start`. SQLite expects durable local storage; use a managed database when deploying multiple independent application hosts.

Run the authentication unit tests with `npm test`.

## Checks

```sh
npm run lint
npm run build
```

## Project structure

- `src/app`: application entry and URL router
- `src/components/layout`: shared application shell and header
- `src/components/ui`: shadcn/ui primitives
- `src/features/admin-navigation`: menu definitions and sidebar navigation
- `src/features/admin-pages`: route page views
- `src/features/theme`: theme provider and toggle
- `src/hooks`: shared UI hooks
- `src/lib`: component utilities
- `src/styles`: shadcn theme tokens and application layout styles

Menu routes are generated from `src/features/admin-navigation/menu-data.ts`; adding an item there adds its sidebar link and route.

## Progressive web app

The production build includes an installable web manifest and an offline app shell. Run `npm run generate:pwa-icons` after changing `public/icons/system-pro.svg` to regenerate the PNG app icons. Install and update prompts appear in supported browsers when available.
