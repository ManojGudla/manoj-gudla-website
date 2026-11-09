#!/usr/bin/env bash
# Runs the schema + access-control tests against a throwaway PostgreSQL database.
# Usage: PGHOST=/var/tmp PGPORT=54329 PGUSER=postgres scripts/test-db.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB=${TEST_DB:-mg_test}
psql -q -d postgres -c "drop database if exists $DB" -c "create database $DB"
for f in tests/db/supabase-stub.sql supabase/migrations/0001_schema.sql supabase/migrations/0002_storage.sql supabase/seed.sql; do
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f" 2>&1 | grep -v NOTICE || true
done
psql -qtA -v ON_ERROR_STOP=1 -d "$DB" -f tests/db/rls.test.sql 2>&1 | grep -v "^$" | sed 's/^psql:[^ ]* NOTICE:  //'
