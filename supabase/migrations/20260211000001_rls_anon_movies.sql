-- Migration: Enable RLS on movies table with anonymous-preserving policies
-- Date: 2026-02-11
-- Description: Creates a permissive SELECT policy for anon and authenticated roles
--              BEFORE enabling RLS, preserving anonymous movie browsing.
-- CRITICAL: Policy MUST be created BEFORE enabling RLS. Reversing this order
--           blocks ALL anonymous access immediately.

-- Step 1: Create permissive anon policy (BEFORE enabling RLS)
create policy "Anyone can view movies"
  on public.movies for select
  to anon, authenticated
  using (true);

-- Step 2: THEN enable RLS (safe because policy already exists)
alter table public.movies enable row level security;
