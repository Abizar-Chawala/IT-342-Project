# Thyme: project notes for Claude

Thyme is a pantry-to-recipe web app for IT 342 (Cloud Admin), deployed as an **AWS 3-tier** application.
Milestone 2 (authentication, API, security) was due 2026-11-24. Milestone 3 is due 2026-12-08.
Also read `AGENTS.md` (Lovable warning) and `README.md`.

**Status (2026-11-24, confirmed by the user): the deployed app works end to end.** Browser -> nginx on the web EC2
-> API on the app EC2 -> RDS. Registration and sign-in work. Remaining Milestone 2 evidence and cleanup items are
in "Open items" below.

## Repo layout (branch `three-tier-split`, pushed to origin; `main` still has the old single-package layout)

```
frontend/   presentation tier: React + TanStack Start (src/, public/, own package.json)
backend/    application tier: Express API (server/) + data tier schema (drizzle/, scripts/)
deploy/app/ app-tier AWS files: systemd unit, fetch-secrets.sh, api.env.example, logrotate,
            CloudWatch agent config, IAM policy example, db-app-user.sql
deploy/web/ web-tier AWS files: nginx proxy snippet, CloudWatch agent config
docker-compose.yml   local Postgres only
CLAUDE.md   this file (not committed yet when last checked)
```

- The tiers share no code. Frontend -> backend only over HTTP `/api/*`; only the backend touches the DB.
- `backend/server/types.ts` is a copy of `frontend/src/lib/types.ts` (the API contract). Keep them in sync.
- Each folder has its own package.json, tsconfig, vitest and eslint config, and lockfile.
- **Lovable is connected to the repo and expects the app at the root; do not merge the split into the
  Lovable-tracked branch without deciding about that.** Never rewrite pushed history (see `AGENTS.md`).
- `frontend/.output/` (the Nitro `node-server` build) is tracked in git and self-contained: the web server runs
  `node .output/server/index.mjs` with no `npm install`. Rebuild with `npm run build` in `frontend/` and commit it
  when the frontend changes.

## Local development

Needs Node >= 20.12 (verified on 26.13.1) and Docker Desktop for the database.

```
cd backend  && npm install && cp .env.example .env && npm run db:setup && npm run dev   # API :3001
cd frontend && npm install && npm run dev                                                # web :8080
```
Checks (all passed after the split): `npm test`, `npm run lint` in both folders; `npm run typecheck` in
`backend/`; `npm run build` in `frontend/`. The 4 DB-backed API tests skip without a configured database.
If a local `backend/.env` exists but Docker/Postgres is not running, `server/api.test.ts` fails with
`ECONNREFUSED 127.0.0.1:5432` (not a code bug; start the DB or remove `.env`).

## Production architecture (AWS, from architecture.jpg)

Region **us-east-2** for EC2, RDS and the Secrets Manager secret. VPC 10.0.0.0/16, two AZs. Web EC2 (nginx + Node
frontend) in a public subnet, app EC2 (Express) in a private subnet, RDS PostgreSQL in private subnets. The ALB(s)
from the diagram are NOT built yet (Milestone 3), so the web EC2 takes traffic directly over plain HTTP.

Request flow now: `browser -> nginx :80 (web EC2) -> / to Node 127.0.0.1:3000, /api/ to app EC2 :3001 -> RDS :5432`

Current private IPs (they change if an instance is replaced; nginx must then be updated):
web EC2 `10.0.25.63`, app EC2 `10.0.155.171`.

### Security groups
- `thyme-web-sg`: in 80/443 from 0.0.0.0/0 (later: from `thyme-alb-sg` only); SSH from my IP or use SSM.
- `thyme-app-sg`: in 3001 from `thyme-web-sg`; out 5432 to `thyme-db-sg`, out 443 (Secrets Manager, CloudWatch, npm, git).
- `thyme-db-sg`: in 5432 from `thyme-app-sg` only; RDS public access = No.
- The app server reached the internet through a NAT gateway while it existed (installs and git clone succeeded); the NAT
  was later deleted to save cost (see the cost runbook), so recreate it before restarting the API or installing. One NAT is
  enough for M2; a second per-AZ NAT is the proper HA design for M3 (about $33/month each plus data).
  A NAT is not "attached" to a subnet: the private subnet's route table needs `0.0.0.0/0 -> nat-...`.
  Ping is not a valid test (SG allows TCP only); use `curl -I https://registry.npmjs.org`.

