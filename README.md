# Thyme

Thyme is a pantry-to-recipe app organized as an AWS three-tier application:

- **Presentation:** React and Vite (`src/`); screens call the REST API.
- **Logic:** Express (`server/`); handles accounts, profiles, ingredient search, and recipe matching.
- **Data:** PostgreSQL on AWS RDS, accessed only by the API through Drizzle.

## Run locally

Requires Node.js and npm. Copy `.env.example` to `.env` and set the five RDS
variables to a PostgreSQL database you can reach. Keep `.env` private and never
commit real credentials. Run `npm run db:push` once to create/update the tables.

Start the API and web app in separate terminals:

```sh
npm run dev:api
npm run dev
```

The Vite dev server forwards `/api` requests to Express on port 3001. Production
deployments should host the Vite presentation tier and Node API tier separately
behind the same HTTPS origin.

Run `npm test`, `npm run lint`, and `npm run build` for checks.

## Project map

- `src/routes/` and `src/components/` — presentation and page layouts.
- `src/lib/api.ts` — browser-to-API HTTP client.
- `server/` — Express endpoints, PBKDF2 password auth, and recipe logic.
- `drizzle/` — RDS schema and SQL migration.
- `src/routeTree.gen.ts` — generated TanStack Router file; do not edit.
