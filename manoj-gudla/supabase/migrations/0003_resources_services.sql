-- =====================================================================
-- Migration 0003: Resources, resource packs, services, "Now" strip.
-- Also removes maNOWj GeoIntel from this website (it is a separate product).
--
-- Run once in Supabase → SQL Editor, after 0001 and 0002.
-- Safe to run again: everything is guarded.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Resource library — individual tools, courses and links
-- ---------------------------------------------------------------------
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  url         text not null check (url ~* '^https://' and char_length(url) <= 500),
  description text not null default '' check (char_length(description) <= 400),
  category    text not null default 'AI Tools' check (char_length(category) between 1 and 60),
  pricing     text not null default 'free' check (pricing in ('free', 'freemium', 'paid')),
  tag         text not null default '' check (char_length(tag) <= 30),
  sort_order  integer not null default 0,
  status      public.publish_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Resource packs — one per video: yoursite.com/r/<code>
-- ---------------------------------------------------------------------
create table if not exists public.resource_packs (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique check (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(code) <= 40),
  title        text not null check (char_length(title) between 1 and 160),
  intro        text not null default '' check (char_length(intro) <= 1000),
  keyword      text not null default '' check (char_length(keyword) <= 30),
  video_url    text not null default '' check (video_url = '' or video_url ~* '^https://'),
  platform     text not null default 'instagram' check (platform in ('youtube', 'instagram', 'linkedin', 'other')),
  published_on date,
  sort_order   integer not null default 0,
  status       public.publish_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.resource_pack_items (
  id          uuid primary key default gen_random_uuid(),
  pack_id     uuid not null references public.resource_packs (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete cascade,
  note        text not null default '' check (char_length(note) <= 300),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (pack_id, resource_id)
);
create index if not exists resource_pack_items_pack_idx on public.resource_pack_items (pack_id, sort_order);

-- Videos can point to the pack that holds their resources.
alter table public.creator_content
  add column if not exists resource_pack_id uuid references public.resource_packs (id) on delete set null;

-- ---------------------------------------------------------------------
-- Services ("Work with me")
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 120),
  summary      text not null default '' check (char_length(summary) <= 600),
  for_whom     text not null default '' check (char_length(for_whom) <= 200),
  deliverables text[] not null default '{}',
  enquiry_type text not null default 'project' check (enquiry_type in ('career', 'partnership', 'brand', 'project', 'general')),
  sort_order   integer not null default 0,
  status       public.publish_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- "Now" strip on the homepage
-- ---------------------------------------------------------------------
alter table public.profile add column if not exists now_building text not null default '' check (char_length(now_building) <= 120);
alter table public.profile add column if not exists now_learning text not null default '' check (char_length(now_learning) <= 120);
alter table public.profile add column if not exists now_creating text not null default '' check (char_length(now_creating) <= 120);
alter table public.profile add column if not exists services_intro text not null default '' check (char_length(services_intro) <= 800);

-- ---------------------------------------------------------------------
-- Triggers + Row-Level Security (same rules as other content)
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['resources', 'resource_packs', 'resource_pack_items', 'services'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;

  foreach t in array array['resources', 'resource_packs', 'services'] loop
    execute format('drop policy if exists "read published" on public.%I', t);
    execute format('create policy "read published" on public.%I for select to anon, authenticated
                    using (status = ''published'' or public.is_admin())', t);
    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('create policy "admin update" on public.%I for update to authenticated
                    using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop policy if exists "admin delete" on public.%I', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Pack items are visible when their pack is published.
drop policy if exists "read with pack" on public.resource_pack_items;
create policy "read with pack" on public.resource_pack_items for select to anon, authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.resource_packs p where p.id = pack_id and p.status = 'published'
    )
  );
drop policy if exists "admin write" on public.resource_pack_items;
create policy "admin write" on public.resource_pack_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant all on public.resources, public.resource_packs, public.resource_pack_items, public.services
  to anon, authenticated, service_role;

-- Reordering now also covers the new tables.
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
                     'interests','vision_items','resources','resource_packs','resource_pack_items','services') then
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

-- ---------------------------------------------------------------------
-- Remove maNOWj GeoIntel from this website
-- ---------------------------------------------------------------------
delete from public.projects where slug = 'manowj-geointel';
delete from public.vision_items where title = 'Grow maNOWj GeoIntel';
update public.achievements
  set description = 'Designing and building independent products — from first idea to launch.'
  where title = 'Independent Technology Initiative' and description ilike '%GeoIntel%';
