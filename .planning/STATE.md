# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-10)

**Core value:** Eliminate the "what should we watch?" debate — open the app, see what's available across your subscriptions, shortlist your picks, and land on a movie in under 5 minutes.
**Current focus:** Phase 2 - Personal Shortlists (COMPLETE)

## Current Position

Phase: 2 of 4 COMPLETE (Personal Shortlists)
Plan: 2 of 2 complete
Status: Phase 2 complete. Ready for Phase 3.
Last activity: 2026-02-16 — Completed 02-02: shortlist UI with heart toggles and Browse/Shortlist view switcher.

Progress: [█████░░░░░] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 2 min
- Total execution time: 0.15 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-authentication-foundation | 3/3 | 6 min | 2 min |
| 02-personal-shortlists | 2/2 | 3 min | 1.5 min |

**Recent Trend:**
- Last 5 plans: 01-02 (2 min), 01-03 (2 min), 02-01 (1 min), 02-02 (2 min)
- Trend: Consistent

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Supabase Auth for accounts — Already using Supabase for data, keep the stack simple
- Shared shortlist (not swipe/vote) — Matches how they naturally decide — each picks, then find overlap
- Scheduled auto-sync — "Must be current" requirement — can't rely on manual runs
- Migrations not pushed via CLI — Supabase project not linked locally; apply via SQL Editor dashboard
- No new auth packages — existing @supabase/supabase-js handles all auth; deprecated packages avoided
- Custom auth forms over @supabase/auth-ui-react — unmaintained package; built custom forms matching app aesthetic
- Auth modal overlay in App.tsx — keeps SPA simple; no separate /login route needed
- Magic link redirects to app root — AuthCallback mounted globally processes token_hash on any page load
- PartnerLink in UserMenu (not App.tsx) — partner status is part of user identity display, keeps App.tsx simpler
- Reused get_my_partner_id() for shortlist RLS — avoids recursion, consistent with profiles pattern
- Optimistic Set updates with rollback — instant UI feedback for shortlist toggle
- Cleanup flag pattern in useEffect — prevents state updates after user change mid-flight
- Filter loaded movies by shortlistedIds instead of separate query — simpler, avoids extra network call
- Inline SVG hearts over lucide import — self-contained, no new dependency
- onAuthRequired callback pattern — components delegate auth-gated actions to parent

### Pending Todos

None yet.

### Blockers/Concerns

**From Research:**
- Phase 1: Must preserve anonymous browsing (critical for existing users) — add anon RLS policies BEFORE enabling RLS
- Phase 3: Real-time subscription memory leaks require proper cleanup patterns — test with React DevTools
- Phase 4: TMDB/OMDb rate limits require batching strategy — verify current API limits during planning

## Session Continuity

Last session: 2026-02-16
Stopped at: Completed 02-02-PLAN.md (shortlist UI). Phase 2 complete. Ready for Phase 3 planning.
Resume file: None

---
*State initialized: 2026-02-10*
*Last updated: 2026-02-16T12:28Z*
