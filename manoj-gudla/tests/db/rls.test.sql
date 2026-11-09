-- =====================================================================
-- Database access-control tests.
-- Run against a database with tests/db/supabase-stub.sql, both
-- migrations and seed.sql applied (see scripts/test-db.sh).
-- Every block raises an exception on failure; psql stops at the first.
-- =====================================================================
\set ON_ERROR_STOP 1

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'admin@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'stranger@example.test');
insert into public.admin_users (user_id, role) values
  ('11111111-1111-4111-8111-111111111111', 'owner');

-- Draft project with a screenshot, used to test visibility rules.
insert into public.media_assets (id, storage_path, file_name, mime_type, size_bytes, category)
values ('33333333-3333-4333-8333-333333333333', 'project/x.webp', 'x.webp', 'image/webp', 100, 'project');
insert into public.projects (id, slug, title, status)
values ('44444444-4444-4444-8444-444444444444', 'secret-draft', 'Secret draft', 'draft');
insert into public.project_images (project_id, media_id)
values ('44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333');

create or replace function pg_temp.as_role(r text, sub text default null) returns void
language plpgsql as $$
begin
  perform set_config('role', r, false);
  perform set_config('request.jwt.claim.sub', coalesce(sub, ''), false);
end $$;

create or replace function pg_temp.check(ok boolean, msg text) returns void
language plpgsql as $$
begin
  if not ok then raise exception 'FAIL: %', msg; end if;
  raise notice 'pass: %', msg;
end $$;

-- ---------------------------------------------------------------- anon
select pg_temp.as_role('anon');
select pg_temp.check((select count(*) from projects) = 1, 'anon sees only the published project');
select pg_temp.check((select count(*) from projects where slug = 'secret-draft') = 0, 'anon cannot see draft project');
select pg_temp.check((select count(*) from project_images) = 0, 'anon cannot see images of a draft project');
select pg_temp.check((select count(*) from creator_stats) = 0, 'anon cannot see draft creator stats');
select pg_temp.check((select count(*) from experience) = 1, 'anon sees only published experience');
select pg_temp.check((select count(*) from profile) = 1, 'anon can read profile');
select pg_temp.check((select count(*) from enquiries) = 0, 'anon cannot read enquiries');
select pg_temp.check((select count(*) from admin_users) = 0, 'anon cannot read admin users');

do $$ begin
  insert into enquiries (full_name, email, category, subject, message)
  values ('x', 'x@x.io', 'general', 's', 'hello there friend');
  raise exception 'FAIL: anon inserted an enquiry directly';
exception when insufficient_privilege then raise notice 'pass: anon cannot insert enquiries directly';
end $$;

do $$ begin
  perform submit_enquiry('x','x@x.io','','general','s','hello there friend','ip','ua');
  raise exception 'FAIL: anon called submit_enquiry';
exception when insufficient_privilege then raise notice 'pass: anon cannot call submit_enquiry';
end $$;

update projects set title = 'hacked' where slug = 'manowj-geointel';
select pg_temp.check((select title from projects where slug = 'manowj-geointel') = 'maNOWj GeoIntel', 'anon update has no effect');

do $$ begin
  insert into projects (slug, title) values ('evil', 'Evil');
  raise exception 'FAIL: anon inserted a project';
exception when insufficient_privilege then raise notice 'pass: anon cannot insert projects';
end $$;

do $$ begin
  insert into storage.objects (bucket_id, name) values ('media', 'evil.png');
  raise exception 'FAIL: anon uploaded to storage';
exception when insufficient_privilege then raise notice 'pass: anon cannot upload media';
end $$;

-- ------------------------------------------- signed-in but not an admin
select pg_temp.as_role('authenticated', '22222222-2222-4222-8222-222222222222');
select pg_temp.check(not is_admin(), 'stranger is not admin');
select pg_temp.check((select count(*) from creator_stats) = 0, 'non-admin cannot see drafts');
select pg_temp.check((select count(*) from enquiries) = 0, 'non-admin cannot read enquiries');
do $$ begin
  insert into projects (slug, title) values ('evil', 'Evil');
  raise exception 'FAIL: non-admin inserted a project';
exception when insufficient_privilege then raise notice 'pass: non-admin cannot insert projects';
end $$;
do $$ begin
  insert into admin_users (user_id) values ('22222222-2222-4222-8222-222222222222');
  raise exception 'FAIL: non-admin promoted themselves';
exception when insufficient_privilege then raise notice 'pass: non-admin cannot self-promote to admin';
end $$;
delete from projects;
select pg_temp.as_role('postgres');
select pg_temp.check((select count(*) from projects) = 2, 'non-admin delete has no effect');

