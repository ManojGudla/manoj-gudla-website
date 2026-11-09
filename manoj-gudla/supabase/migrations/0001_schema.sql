-- =====================================================================
-- Manoj Gudla — personal brand platform
-- Migration 0001: core schema, access control (Row-Level Security)
--
-- Run this in Supabase → SQL Editor (or `supabase db push`).
-- Safe to run once on a fresh project. Requires the built-in `auth` schema.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------

-- Keeps updated_at current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Publication status used by every public content table.
do $$ begin
  create type public.publish_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 1. Admin users (who may manage content)
--    Rows are created by SQL only (see docs/SETUP.md). There is no
--    public sign-up path anywhere in the application.
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'owner' check (role in ('owner', 'editor')),
  display_name text check (char_length(display_name) <= 120),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Security-definer so RLS policies can call it without recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 15. Media assets (declared early: other tables reference it)
-- ---------------------------------------------------------------------
create table if not exists public.media_assets (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null unique check (char_length(storage_path) <= 400),
  file_name    text not null check (char_length(file_name) <= 255),
  mime_type    text not null check (mime_type in (
                 'image/webp', 'image/jpeg', 'image/png', 'image/avif', 'application/pdf')),
  size_bytes   integer not null check (size_bytes > 0 and size_bytes <= 20000000),
  width        integer check (width is null or width > 0),
  height       integer check (height is null or height > 0),
  alt_text     text not null default '' check (char_length(alt_text) <= 300),
  category     text not null default 'gallery' check (category in (
                 'profile', 'lifestyle', 'project', 'certificate', 'thumbnail',
                 'banner', 'gallery', 'document')),
  created_by   uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Profile (single row, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.profile (
  id                   smallint primary key default 1 check (id = 1),
  full_name            text not null check (char_length(full_name) between 1 and 120),
  headline             text not null default '' check (char_length(headline) <= 200),
  roles                text[] not null default '{}',
  tagline              text not null default '' check (char_length(tagline) <= 200),
  hero_intro           text not null default '' check (char_length(hero_intro) <= 400),
  short_bio            text not null default '' check (char_length(short_bio) <= 800),
  biography            text not null default '' check (char_length(biography) <= 6000),
  professional_intro   text not null default '' check (char_length(professional_intro) <= 2000),
  career_direction     text not null default '' check (char_length(career_direction) <= 2000),
  philosophy           text not null default '' check (char_length(philosophy) <= 400),
  location             text not null default '' check (char_length(location) <= 120),
  show_location        boolean not null default false,
  email                text not null default '' check (email = '' or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  linkedin_url         text not null default '' check (linkedin_url = '' or linkedin_url ~* '^https://'),
  instagram_url        text not null default '' check (instagram_url = '' or instagram_url ~* '^https://'),
  youtube_url          text not null default '' check (youtube_url = '' or youtube_url ~* '^https://'),
  github_url           text not null default '' check (github_url = '' or github_url ~* '^https://'),
  creator_title        text not null default '' check (char_length(creator_title) <= 200),
  creator_intro        text not null default '' check (char_length(creator_intro) <= 2000),
  experience_summary   text not null default '' check (char_length(experience_summary) <= 200),
  photo_media_id       uuid references public.media_assets (id) on delete set null,
  about_photo_media_id uuid references public.media_assets (id) on delete set null,
  creator_photo_media_id uuid references public.media_assets (id) on delete set null,
  resume_media_id      uuid references public.media_assets (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 14. Website settings (single row, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id               smallint primary key default 1 check (id = 1),
  site_title       text not null default 'Manoj Gudla' check (char_length(site_title) between 1 and 120),
  tagline          text not null default '' check (char_length(tagline) <= 200),
  seo_title        text not null default '' check (char_length(seo_title) <= 120),
  meta_description text not null default '' check (char_length(meta_description) <= 320),
  default_theme    text not null default 'system' check (default_theme in ('system', 'light', 'dark')),
  footer_text      text not null default '' check (char_length(footer_text) <= 400),
  contact_email    text not null default '' check (contact_email = '' or contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  og_media_id      uuid references public.media_assets (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Professional experience
-- ---------------------------------------------------------------------
create table if not exists public.experience (
  id               uuid primary key default gen_random_uuid(),
  organisation     text not null check (char_length(organisation) between 1 and 160),
  role_title       text not null default '' check (char_length(role_title) <= 160),
  employment_type  text not null default '' check (char_length(employment_type) <= 60),
  location         text not null default '' check (char_length(location) <= 120),
  start_label      text not null default '' check (char_length(start_label) <= 40),
  end_label        text not null default '' check (char_length(end_label) <= 40),
  is_current       boolean not null default false,
  summary          text not null default '' check (char_length(summary) <= 2000),
  responsibilities text[] not null default '{}',
  sort_order       integer not null default 0,
  status           public.publish_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. Education
-- ---------------------------------------------------------------------
create table if not exists public.education (
  id            uuid primary key default gen_random_uuid(),
  qualification text not null check (char_length(qualification) between 1 and 200),
  field         text not null default '' check (char_length(field) <= 160),
  institution   text not null default '' check (char_length(institution) <= 200),
  start_label   text not null default '' check (char_length(start_label) <= 40),
  end_label     text not null default '' check (char_length(end_label) <= 40),
  progress      text not null default 'completed' check (progress in ('completed', 'pursuing')),
  notes         text not null default '' check (char_length(notes) <= 1000),
  sort_order    integer not null default 0,
  status        public.publish_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. Skills
--    Proficiency is only shown publicly when proficiency_approved = true.
-- ---------------------------------------------------------------------
create table if not exists public.skills (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null check (char_length(name) between 1 and 80),
  category             text not null check (category in ('programming', 'development', 'ai_analytics', 'strengths')),
  proficiency          text check (proficiency is null or proficiency in ('learning', 'working', 'proficient', 'advanced')),
  proficiency_approved boolean not null default false,
  sort_order           integer not null default 0,
  status               public.publish_status not null default 'draft',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. Certifications
-- ---------------------------------------------------------------------
create table if not exists public.certifications (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(title) between 1 and 200),
  issuer         text not null default '' check (char_length(issuer) <= 160),
  issued_label   text not null default '' check (char_length(issued_label) <= 40),
  credential_url text not null default '' check (credential_url = '' or credential_url ~* '^https://'),
  media_id       uuid references public.media_assets (id) on delete set null,
  sort_order     integer not null default 0,
  status         public.publish_status not null default 'draft',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. Projects
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title          text not null check (char_length(title) between 1 and 160),
  tagline        text not null default '' check (char_length(tagline) <= 240),
  summary        text not null default '' check (char_length(summary) <= 600),
  overview       text not null default '' check (char_length(overview) <= 6000),
  purpose        text not null default '' check (char_length(purpose) <= 3000),
  dev_status     text not null default 'in_development' check (dev_status in ('idea', 'in_development', 'live', 'paused', 'archived')),
  features       text[] not null default '{}',
  technologies   text[] not null default '{}',
  roadmap        text[] not null default '{}',
  live_url       text not null default '' check (live_url = '' or live_url ~* '^https://'),
  repo_url       text not null default '' check (repo_url = '' or repo_url ~* '^https://'),
  cover_media_id uuid references public.media_assets (id) on delete set null,
  is_featured    boolean not null default false,
  sort_order     integer not null default 0,
  status         public.publish_status not null default 'draft',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. Project images (screenshots)
-- ---------------------------------------------------------------------
create table if not exists public.project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  media_id   uuid not null references public.media_assets (id) on delete cascade,
  caption    text not null default '' check (char_length(caption) <= 300),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, media_id)
);

-- ---------------------------------------------------------------------
-- 9. Creator content (manually managed — no fake live integrations)
-- ---------------------------------------------------------------------
create table if not exists public.creator_content (
  id                 uuid primary key default gen_random_uuid(),
  platform           text not null check (platform in ('youtube', 'instagram', 'linkedin', 'other')),
  url                text not null check (url ~* '^https://' and char_length(url) <= 500),
  title              text not null check (char_length(title) between 1 and 200),
  description        text not null default '' check (char_length(description) <= 1000),
  category           text not null default 'technology' check (category in ('technology', 'lifestyle', 'ai')),
  thumbnail_media_id uuid references public.media_assets (id) on delete set null,
  published_on       date,
  is_featured        boolean not null default false,
  sort_order         integer not null default 0,
  status             public.publish_status not null default 'draft',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 10. Creator statistics (self-reported unless marked verified)
-- ---------------------------------------------------------------------
create table if not exists public.creator_stats (
  id            uuid primary key default gen_random_uuid(),
  platform      text not null check (platform in ('youtube', 'instagram', 'linkedin', 'other')),
  label         text not null check (char_length(label) between 1 and 80),
  value         bigint not null check (value >= 0),
  value_suffix  text not null default '' check (char_length(value_suffix) <= 4),
  verification  text not null default 'self_reported' check (verification in ('self_reported', 'verified')),
  verified_on   date,
  last_updated  date not null default current_date,
  source_note   text not null default '' check (char_length(source_note) <= 300),
  sort_order    integer not null default 0,
  status        public.publish_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (verification = 'self_reported' or verified_on is not null)
);

-- ---------------------------------------------------------------------
-- 11. Achievements (personal highlights + genuine external recognition)
-- ---------------------------------------------------------------------
create table if not exists public.achievements (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('highlight', 'award', 'certification', 'recognition', 'hackathon', 'mentoring', 'milestone')),
  title       text not null check (char_length(title) between 1 and 200),
  focus       text not null default '' check (char_length(focus) <= 300),
  description text not null default '' check (char_length(description) <= 2000),
  issuer      text not null default '' check (char_length(issuer) <= 160),
  date_label  text not null default '' check (char_length(date_label) <= 40),
  link_url    text not null default '' check (link_url = '' or link_url ~* '^https://'),
  media_id    uuid references public.media_assets (id) on delete set null,
  sort_order  integer not null default 0,
  status      public.publish_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 12. Personal gallery (Beyond Work)
-- ---------------------------------------------------------------------
create table if not exists public.gallery_items (
  id         uuid primary key default gen_random_uuid(),
  media_id   uuid not null references public.media_assets (id) on delete cascade,
  caption    text not null default '' check (char_length(caption) <= 300),
  category   text not null default 'lifestyle' check (category in ('lifestyle', 'technology', 'creating', 'events', 'travel')),
  sort_order integer not null default 0,
  status     public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Interests (Beyond Work) and Vision items — so those pages are editable too.
create table if not exists public.interests (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 600),
  sort_order  integer not null default 0,
  status      public.publish_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.vision_items (
  id          uuid primary key default gen_random_uuid(),
  area        text not null check (area in ('technologies', 'products', 'business', 'skills', 'opportunities', 'ambitions')),
  title       text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 800),
  horizon     text not null default '' check (char_length(horizon) <= 40),
  sort_order  integer not null default 0,
  status      public.publish_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 13. Contact enquiries (private — admin only)
-- ---------------------------------------------------------------------
create table if not exists public.enquiries (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null check (char_length(full_name) between 1 and 120),
  email        text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  organisation text not null default '' check (char_length(organisation) <= 160),
  category     text not null check (category in ('career', 'partnership', 'brand', 'project', 'general')),
  subject      text not null check (char_length(subject) between 1 and 200),
  message      text not null check (char_length(message) between 10 and 5000),
  status       text not null default 'new' check (status in ('new', 'read', 'responded', 'archived')),
  admin_notes  text not null default '' check (char_length(admin_notes) <= 2000),
  ip_hash      text not null default '' check (char_length(ip_hash) <= 128),
  user_agent   text not null default '' check (char_length(user_agent) <= 400),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
create index if not exists enquiries_ip_idx on public.enquiries (ip_hash, created_at desc);
create index if not exists project_images_project_idx on public.project_images (project_id, sort_order);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'admin_users','media_assets','profile','site_settings','experience','education',
    'skills','certifications','projects','project_images','creator_content',
    'creator_stats','achievements','gallery_items','interests','vision_items','enquiries'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'admin_users','media_assets','profile','site_settings','experience','education',
    'skills','certifications','projects','project_images','creator_content',
    'creator_stats','achievements','gallery_items','interests','vision_items','enquiries'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end $$;

-- Content tables with a publication status:
-- visitors read published rows; admins read and write everything.
do $$
declare t text;
begin
  foreach t in array array[
    'experience','education','skills','certifications','projects','creator_content',
    'creator_stats','achievements','gallery_items','interests','vision_items'
  ] loop
    execute format('drop policy if exists "read published" on public.%I', t);
    execute format('create policy "read published" on public.%I for select
                    to anon, authenticated
                    using (status = ''published'' or public.is_admin())', t);
    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('create policy "admin insert" on public.%I for insert
                    to authenticated with check (public.is_admin())', t);
    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('create policy "admin update" on public.%I for update
                    to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop policy if exists "admin delete" on public.%I', t);
    execute format('create policy "admin delete" on public.%I for delete
                    to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Always-public singletons and media metadata: anyone reads, admins write.
do $$
declare t text;
begin
  foreach t in array array['profile','site_settings','media_assets'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select
                    to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('create policy "admin insert" on public.%I for insert
                    to authenticated with check (public.is_admin())', t);
    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('create policy "admin update" on public.%I for update
                    to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop policy if exists "admin delete" on public.%I', t);
    execute format('create policy "admin delete" on public.%I for delete
                    to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Project images follow their parent project's visibility.
drop policy if exists "read with project" on public.project_images;
create policy "read with project" on public.project_images for select
  to anon, authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );
drop policy if exists "admin write" on public.project_images;
create policy "admin write" on public.project_images for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admin users: a signed-in user can see their own row (used for the role
-- check). No insert/update/delete policies → only SQL/service role can change it.
drop policy if exists "read own row" on public.admin_users;
create policy "read own row" on public.admin_users for select
  to authenticated using (user_id = auth.uid() or public.is_admin());

-- Enquiries: admins only. No insert policy — submissions go through
-- public.submit_enquiry(), which only the server (service role) may call.
drop policy if exists "admin read" on public.enquiries;
create policy "admin read" on public.enquiries for select
  to authenticated using (public.is_admin());
drop policy if exists "admin update" on public.enquiries;
create policy "admin update" on public.enquiries for update
  to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete" on public.enquiries;
create policy "admin delete" on public.enquiries for delete
  to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- Contact form submission with database-side rate limiting
-- ---------------------------------------------------------------------
create or replace function public.submit_enquiry(
  p_full_name    text,
  p_email        text,
  p_organisation text,
  p_category     text,
  p_subject      text,
  p_message      text,
  p_ip_hash      text,
  p_user_agent   text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_recent_ip int;
  v_recent_email int;
  v_recent_all int;
begin
  select count(*) into v_recent_ip from public.enquiries
    where ip_hash = coalesce(p_ip_hash, '') and p_ip_hash <> ''
      and created_at > now() - interval '1 hour';
  if v_recent_ip >= 5 then
    raise exception 'rate_limited' using errcode = 'P0429';
  end if;

  select count(*) into v_recent_email from public.enquiries
    where lower(email) = lower(p_email) and created_at > now() - interval '1 hour';
  if v_recent_email >= 3 then
    raise exception 'rate_limited' using errcode = 'P0429';
  end if;

  -- Global circuit breaker against floods.
  select count(*) into v_recent_all from public.enquiries
    where created_at > now() - interval '1 hour';
  if v_recent_all >= 60 then
    raise exception 'rate_limited' using errcode = 'P0429';
  end if;

  insert into public.enquiries
    (full_name, email, organisation, category, subject, message, ip_hash, user_agent)
  values
    (trim(p_full_name), lower(trim(p_email)), trim(coalesce(p_organisation, '')),
     p_category, trim(p_subject), trim(p_message),
     coalesce(p_ip_hash, ''), left(coalesce(p_user_agent, ''), 400))
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_enquiry(text, text, text, text, text, text, text, text) from public;
revoke all on function public.submit_enquiry(text, text, text, text, text, text, text, text) from anon, authenticated;
grant execute on function public.submit_enquiry(text, text, text, text, text, text, text, text) to service_role;

-- Swap sort_order between two rows of the same table (admin reordering).
create or replace function public.swap_sort_order(p_table text, p_a uuid, p_b uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_a int; v_b int;
begin
  if p_table not in ('experience','education','skills','certifications','projects','project_images',
                     'creator_content','creator_stats','achievements','gallery_items',
                     'interests','vision_items') then
    raise exception 'invalid table';
  end if;
  execute format('select sort_order from public.%I where id = $1', p_table) into v_a using p_a;
  execute format('select sort_order from public.%I where id = $1', p_table) into v_b using p_b;
  if v_a is null or v_b is null then
    raise exception 'row not found';
  end if;
  if v_a = v_b then v_b := v_a + 1; end if;
  execute format('update public.%I set sort_order = $1 where id = $2', p_table) using v_b, p_a;
  execute format('update public.%I set sort_order = $1 where id = $2', p_table) using v_a, p_b;
end;
$$;

revoke all on function public.swap_sort_order(text, uuid, uuid) from public, anon;
grant execute on function public.swap_sort_order(text, uuid, uuid) to authenticated;
-- security invoker: the UPDATE still passes through RLS, so only admins succeed.
