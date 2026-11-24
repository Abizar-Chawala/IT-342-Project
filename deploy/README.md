# deploy/

Files for the AWS 3-tier setup, grouped by the tier (server) they belong on. Full step-by-step
instructions are in the Milestone 2 playbook.

## deploy/app/ — application tier (private subnets, backend/)

| File | Goes to |
| --- | --- |
| `api.env.example` | `/etc/thyme/api.env` (edit values) |
| `fetch-secrets.sh` | `/opt/thyme/deploy/app/fetch-secrets.sh` (already there after `git clone`) |
| `thyme-api.service` | `/etc/systemd/system/thyme-api.service` (runs `backend/` from `/opt/thyme/backend`) |
| `thyme-logrotate` | `/etc/logrotate.d/thyme` |
| `cloudwatch-agent-app.json` | `/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json` |
| `iam/app-instance-secret-read.json` | inline policy on the app server's IAM role (edit the ARN) |
| `db-app-user.sql` | run once against RDS as the master user (optional) — data tier |

The app server only needs the `backend/` folder: `cd /opt/thyme/backend && npm ci --omit=dev`
(`tsx` is a runtime dependency, so `--omit=dev` is fine).

## deploy/web/ — presentation tier (public subnets, frontend/)

| File | Goes to |
| --- | --- |
| `thyme-web.service` | `/etc/systemd/system/thyme-web.service` (runs `frontend/.output/server/index.mjs` on 127.0.0.1:3000) |
| `thyme.conf` | `/etc/nginx/conf.d/thyme.conf` (full server block: `/` to the Node frontend, `/api/` to the app server; edit `APP_PRIVATE_IP`) |
| `cloudwatch-agent-web.json` | `/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json` |
| `nginx-api-proxy.conf` | older snippet for a setup with an internal ALB in front of the app tier; not used while there is no ALB |

The web server only needs the `frontend/` folder: build it with `npm ci && npm run build` in
`frontend/` and serve the result (see the repo README).

No file here contains a real password, key or endpoint.
