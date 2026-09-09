#!/usr/bin/env bash
set -euo pipefail

: "${DISPLAY:=:1}"
: "${NOVNC_PORT:=6080}"
: "${VNC_PORT:=5900}"
: "${XVFB_WHD:=1280x800x24}"
: "${PORTFOLIO_URL:=http://localhost:5173/}"

export PORTFOLIO_URL

python - <<'PY'
from html import escape
import os
from pathlib import Path

vnc_html = Path("/usr/share/novnc/vnc.html")
if not vnc_html.exists():
    raise SystemExit(0)

content = vnc_html.read_text(encoding="utf-8")
if "portfolio-back-link" in content:
    raise SystemExit(0)

portfolio_url = escape(os.environ.get("PORTFOLIO_URL", "http://localhost:5173/"), quote=True)
link_html = (
    f'<a id="portfolio-back-link" href="{portfolio_url}" target="_top" '
    'rel="noopener noreferrer" '
    'style="position:fixed;top:12px;right:12px;z-index:2147483647;'
    'padding:8px 12px;border-radius:6px;background:#111;color:#fff;'
    'font:600 13px/1.2 Arial,sans-serif;text-decoration:none;'
    'box-shadow:0 2px 8px rgba(0,0,0,.25);">Retour au portfolio</a>'
)

if "<body>" in content:
    content = content.replace("<body>", f"<body>\n{link_html}", 1)
    vnc_html.write_text(content, encoding="utf-8")
PY

Xvfb "$DISPLAY" -screen 0 "$XVFB_WHD" -ac +extension RANDR > /tmp/xvfb.log 2>&1 &
xvfb_pid=$!

# Wait until the X11 socket is ready to avoid Tkinter startup races.
display_num="${DISPLAY#:}"
x_socket="/tmp/.X11-unix/X${display_num}"
for _ in $(seq 1 100); do
  if [ -S "$x_socket" ]; then
    break
  fi
  if ! kill -0 "$xvfb_pid" 2>/dev/null; then
    break
  fi
  sleep 0.1
done

if [ ! -S "$x_socket" ]; then
  echo "Xvfb did not create display socket $x_socket" >&2
  tail -n 80 /tmp/xvfb.log >&2 || true
  exit 1
fi

display_ready=0
for _ in $(seq 1 100); do
  if python - <<'PY' >/dev/null 2>&1
import tkinter as tk
r = tk.Tk()
r.destroy()
PY
  then
    display_ready=1
    break
  fi
  sleep 0.1
done

if [ "$display_ready" -ne 1 ]; then
  echo "Tkinter cannot connect to display $DISPLAY" >&2
  tail -n 80 /tmp/xvfb.log >&2 || true
  exit 1
fi

openbox > /tmp/openbox.log 2>&1 &

x11vnc \
  -display "$DISPLAY" \
  -rfbport "$VNC_PORT" \
  -forever \
  -shared \
  -nopw \
  -xkb > /tmp/x11vnc.log 2>&1 &

websockify --web=/usr/share/novnc/ "$NOVNC_PORT" "127.0.0.1:${VNC_PORT}" > /tmp/websockify.log 2>&1 &

exec python /opt/worldcup/scripts/launch_worldcup.py

