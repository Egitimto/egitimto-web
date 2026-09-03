alter table public.news add column is_featured boolean not null default false;
alter table public.news add column featured_at timestamptz;
alter table public.events add column is_featured boolean not null default false;
alter table public.events add column featured_at timestamptz;

create index news_featured_idx on public.news (is_featured, featured_at desc) where is_featured;
create index events_featured_idx on public.events (is_featured, featured_at desc) where is_featured;
