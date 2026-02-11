---
phase: 01-authentication-foundation
plan: 01
subsystem: database, auth
tags: [supabase, rls, postgres, react-context, auth, profiles]

# Dependency graph
requires:
  - phase: none
    provides: "Existing movies table and supabase client"
provides:
  - "RLS enabled on movies table with anon-preserving SELECT policy"
  - "Profiles table with partner_id, auto-create trigger, RLS policies"
  - "link_partner and unlink_partner database functions"
  - "AuthProvider component and useAuth hook for React auth state"
affects: [01-02, 01-03, 02-shortlist, 03-realtime]

# Tech tracking
tech-stack:
  added: []
  patterns: ["AuthContext with onAuthStateChange for auth state", "Security definer functions for partner linking", "Anon-preserving RLS policy ordering"]

key-files:
  created:
    - supabase/migrations/20260211000001_rls_anon_movies.sql
    - supabase/migrations/20260211000002_profiles_table.sql
    - src/contexts/auth-context.tsx
  modified:
    - src/main.tsx

key-decisions:
  - "Migrations created as SQL files but not pushed via CLI -- supabase project not linked locally. Must apply via Supabase SQL Editor dashboard."
  - "AuthContext follows official Supabase React quickstart pattern -- no third-party auth packages added."

patterns-established:
  - "RLS migration ordering: CREATE POLICY before ALTER TABLE ENABLE RLS"
  - "Auth state via React Context: AuthProvider at app root, useAuth hook for consumers"
  - "Security definer functions with empty search_path for database operations"

# Metrics
duration: 2min
completed: 2026-02-11
---

# Phase 1 Plan 1: Auth Foundation Summary

**Anon-preserving RLS on movies, profiles table with partner linking, and React AuthContext provider with useAuth hook**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-11T07:04:45Z
- **Completed:** 2026-02-11T07:06:38Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- RLS enabled on movies table with permissive SELECT policy for anon and authenticated roles (anonymous browsing preserved)
- Profiles table created with partner_id self-reference, RLS policies, auto-create trigger on signup, and bidirectional partner linking functions
- AuthProvider wraps the app at root, providing user/session/loading/signOut via useAuth hook
- Build succeeds with zero TypeScript errors (1717 modules)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create database migrations for RLS and profiles** - `3bdb529` (feat)
2. **Task 2: Create AuthContext provider and wrap the app** - `0da0d36` (feat)

## Files Created/Modified
- `supabase/migrations/20260211000001_rls_anon_movies.sql` - Anon-preserving SELECT policy on movies, then RLS enable
- `supabase/migrations/20260211000002_profiles_table.sql` - Profiles table, RLS policies, signup trigger, partner link/unlink functions
- `src/contexts/auth-context.tsx` - AuthProvider component and useAuth hook using onAuthStateChange
- `src/main.tsx` - App wrapped in AuthProvider inside StrictMode

## Decisions Made
- **Migrations not pushed via CLI:** `supabase db push` failed because the project is not linked locally (no `supabase/config.toml`). Migrations must be applied manually via the Supabase SQL Editor dashboard. This is a one-time setup step.
- **No new packages added:** The existing `@supabase/supabase-js` already includes all auth functionality. No auth-helpers or auth-ui packages (both deprecated).

## Deviations from Plan

None - plan executed exactly as written.

Note: The plan anticipated that `supabase db push` might not be available and specified "provide the SQL for manual execution via the Supabase SQL editor dashboard and note this in the summary" -- which is what happened. This is expected flow, not a deviation.

## Issues Encountered
- `npx supabase db push` returned "Cannot find project ref. Have you run supabase link?" -- Supabase CLI is not linked to the project. The SQL migration files are ready for manual application via the Supabase Dashboard SQL Editor.

## User Setup Required

**Database migrations require manual application.** Run the following SQL files in order via the Supabase Dashboard SQL Editor:
1. `supabase/migrations/20260211000001_rls_anon_movies.sql` -- RLS policies on movies
2. `supabase/migrations/20260211000002_profiles_table.sql` -- Profiles table and functions

**Additionally, the plan's `user_setup` section requires these dashboard configurations before magic links will work (needed in Plan 02/03):**
- Supabase Dashboard -> Authentication -> URL Configuration -> Additional Redirect URLs -> add `http://localhost:5173/**`
- Supabase Dashboard -> Authentication -> URL Configuration -> Site URL should be your production Vercel URL
- Supabase Dashboard -> Authentication -> Providers -> Email -> toggle OFF "Confirm email" (for development)

## Next Phase Readiness
- AuthProvider is mounted and useAuth hook is available for all components
- Migration files are ready for database application
- Plan 02 (auth UI forms) and Plan 03 (partner linking UI) can proceed once migrations are applied
- No blockers for continuing with React-side auth work

## Self-Check: PASSED

- All 5 files verified present on disk
- Commit `3bdb529` (Task 1) verified in git log
- Commit `0da0d36` (Task 2) verified in git log
- Build passes with zero TypeScript errors

---
*Phase: 01-authentication-foundation*
*Completed: 2026-02-11*
