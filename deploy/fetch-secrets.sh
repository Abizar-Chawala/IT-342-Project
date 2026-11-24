#!/usr/bin/env bash
# Runs as root from the systemd unit (ExecStartPre=+) before the API starts.
# Reads the DB credentials from AWS Secrets Manager using the EC2 instance role, so there is
# no access key and no password anywhere on disk or in git. The file is written to /run
# (tmpfs, RAM only), readable by the service user only, and disappears on reboot.
set -euo pipefail

# shellcheck disable=SC1091
set -a; source /etc/thyme/api.env; set +a

umask 077
secret_json="$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ID" --region "$AWS_REGION" \
  --query SecretString --output text)"

SECRET_JSON="$secret_json" python3 - > /run/thyme/db.env <<'PY'
import json, os
s = json.loads(os.environ["SECRET_JSON"])
# json.dumps gives a double-quoted value with backslash escapes, which systemd's EnvironmentFile accepts.
print("RDS_USERNAME=" + json.dumps(s["username"], ensure_ascii=False))
print("RDS_PASSWORD=" + json.dumps(s["password"], ensure_ascii=False))
PY

chown thyme:thyme /run/thyme/db.env
chmod 600 /run/thyme/db.env
echo "fetch-secrets: loaded credentials for user $(SECRET_JSON="$secret_json" python3 -c 'import json,os;print(json.loads(os.environ["SECRET_JSON"])["username"])') from $SECRET_ID"
