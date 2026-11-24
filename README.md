# Thyme

Thyme is a pantry-to-recipe app organized as an AWS three-tier application:

- **Presentation:** React and Vite (`src/`); screens call the REST API.
- **Logic:** Express (`server/`); handles accounts, profiles, ingredient search, and recipe matching.
- **Data:** PostgreSQL on AWS RDS, accessed only by the API through Drizzle.

## Run locally

Requires Node.js, npm, and Docker Desktop.

Start the local PostgreSQL database, apply the schema, load the ingredient and recipe catalog, and run the API and web app:

```sh
npm run db:setup
npm run dev:api
npm run dev
```

Before the first database-backed run, copy `.env.example` to `.env` (it sets `NODE_ENV=development`, which the local demo mode needs).

For a no-database recipe demo, start the API and web app in separate terminals:

```sh
npm run dev:api
npm run dev
```

The Vite dev server forwards `/api` requests to Express on port 3001. Production
deployments should host the Vite presentation tier and Node API tier separately
behind the same HTTPS origin.

Open `http://localhost:8080`, choose **Account → Continue in local demo mode**,
then select **Try a sample pantry → Conjure Recipes**. Demo sessions are local
development only. To use registration and saved profiles, copy `.env.example`
to `.env`, set the RDS variables for a reachable PostgreSQL database, and run
`npm run db:push` once. Never commit real credentials.

Run `npm test`, `npm run lint`, and `npm run build` for checks.

## Project map

- `src/routes/` and `src/components/` — presentation and page layouts.
- `src/lib/api.ts` — browser-to-API HTTP client.
- `server/` — Express endpoints, PBKDF2 password auth, and recipe logic.
- `drizzle/` — RDS schema and SQL migration.
- `src/routeTree.gen.ts` — generated TanStack Router file; do not edit.

## Milestone 2: authentication, API and security

- **Accounts:** `POST /api/auth/register`, `/login`, `/logout`, `GET /api/auth/session`. Passwords are salted PBKDF2-SHA256 (310,000 iterations); sessions are random tokens stored hashed, in `HttpOnly`, `SameSite=Strict` cookies.
- **Search (PostgreSQL):** `GET /api/pantry?q=` (ingredient autocomplete), `GET /api/recipes/search?q=&category=&cuisine=&tag=&limit=&offset=`, `GET /api/recipes/:id`. The catalog lives in the `ingredients` and `recipes` tables; load it with `npm run db:seed`.
- **Validation:** every request is parsed in `server/validate.ts` before use; SQL goes through parameterized Drizzle queries. Evidence: `npm test` and `npm run demo:security` (against any running API, e.g. `node scripts/security-demo.mjs https://your-site`).
- **Logging:** one JSON line per event (`server/logger.ts`); on AWS the CloudWatch agent ships `/var/log/thyme/api.log` to the `/thyme/api` log group. Passwords, tokens and full emails are never logged.
- **Secrets:** nothing secret is in the repo. On AWS the database credentials come from Secrets Manager through the EC2 instance role (`deploy/`).
- **Health check:** `GET /api/health` (add `?deep=1` to include a database check).
