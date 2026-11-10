#!/usr/bin/env bash
# End-to-end test run: fresh database → fake Supabase services → production
# build of the app → browser tests. Requires a local PostgreSQL server
# (PGHOST/PGPORT/PGUSER), Google Chrome and Python Playwright.
set -euo pipefail
cd "$(dirname "$0")/../.."
export PGDATABASE=${PGDATABASE:-mg_e2e}
stop() { pkill -f "fake-supabase.mjs" 2>/dev/null || true; pkill -f "next start" 2>/dev/null || true; pkill -f "next-server" 2>/dev/null || true; }
stop; sleep 1
psql -q -d postgres -c "drop database if exists $PGDATABASE" -c "create database $PGDATABASE"
for f in tests/db/supabase-stub.sql supabase/migrations/0001_schema.sql supabase/migrations/0002_storage.sql supabase/migrations/0003_resources_services.sql supabase/seed.sql tests/e2e/setup-db.sql; do
  psql -q -v ON_ERROR_STOP=1 -f "$f" 2>&1 | grep -v NOTICE || true
done

export TEST_USERS='[{"id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","email":"admin@test.local","password":"correct horse battery staple"},{"id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","email":"visitor@test.local","password":"visitor password 123"}]'
export STORAGE_DIR=/var/tmp/fake-storage-e2e
rm -rf "$STORAGE_DIR"
PORT=54321 node tests/e2e/fake-supabase.mjs > /var/tmp/fake-supabase.log 2>&1 &
trap stop EXIT

export NEXT_PUBLIC_SITE_URL=http://localhost:3200
export NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
export NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key-0123456789abcdef0123456789
export SUPABASE_SERVICE_ROLE_KEY=test-service-key-0123456789abcdef01234567
export IP_HASH_SALT=e2e-salt
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DIST_DIR=.next-e2e
npx next build > /var/tmp/e2e-build.log 2>&1 || { tail -40 /var/tmp/e2e-build.log; exit 1; }
PORT=3200 npx next start > /var/tmp/e2e-app.log 2>&1 &
for i in $(seq 1 60); do curl -sf -o /dev/null http://localhost:3200/ && break; sleep 1; done
if [ "${1:-}" = "serve" ]; then echo "Servers running on :3200 and :54321"; trap - EXIT; exit 0; fi
python3 tests/e2e/test_app.py "$@"
