alter table public.about_content
  add column kurulus_tr text not null default '',
  add column kurulus_en text not null default '',
  add column vizyon_tr text not null default '',
  add column vizyon_en text not null default '',
  add column degerler_tr text not null default '',
  add column degerler_en text not null default '';

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact_messages_public_insert" on public.contact_messages
  for insert to anon, authenticated with check (true);

create policy "contact_messages_staff_read" on public.contact_messages
  for select to authenticated
  using ((select public.current_user_role()) in ('admin', 'moderator'));
