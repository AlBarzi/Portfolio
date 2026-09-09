#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
import socket

for port in (6080, 5900):
    with socket.socket() as s:
        s.settimeout(2)
        if s.connect_ex(("127.0.0.1", port)) != 0:
            raise SystemExit(f"port {port} is not listening")

print("ok")
PY

