-- Migration: Partner invite link system
-- Date: 2026-02-15
-- Description: Replaces auto-discovery partner linking with invite codes.
--              Users generate a shareable code, send it to their partner,
--              who then accepts the invite to link accounts.

-- =============================================================================
-- 1. Partner invites table
-- =============================================================================

create table public.partner_invites (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  used_at timestamptz,
  used_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.partner_invites enable row level security;

-- Users can view their own invites (as inviter or recipient)
create policy "Users can view own invites"
  on public.partner_invites for select
  to authenticated
  using (
    (select auth.uid()) = inviter_id
    or (select auth.uid()) = used_by_user_id
  );

-- =============================================================================
-- 2. Helper: generate invite code (8-char, no ambiguous chars)
-- =============================================================================

create or replace function public._generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
  i int;
begin
  for i in 1..8 loop
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return code;
end;
$$;

-- =============================================================================
-- 3. create_partner_invite() — generate code, revoke old pending, return info
-- =============================================================================

create or replace function public.create_partner_invite()
returns json
language plpgsql
security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  new_code text;
  new_invite public.partner_invites;
  partner uuid;
begin
  -- Check user is not already linked
  select partner_id into partner from public.profiles where id = current_user_id;
  if partner is not null then
    raise exception 'You are already linked to a partner';
  end if;

  -- Cancel any existing pending invites from this user
  update public.partner_invites
    set status = 'cancelled'
    where inviter_id = current_user_id and status = 'pending';

  -- Generate unique code (retry on collision)
  loop
    new_code := public._generate_invite_code();
    exit when not exists (
      select 1 from public.partner_invites where invite_code = new_code
    );
  end loop;

  -- Create invite
  insert into public.partner_invites (invite_code, inviter_id)
    values (new_code, current_user_id)
    returning * into new_invite;

  return json_build_object(
    'invite_code', new_invite.invite_code,
    'expires_at', new_invite.expires_at
  );
end;
$$;

-- =============================================================================
-- 4. get_invite_by_code(code) — public lookup, returns inviter name
-- =============================================================================

create or replace function public.get_invite_by_code(code text)
returns json
language plpgsql
security definer set search_path = ''
as $$
declare
  invite record;
  inviter_name text;
begin
  select pi.*, p.display_name
    into invite
    from public.partner_invites pi
    join public.profiles p on p.id = pi.inviter_id
    where pi.invite_code = upper(trim(code))
      and pi.status = 'pending'
      and pi.expires_at > now();

  if not found then
    return json_build_object('valid', false);
  end if;

  return json_build_object(
    'valid', true,
    'invite_code', invite.invite_code,
    'inviter_name', invite.display_name,
    'inviter_id', invite.inviter_id,
    'expires_at', invite.expires_at
  );
end;
$$;

-- =============================================================================
-- 5. accept_partner_invite(code) — validate, mark accepted, link partner
-- =============================================================================

create or replace function public.accept_partner_invite(code text)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  invite public.partner_invites;
begin
  -- Find valid pending invite
  select * into invite
    from public.partner_invites
    where invite_code = upper(trim(code))
      and status = 'pending'
      and expires_at > now();

  if not found then
    raise exception 'Invite not found or expired';
  end if;

  -- Cannot accept own invite
  if invite.inviter_id = current_user_id then
    raise exception 'Cannot accept your own invite';
  end if;

  -- Check neither user is already linked
  if exists (select 1 from public.profiles where id = current_user_id and partner_id is not null) then
    raise exception 'You are already linked to a partner';
  end if;

  if exists (select 1 from public.profiles where id = invite.inviter_id and partner_id is not null) then
    raise exception 'The inviter is already linked to a partner';
  end if;

  -- Mark invite as accepted
  update public.partner_invites
    set status = 'accepted', used_at = now(), used_by_user_id = current_user_id
    where id = invite.id;

  -- Link partners using existing function
  perform public.link_partner(invite.inviter_id);
end;
$$;

-- =============================================================================
-- 6. reject_partner_invite(code) — mark rejected
-- =============================================================================

create or replace function public.reject_partner_invite(code text)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  update public.partner_invites
    set status = 'rejected', used_at = now(), used_by_user_id = current_user_id
    where invite_code = upper(trim(code))
      and status = 'pending'
      and expires_at > now();

  if not found then
    raise exception 'Invite not found or expired';
  end if;
end;
$$;

-- =============================================================================
-- 7. cancel_partner_invite() — cancel own pending invite
-- =============================================================================

create or replace function public.cancel_partner_invite()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.partner_invites
    set status = 'cancelled'
    where inviter_id = auth.uid() and status = 'pending';
end;
$$;

-- =============================================================================
-- 8. get_my_active_invite() — return user's current pending invite
-- =============================================================================

create or replace function public.get_my_active_invite()
returns json
language plpgsql
security definer set search_path = ''
as $$
declare
  invite public.partner_invites;
begin
  select * into invite
    from public.partner_invites
    where inviter_id = auth.uid()
      and status = 'pending'
      and expires_at > now()
    order by created_at desc
    limit 1;

  if not found then
    return null;
  end if;

  return json_build_object(
    'invite_code', invite.invite_code,
    'expires_at', invite.expires_at
  );
end;
$$;

-- =============================================================================
-- 9. Notify PostgREST to reload schema
-- =============================================================================

notify pgrst, 'reload schema';
