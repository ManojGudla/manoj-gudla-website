#!/usr/bin/env bash
# Runs the schema + access-control tests against a throwaway PostgreSQL database.
# Usage: PGHOST=/var/tmp PGPORT=54329 PGUSER=postgres scripts/test-db.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB=${TEST_DB:-mg_test}
psql -q -d postgres -c "drop database if exists $DB" -c "create database $DB"
for f in tests/db/supabase-stub.sql supabase/migrations/0001_schema.sql supabase/migrations/0002_storage.sql supabase/migrations/0003_resources_services.sql supabase/seed.sql; do
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f" 2>&1 | grep -v NOTICE || true
done
psql -qtA -v ON_ERROR_STOP=1 -d "$DB" -f tests/db/rls.test.sql 2>&1 | grep -v "^$" | sed 's/^psql:[^ ]* NOTICE:  //'

# Upgrade path: a version-1 database (with the old GeoIntel content) upgraded with upgrade-v2.sql
UP=${DB}_upgrade
psql -q -d postgres -c "drop database if exists $UP" -c "create database $UP"
for f in tests/db/supabase-stub.sql supabase/migrations/0001_schema.sql supabase/migrations/0002_storage.sql tests/db/v1-sample.sql supabase/upgrade-v2.sql supabase/upgrade-v2.sql supabase/upgrade-v3.sql supabase/upgrade-v3.sql; do
  psql -q -v ON_ERROR_STOP=1 -d "$UP" -f "$f" 2>&1 | grep -v NOTICE || true
done
psql -qtA -d "$UP" -c "select 'upgrade: geointel=' || (select count(*) from projects where slug='manowj-geointel') || ' resources=' || (select count(*) from resources) || ' now=' || (select now_learning from profile) || ' kept_tagline=' || (select tagline from profile) || ' bca=' || (select count(*) from education where institution ilike '%Aditya%') || ' dashes=' || (select count(*) from interests where description like '%—%')"
