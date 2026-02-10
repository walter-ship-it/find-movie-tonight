# Technology Stack

**Project:** Netflix-IMDB Movie Night Decision App
**Researched:** 2026-02-10
**Confidence:** MEDIUM (based on training data - web verification tools unavailable)

## Recommended Stack Additions

### Authentication
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @supabase/supabase-js | ^2.47.0 (current) | Authentication (already installed) | Built-in Auth with your existing Supabase instance. Zero additional infrastructure. Supports email/password, magic links, OAuth. Simple couple use case (2 users) doesn't need external auth provider. |
| @supabase/auth-ui-react | ^0.4.7+ | Pre-built auth UI components | Drop-in login/signup forms styled with Tailwind. Reduces auth UI dev time from days to hours. Handles validation, error states, password reset flows. |
| @supabase/auth-helpers-react | ^0.5.0+ | React-specific auth helpers | Provides useSession, useUser hooks. Manages auth state across components. Handles token refresh automatically. |

**Rationale:** Supabase Auth is already part of your Supabase subscription. Adding auth requires no new services, no OAuth app setup complexity for 2 users. The auth-ui-react package provides production-ready components that match your Tailwind setup.

**Confidence:** HIGH - Supabase Auth is standard for Supabase projects. Version numbers are MEDIUM confidence (training data, not verified against current releases).

### State Management & Data Sync
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @tanstack/react-query | ^5.62.0+ | Server state management | De-facto standard for async data in React. Handles caching, refetching, optimistic updates. Integrates seamlessly with Supabase. Better DX than manual useState for server data. 2M+ weekly downloads. |
| @supabase/realtime-js | (included in @supabase/supabase-js) | Real-time subscriptions | Already available via your Supabase client. No additional library needed. Subscribe to database changes for shared shortlists. |

**Rationale:**
- React Query because it's the industry standard for server state (cache invalidation, background refetching, optimistic updates). Your shared shortlist feature needs these patterns.
- Supabase Realtime because it's already included - no new dependency. Postgres triggers push changes to connected clients.

**Confidence:** HIGH on React Query (ubiquitous), MEDIUM on version number (not verified).

### Scheduled Background Sync
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase Edge Functions | Latest (Deno runtime) | Scheduled TMDB/OMDb sync | Serverless functions on your existing Supabase project. No separate infrastructure (vs AWS Lambda, Vercel Crons). Native cron trigger support via pg_cron. |
| pg_cron | (Supabase extension) | Cron scheduling in Postgres | Built into Supabase. Schedule Edge Function calls directly from Postgres. No external scheduler needed. Simple SQL syntax for schedule definition. |

**Alternative considered:** Vercel Cron Jobs
- **Why not:** Ties you to Vercel for backend scheduling. Edge Functions keep all logic in Supabase. Supabase already has your secrets (TMDB/OMDb API keys), database access.

**Rationale:** Keep scheduled jobs where your data lives. Edge Functions access Supabase without API keys (service role built-in). pg_cron triggers are database-native (vs webhooks from external schedulers).

**Confidence:** MEDIUM - Edge Functions were actively developed as of Jan 2025. pg_cron support for Supabase confirmed in training data.

