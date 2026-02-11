-- Migration: get_available_partners function
-- Purpose: Security definer function to list unlinked users for partner linking.
-- RLS on profiles only allows reading own + partner's profile, so before linking
-- you can't see other users. This function bypasses RLS safely.

create or replace function public.get_available_partners()
returns table(id uuid, display_name text)
language plpgsql
security definer set search_path = ''
as $$
begin
  return query
    select p.id, p.display_name
    from public.profiles p
    where p.id != auth.uid()
    and p.partner_id is null;
end;
$$;