-- ----------------------------------------------- service role (server)
select pg_temp.as_role('service_role');
do $$
declare i int;
begin
  for i in 1..5 loop
    perform submit_enquiry('Visitor ' || i, 'v' || i || '@example.test', '', 'general',
                           'Hello', 'A genuine message body here.', 'iphash-A', 'test');
  end loop;
  begin
    perform submit_enquiry('Visitor 6', 'v6@example.test', '', 'general',
                           'Hello', 'A genuine message body here.', 'iphash-A', 'test');
    raise exception 'FAIL: 6th enquiry from same IP accepted';
  exception when sqlstate 'P0429' then raise notice 'pass: per-IP rate limit enforced';
  end;
  begin
    perform submit_enquiry('Bad', 'not-an-email', '', 'general', 'Hello', 'A genuine message body here.', 'iphash-B', 't');
    raise exception 'FAIL: invalid email accepted';
  exception when check_violation then raise notice 'pass: invalid email rejected';
  end;
  begin
    perform submit_enquiry('Bad', 'ok@example.test', '', 'spam', 'Hello', 'A genuine message body here.', 'iphash-B', 't');
    raise exception 'FAIL: invalid category accepted';
  exception when check_violation then raise notice 'pass: invalid category rejected';
  end;
end $$;

-- --------------------------------------------------------------- admin
select pg_temp.as_role('authenticated', '11111111-1111-4111-8111-111111111111');
select pg_temp.check(is_admin(), 'admin recognised');
select pg_temp.check((select count(*) from creator_stats) = 3, 'admin sees draft stats');
select pg_temp.check((select count(*) from projects) = 2, 'admin sees draft projects');
select pg_temp.check((select count(*) from project_images) = 1, 'admin sees draft project images');
select pg_temp.check((select count(*) from enquiries) = 5, 'admin reads enquiries');

update creator_stats set status = 'published' where label = 'YouTube subscribers';
update enquiries set status = 'read' where full_name = 'Visitor 1';
select pg_temp.check((select status from enquiries where full_name = 'Visitor 1') = 'read', 'admin updates enquiry status');

insert into projects (slug, title, status) values ('new-thing', 'New thing', 'published');
select pg_temp.check((select count(*) from projects) = 3, 'admin creates project');

do $$ begin
  update projects set live_url = 'http://insecure.example' where slug = 'new-thing';
  raise exception 'FAIL: non-https URL accepted';
exception when check_violation then raise notice 'pass: non-https URLs rejected';
end $$;
do $$ begin
  update projects set slug = 'Bad Slug!' where slug = 'new-thing';
  raise exception 'FAIL: invalid slug accepted';
exception when check_violation then raise notice 'pass: invalid slugs rejected';
end $$;
do $$ begin
  update creator_stats set verification = 'verified', verified_on = null where label = 'Instagram followers';
  raise exception 'FAIL: verified stat without date accepted';
exception when check_violation then raise notice 'pass: "verified" requires a verification date';
end $$;

-- reorder
select pg_temp.check(
  (select sort_order from skills where name = 'Python') = 10 and
  (select sort_order from skills where name = 'Java') = 20, 'initial skill order');
select swap_sort_order('skills',
  (select id from skills where name = 'Python'), (select id from skills where name = 'Java'));
select pg_temp.check((select sort_order from skills where name = 'Python') = 20, 'admin reorder swaps sort order');

insert into storage.objects (bucket_id, name) values ('media', 'profile/ok.webp');
insert into storage.objects (bucket_id, name) values ('incoming', 'raw/ok.jpg');
select pg_temp.check((select count(*) from storage.objects) = 2, 'admin uploads to media and incoming');

delete from projects where slug = 'new-thing';
select pg_temp.check((select count(*) from projects where slug = 'new-thing') = 0, 'admin deletes project');

-- updated_at trigger
select pg_temp.as_role('postgres');
update profile set updated_at = '2000-01-01' where id = 1;
update profile set headline = headline || '' where id = 1;
select pg_temp.check((select updated_at from profile) > '2001-01-01', 'updated_at trigger refreshes timestamps');

-- non-admin reorder has no effect; anon sees newly published stat; anon can't see incoming
select pg_temp.as_role('authenticated', '22222222-2222-4222-8222-222222222222');
select swap_sort_order('skills',
  (select id from skills where name = 'SQL'), (select id from skills where name = 'Java'));
select pg_temp.as_role('anon');
select pg_temp.check((select sort_order from skills where name = 'SQL') = 30, 'non-admin reorder has no effect');
select pg_temp.check((select count(*) from creator_stats) = 1, 'published stat becomes visible to visitors');
select pg_temp.check((select count(*) from storage.objects where bucket_id = 'incoming') = 0, 'visitors cannot see the private incoming bucket');
select pg_temp.check((select count(*) from storage.objects where bucket_id = 'media') = 1, 'visitors can read the media bucket');

select pg_temp.as_role('postgres');
\echo ALL DATABASE TESTS PASSED
