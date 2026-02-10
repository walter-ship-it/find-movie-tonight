# Movie Night Picker

## What This Is

A mobile-responsive web app for Walter and Paulina to decide what to watch on movie night. It aggregates movies across all major streaming platforms (Netflix, Disney+, Prime Video, HBO Max, Apple TV+, etc.) with IMDB, Rotten Tomatoes, and Metacritic scores, and lets each person build a shortlist so they can quickly find something they both want to watch.

## Core Value

Eliminate the "what should we watch?" debate — open the app, see what's available across your subscriptions, shortlist your picks, and land on a movie in under 5 minutes.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. Inferred from existing codebase. -->

- ✓ Browse movies available on streaming platforms by country — existing
- ✓ View IMDB, Rotten Tomatoes, and Metacritic scores for each movie — existing
- ✓ Filter movies by genre, year, runtime, rating, and streaming provider — existing
- ✓ Sort movies by title, year, runtime, or any rating score — existing
- ✓ Search movies by title — existing
- ✓ Responsive layout (table on desktop, cards on mobile) — existing
- ✓ Multi-country support (10 countries) — existing
- ✓ Multi-provider tracking (Netflix, Disney+, Prime, etc.) — existing
- ✓ Data sync pipeline from TMDB and OMDb APIs — existing
- ✓ User preferences persisted across sessions (country, filters, sort) — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Simple user accounts so Walter and Paulina each have their own profile
- [ ] Personal shortlist — each user can add/remove movies they want to watch
- [ ] Shared shortlist view — see movies both people shortlisted (the overlap)
- [ ] Combined shortlist view — see all shortlisted movies from both people
- [ ] "Pick for us" — surface top matches from the shared shortlist (e.g. highest rated overlap)
- [ ] Scheduled auto-sync to keep the movie catalog current without manual runs
- [ ] Per-user streaming platform selection (mark which platforms you subscribe to)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Social features beyond two users — this is a couples app, not a social platform
- Movie reviews or comments — scores from IMDB/RT are sufficient
- Watch history tracking — streaming platforms already do this
- Trailer playback — just link out to the streaming platform
- Recommendation engine — the whole point is to browse the real catalog, not get algorithmic suggestions

## Context

- Walter and Paulina have different streaming subscriptions (he has Disney+, she has Netflix, plus others)
- The core frustration is scrolling through a single platform's recommendations and not being able to see everything available
- They browse both together on one screen and separately on their phones, then compare picks
- Scores are tiebreakers (help choose between options) not dealbreakers (won't filter out low-rated movies if they look fun)
- Success metric: they actually open this app instead of scrolling Netflix on movie night
- Existing app is deployed on Vercel with Supabase backend, syncs data from TMDB and OMDb APIs
- Current sync is manual (`npm run sync`), needs to become automated

## Constraints

- **Tech stack**: React + Vite + TypeScript + Supabase + Tailwind (existing, keep it)
- **Auth**: Supabase Auth (already have Supabase, use its auth layer)
- **Data source**: TMDB + OMDb APIs (existing pipeline, extend don't replace)
- **Hosting**: Vercel (existing deployment)
- **Users**: Just two people — don't over-engineer for scale
- **Mobile-first**: Must work great on phones since that's the primary use case (couch browsing)

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase Auth for accounts | Already using Supabase for data, keep the stack simple | — Pending |
| Shared shortlist (not swipe/vote) | Matches how they naturally decide — each picks, then find overlap | — Pending |
| All major platforms, not just Netflix | They have multiple subscriptions, need to see everything | — Pending |
| Scheduled auto-sync | "Must be current" requirement — can't rely on manual runs | — Pending |

---
*Last updated: 2026-02-10 after initialization*