### IAM
- Two roles (least privilege): web role (`CloudWatchAgentServerPolicy`, `AmazonSSMManagedInstanceCore`) and the app
  role, actually named `thyme-app-ec2-role` (same two policies + an inline policy reading exactly one secret).
- Inline policy: `secretsmanager:GetSecretValue` and `DescribeSecret` on the **us-east-2** ARN of
  `thyme/db-credentials` (exact ARN with its random suffix, or `...secret:thyme/db-credentials-*`).
- No access keys anywhere; instances use instance-role credentials.

### Secrets and config
- DB username/password live only in Secrets Manager (`thyme/db-credentials`, JSON `{"username","password"}`); the DB
  user is the RDS master user `postgres`. `deploy/app/fetch-secrets.sh` writes them to `/run/thyme/db.env` (tmpfs).
- Non-secret config in `/etc/thyme/api.env` (copy of `deploy/app/api.env.example`; mode 640 root:thyme). Values in use:
  `NODE_ENV=production`, `PORT=3001`, `RDS_HOSTNAME=thyme-postgres-db.c90460qcmvce.us-east-2.rds.amazonaws.com`,
  `RDS_PORT=5432`, `RDS_DB_NAME=thyme`, `RDS_SSL=true`, `SECRET_ID=thyme/db-credentials`, `AWS_REGION=us-east-2`,
  `TRUST_PROXY_HOPS=1` (only nginx fronts the API; use 3 only with public ALB + nginx + internal ALB),
  `COOKIE_SECURE=false` (see problems; **must go back to true once HTTPS exists**).
- The `thyme` database had to be created by hand (RDS created only the default `postgres` DB).

## Deployed server setup (what was actually done)

App EC2 (`/opt/thyme`, service user `thyme`):
1. Node installed system-wide in `/usr/local` (official tarball with checksum check; needs `xz libatomic`), then
   `npm install -g npm@11`.
2. `git clone -b three-tier-split https://github.com/Abizar-Chawala/IT-342-Project /opt/thyme`; `cd backend && sudo npm ci`
   (full install: `drizzle-kit` is a dev dependency needed for `db:push`); `chmod +x deploy/app/fetch-secrets.sh`;
   `chown -R thyme:thyme /opt/thyme`.
3. `/etc/thyme/api.env` created and filled in (above); `fetch-secrets.sh` must print "loaded credentials".
4. Created DB: `sudo dnf install -y postgresql15`, then `psql ... dbname=postgres sslmode=require -c "CREATE DATABASE thyme;"`
   using the credentials from `/run/thyme/db.env` (RDS is private: only the app EC2 can reach it).
5. Schema + data: `sudo bash -c '/opt/thyme/deploy/app/fetch-secrets.sh && set -a && . /etc/thyme/api.env && . /run/thyme/db.env && set +a && npm run db:push && npm run db:seed'` in `backend/`.
6. `deploy/app/thyme-api.service` copied to `/etc/systemd/system/`, `systemctl enable --now thyme-api`.
   Health: `curl localhost:3001/api/health?deep=1`. Logs: `/var/log/thyme/api.log` (one JSON line per event).

Web EC2 (`/opt/thyme`, service user `thyme-web`):
1. Node (system-wide tarball), nginx, git installed; repo cloned the same way.
2. `thyme-web.service` (not yet in the repo): `User=thyme-web`, `WorkingDirectory=/opt/thyme/frontend`,
   `Environment=HOST=127.0.0.1`, `Environment=PORT=3000`, `ExecStart=/usr/local/bin/node .output/server/index.mjs`.
