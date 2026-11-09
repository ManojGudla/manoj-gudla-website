-- =====================================================================
-- Migration 0002: storage buckets and access policies
--
-- media    — public-read bucket for optimised images and PDFs shown on
--            the website. Only admins can upload, replace or delete.
-- incoming — PRIVATE staging bucket. The admin browser uploads the raw
--            original here; the server validates it, strips metadata
--            (e.g. GPS location in photos), optimises it, moves the
--            result to `media`, then deletes the original.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 20000000,
   array['image/webp','image/jpeg','image/png','image/avif','application/pdf']),
  ('incoming', 'incoming', false, 20000000,
   array['image/webp','image/jpeg','image/png','image/avif','image/heic','image/heif','application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select
  to anon, authenticated using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert
  to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update
  to authenticated using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete
  to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "incoming admin all" on storage.objects;
create policy "incoming admin all" on storage.objects for all
  to authenticated using (bucket_id = 'incoming' and public.is_admin())
  with check (bucket_id = 'incoming' and public.is_admin());
