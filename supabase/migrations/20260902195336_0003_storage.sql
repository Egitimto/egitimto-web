insert into storage.buckets (id, name, public)
values
  ('team-photos', 'team-photos', true),
  ('partnership-logos', 'partnership-logos', true),
  ('news-events-covers', 'news-events-covers', true),
  ('document-files', 'document-files', true)
on conflict (id) do nothing;

create policy "team_photos_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'team-photos');
create policy "team_photos_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'team-photos' and (select public.current_user_role()) = 'admin')
  with check (bucket_id = 'team-photos' and (select public.current_user_role()) = 'admin');

create policy "partnership_logos_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'partnership-logos');
create policy "partnership_logos_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'partnership-logos' and (select public.current_user_role()) = 'admin')
  with check (bucket_id = 'partnership-logos' and (select public.current_user_role()) = 'admin');

create policy "news_events_covers_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'news-events-covers');
create policy "news_events_covers_staff_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'news-events-covers' and (select public.current_user_role()) in ('admin', 'moderator'))
  with check (bucket_id = 'news-events-covers' and (select public.current_user_role()) in ('admin', 'moderator'));

create policy "document_files_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'document-files');
create policy "document_files_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'document-files' and (select public.current_user_role()) = 'admin')
  with check (bucket_id = 'document-files' and (select public.current_user_role()) = 'admin');