### Database Schema & Types
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase CLI | Latest | Type generation, migrations | Generate TypeScript types from Postgres schema. Version control migrations. Local dev with `supabase start`. Essential for type-safe queries. |
| Database Functions (Postgres) | N/A | Row-level security, shared list logic | RLS ensures users only see their shortlists + shared ones. Postgres functions for "overlap" logic (movies on both users' lists). Better performance than client-side filtering. |

**Rationale:** Type safety prevents runtime errors. RLS is security-critical (users can't access each other's personal lists). Postgres functions let you write "shared shortlist overlap" logic once in SQL, not replicated in frontend code.

**Confidence:** HIGH - Supabase CLI and RLS are core Supabase features.

## Supporting Libraries (Optional But Recommended)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | ^5.0.2+ | Client state management | If you need global UI state (modal open/closed, current filter selections). Lightweight (3KB). Simpler than Redux/Context for small apps. |
| zod | ^3.24.1+ | Runtime validation | Validate API responses from TMDB/OMDb before saving to DB. Type-safe schema validation. Pairs with TypeScript. |
| date-fns | ^4.1.0+ | Date utilities | Format "last synced" timestamps, schedule display ("next sync in 2 hours"). Tree-shakeable (vs Moment.js). |

**Rationale:**
- Zustand: Only if you find React Query + useState insufficient for UI state. Don't add preemptively.
- Zod: Worth it for external API validation. TMDB/OMDb can return unexpected shapes.
- date-fns: If you show sync schedules or "last updated" times. Otherwise skip.

**Confidence:** MEDIUM - Popular libraries, versions from training data.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Authentication | Supabase Auth | Clerk, Auth0, Firebase Auth | Overhead for 2 users. Supabase Auth is included, simpler for small scale. |
| State Management | React Query | SWR, Redux Toolkit | SWR is good but React Query has better devtools, larger ecosystem. Redux is overkill for this use case. |
| Scheduled Jobs | Supabase Edge Functions + pg_cron | Vercel Cron, GitHub Actions, AWS EventBridge | Keeps logic co-located with data. No external service dependencies. |
| Real-time | Supabase Realtime | Pusher, Ably, Firebase Realtime | Already included in Supabase. Adding separate service is unnecessary cost/complexity. |
| Database | Postgres (via Supabase) | MongoDB, Firebase Firestore | Postgres already in use. Relational model fits (users → shortlists → movies). |

## What NOT to Use

| Technology | Why Avoid | What to Do Instead |
|------------|-----------|-------------------|
| Redux / Redux Toolkit | Massive overkill for 2-user app. Boilerplate hell. | Use React Query for server state, useState/useReducer for local UI state. Add Zustand only if needed. |
| GraphQL (Hasura, Apollo) | Complexity not justified. Your data access is simple (list movies, filter, user shortlists). | Use Supabase PostgREST API (already available). Type-safe with generated types. |
| Separate backend (Express, Nest.js) | Duplication with Supabase. Adds deployment, CORS, auth middleware complexity. | Use Supabase Edge Functions for serverless backend logic. PostgREST for CRUD. |
| Firebase | You're already on Supabase. Mixing platforms adds billing complexity, auth handoff issues. | Stick with Supabase ecosystem for consistency. |
| WebSockets (raw) | Supabase Realtime abstracts this. Don't reinvent. | Use Supabase Realtime subscriptions. |
| Moment.js | Deprecated, huge bundle size (67KB). | Use date-fns (tree-shakeable) or native Intl API. |

## Installation

### Core New Dependencies
```bash
# Authentication UI (pre-built components)
npm install @supabase/auth-ui-react @supabase/auth-ui-shared

# React Query for server state
npm install @tanstack/react-query

# Optional: Validation
npm install zod

# Optional: Date utilities (if showing sync schedules)
npm install date-fns
```

### Dev Dependencies
```bash
# Supabase CLI (type generation, migrations)
npm install -D supabase

# React Query DevTools (development only)
npm install -D @tanstack/react-query-devtools
```

### Supabase Setup
```bash
# Link to your Supabase project
npx supabase link --project-ref <your-project-ref>

# Generate TypeScript types from database schema
npx supabase gen types typescript --linked > src/lib/database.types.ts

# Enable pg_cron extension (run once in Supabase SQL editor)
# CREATE EXTENSION IF NOT EXISTS pg_cron;
```

## Architecture Decisions

### 1. Authentication Flow
**Decision:** Use Supabase Auth with email/password (no OAuth providers initially).

**Why:**
- 2 users don't need "Sign in with Google" complexity
- Email/password is simplest to implement and debug
- Can add OAuth later if needed (Supabase supports it)

**Implementation:**
```typescript
// Wrap app with session provider
import { SessionContextProvider } from '@supabase/auth-helpers-react'

<SessionContextProvider supabaseClient={supabase}>
  <App />
</SessionContextProvider>
```

### 2. Real-time Shared Shortlists
**Decision:** Use Supabase Realtime with Postgres Row-Level Security.

**Why:**
- Changes to shortlists automatically sync between devices
- RLS ensures users only see their own + shared lists
- No polling (efficient, immediate updates)

**Implementation Pattern:**
```typescript
// Subscribe to shortlist changes
const shortlistSubscription = supabase
  .channel('shortlists')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'shortlists' },
    (payload) => {
      queryClient.invalidateQueries(['shortlists'])
    }
  )
  .subscribe()
```

### 3. Scheduled Sync Strategy
**Decision:** Daily TMDB/OMDb sync via Edge Function triggered by pg_cron.

**Why:**
- Movie data doesn't change hourly - daily is sufficient
- Off-peak hours (3 AM) reduces API rate limit pressure
- Edge Function can batch process, handle retries

**Implementation:**
```sql
-- Schedule daily sync at 3 AM UTC
SELECT cron.schedule(
  'daily-movie-sync',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/sync-movies',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key'))
  );
  $$
);
```

### 4. Type Safety
**Decision:** Generate types from Supabase schema, not manual interfaces.

**Why:**
- Single source of truth (database schema)
- Types update automatically when schema changes
- Catches mismatches at compile time

**Workflow:**
1. Update schema in Supabase dashboard or migration
2. Run `npx supabase gen types typescript --linked`
3. TypeScript errors if queries don't match schema

## Rollout Strategy

### Phase 1: Authentication (Week 1)
- Add @supabase/auth-ui-react
- Create login/signup pages
- Protect existing routes (redirect to login if not authenticated)
- Test with 2 user accounts

### Phase 2: Personal Shortlists (Week 2)
- Database schema: `shortlists` table with `user_id` foreign key
- React Query hooks: `useShortlist`, `useAddToShortlist`
- UI: "Add to My List" button on movie cards
- RLS policies: users see only their shortlists

### Phase 3: Shared Shortlists (Week 3)
- Database: "shared" flag or separate `shared_shortlists` table
- Realtime subscription to shortlist changes
- UI: "Overlap" view (movies on both users' lists)
- Test real-time sync (open 2 browsers, different users)

### Phase 4: Scheduled Sync (Week 4)
- Edge Function: `sync-movies` (port existing script)
- pg_cron: schedule daily trigger
- UI: "Last synced" timestamp display
- Manual trigger button (for testing/immediate refresh)

## Migration Path from Current Setup

### Already in Place
- ✅ React 18, TypeScript, Vite
- ✅ Supabase client configured
- ✅ Tailwind CSS
- ✅ Movie data schema
- ✅ TMDB/OMDb sync script (in `/scripts`)

### New Additions
- **Auth:** Add session provider wrapper, login page
- **State:** Replace manual `useState` for movie data with React Query
- **Real-time:** Add subscription to shortlist table
- **Scheduling:** Move `/scripts/sync-netflix-movies.ts` logic to Edge Function

### Breaking Changes
- None. New features are additive. Existing movie browsing continues to work.

## Monitoring & Observability

| Tool | Purpose | How |
|------|---------|-----|
| Supabase Dashboard | Monitor auth, database queries, Edge Function logs | Built-in. Check "Logs" tab for errors. |
| React Query DevTools | Debug cache state, refetch timing | Install devtools package, shows in bottom corner. |
| pg_cron logs | Verify scheduled jobs ran | Query `cron.job_run_details` table in SQL editor. |

## Performance Considerations

### Database
- **Index on user_id in shortlists table** (for fast "my lists" queries)
- **Index on movie_id in shortlists** (for overlap queries)
- **Postgres function for overlap logic** (avoid N+1 queries)

### React Query
- **Stale time:** Set to 5 minutes for movie catalog (doesn't change often)
- **Cache time:** 10 minutes (keep data in memory)
- **Refetch on window focus:** Disable for movie data, enable for shortlists

### Real-time
- **Subscribe per component lifecycle** (unsubscribe on unmount to avoid memory leaks)
- **Debounce rapid updates** (if user adds multiple movies quickly)

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Service role key in Edge Functions only (never in frontend)
- [ ] VITE_SUPABASE_ANON_KEY is anon key, not service role
- [ ] Auth redirects prevent accessing shortlists without login
- [ ] CORS configured in Edge Functions (only allow your domain)

## Cost Implications

### Supabase Free Tier Limits
- 500 MB database (your movie catalog likely < 100 MB)
- 2 GB bandwidth/month (2 users = well within limits)
- 500K Edge Function invocations (1 daily sync = 30/month, negligible)
- Realtime concurrent connections: 200 (2 users = no issue)

**Verdict:** Entire feature set fits in free tier. No new costs.

### External API Costs
- TMDB: Free (but rate limited to 40 req/10 sec)
- OMDb: Free tier = 1000 requests/day (sufficient for daily sync)

## Open Questions for Phase-Specific Research

1. **Shortlist overlap algorithm:** Client-side filter vs Postgres function? Need to benchmark with real data size.
2. **Auth persistence:** localStorage vs cookies? Matters for mobile (if you add React Native later).
3. **Edge Function timeout:** Can daily sync complete within Supabase's timeout limit? Depends on catalog size.

## Sources

**Note:** Web verification tools were unavailable during research. Recommendations based on training data (knowledge cutoff: January 2025). Versions and features should be verified against current documentation before implementation.

**Training data sources:**
- Supabase official documentation patterns
- React Query (TanStack Query) ecosystem standards
- React 18 + TypeScript best practices
- Postgres pg_cron extension capabilities

**Recommended verification (before implementation):**
- [ ] Check latest @supabase/auth-ui-react version on npm
- [ ] Verify @tanstack/react-query v5 is current stable
- [ ] Confirm Supabase Edge Functions support pg_cron triggers
- [ ] Review Supabase Realtime API for any breaking changes

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Supabase Auth choice | HIGH | Standard for Supabase projects, well-documented, matches use case |
| React Query choice | HIGH | Industry standard, 2M+ weekly downloads, proven with Supabase |
| Edge Functions + pg_cron | MEDIUM | Architecture sound, but feature availability/limits not verified with current docs |
| Library versions | MEDIUM | Based on training data (Jan 2025), should verify npm for latest |
| RLS patterns | HIGH | Core Postgres/Supabase feature, well-established |
| Cost estimates | MEDIUM | Free tier limits from training data, verify current Supabase pricing |

**Overall Confidence: MEDIUM** - Architecture decisions are sound and align with ecosystem standards. Version numbers and specific feature availability require verification against current documentation.
