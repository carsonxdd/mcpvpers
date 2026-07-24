#!/usr/bin/env bash
# Daily pg_dump of the multi-tenant Postgres container (tenants, memberships,
# rules, news, Auth.js sessions). Run via cron on the Pi — see README for the
# crontab line. Not needed for the base pvpers site, which has no DB.
set -euo pipefail

CONTAINER="mcpvpers-postgres"
DB="mcpvpers"
DB_USER="mcpvpers"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/mcpvpers-postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
TMP="$BACKUP_DIR/.mcpvpers-$STAMP.sql.gz.tmp"
OUT="$BACKUP_DIR/mcpvpers-$STAMP.sql.gz"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB" | gzip > "$TMP"
mv "$TMP" "$OUT"

find "$BACKUP_DIR" -name 'mcpvpers-*.sql.gz' -mtime "+$RETENTION_DAYS" -delete

echo "$(date -Is) backup ok: $OUT ($(du -h "$OUT" | cut -f1))"
