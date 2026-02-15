-- Migration: Create profiles table with partner linking support
-- Date: 2026-02-11
-- Description: Creates profiles table with RLS policies, auto-create trigger on
--              auth.users signup, and bidirectional partner linking functions.

-- =============================================================================
-- 1. Profiles table
-- =============================================================================

create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  partner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

-- =============================================================================
-- 2. Enable RLS on profiles
-- =============================================================================

alter table public.profiles enable row level security;

-- =============================================================================
-- 3. RLS policies
-- =============================================================================

-- Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- Helper function to get current user's partner_id without triggering RLS recursion
create or replace function public.get_my_partner_id()
returns uuid
language sql
security definer set search_path = ''
stable
as $$
  select partner_id from public.profiles where id = auth.uid();
$$;

-- Users can view their partner's profile (uses helper to avoid RLS recursion)
create policy "Users can view partner profile"
  on public.profiles for select
  to authenticated
  using (id = public.get_my_partner_id());

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- =============================================================================
-- 4. Auto-create profile on signup trigger
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- 5. Partner linking functions
-- =============================================================================

-- Link with a partner (bidirectional)
create or replace function public.link_partner(target_user_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  -- Prevent self-linking
  if current_user_id = target_user_id then
    raise exception 'Cannot link to yourself';
  end if;

  -- Verify target user exists
  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'User not found';
  end if;

  -- Set bidirectional partnership
  update public.profiles set partner_id = target_user_id, updated_at = now()
    where id = current_user_id;
  update public.profiles set partner_id = current_user_id, updated_at = now()
    where id = target_user_id;
end;
$$;

-- Unlink partner (bidirectional)
create or replace function public.unlink_partner()
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_partner_id uuid;
begin
  select partner_id into current_partner_id from public.profiles where id = current_user_id;

  if current_partner_id is not null then
    update public.profiles set partner_id = null, updated_at = now()
      where id = current_user_id;
    update public.profiles set partner_id = null, updated_at = now()
      where id = current_partner_id;
  end if;
end;
$$;
