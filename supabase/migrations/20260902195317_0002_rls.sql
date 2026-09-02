create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.user_roles where user_id = (select auth.uid())
$$;

revoke execute on function public.current_user_role() from public, anon;
grant execute on function public.current_user_role() to authenticated;

alter table public.user_roles enable row level security;
alter table public.documents enable row level security;
alter table public.about_content enable row level security;
alter table public.team_categories enable row level security;
alter table public.team_members enable row level security;
alter table public.partnerships enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;

-- user_roles: doğrudan istemci erişimi yok; yalnızca current_user_role() üzerinden (definer ayrıcalığıyla) okunur

create policy "documents_public_read" on public.documents
  for select to anon, authenticated using (true);
create policy "documents_admin_write" on public.documents
  for all to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

create policy "about_content_public_read" on public.about_content
  for select to anon, authenticated using (true);
create policy "about_content_admin_update" on public.about_content
  for update to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

create policy "team_categories_public_read" on public.team_categories
  for select to anon, authenticated using (true);
create policy "team_categories_admin_write" on public.team_categories
  for all to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

create policy "team_members_public_read" on public.team_members
  for select to anon, authenticated using (true);
create policy "team_members_admin_write" on public.team_members
  for all to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

create policy "partnerships_public_read" on public.partnerships
  for select to anon, authenticated using (true);
create policy "partnerships_admin_write" on public.partnerships
  for all to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

create policy "news_public_read" on public.news
  for select to anon, authenticated using (is_published = true);
create policy "news_staff_all" on public.news
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'moderator'))
  with check ((select public.current_user_role()) in ('admin', 'moderator'));

create policy "events_public_read" on public.events
  for select to anon, authenticated using (is_published = true);
create policy "events_staff_all" on public.events
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'moderator'))
  with check ((select public.current_user_role()) in ('admin', 'moderator'));
