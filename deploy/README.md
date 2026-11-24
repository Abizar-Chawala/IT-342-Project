# deploy/

Files for the AWS 3-tier setup. Full step-by-step instructions are in the Milestone 2 playbook.

| File | Goes to | Tier |
| --- | --- | --- |
| `api.env.example` | `/etc/thyme/api.env` (edit values) | app |
| `fetch-secrets.sh` | `/opt/thyme/deploy/fetch-secrets.sh` (already there after `git clone`) | app |
| `thyme-api.service` | `/etc/systemd/system/thyme-api.service` | app |
| `thyme-logrotate` | `/etc/logrotate.d/thyme` | app |
| `cloudwatch-agent-app.json` | `/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json` | app |
| `cloudwatch-agent-web.json` | same path, on the web server | web |
| `nginx-api-proxy.conf` | inside the nginx `server { }` block | web |
| `iam/app-instance-secret-read.json` | inline policy on the app server's IAM role (edit the ARN) | app |
| `db-app-user.sql` | run once against RDS as the master user (optional) | data |

No file here contains a real password, key or endpoint.
