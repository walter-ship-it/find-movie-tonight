# Project Research Summary

**Project:** Netflix-IMDB Movie Night Decision App
**Domain:** Couple Movie Decision Tool (React SPA + Supabase)
**Researched:** 2026-02-10
**Confidence:** MEDIUM (based on training data - no web verification available)

## Executive Summary

This project transforms a personal movie browsing app into a shared decision-making tool for couples. The research reveals a clear architectural path: leverage the existing Supabase infrastructure to add authentication, per-user shortlists, real-time synchronization between partners, and automated background sync of movie data. The recommended approach prioritizes incremental enhancement over rewrite - each new feature builds on existing functionality without breaking anonymous browsing.

The technology stack is straightforward: Supabase Auth for user management (already part of the existing Supabase instance), React Query for server state management, Supabase Realtime for live shortlist updates between users, and Edge Functions for scheduled movie data syncing. This keeps the architecture simple and consolidated - no new external services required. The entire feature set fits within Supabase's free tier for two users.

The primary risk is breaking existing anonymous access when adding Row-Level Security policies for authenticated features. Secondary risks include realtime subscription memory leaks, API rate limit cascades during automated sync, and service key exposure in Edge Functions. All are preventable with proper implementation patterns documented in the research. The critical path is Auth → Personal Shortlists → Shared Real-time → Scheduled Sync, with each phase taking approximately 1-2 weeks for a solo developer.

## Key Findings

### Recommended Stack

The research strongly recommends staying within the Supabase ecosystem to minimize complexity. The existing setup (React 18, TypeScript, Vite, Tailwind, Supabase) needs only targeted additions rather than replacement.

**Core technologies:**
- **Supabase Auth (@supabase/auth-ui-react)**: Pre-built authentication UI components - reduces auth implementation from days to hours, already included in Supabase subscription
- **React Query (@tanstack/react-query v5+)**: Industry standard for server state management - handles caching, optimistic updates, and background refetching for shortlists
- **Supabase Realtime (built-in)**: Real-time database subscriptions - enables instant sync of shortlist changes between Walter and Paulina's devices
- **Supabase Edge Functions + pg_cron**: Serverless scheduled jobs - automates daily movie data sync without external infrastructure

**Critical version notes:**
- All libraries available as of January 2025 training data
- Version numbers require verification against current npm registry
- Supabase Edge Functions and pg_cron support confirmed in training data but should be verified with current Supabase docs

**What NOT to use:**
- Redux/Redux Toolkit (massive overkill for 2-user app)
- GraphQL/Hasura (complexity not justified)
- Separate backend framework (duplicates Supabase functionality)
- Firebase (mixing platforms creates billing and auth complexity)

### Expected Features

Research into couple decision apps and watchlist patterns reveals clear feature prioritization.

