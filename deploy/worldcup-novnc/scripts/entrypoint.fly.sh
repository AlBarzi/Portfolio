#!/usr/bin/env bash
# Entrypoint tout-en-un pour hebergement mono-conteneur (Fly.io, HF Spaces...).
# Demarre PostgreSQL dans le conteneur, cree le role, puis lance le flux
# X11/VNC/app habituel (entrypoint.sh). La base est ephemere : l'app la
# reconstruit depuis les fichiers SQL a chaque demarrage.
#
# Robuste root ET non-root : certains hebergeurs lancent le conteneur avec
# un uid non privilegie ; PostgreSQL refuse de tourner en root, donc on
# adapte selon l'utilisateur courant.
set -euo pipefail

PGBIN="$(ls -d /usr/lib/postgresql/*/bin | head -n1)"
PG_USER="${POSTGRES_USER:-worldcup}"
PG_PASS="${POSTGRES_PASSWORD:-worldcup}"

if [ "$(id -u)" = "0" ]; then
  PGDATA=/var/lib/postgresql/data
  mkdir -p "$PGDATA"
  chown -R postgres:postgres "$PGDATA"
  as_pg() { su postgres -c "$1"; }
else
  # Non-root : on possede un repertoire dans /tmp et on lance tout soi-meme.
  PGDATA=/tmp/pgdata
  mkdir -p "$PGDATA"
  as_pg() { bash -c "$1"; }
fi

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  as_pg "$PGBIN/initdb -D '$PGDATA' --auth=trust --username=postgres" >/tmp/initdb.log 2>&1
fi

as_pg "$PGBIN/pg_ctl -D '$PGDATA' -o '-c listen_addresses=127.0.0.1 -p 5432' -w start" >/tmp/pg.log 2>&1

# Role applicatif (superuser : il cree la base coupe_du_monde au boot).
as_pg "$PGBIN/psql -qtA -p 5432 -U postgres -d postgres -c \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${PG_USER}') THEN CREATE ROLE ${PG_USER} LOGIN SUPERUSER PASSWORD '${PG_PASS}'; ELSE ALTER ROLE ${PG_USER} PASSWORD '${PG_PASS}'; END IF; END \\$\\$;\"" >/tmp/pgrole.log 2>&1

# La cible que lira launch_worldcup.py.
export WORLDCUP_DB_HOST=127.0.0.1
export WORLDCUP_DB_PORT=5432
export WORLDCUP_DB_USER="$PG_USER"
export WORLDCUP_DB_PASSWORD="$PG_PASS"
export WORLDCUP_DB_NAME="${WORLDCUP_DB_NAME:-coupe_du_monde}"
export WORLDCUP_BOOTSTRAP_DB="${WORLDCUP_BOOTSTRAP_DB:-postgres}"

exec /opt/worldcup/scripts/entrypoint.sh
