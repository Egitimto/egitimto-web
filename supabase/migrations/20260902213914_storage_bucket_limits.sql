update storage.buckets set file_size_limit = 5242880, allowed_mime_types = array['image/png','image/jpeg','image/webp','image/svg+xml']
  where id in ('team-photos', 'partnership-logos', 'news-events-covers');
update storage.buckets set file_size_limit = 10485760, allowed_mime_types = array['application/pdf']
  where id = 'document-files';