3. `/etc/nginx/conf.d/thyme.conf` (not yet in the repo): `listen 80 default_server`; `location /api/` proxies to
   `http://10.0.155.171:3001`; `location /` proxies to `http://127.0.0.1:3000`; both keep
   `proxy_set_header Host $http_host` (the API's CSRF check compares Origin with Host) and X-Forwarded-* headers.
4. The stock Amazon Linux server block in `/etc/nginx/nginx.conf` was moved from port 80 to 8081 (backup at
   `nginx.conf.bak`) so only `thyme.conf` serves port 80.

## Problems we hit and how they were solved

| Problem | Cause | Fix |
| --- | --- | --- |
| `npm` blocked in PowerShell (`running scripts is disabled`) | Execution policy | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or run `npm.cmd` / use cmd |
| Node not on this Windows machine | Not installed | `winget install OpenJS.NodeJS.LTS`; open a new terminal |
| Backend typecheck failed after the split | Two backend files still imported `../../src/lib/types.ts` | Copied the types to `backend/server/types.ts` and fixed imports |
| Lint reported 3,000+ prettier errors (`Delete ␍`) | Git checks out CRLF on Windows | `"endOfLine": "auto"` in all `.prettierrc` files |
| `README.md` was wiped to 0 bytes mid-edit | Python wrote a non-cp1252 character to a file on Windows | Restored with `git checkout HEAD -- README.md`; edit with `io.open(..., encoding="utf-8")` |
| `sudo: /opt/thyme/deploy/app/fetch-secrets.sh: command not found` | Windows git commits scripts as 644; no executable bit | `sudo chmod +x` (repo fix still pending: `git update-index --chmod=+x`) |
| Same error shape, file really missing | Repo not cloned at `/opt/thyme`, or non-empty dir blocks `git clone` | Clone to `/opt/thyme` on branch `three-tier-split`; move an existing non-repo dir aside |
| `fetch-secrets.sh: /etc/thyme/api.env: No such file` | Config step skipped | Copy `api.env.example` to `/etc/thyme/api.env` and edit |
| `AccessDeniedException` on `GetSecretValue` (twice) | Inline secret-read policy missing from `thyme-app-ec2-role`, then policy ARN in us-east-1 while the secret is in us-east-2 | Add the inline policy with the exact us-east-2 ARN and set `AWS_REGION=us-east-2` |
| `node: libatomic.so.1: cannot open shared object file` | NodeSource Node 22 needs the library | `sudo dnf install -y libatomic` |
| `npm: command not found` / `sudo npm` fails | Node was installed with nvm in a user home; sudo and systemd can't see it | Install Node system-wide in `/usr/local` (never rely on nvm for a systemd service) |
| `EACCES mkdir /opt/thyme/backend/node_modules` | Folder owned by root/thyme, not ec2-user | `chown` to the installing user, install, then `chown -R thyme:thyme /opt/thyme` |
| `npm ci` -> `EBADPLATFORM @esbuild/aix-ppc64@0.28.2` | `backend/package-lock.json` has a stale `extraneous` esbuild entry; npm 10 (bundled with Node 22) errors on it, npm 11 ignores it | `sudo npm install -g npm@11`, then `npm ci`. Regenerating the lockfile did not remove the entries |
| `drizzle-kit: command not found` | Dependencies not installed on the app server | Full `sudo npm ci` in `backend/` (not `--omit=dev`) |
| `/run/thyme/db.env: No such file` right after fetch-secrets | `/run/thyme` is a systemd RuntimeDirectory and is removed when `thyme-api` stops or restarts | Run `fetch-secrets.sh` and the DB command in one `sudo bash -c`; stop the service first if it is crash-looping |
| `pgCode 3D000: database "thyme" does not exist` | RDS only creates a DB if an initial name was given | Created `thyme` with `psql` from the app EC2, then `db:push` and `db:seed` |
| nginx kept serving its stock 404 page; `conflicting server name "_"` warning | Stock server block on port 80 also uses `server_name _` and won the match | Moved the stock block to port 8081; `thyme.conf` is the only server on port 80 |
| Browser: "Couldn't verify your session" | The browser's `GET /api/auth/session` failed; nginx `proxy_pass` pointed at `10.0.25.63` (the web server itself), not the app server | Changed `proxy_pass` to the app EC2's private IP `10.0.155.171:3001` and reloaded nginx |
| Login would appear to work but the session is dropped | In production the session cookie has `Secure`; browsers refuse it over plain HTTP | `COOKIE_SECURE=false` in `/etc/thyme/api.env` and restart. Revert when HTTPS exists |
| SSM agent "inactive" / Session Manager unavailable | Role missing/propagating, agent stopped, or no outbound 443 | Role with `AmazonSSMManagedInstanceCore`, `systemctl enable --now amazon-ssm-agent`, NAT/SG outbound 443. SSH works as a fallback |
| Web EC2 public IP not responding | Typical causes: browser forced `https://`, SG rule source, nginx not listening, subnet not public | Use `http://`; check SG (80 from 0.0.0.0/0), `ss -tlnp`, IGW route; `Test-NetConnection <ip> -Port 80` |
| Web `RDS_DB_NAME` / secret region confusion | RDS and instances in us-east-2, early policy and `AWS_REGION` said us-east-1 | Everything is us-east-2 now; keep region consistent across policy, `api.env` and CloudWatch console |
| Could not ping Google from the app EC2 after attaching the NAT | `thyme-app-sg` outbound allows TCP only, so ICMP is blocked by design; ping is not a valid test | Test with `curl -sI https://registry.npmjs.org`; if that fails check route table, NAT state/public subnet, IGW route, NACL, DNS settings |
| "How do I attach the NAT to the other subnet?" | A NAT is not attached to subnets; private subnets use it through their route table | Add `0.0.0.0/0 -> nat-...` to the AZ-B private route table (do not touch the DB subnets) |
| Cannot release the Elastic IP after deleting the NAT gateway | The NAT is still in "Deleting" and its network interface holds the EIP, or the EIP belongs to an instance | Wait until the NAT shows "Deleted"; check the EIP's association fields; disassociate first only if it is not needed; then Release |
| Test account password forgotten (`test1@example.com`) | Hashes cannot be reversed; the demo password used in the curl example was `Str0ng!Passw0rd` | Register a new test account or `DELETE FROM users WHERE email = ...` (profiles/sessions cascade); use throwaway passwords only |
| Earlier mistake in these notes' history: `10.0.25.63` was called an "old instance" | It is the web EC2's own private IP, so nginx was proxying to itself | Use the app EC2 IP `10.0.155.171`; confirm IPs in the EC2 console before editing `proxy_pass` |

## Code map (where things live)

All backend paths are under `backend/server/`; line numbers are from branch `three-tier-split` and may drift.
- **Password hashing:** `passwords.ts`. `hashPassword()` = PBKDF2-SHA256, random 16-byte salt, `ITERATIONS = 310_000`,
  stored as `pbkdf2-sha256$<iters>$<salt>$<key>`; `verifyPassword()` uses `timingSafeEqual`. Used in `app.ts`
  (register ~L263, login ~L302). Unknown emails are verified against a dummy hash so login timing does not leak accounts.
- **Input validation:** `validate.ts` (the live one): `parseRegistration`, `parseLogin`, `parseEmail`,
  `parseNewPassword` (length 8-128 from `LIMITS`, then `isStrongPassword` in the older `validation.ts` for the
  upper/lower/number/symbol rule), `parseProfile`, `parseRecipeRequest`, `parseQueryText`, `parseIntParam`.
  `validation.ts` is otherwise only used by tests. Login is deliberately lenient on password rules.
- **Auth/sessions (`app.ts`):** register (~L254) and login (~L292) create a random 32-byte token; only its SHA-256 is
  stored in `sessions` (7-day expiry); the raw token is the `thyme_session` cookie (`HttpOnly`, `SameSite=Strict`,
  `Secure` in production unless `COOKIE_SECURE=false`). `sessionUserId` (~L78) resolves the cookie, `requireAuth`
  guards `/api/profile`, `GET /api/auth/session` (~L240) feeds the frontend, logout deletes the session row.
- **API lookup:** routes in `app.ts`: `GET /api/pantry` (~L343), `GET /api/recipes/search` (~L362),
  `GET /api/recipes/:id` (~L393), `POST /api/recipes` (~L433, pantry matching via `engine/match.ts`),
  `GET /api/health` (`?deep=1` checks the DB). Queries are parameterized Drizzle in `catalog.ts`
  (`searchIngredients`, `searchRecipes`, `getRecipeById`, cached `getCatalogRecipes`; `escapeLike` for patterns).
  Frontend callers: `IngredientSearch.tsx` (`/api/pantry`), `_authenticated/results.tsx` (`/api/recipes`),
  everything via `frontend/src/lib/api.ts`.
- **Other protections:** rate limiting `rateLimit.ts` (api/login/register limiters), CSRF Origin-vs-Host check
  (~L165-183, which is why nginx must pass `Host $http_host`), JSON logger `logger.ts` (never logs passwords, tokens or full emails).
- **Ports:** 80/443 nginx (web EC2); 3000 Node frontend bound to 127.0.0.1; 3001 Express API (`PORT` in `api.env`);
  5432 RDS; 8081 the relocated stock nginx block (not open in any SG).

## How to test and demo (evidence for Milestone 2)

- **Security demo:** `node backend\scripts\security-demo.mjs http://<web-public-ip>` prints a pass/fail table (SQL injection
  text, wrong types, malformed JSON, oversized body, weak password, login bypass attempts). `--ratelimit` also exercises
  the limiter; run it last. Unit tests: `npm test` in `backend/` (`validate.test.ts`, `validation.test.ts`, `passwords.test.ts`).
- **Manual injection tests:** strings like `' OR '1'='1` and `' UNION SELECT email, password_hash FROM users--` in the search
  box and password field must return 400/401 or normal/empty results, never data or SQL errors; `'; DROP TABLE users;--`
  must do nothing (check with `SELECT count(*) FROM users;`). The email input may block the payload client-side; use curl then.
  POSTs through nginx need an `Origin: http://localhost` header for the CSRF check.
- **Show hashing:** register two users with the same throwaway password, then in `psql`
  `SELECT email, password_hash FROM users WHERE email LIKE 'hashdemo%';` shows different salted `pbkdf2-sha256$310000$...`
  values; `grep -c "<password>" /var/log/thyme/api.log` must be 0; delete the test users afterwards.
- **psql into RDS (only possible from the app EC2, RDS is private):**
  `sudo bash -c 'set -a; . /etc/thyme/api.env; . /run/thyme/db.env; set +a; PGPASSWORD="$RDS_PASSWORD" psql "host=$RDS_HOSTNAME port=$RDS_PORT user=$RDS_USERNAME dbname=$RDS_DB_NAME sslmode=require"'`
  (works while `thyme-api` is running; `/run/thyme/db.env` is its runtime dir). Useful: `\dt`, `\d users`,
  `SELECT id, email, created_at FROM users;`. For a GUI, tunnel with SSM port forwarding to `localhost:5433`; never make RDS public.
  The website must never expose table contents.
- **Layered connectivity tests:** app EC2 `curl localhost:3001/api/health?deep=1`; web EC2
  `curl http://10.0.155.171:3001/api/auth/session` (direct) vs `curl localhost/api/auth/session` (through nginx);
  browser DevTools Network tab for `/api/auth/session`. Negative SG tests from a laptop: `Test-NetConnection <rds> -Port 5432`
  and `<app-private-ip> -Port 3001` must time out.
- **CloudWatch:** console region **us-east-2** -> Logs -> Log groups `/thyme/api`, `/thyme/web-access`, `/thyme/web-error`;
  Logs Insights query `fields @timestamp, @message | sort @timestamp desc | limit 20`; metrics namespace `Thyme`.
  Agent status: `sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a status`.

## Cost control runbook (stop/delete when idle)

- **NAT gateway** (~$1/day, cannot be stopped): delete it and release its Elastic IP; recreate on restart and repoint the
  private route table's `0.0.0.0/0` to the new NAT. **Status at last update: the NAT gateway was deleted** (so the app EC2 has
  no outbound internet: no `npm`, `git`, Secrets Manager fetch on restart, or CloudWatch shipping until a NAT is recreated).