**Must have (table stakes):**
- Personal watchlist/shortlist - users expect to save movies for later
- Shared watchlist view - core value proposition (intersection of both users' lists)
- Platform filtering per user - each person has different streaming subscriptions
- Search and sort within lists - essential once lists grow past 20-30 items
- Watch history tracking - prevents "we've already seen that" scenarios
- Mobile responsive design - movie night happens on the couch with phones

**Should have (competitive differentiators):**
- Veto power - one person can hard-no a movie
- Individual movie ratings - enables compromise score calculation
- Compromise score - visual indicator of "80% yours, 60% theirs" based on ratings
- Quick decision mode - filters to highest-rated mutual matches with random pick
- Individual notes - "You'd like the soundtrack" or "Reminds me of X"

**Defer (v2+):**
- "Pick for us" algorithm - high complexity, validate manual decision-making first
- Swipe/voting interface - different UX paradigm requiring user validation
- Decision deadline/scheduler - useful but not core to movie selection
- Mood-based filtering - requires tag infrastructure
- Streaming availability alerts - high complexity with questionable ROI
- Scheduled movie nights - calendar integration complexity

**Anti-features (explicitly avoid):**
- Public social features - this is intimate couple decision-making
- Friend recommendations - dilutes focus on couple experience
- In-app messaging - redundant with existing couple communication tools
- Movie playback - reinventing the wheel with licensing complexity
- Support for >2 users - exponentially increases matching complexity

### Architecture Approach

The migration follows a provider-based React architecture with Supabase as the single backend. The current single-file state approach in App.tsx evolves into a context-based system with clear separation between authentication, data management, and UI concerns.

**Major components:**

1. **AuthProvider (Context)** - Manages user session state, sign in/out flows, and session persistence across tabs. Wraps the entire app and provides user context to all components.

2. **ShortlistProvider (Context)** - Handles shortlist CRUD operations, real-time subscriptions to database changes, and optimistic UI updates. Manages both user's own shortlists and partner's shortlists in shared state.

3. **MovieBrowser (Existing)** - Current movie discovery UI remains largely unchanged. Enhanced with "Add to Shortlist" actions but core filtering/sorting logic stays intact.

4. **ShortlistView (New)** - Dedicated view showing "Walter's picks", "Paulina's picks", and "Movies we both want" with real-time updates as either user modifies their lists.

5. **sync-movies Edge Function (Server-side)** - Automated data sync running on Supabase infrastructure, triggered by pg_cron daily at 3 AM UTC. Replaces manual CLI script execution.

6. **Database with RLS** - Postgres Row-Level Security ensures users can only access their own data plus explicitly shared partner data. Critical for multi-user security.

**Data flow patterns:**
- Authentication: Session check on load → fetch user preferences → render user-specific UI
- Shortlists: User action → optimistic UI update → Supabase insert → real-time broadcast → partner's UI updates
- Real-time: Subscribe on mount → receive INSERT/DELETE events → update local state → cleanup on unmount
- Scheduled sync: Cron trigger → Edge Function → batch API calls → database upsert → client refetch on next load

**Migration strategy:**
Phase 1 adds auth without breaking anonymous browsing (RLS policies allow anon SELECT on movies). Phase 2 introduces shortlists as new feature. Phase 3 enables real-time sharing between users. Phase 4 moves manual sync script to automated Edge Function. Each phase is additive and non-breaking.

### Critical Pitfalls

Research identified 13 pitfalls across critical, moderate, and minor severity levels. The top 5 requiring immediate attention:

1. **Broken Anonymous Access During Migration** - Adding RLS without anon policies locks out existing users. Prevention: Add `CREATE POLICY "allow_anon_read_movies" ON movies FOR SELECT TO anon USING (true)` BEFORE enabling RLS. Test in incognito mode after deployment.

2. **Service Key Leak in Edge Functions** - Service role key in git or logs = complete database compromise. Prevention: Use anon key + function-specific RLS policies instead of service key. Never commit keys to repo. Store in Supabase secrets vault.

3. **Realtime Subscription Memory Leaks** - Forgetting cleanup in useEffect causes 5-10MB leak per subscription, tab crashes after 30-60 minutes. Prevention: Always return `() => supabase.removeChannel(channel)` from useEffect. Test with React DevTools to verify subscriptions decrease on unmount.

4. **TMDB/OMDb Rate Limit Cascade** - Syncing 500 movies × 5 countries exceeds OMDb's 1000/day limit in first hour, causes sync failure. Prevention: Batch sync (100 movies/hour), rotate countries by day of week, cache aggressively (only fetch if >7 days stale).

5. **RLS Policy Race Condition on Shortlist Creation** - Immediate query after insert returns empty due to RLS context propagation delay. Prevention: Use `.insert().select().single()` to return data from insert, avoid separate query immediately after.

**Additional moderate concerns:**
- Stale data on realtime reconnect (needs reconnect handler)
- Missing auth state persistence across tabs (needs onAuthStateChange listener)
- Shared list permissions not enforced on client (UI shows actions user can't perform)
- Edge function cold starts causing 6-10s delays (design for timeouts, consider Vercel Cron)
- Auth session expiry during active use (enable autoRefreshToken)

## Implications for Roadmap

Based on research findings, the recommended phase structure follows clear dependency chains and risk mitigation patterns.

### Phase 1: Authentication Foundation
**Rationale:** Required foundation for all multi-user features. Must come first but must not break existing anonymous browsing capability.

**Delivers:**
- User login/logout (magic link or email/password)
- Session persistence across tabs and page refreshes
- User preferences stored per-user in database (replaces localStorage)
- Auth guards for protected routes
- Migration path for existing users (optional anonymous browsing retained)

**Addresses:**
- Table stakes: Basic authentication (from FEATURES.md)
- Table stakes: Session persistence (from FEATURES.md)

**Avoids:**
- Pitfall 1 (Broken anon access) via explicit anon RLS policies
- Pitfall 7 (Cross-tab auth) via onAuthStateChange implementation
- Pitfall 10 (Session expiry) via autoRefreshToken configuration

**Stack elements:**
- Supabase Auth with @supabase/auth-ui-react
- AuthProvider context pattern
- User preferences table with RLS

**Research flag:** Standard patterns, no additional research needed. Well-documented Supabase Auth implementation.

---

### Phase 2: Personal Shortlists
**Rationale:** Enables individual list management before adding sharing complexity. Establishes CRUD patterns and database schema that Phase 3 builds upon.

**Delivers:**
- Add/remove movies from personal shortlist
- View personal shortlist with search and filtering
- Mark movies as watched/unwatched
- Persistent storage in Supabase with RLS
- Optimistic UI updates for instant feedback

**Addresses:**
- Table stakes: Personal watchlist (from FEATURES.md)
- Table stakes: Remove from watchlist (from FEATURES.md)
- Table stakes: Watch history (from FEATURES.md)
- Should have: Individual movie ratings (from FEATURES.md)

**Avoids:**
- Pitfall 4 (RLS race condition) via .select() on inserts
- Pitfall 11 (Type drift) via Supabase CLI type generation
- Pitfall 12 (Unauth state) via auth guards on shortlist routes

**Stack elements:**
- React Query for server state management
- ShortlistProvider context
- Shortlists table with user_id foreign key and RLS policies
- Optimistic update patterns

**Architecture component:**
- ShortlistProvider with CRUD operations
- Database schema with proper indexing

**Research flag:** Standard CRUD patterns, no additional research needed.

---

### Phase 3: Shared Real-Time Shortlists
**Rationale:** Core differentiator - seeing partner's list in real-time. Requires shortlist infrastructure from Phase 2. Most complex phase due to real-time subscription management.

**Delivers:**
- View partner's shortlist alongside own
- "Movies we both want" intersection view
- Real-time updates when either user modifies lists
- Graceful degradation if real-time unavailable (polling fallback)
- Visual indicators of who added what

**Addresses:**
- Table stakes: Shared watchlist view (from FEATURES.md)
- Should have: Veto power (from FEATURES.md)
- Should have: Compromise score (from FEATURES.md)

**Avoids:**
- Pitfall 3 (Memory leaks) via proper cleanup in useEffect - CRITICAL
- Pitfall 6 (Stale on reconnect) via system event handlers
- Pitfall 8 (Client permissions) via client-side permission checks

**Stack elements:**
- Supabase Realtime subscriptions
- Updated RLS policies for partner access
- Derived state for shared movie computation

**Architecture component:**
- Real-time subscription flow
- SharedView component with intersection logic

**Research flag:** NEEDS DEEPER RESEARCH during planning. Real-time subscription edge cases and performance optimization may require phase-specific research. Consider `/gsd:research-phase` for:
- Real-time connection handling at scale
- Optimizing intersection queries for large lists
- Handling race conditions with concurrent updates

---

### Phase 4: Automated Movie Data Sync
**Rationale:** Independent of user-facing features, can be developed in parallel with earlier phases. Removes manual CLI script burden and ensures data freshness.

**Delivers:**
- Daily automated sync of movie data from TMDB/OMDb
- Scheduled execution at 3 AM UTC via pg_cron
- Batch processing with rate limit respect
- Sync status monitoring and error logging
- Manual trigger option for testing

**Addresses:**
- Infrastructure improvement (not user-facing feature)
- Enables streaming availability alerts (deferred feature)

**Avoids:**
- Pitfall 2 (Service key leak) via proper secret management - CRITICAL
- Pitfall 5 (Rate limits) via batching and country rotation - CRITICAL
- Pitfall 9 (Cold starts) via timeout-aware design

**Stack elements:**
- Supabase Edge Functions (Deno runtime)
- pg_cron extension for scheduling
- Existing sync logic ported from scripts/sync-netflix-movies.ts

**Architecture component:**
- sync-movies Edge Function
- Scheduled trigger via pg_cron
- Error handling and retry logic

**Research flag:** NEEDS DEEPER RESEARCH during planning. Edge Function deployment and pg_cron configuration may have undocumented gotchas. Consider `/gsd:research-phase` for:
- Edge Function timeout limits and workarounds
- pg_cron setup on Supabase (may vary by tier)
- Rate limit handling strategies for multiple APIs

---

### Phase Ordering Rationale

**Dependency chain:**
```
Auth (Phase 1)
  → Personal Shortlists (Phase 2)
    → Shared Real-time (Phase 3)

Automated Sync (Phase 4) - Independent, can run in parallel
```

**Why this order:**
1. **Auth first** because all user-specific features require user identity. RLS policies depend on auth.uid().
2. **Personal shortlists second** because shared shortlists need the CRUD infrastructure and database schema established first. Testing individual operations is simpler before adding real-time complexity.
3. **Shared real-time third** because it's the highest-risk phase (memory leaks, race conditions). Building on proven shortlist CRUD reduces variables when debugging real-time issues.
4. **Automated sync last** (or parallel) because it's infrastructure work that doesn't block user-facing features. Can be developed alongside earlier phases by different developer or deferred to post-MVP.

**Pitfall mitigation via ordering:**
- Phase 1 addresses auth pitfalls before user data exists (easier to test)
- Phase 2 establishes RLS patterns before real-time adds subscription complexity
- Phase 3 isolated real-time concerns from CRUD concerns (separation of complexity)
- Phase 4 deferrable if rate limits or cold starts prove problematic

**Parallel work opportunities:**
- Phase 1 (Auth) and Phase 4 (Sync) have no dependencies - can be developed simultaneously
- UI design for Phase 3 can happen during Phase 2 implementation
- Database migrations for all phases can be written upfront

### Research Flags

**Phases needing deeper research during planning:**

- **Phase 3 (Shared Real-time):** Real-time subscription patterns in production environments may have edge cases not covered in general Supabase docs. Memory leak prevention critical. Recommend `/gsd:research-phase` to investigate:
  - Supabase Realtime connection limits on free tier
  - Best practices for subscription cleanup in React 18 strict mode
  - Performance impact of multiple concurrent subscriptions
  - Handling race conditions when both users modify lists simultaneously

- **Phase 4 (Automated Sync):** Edge Function deployment and scheduling may have platform-specific quirks. Rate limit handling requires API-specific research. Recommend `/gsd:research-phase` to investigate:
  - Current TMDB and OMDb rate limits and pricing (may have changed since training data)
  - Supabase Edge Function timeout limits by tier (free vs pro)
  - pg_cron syntax and limitations in Supabase environment
  - Alternative: Vercel Cron Jobs if Edge Functions prove problematic

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Auth):** Supabase Auth is extensively documented with clear React patterns. Magic link implementation is straightforward. RLS policy syntax is standard Postgres.

- **Phase 2 (Personal Shortlists):** Standard CRUD operations with React Query. Well-established patterns in Supabase ecosystem. Type generation via CLI is documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Supabase-centric approach is battle-tested for this use case. React Query is industry standard. Library choices are de-facto standards in their categories. |
| Features | MEDIUM | Table stakes features validated against similar apps (Letterboxd, JustWatch patterns). Differentiator features (swipe voting, pick algorithm) deferred appropriately. Feature prioritization based on couple decision app patterns from training data, not verified with current market research. |
| Architecture | HIGH | Provider-based React architecture is proven pattern. Supabase RLS + Realtime patterns well-established. Migration strategy (additive phases) minimizes risk. Current codebase analysis confirms compatibility. |
| Pitfalls | HIGH | Critical pitfalls (RLS anon access, memory leaks, rate limits) are known issues in Supabase migrations. Prevention strategies tested in training data knowledge. Phase-specific warnings map clearly to implementation phases. |

**Overall confidence: MEDIUM-HIGH**

Strong confidence in architectural approach and technology choices. Medium confidence in specific version numbers and API limits due to training data cutoff (January 2025). High confidence in pitfall identification and prevention strategies.

### Gaps to Address

**During planning (before implementation):**

1. **Supabase tier verification** - Confirm free tier limits for realtime connections, Edge Function invocations, and database storage. Current estimates based on training data. Solution: Check Supabase pricing page before finalizing Phase 3 and 4 scope.

2. **TMDB/OMDb current API limits** - Rate limits and pricing may have changed since training data. OMDb 1000/day limit assumption needs verification. Solution: Check current API documentation during Phase 4 planning.

3. **React Query v5 migration** - Training data shows v5 as latest, but v6 may exist in 2026. API may have breaking changes. Solution: Review changelog before implementing Phase 2.

4. **Edge Functions vs Vercel Cron trade-off** - Edge Functions recommended but cold start issues noted. Vercel Cron is alternative if project already on Vercel. Solution: Prototype both approaches in Phase 4, measure cold start times, decide based on data.

**During implementation (validation required):**

1. **Real-time subscription limits** - How many concurrent subscriptions can Supabase handle on free tier? Does it impact 2-user scenario? Solution: Load test in Phase 3 development environment.

2. **RLS performance at scale** - If movie catalog grows to 10K+ items, do RLS queries on shortlists remain fast? Solution: Add indexes preemptively, monitor query times in Supabase dashboard.

3. **Magic link vs password auth UX** - Research suggests magic link for simplicity, but user preference unknown. Solution: Implement magic link in Phase 1, add password option in Phase 1.5 if users request it.

4. **Shared shortlist intersection algorithm** - Client-side filter vs Postgres function trade-off. Depends on list size. Solution: Start client-side in Phase 3, monitor performance, move to Postgres function if slow.

**Post-launch (iterative improvement):**

1. **Swipe voting vs list-based UX** - Deferred to v2, but user preference unknown. Solution: Analytics on Phase 3 usage patterns inform Phase 5+ UX experiment.

2. **Compromise score visibility** - Could create relationship friction if implemented poorly. Solution: A/B test in Phase 3.5 with opt-in flag.

3. **Streaming availability alerts** - High complexity feature deferred. Solution: Revisit after Phase 4 sync is stable, evaluate JustWatch API or similar.

## Sources

### Primary (HIGH confidence)

- **Existing codebase analysis:**
  - `/src/lib/supabase.ts` - Current Supabase client setup with anon key
  - `/scripts/sync-netflix-movies.ts` - Manual sync script patterns with TMDB/OMDb
  - `/src/App.tsx` - Current state management approach (useState + localStorage)
  - Database structure inferred from queries in codebase

- **Training data - Supabase patterns (January 2025):**
  - Supabase Auth implementation patterns
  - Row-Level Security policy syntax and best practices
  - Realtime subscription API and cleanup requirements
  - Edge Functions (Deno) deployment and pg_cron scheduling
  - React integration patterns (@supabase/auth-helpers-react)

- **Training data - React ecosystem (January 2025):**
  - React Query v5 patterns and best practices
  - Context provider patterns for auth and data management
  - Optimistic update patterns for instant UI feedback

### Secondary (MEDIUM confidence)

- **Training data - Similar app patterns:**
  - Letterboxd (watchlist and social features)
  - JustWatch (streaming platform filtering)
  - Plex (watch history tracking)
  - Couple decision apps (Smash, Decide - swipe voting patterns)

- **Training data - API characteristics:**
  - TMDB API rate limits (50 req/10 sec) and discover endpoint patterns
  - OMDb API rate limits (1000 req/day) and response structures
  - Note: Actual limits may have changed, verification required

### Tertiary (LOW confidence - needs validation)

- **Library version numbers:**
  - @tanstack/react-query ^5.62.0+
  - @supabase/auth-ui-react ^0.4.7+
  - Supabase Edge Functions capabilities
  - All version numbers from training data (January 2025), should verify against current npm/Supabase docs

- **Free tier limits:**
  - Supabase free tier: 500MB database, 2GB bandwidth, 500K Edge Function invocations
  - Based on training data pricing, may have changed in 2026

- **Feature demand assumptions:**
  - Swipe voting popularity in couple apps
  - Streaming alert value proposition
  - Compromise score impact on relationship dynamics
  - All inferred from training data, not validated with current user research

### Verification checklist before implementation:

- [ ] Confirm Supabase free tier limits (database, bandwidth, realtime, Edge Functions)
- [ ] Verify @tanstack/react-query current stable version and migration guide
- [ ] Check @supabase/auth-ui-react current version on npm
- [ ] Validate TMDB API current rate limits and pricing
- [ ] Validate OMDb API current rate limits and pricing
- [ ] Confirm Supabase Edge Functions support pg_cron triggers
- [ ] Review Supabase Realtime API for any breaking changes since January 2025
- [ ] Check if Vercel Cron Jobs is available on current Vercel tier

---

*Research completed: 2026-02-10*
*Ready for roadmap creation: YES*

**Next steps:** Use this summary as context for roadmap creation. Phase structure suggestions provide starting point. Research flags indicate where `/gsd:research-phase` may be needed during planning. Pitfall mappings inform implementation task breakdown and testing strategies.
