# Roadmap: Movie Night Picker

## Overview

This roadmap takes an existing movie browsing app and transforms it into a collaborative decision tool for Walter and Paulina. We start by adding user authentication and personal shortlists, then layer on real-time sharing between partners, and finally automate the movie catalog sync. Each phase delivers a complete capability that brings the couple closer to eliminating movie night debates.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Authentication Foundation** - User accounts with session persistence
- [x] **Phase 2: Personal Shortlists** - Individual movie lists with watch tracking
- [ ] **Phase 3: Shared Shortlists** - Real-time collaboration between partners
- [ ] **Phase 4: Platform Selection & Sync** - Per-user streaming platforms and automated catalog updates

## Phase Details

### Phase 1: Authentication Foundation
**Goal**: Users can securely access their own accounts and maintain sessions across devices
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. User can create an account with email and password
  2. User can sign in via magic link (passwordless email)
  3. User session persists across browser refresh and tab close/reopen
  4. User can link their account to their partner's account
  5. Anonymous browsing still works (existing functionality preserved)
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md -- Database foundation (RLS + profiles) and AuthContext provider
- [x] 01-02-PLAN.md -- Auth UI forms (sign up, sign in, magic link, user menu)
- [x] 01-03-PLAN.md -- Partner linking UI and end-to-end verification

### Phase 2: Personal Shortlists
**Goal**: Each user can build and manage their own movie shortlist
**Depends on**: Phase 1
**Requirements**: LIST-01, LIST-02, LIST-03
**Success Criteria** (what must be TRUE):
  1. User can add a movie to their personal shortlist from the browse view
  2. User can remove a movie from their shortlist
  3. User can view their complete shortlist with all movie details (ratings, runtime, platforms)
  4. Shortlist persists across sessions and devices
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md -- Shortlist table migration with RLS and ShortlistContext provider
- [x] 02-02-PLAN.md -- Heart toggle on MovieCard/MovieTable and Browse/Shortlist view switcher

### Phase 3: Shared Shortlists
**Goal**: Partners can see each other's shortlists and identify shared picks in real-time
**Depends on**: Phase 2
**Requirements**: LIST-04, LIST-05
**Success Criteria** (what must be TRUE):
  1. User can view the shared shortlist showing movies both partners added
  2. User can view the combined shortlist showing all movies either partner added
  3. When partner adds or removes a movie, it appears/disappears in real-time without refresh
  4. Shared and combined views clearly indicate who added each movie
**Plans**: TBD

Plans:
- [ ] TBD during phase planning

### Phase 4: Platform Selection & Sync
**Goal**: Users see movies available on their platforms and catalog stays current automatically
**Depends on**: Phase 1 (auth for per-user preferences), independent of Phases 2-3
**Requirements**: PLAT-01, PLAT-02, PLAT-03
**Success Criteria** (what must be TRUE):
  1. User can select which streaming platforms they subscribe to
  2. User can filter movies by "available on my platforms" or "available on our platforms" (partner's platforms + mine)
  3. Movie catalog automatically syncs daily without manual intervention
  4. Sync status is visible (last sync time, any errors)
**Plans**: TBD

Plans:
- [ ] TBD during phase planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

Note: Phase 4 can be developed in parallel with Phases 2-3 as it has no dependency on shortlist features.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication Foundation | 3/3 | ✓ Complete | 2026-02-15 |
| 2. Personal Shortlists | 2/2 | ✓ Complete | 2026-02-16 |
| 3. Shared Shortlists | 0/TBD | Not started | - |
| 4. Platform Selection & Sync | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-10*
*Last updated: 2026-02-16*
