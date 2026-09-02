grant select on public.documents, public.about_content, public.team_categories,
  public.team_members, public.partnerships, public.news, public.events
  to anon, authenticated;

grant insert, update, delete on public.documents, public.team_categories,
  public.team_members, public.partnerships, public.news, public.events
  to authenticated;

grant update on public.about_content to authenticated;
