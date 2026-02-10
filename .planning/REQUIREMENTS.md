# Requirements: Movie Night Picker

**Defined:** 2026-02-10
**Core Value:** Eliminate the "what should we watch?" debate — open the app, see what's available across your subscriptions, shortlist your picks, and land on a movie in under 5 minutes.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can sign in via magic link (passwordless email)
- [ ] **AUTH-03**: User session persists across browser refresh
- [ ] **AUTH-04**: User can link their account to their partner's account

### Shortlists

- [ ] **LIST-01**: User can add a movie to their personal shortlist
- [ ] **LIST-02**: User can remove a movie from their personal shortlist
- [ ] **LIST-03**: User can view their own shortlist
- [ ] **LIST-04**: User can view the shared shortlist (movies both partners shortlisted)
- [ ] **LIST-05**: User can view the combined shortlist (all movies either partner shortlisted)

### Platform & Catalog

- [ ] **PLAT-01**: User can select which streaming platforms they subscribe to
- [ ] **PLAT-02**: User can filter movies by "available on my platforms" or "available on our platforms"
- [ ] **PLAT-03**: Movie catalog auto-syncs on a schedule to stay current

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Decision Enhancement

- **PICK-01**: "Pick for us" — auto-suggest highest-rated movie from shared shortlist
- **LIST-06**: Veto power — mark a movie as "not tonight"
- **HIST-01**: Watch history — mark movies as watched, exclude from future suggestions

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Social features beyond 2 users | Couples app, not a social platform |
| Movie reviews or comments | IMDB/RT scores are sufficient |
| Trailer playback | Link out to streaming platform instead |
| Recommendation engine | The point is browsing the real catalog, not algorithmic suggestions |
| In-app messaging | You're sitting on the same couch |
| Mobile native app | Web-first, responsive design is sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| LIST-01 | Phase 2 | Pending |
| LIST-02 | Phase 2 | Pending |
| LIST-03 | Phase 2 | Pending |
| LIST-04 | Phase 3 | Pending |
| LIST-05 | Phase 3 | Pending |
| PLAT-01 | Phase 4 | Pending |
| PLAT-02 | Phase 4 | Pending |
| PLAT-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-10*
*Last updated: 2026-02-10 after roadmap creation*
