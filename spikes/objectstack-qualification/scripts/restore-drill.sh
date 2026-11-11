#!/usr/bin/env bash
# TP-02 G3 — migration/backup/restore drill on disposable PostgreSQL.
#   1. `os migrate plan` reports the managed/federated split;
#   2. pg_dump the platform DB, restore into a scratch database;
#   3. boot a SECOND host instance against the restored DB with the same
#      OS_SECRET_KEY, and assert data + the encrypted datasource credential
#      both survive (federated read works).
set -euo pipefail

SPIKE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$SPIKE_DIR/maint-qual"
# shellcheck disable=SC1091
source "$SPIKE_DIR/local/.env"
COMPOSE="docker compose -f $SPIKE_DIR/infra/compose.yml --env-file $SPIKE_DIR/local/.env"
CID=tp02-qual-db-1
RESTORE_PORT=3101
RESTORE_DB=objectstack_restore_drill

cd "$APP_DIR"

echo "== 1. migrate plan =="
set -a; source "$SPIKE_DIR/local/app.env"; set +a
npx os migrate plan 2>&1 | grep -E "Examined|federated|No drift|drift" | head -5

echo "== 2. pg_dump + restore to scratch DB =="
mkdir -p "$SPIKE_DIR/local/backups"
DUMP="$SPIKE_DIR/local/backups/restore-drill.dump"
$COMPOSE exec -T db bash -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --file=/tmp/rd.dump'
docker cp "$CID:/tmp/rd.dump" "$DUMP"
docker exec -e PGPASSWORD="$PLATFORM_PG_PASSWORD" "$CID" \
  psql -U "$PLATFORM_PG_USER" -d postgres \
  -c "DROP DATABASE IF EXISTS $RESTORE_DB;" -c "CREATE DATABASE $RESTORE_DB;" >/dev/null
docker cp "$DUMP" "$CID:/tmp/rd-restore.dump"
docker exec -e PGPASSWORD="$PLATFORM_PG_PASSWORD" "$CID" \
  pg_restore -U "$PLATFORM_PG_USER" -d "$RESTORE_DB" --no-owner /tmp/rd-restore.dump
echo "restore complete"

echo "== 3. second instance against restored DB =="
set -a; source "$SPIKE_DIR/local/app.env"; set +a
export OS_ARTIFACT_PATH="$APP_DIR/dist/objectstack.json"
export OS_DATABASE_URL="postgres://$PLATFORM_PG_USER:$PLATFORM_PG_PASSWORD@localhost:55432/$RESTORE_DB"
export OS_PORT="$RESTORE_PORT"
nohup npx os start > "$SPIKE_DIR/local/host.restore-drill.log" 2>&1 &
DRILL_PID=$!
trap 'kill $DRILL_PID 2>/dev/null || true' EXIT
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$RESTORE_PORT/api/v1/health" 2>/dev/null || true)
  [ "$code" = "200" ] && break; sleep 1
done

TECH=$(grep '^TECH=' "$SPIKE_DIR/local/tokens.env" | cut -d= -f2)
OWNER=$(grep '^OWNER=' "$SPIKE_DIR/local/tokens.env" | cut -d= -f2)
B="http://localhost:$RESTORE_PORT"

WO_COUNT=$(curl -sS -H "Authorization: Bearer $OWNER" "$B/api/v1/data/maint_qual_work_order?limit=50" \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).records.length))')
PART_COUNT=$(curl -sS -H "Authorization: Bearer $TECH" "$B/api/v1/data/maint_qual_spare_part?limit=10" \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log(j.records?.length??"ERR:"+j.error.code)})')
SECRET_STATE=$(curl -sS -H "Authorization: Bearer $OWNER" "$B/api/v1/datasources/inventory_src" \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);const x=j.data?.datasource??j.data?.datasources?.[0]??{};console.log("hasSecret="+!!x.hasSecret)})')

echo "restored work orders: $WO_COUNT"
echo "federated parts via restored host: $PART_COUNT"
echo "datasource: $SECRET_STATE"

[ "$WO_COUNT" -ge 5 ] || { echo "FAIL: work order count"; exit 1; }
[ "$PART_COUNT" = "3" ] || { echo "FAIL: federated read through restored host"; exit 1; }
echo "RESTORE DRILL PASSED"
