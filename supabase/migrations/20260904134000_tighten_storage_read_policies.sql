-- Public buckets serve objects via the public URL endpoint without needing a SELECT
-- policy; the app also never calls storage.list(). The broad anon/authenticated
-- SELECT policies below only served to let anyone enumerate every file in each
-- bucket via the Storage API's list endpoint, which Supabase flags as unnecessary
-- exposure for public buckets. Drop them; staff (admin/moderator) keep full access
-- via the existing "*_admin_write" / "*_staff_write" ("for all") policies.
drop policy if exists "team_photos_public_read" on storage.objects;
drop policy if exists "partnership_logos_public_read" on storage.objects;
drop policy if exists "news_events_covers_public_read" on storage.objects;
drop policy if exists "document_files_public_read" on storage.objects;
