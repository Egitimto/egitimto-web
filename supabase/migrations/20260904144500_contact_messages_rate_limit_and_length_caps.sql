-- Contact form abuse mitigation: cap field lengths and rate-limit anonymous
-- inserts at the RLS layer itself, since the anon key (and thus this table's
-- insert endpoint) is reachable directly via the public REST API regardless
-- of what the Next.js form does client-side.
create or replace function public.contact_message_allowed(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    not exists (
      select 1 from public.contact_messages
      where email = p_email and created_at > now() - interval '2 minutes'
    )
    and (
      select count(*) from public.contact_messages
      where created_at > now() - interval '5 minutes'
    ) < 20
$$;

grant execute on function public.contact_message_allowed(text) to anon, authenticated;

drop policy if exists "contact_messages_public_insert" on public.contact_messages;

create policy "contact_messages_public_insert" on public.contact_messages
  for insert to anon, authenticated
  with check (
    char_length(full_name) between 1 and 200
    and char_length(email) between 1 and 254
    and char_length(subject) between 1 and 200
    and char_length(message) between 1 and 5000
    and public.contact_message_allowed(email)
  );
