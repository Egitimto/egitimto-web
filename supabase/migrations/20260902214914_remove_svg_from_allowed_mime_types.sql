update storage.buckets set allowed_mime_types = array['image/png','image/jpeg','image/webp']
  where id in ('team-photos', 'partnership-logos', 'news-events-covers');
