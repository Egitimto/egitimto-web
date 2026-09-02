alter table public.news add column updated_at timestamptz not null default now();
alter table public.events add column updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger news_set_updated_at before update on public.news
  for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger about_content_set_updated_at before update on public.about_content
  for each row execute function public.set_updated_at();
