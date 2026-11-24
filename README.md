# Thyme

Thyme is a pantry-to-recipe app organized as an AWS three-tier application:

- **Presentation:** React and Vite (`frontend/`); screens call the REST API.
- **Logic:** Express (`backend/`); handles accounts, profiles, ingredient search, and recipe matching.
- **Data:** PostgreSQL on AWS RDS, accessed only by the API through Drizzle.

## Repository layout

```
frontend/   presentation tier: React + TanStack Start (src/, public/, its own package.json)
backend/    application tier: Express API (server/) and data tier schema (drizzle/)
deploy/     AWS config per tier: deploy/web (web servers) and deploy/app (app servers)
docker-compose.yml   local PostgreSQL for development
```

The tiers share no code. The frontend talks to the backend only over HTTP (`/api/*`), and only
the backend connects to the database. Each folder has its own `package.json`, lint, test and
TypeScript config, and is installed and deployed on its own servers.

## Run locally

Requires Node.js, npm, and Docker Desktop. Install each tier once:

```sh
cd backend && npm install
cd ../frontend && npm install
```

Start the local PostgreSQL database, apply the schema, load the catalog, and run the API
(copy `backend/.env.example` to `backend/.env` first; it sets `NODE_ENV=development`, which the
local demo mode needs):

```sh
cd backend
npm run db:setup
npm run dev          # API on :3001
```

In a second terminal, run the web app:

```sh
cd frontend
npm run dev          # web on :8080, proxies /api to :3001
```

For a no-database recipe demo, skip `db:setup` and just run both `npm run dev` commands.

The Vite dev server forwards `/api` requests to Express on port 3001. In production the web
tier (nginx) forwards `/api/` to the app tier (see `deploy/web/nginx-api-proxy.conf`), so the
browser only ever sees one HTTPS origin.

Open `http://localhost:8080`, choose **Account -> Continue in local demo mode**,
then select **Try a sample pantry -> Conjure Recipes**. Demo sessions are local
development only. To use registration and saved profiles, set the RDS variables in
`backend/.env` for a reachable PostgreSQL database and run `npm run db:push` once in
`backend/`. Never commit real credentials.

Checks: run `npm test` and `npm run lint` in each of `frontend/` and `backend/`, plus
`npm run build` in `frontend/`.

## Project map

- `frontend/src/routes/`, `frontend/src/components/` - presentation and page layouts.
- `frontend/src/lib/api.ts` - browser-to-API HTTP client.
- `backend/server/` - Express endpoints, PBKDF2 password auth, and recipe logic.
- `backend/drizzle/` - RDS schema and SQL migrations.
- `frontend/src/routeTree.gen.ts` - generated TanStack Router file; do not edit.

## Milestone 2: authentication, API and security

- **Accounts:** `POST /api/auth/register`, `/login`, `/logout`, `GET /api/auth/session`. Passwords are salted PBKDF2-SHA256 (310,000 iterations); sessions are random tokens stored hashed, in `HttpOnly`, `SameSite=Strict` cookies.
- **Search (PostgreSQL):** `GET /api/pantry?q=` (ingredient autocomplete), `GET /api/recipes/search?q=&category=&cuisine=&tag=&limit=&offset=`, `GET /api/recipes/:id`. The catalog lives in the `ingredients` and `recipes` tables; load it with `npm run db:seed`.
- **Validation:** every request is parsed in `backend/server/validate.ts` before use; SQL goes through parameterized Drizzle queries. Evidence: `npm test` and `npm run demo:security` (both in `backend/`) (against any running API, e.g. `node backend/scripts/security-demo.mjs https://your-site`).
- **Logging:** one JSON line per event (`backend/server/logger.ts`); on AWS the CloudWatch agent ships `/var/log/thyme/api.log` to the `/thyme/api` log group. Passwords, tokens and full emails are never logged.
- **Secrets:** nothing secret is in the repo. On AWS the database credentials come from Secrets Manager through the EC2 instance role (`deploy/app/`).
- **Health check:** `GET /api/health` (add `?deep=1` to include a database check).