- **ALB** (once built): cannot be stopped; delete it when idle.
- **RDS:** Actions -> Stop temporarily; AWS auto-restarts it after **7 days**, so re-check. Storage is billed while stopped.
- **EC2:** stop instances. Private IPs persist across stop/start (nginx `proxy_pass` stays valid); public IPs change unless an
  Elastic IP is attached. Services are systemd-enabled and start on boot.
- **Elastic IPs** bill when allocated and unattached: release unused ones. Delete orphaned EBS volumes and snapshots.
- **Startup order:** new NAT + route -> start RDS (wait for Available) -> start app EC2 (check `/api/health?deep=1`) -> start
  web EC2 (use its new public IP) -> test the site and CloudWatch.
- Keep the AWS Budgets alert (suggested $75; 50% and 80% actual, 100% forecast). Do not tear everything down before the
  Milestone 3 demonstration screenshots; after grading, delete NAT(s), ALB, RDS, EC2, volumes, EIPs and unused SGs.

## HTTPS plan (not built yet)

Certificates need a domain name (not a bare IP or `*.amazonaws.com`). Plan: domain (Route 53 or any registrar that allows CNAMEs)
-> ACM certificate in us-east-2 (DNS validation) -> `thyme-alb-sg` (80/443 from 0.0.0.0/0) -> target group (HTTP 80, health
check `/` or `/api/health`) -> internet-facing ALB in two public subnets (HTTPS 443 forward, HTTP 80 redirect) -> DNS alias to
the ALB -> restrict `thyme-web-sg` port 80 to `thyme-alb-sg`. Then on the servers: nginx must send
`proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;` (not `$scheme`, which is always http behind the ALB), optionally add
HSTS; on the app set `COOKIE_SECURE=true` and `TRUST_PROXY_HOPS=2` (ALB + nginx), then restart `thyme-api`. Verify the logged
`ip` is the real client IP. Without a domain, a self-signed certificate is the only option and browsers will warn.

