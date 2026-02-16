---
phase: 02-personal-shortlists
plan: 02
subsystem: ui, state-management
tags: [react, shortlist, heart-toggle, view-switcher, optimistic-updates, tailwind]

# Dependency graph
requires:
  - phase: 02-personal-shortlists plan 01
    provides: "ShortlistContext with useShortlist hook, shortlistedIds, toggleShortlist, isShortlisted"
  - phase: 01-authentication-foundation
    provides: "AuthProvider, useAuth hook, auth modal pattern"
provides:
  - "Heart toggle buttons on MovieCard (mobile) and MovieTable (desktop)"
  - "Browse/My Shortlist view switcher in App.tsx"
  - "Shortlist view showing filtered movies with full details"
  - "onAuthRequired callback pattern for anon user sign-in prompt"
affects: [03-partner-overlap]

# Tech tracking
tech-stack:
  added: []
  patterns: [view-switcher-tabs, inline-svg-icons, onAuthRequired-callback]

key-files:
  created: []
  modified:
    - src/components/movie-card.tsx
    - src/components/movie-table.tsx
    - src/App.tsx

key-decisions:
  - "Filter already-loaded movies array by shortlistedIds instead of separate Supabase query"
  - "Shortlist view only shows movies from current country (acceptable for v1)"
  - "Inline SVG hearts instead of lucide import to keep it simple"

patterns-established:
  - "onAuthRequired callback: components call parent callback when anon user tries auth-gated action"
  - "View switcher: glass-card pill tabs with bg-primary/20 active state"

# Metrics
duration: 2min
completed: 2026-02-16
---

# Phase 2 Plan 2: Shortlist UI Summary

**Heart toggle buttons on MovieCard/MovieTable and Browse/Shortlist view switcher with tab count badge**

## Performance

- **Duration:** 2 min (execution) + checkpoint wait
- **Started:** 2026-02-16T10:26:33Z
- **Completed:** 2026-02-16T12:28:22Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 3

## Accomplishments
- Heart icon on every movie: top-right corner on mobile cards, first column on desktop table
- Browse/My Shortlist tab switcher with live shortlist count badge (only shown when signed in)
- Shortlist view reuses existing MovieTable and MovieCard components with filtered data
- Empty shortlist state with heart icon and "Browse movies" link
- Anon users get sign-in modal when clicking heart via onAuthRequired callback
- View resets to browse on sign-out

## Task Commits

Each task was committed atomically:

1. **Task 1: Add shortlist heart toggle to MovieCard and MovieTable** - `dec9997` (feat)
2. **Task 2: Add Browse/Shortlist view switcher to App.tsx** - `6ba7a73` (feat)
3. **Task 3: Verify complete shortlist feature end-to-end** - human-verify checkpoint (approved)

## Files Created/Modified
- `src/components/movie-card.tsx` - Added heart toggle button (top-right, 20x20 SVG), useShortlist/useAuth hooks, onAuthRequired prop
- `src/components/movie-table.tsx` - Added heart toggle as first column (16x16 SVG), useShortlist/useAuth hooks, onAuthRequired prop
- `src/App.tsx` - Added view state, useShortlist hook, tab switcher UI, shortlist view with empty state, onAuthRequired wiring

## Decisions Made
- Filtered already-loaded `movies` array by `shortlistedIds` via useMemo instead of a separate Supabase query -- simpler, avoids extra network call, acceptable trade-off that shortlist view only shows movies from current country
- Used inline SVG hearts rather than adding a lucide heart import -- keeps it self-contained, matches plan spec
- Glass-card pill tab style for view switcher matching existing controls aesthetic

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

**The shortlist table migration must be applied before the feature works.** See Plan 01 summary for details:
- `supabase/migrations/20260216000001_shortlist_table.sql`
- Location: Supabase Dashboard > SQL Editor > New query > paste contents > Run

## Issues Encountered
None

## Next Phase Readiness
- Phase 2 complete: all 4 success criteria met (add to shortlist, remove from shortlist, view shortlist with details, persists across sessions)
- Partner shortlist RLS policies already in place for Phase 3 overlap detection
- MovieTable/MovieCard heart toggles ready for Phase 3 to add overlap indicators

## Self-Check: PASSED

All 3 modified files verified on disk. All 2 commit hashes found in git log. Human verification approved.

---
*Phase: 02-personal-shortlists*
*Completed: 2026-02-16*
