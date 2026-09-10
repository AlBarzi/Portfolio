#!/usr/bin/env bash
# Entrypoint tout-en-un pour un hebergement mono-conteneur (Fly.io, Render...).
# Demarre PostgreSQL dans le conteneur, cree le role, puis lance le flux
# X11/VNC/app habituel (entrypoint.sh). La base est ephemere : l'app la
# reconstruit depuis les fichiers SQL a chaque demarrage.
set -euo pipefail

PGBIN="$(ls -d /usr/lib/postgresql/*/bin | head -n1)"
PGDATA=/var/lib/postgresql/data
PG_USER="${POSTGRES_USER:-worldcup}"
PG_PASS="${POSTGRES_PASSWORD:-worldcup}"

mkdir -p "$PGDATA"
chown -R postgres:postgres "$PGDATA"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  su postgres -c "$PGBIN/initdb -D '$PGDATA' --auth=trust --username=postgres" >/tmp/initdb.log 2>&1
fi

su postgres -c "$PGBIN/pg_ctl -D '$PGDATA' -o '-c listen_addresses=127.0.0.1 -p 5432' -w start" >/tmp/pg.log 2>&1

# Role applicatif (superuser : il cree la base coupe_du_monde au boot).
su postgres -c "psql -qtA -p 5432 -c \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${PG_USER}') THEN CREATE ROLE ${PG_USER} LOGIN SUPERUSER PASSWORD '${PG_PASS}'; ELSE ALTER ROLE ${PG_USER} PASSWORD '${PG_PASS}'; END IF; END \\$\\$;\"" >/tmp/pgrole.log 2>&1

# La cible que lira launch_worldcup.py.
export WORLDCUP_DB_HOST=127.0.0.1
export WORLDCUP_DB_PORT=5432
export WORLDCUP_DB_USER="$PG_USER"
export WORLDCUP_DB_PASSWORD="$PG_PASS"
export WORLDCUP_DB_NAME="${WORLDCUP_DB_NAME:-coupe_du_monde}"
export WORLDCUP_BOOTSTRAP_DB="${WORLDCUP_BOOTSTRAP_DB:-postgres}"

exec /opt/worldcup/scripts/entrypoint.sh
