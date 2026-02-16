-- Migration: Create shortlist table for personal movie shortlists
-- Date: 2026-02-16
-- Description: Creates shortlist table with RLS policies for own + partner read
--              access, own-only insert/delete, and user_id index.

-- =============================================================================
-- 1. Shortlist table
-- =============================================================================

create table public.shortlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, movie_id)
);

-- =============================================================================
-- 2. Enable RLS on shortlist
-- =============================================================================

alter table public.shortlist enable row level security;

-- =============================================================================
-- 3. RLS policies
-- =============================================================================

-- Users can view their own shortlist entries
create policy "Users can view own shortlist"
  on public.shortlist for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Users can view their partner's shortlist entries (uses helper to avoid RLS recursion)
create policy "Users can view partner shortlist"
  on public.shortlist for select
  to authenticated
  using (user_id = public.get_my_partner_id());

-- Users can add to their own shortlist
create policy "Users can insert own shortlist"
  on public.shortlist for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Users can remove from their own shortlist
create policy "Users can delete own shortlist"
  on public.shortlist for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- =============================================================================
-- 4. Indexes
-- =============================================================================

create index idx_shortlist_user_id on public.shortlist(user_id);
