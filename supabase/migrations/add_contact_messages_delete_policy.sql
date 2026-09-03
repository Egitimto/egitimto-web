create policy "contact_messages_admin_delete" on public.contact_messages
  for delete to authenticated
  using ((select public.current_user_role()) = 'admin');

grant delete on public.contact_messages to authenticated;