## Open items

Milestone 2 evidence and cleanup (statuses unconfirmed unless noted above):
- [ ] CloudWatch agent on BOTH tiers: log groups `/thyme/api`, `/thyme/web-access`, `/thyme/web-error`, namespace
      `Thyme`; check the console region is us-east-2. Screenshot log lines and one Logs Insights query.
- [ ] Run `node backend/scripts/security-demo.mjs http://<web-public-ip>` and save the output (injection/validation proof).
- [ ] Negative tests for the security groups (RDS 5432 and app 3001 should time out from the internet); screenshot SG rules.
- [ ] AWS Budgets monthly alert (suggested $75; 50% and 80% actual, 100% forecast) plus optional CloudWatch billing alarm.
- [ ] Update Trello (30% of the grade) and document AI usage.
- [ ] Remove port 22 rules if Session Manager works on both tiers.
Repo cleanup (not done yet):
- [ ] Commit `CLAUDE.md`; commit the executable bit for `deploy/app/fetch-secrets.sh`; push.
- [ ] Save `thyme-web.service` and the real `thyme.conf` into `deploy/web/`; update `deploy/web/nginx-api-proxy.conf` (it still references an internal ALB placeholder).
- [ ] Consider `"engines": {"node": ">=22", "npm": ">=11"}` in both package.json files, and stop tracking `frontend/.output`.
- [ ] Switch the app to a least-privilege DB user (`deploy/app/db-app-user.sql`) instead of the master user.

## Milestone 3 reminders
Email verification or MFA; billing alerts and documented cost controls; HA across two AZs (public ALB with ACM HTTPS,
internal ALB so nginx stops using a hard-coded app IP, second NAT, test failover); scaling/recovery demo; final
diagram and deployment instructions matching the live environment; short write-up of security, cost, availability and
scaling decisions. When HTTPS exists: set `COOKIE_SECURE=true`, set `TRUST_PROXY_HOPS` to the real hop count, and
tighten `thyme-web-sg` to accept 80 only from the ALB. Tear down the NAT gateway(s), ALB, RDS and release Elastic
IPs after grading to stop charges.
