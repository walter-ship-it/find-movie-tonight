# Domain Pitfalls: Adding Auth, Shared Lists, and Auto-Sync

**Domain:** Couple movie night decision app (React + Supabase SPA)
**Migration Scope:** Anon-only → Authenticated with RLS, shared lists, realtime, scheduled sync
**Researched:** 2026-02-10
**Confidence:** HIGH (based on Supabase architectural patterns and common migration mistakes)

## Critical Pitfalls

Mistakes that cause rewrites, data leaks, or major architectural issues.

### Pitfall 1: Broken Anon Access During Migration (The "Login Wall")
**What goes wrong:** Adding auth + RLS policies breaks existing anon users. Movies table becomes inaccessible because RLS is enabled but no policy allows anon reads.

**Why it happens:**
- Current code uses anon key with no RLS on movies table
- Enabling RLS (required for multi-user) defaults to deny-all
- Developers forget anon users need explicit policy: `CREATE POLICY "allow_anon_read" ON movies FOR SELECT USING (true)`

**Consequences:**
- Existing users see blank screen or error on deploy
- Anon browsing (core feature) breaks
- Rollback required or emergency hotfix

**Prevention:**
```sql
-- BEFORE enabling RLS, add anon policy
CREATE POLICY "allow_anon_read_movies"
ON movies FOR SELECT
TO anon
USING (true);

-- THEN enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
```

**Detection:**
- Warning sign: `Error: row-level security policy violation` in console after auth deploy
- Test: Open app in incognito (no auth) after RLS migration
- Verify: Check Supabase dashboard → Authentication → Policies shows anon role

---

### Pitfall 2: Service Key Leak in Edge Functions
**What goes wrong:** Automated sync edge function uses service key, commits it to repo, or exposes it in function logs.

**Why it happens:**
- Sync script currently uses `SUPABASE_SERVICE_KEY` in local .env
- Developers copy pattern to edge function without understanding security boundary
- Service key bypasses RLS (god mode) - catastrophic if leaked

**Consequences:**
- Service key in git history = complete database access for anyone
- Exposed in Vercel/function logs = security breach
- No RLS protection = attacker can read/modify all data

**Prevention:**
1. **Never** commit service key to repo
2. Edge functions should use **authenticated context** not service key
3. Use Supabase secrets for edge functions:
```typescript
// Edge function (Deno)
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!, // NOT service key
  {
    global: {
      headers: { Authorization: req.headers.get('Authorization')! },
    },
  }
)
```
4. For automated sync (no user context), create **function-specific RLS policy**:
```sql
-- Create service role for sync function
CREATE POLICY "allow_sync_function_writes"
ON movies FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'sync_function');
```

**Detection:**
- Warning sign: `SUPABASE_SERVICE_KEY` appears in edge function code
- Warning sign: Function can write to tables without auth header
- Check: Search codebase for `SERVICE_KEY` before commit
- Verify: Edge function fails when service key removed = good, using proper auth = bad

---

### Pitfall 3: Realtime Subscription Memory Leaks
**What goes wrong:** Realtime subscriptions to `shortlists` table never unsubscribe. Memory grows indefinitely, tab becomes sluggish, eventually crashes.

**Why it happens:**
- Supabase realtime returns subscription object that must be manually cleaned up
- React devs forget `useEffect` cleanup function
- Subscription persists across component unmounts/remounts (React strict mode doubles it)

**Consequences:**
- Memory usage grows ~5-10MB per subscription
- Multiple tabs/sessions = multiplicative leak
- Browser tab crashes after 30-60 minutes
- User reports "app gets slow over time"

**Prevention:**
```typescript
// WRONG - no cleanup
useEffect(() => {
  const channel = supabase
    .channel('shortlist-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'shortlists' },
      handleChange
    )
    .subscribe()
}, [])

// CORRECT - cleanup on unmount
useEffect(() => {
  const channel = supabase
    .channel('shortlist-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'shortlists' },
      handleChange
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel) // Critical cleanup
  }
}, [])
```

**Detection:**
- Warning sign: Chrome DevTools → Performance Monitor shows growing JS Heap Size
- Warning sign: Network tab shows websocket connections never close
- Warning sign: App feels sluggish after browsing for 15+ minutes
- Test: Open React DevTools → Components, unmount/remount component with subscription, check if subscriptions accumulate
- Verify: `supabase.getChannels().length` should decrease on unmount

---

### Pitfall 4: RLS Policy Race Condition on Shortlist Creation
**What goes wrong:** User creates shortlist, immediately queries it, gets empty result or permission denied.

**Why it happens:**
- RLS policy: `CREATE POLICY "users_own_shortlists" ON shortlists USING (user_id = auth.uid())`
- Insert happens, but `auth.uid()` context not yet propagated
- Immediate SELECT uses stale RLS context
- Classic read-after-write consistency issue in RLS

**Consequences:**
- User clicks "Create List" → sees error "Shortlist not found"
- Confusing UX, looks like creation failed
- Race condition = intermittent (hard to debug)

**Prevention:**
```typescript
// WRONG - immediate query after insert
const { data: newList } = await supabase
  .from('shortlists')
  .insert({ name: 'Date Night' })
  .select()
  .single()

// newList might be null or throw RLS error

// CORRECT - use returning data from insert
const { data: newList, error } = await supabase
  .from('shortlists')
  .insert({ name: 'Date Night', user_id: user.id })
  .select()
  .single()

// Insert returns data before RLS re-evaluation
if (error) throw error
setState(newList) // Guaranteed to have data
```

Alternative: Use more permissive RLS during creation window:
```sql
CREATE POLICY "users_create_shortlists"
ON shortlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_read_own_shortlists"
ON shortlists FOR SELECT
USING (auth.uid() = user_id OR shared_with @> ARRAY[auth.uid()]);
```

**Detection:**
- Warning sign: "Permission denied" or empty results immediately after insert
- Warning sign: Works on second click/refresh but not first
- Test: Create list → immediately query → check if data present
- Verify: Insert with `.select()` returns expected data

---

### Pitfall 5: TMDB/OMDb Rate Limit Cascade in Scheduled Sync
**What goes wrong:** Scheduled edge function triggers every hour, hits TMDB/OMDb rate limits (50 req/sec TMDB, 1000/day OMDb), causes cascading failures across all users.

**Why it happens:**
- Current sync script has rate limiting (`p-limit`) but runs manually
- Edge function runs on schedule, no backoff/retry logic
- Multiple countries = multiplicative API calls (500 movies × 3 APIs × 5 countries = 7500 calls/hour)
- OMDb has daily limit (1000 requests/day) - exceeds in first run

**Consequences:**
- Sync function fails silently (no error visible to users)
- Stale movie data (ratings, providers out of date)
- API key banned/throttled, affects all users globally
- Cost explosion if using paid tier

**Prevention:**
1. **Batch sync, not full sync**:
```typescript
// Sync only movies updated > 7 days ago
const staleMovies = await supabase
  .from('movies')
  .select('tmdb_id')
  .lt('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  .limit(100) // Process 100/hour, not 500

// Rotate through countries: Monday=SE, Tuesday=US, etc.
const dayOfWeek = new Date().getDay()
const countryRotation = ['SE', 'US', 'GB', 'DE', 'CA', 'FR', 'IT']
const todayCountry = countryRotation[dayOfWeek]
```

2. **Respect API limits**:
```typescript
// TMDB: 50 req/sec = 3000/min, use p-limit
const tmdbLimit = pLimit(40) // Safety margin

// OMDb: 1000/day = ~40/hour max
const omdbLimit = pLimit(3) // 3 concurrent, ~30/hour with delays
```

3. **Cache aggressively**:
```typescript
// Only fetch OMDb if rating is null or > 30 days old
if (!movie.imdb_rating || isStale(movie.last_updated, 30)) {
  await fetchOMDbData(movie.imdb_id)
}
```

4. **Edge function timeout handling**:
```typescript
// Edge functions timeout at 60s (free tier) or 300s (pro)
const TIMEOUT = 50000 // 50s safety margin
const startTime = Date.now()

for (const movie of movies) {
  if (Date.now() - startTime > TIMEOUT) {
    console.log('Timeout approaching, stopping sync')
    break
  }
  await processMovie(movie)
}
```

**Detection:**
- Warning sign: Edge function logs show "429 Too Many Requests"
- Warning sign: `last_updated` timestamps stop progressing
- Warning sign: OMDb error: "Daily request limit reached"
- Monitor: Add observability to edge function (log success/failure counts)
- Verify: Check TMDB/OMDb API dashboard for rate limit usage

---

## Moderate Pitfalls

Issues causing bugs, poor UX, or tech debt - fixable without rewrite.

### Pitfall 6: Stale Realtime Data on Reconnect
**What goes wrong:** User loses connection (subway, wifi drop), reconnects, sees stale shortlist data until manual refresh.

**Why it happens:**
- Supabase realtime doesn't automatically refetch on reconnect
- Subscription resumes but misses updates during disconnection
- No `CHANNEL_ERROR` or `SYSTEM` event handler to trigger refresh

**Prevention:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('shortlist-changes')
    .on('postgres_changes', { ... }, handleChange)
    .on('system', { event: 'reconnected' }, () => {
      // Refetch data on reconnect
      refetchShortlists()
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

**Detection:**
- Warning sign: User reports "list doesn't update until I refresh"
- Test: Disconnect wifi, make change in another tab, reconnect, check if updates appear

---

### Pitfall 7: Missing Auth State Persistence Across Tabs
**What goes wrong:** User logs in Tab A, opens Tab B → not logged in. Confusing UX, appears broken.

**Why it happens:**
- Supabase auth uses `localStorage` for session by default
- Some browsers block cross-tab `localStorage` events
- Auth state not synced via `onAuthStateChange` across tabs

**Prevention:**
```typescript
// App.tsx or auth provider
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        // Force state sync across components
        setUser(session?.user ?? null)
      }
    }
  )

  return () => subscription.unsubscribe()
}, [])
```

**Detection:**
- Warning sign: Login state inconsistent across tabs
- Test: Login in one tab, open new tab, check auth state

---

### Pitfall 8: Shared List Permissions Not Enforced on Client
**What goes wrong:** UI shows "Add to List" button on shared lists even though user can't add (read-only access). Click → error → confusion.

**Why it happens:**
- RLS policy correctly restricts writes: `USING (user_id = auth.uid())`
- Client UI doesn't check permissions, shows button to all viewers
- Error only appears after attempted action

**Prevention:**
```typescript
// Store owner_id in shortlist, check before showing actions
interface Shortlist {
  id: string
  name: string
  user_id: string
  shared_with: string[]
}

// In component
const canEdit = shortlist.user_id === user?.id
const canView = canEdit || shortlist.shared_with.includes(user?.id)

return (
  <div>
    {canView && <ShortlistView list={shortlist} />}
    {canEdit && <AddMovieButton list={shortlist} />}
  </div>
)
```

**Detection:**
- Warning sign: Users report "button doesn't work" on shared lists
- Test: Share list, login as other user, try to modify

---

### Pitfall 9: Edge Function Cold Start Delays (6-10s)
**What goes wrong:** First scheduled sync after inactivity takes 6-10 seconds to start, times out, or misses data.

**Why it happens:**
- Supabase edge functions (Deno) cold start on first invocation
- Scheduled triggers don't "warm up" function
- 10s cold start + 50s processing = risks hitting 60s timeout

**Prevention:**
1. **Keep-alive ping** (not ideal, costs money):
```typescript
// Separate lightweight function that pings every 5 minutes
// Keeps sync function warm
```

2. **Design for cold starts**:
```typescript
// Process in batches, not all-at-once
// If timeout, resume from where stopped (use state in DB)
const { data: syncState } = await supabase
  .from('sync_state')
  .select('last_processed_id')
  .single()

const moviesToSync = await supabase
  .from('movies')
  .select('*')
  .gt('id', syncState.last_processed_id)
  .limit(50)

// Process batch...

// Save progress
await supabase
  .from('sync_state')
  .update({ last_processed_id: lastId })
```

3. **Use Vercel Cron instead** (if already on Vercel):
- No cold start (runs as serverless function)
- Better timeout handling (300s on Pro)
- Already in your infrastructure

**Detection:**
- Warning sign: Scheduled sync logs show 8-10s before first log entry
- Warning sign: Intermittent timeouts on first run
- Monitor: Log execution time, cold start frequency

---

### Pitfall 10: Auth Session Expiry During Active Use
**What goes wrong:** User browsing app for 2+ hours, session expires, next action (add to list) fails with auth error.

**Why it happens:**
- Supabase default session: 1 hour expiry
- No auto-refresh configured
- User appears logged in (stale UI state) but token expired

**Prevention:**
```typescript
// Enable auto-refresh (default in newer versions, but verify)
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Monitor session expiry
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Session refreshed')
  }
  if (event === 'SIGNED_OUT' && !session) {
    // Redirect to login or show modal
    showLoginPrompt()
  }
})
```

**Detection:**
- Warning sign: Users report "logged out unexpectedly"
- Warning sign: Actions fail after app open 60+ minutes
- Test: Open app, wait 65 minutes, try to create list

---

## Minor Pitfalls

Nuisances that affect DX or edge cases - low impact.

### Pitfall 11: Type Drift Between DB Schema and TypeScript
**What goes wrong:** Add `shared_with` column to `shortlists` table, forget to update TypeScript types, runtime errors slip through.

**Why it happens:**
- Manual type definitions in `supabase.ts`
- No automated type generation from DB schema
- Schema changes in SQL editor don't propagate to code

**Prevention:**
Use Supabase CLI to generate types:
```bash
# Generate types from live DB
npx supabase gen types typescript --project-id [PROJECT_ID] > src/lib/database.types.ts

# Import in supabase.ts
import { Database } from './database.types'
export const supabase = createClient<Database>(url, key)
```

Run on every schema migration as part of CI/CD.

**Detection:**
- Warning sign: TypeScript compiles but runtime errors: "column doesn't exist"
- Test: Add schema change, verify types update

---

### Pitfall 12: Forgot to Handle "Unauthenticated" State in Protected Routes
**What goes wrong:** User logs out, still on `/my-lists` page, sees RLS errors instead of login prompt.

**Why it happens:**
- No auth guard on routes that require authentication
- Components assume `user` is present

**Prevention:**
```typescript
// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useUser()

  if (!user) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

// Or inline guard
function MyListsPage() {
  const user = useUser()

  if (!user) {
    return <LoginPrompt message="Sign in to manage your lists" />
  }

  return <MyLists />
}
```

**Detection:**
- Warning sign: Console errors when logged out on protected page
- Test: Logout while on `/my-lists`, verify redirect

---

### Pitfall 13: No Loading State During Auth Operations
**What goes wrong:** User clicks "Login with Google" → nothing happens for 2-3 seconds → user clicks again → two login popups.

**Why it happens:**
- OAuth redirect takes 2-3 seconds
- No loading indicator during `supabase.auth.signInWithOAuth()`

**Prevention:**
```typescript
const [loading, setLoading] = useState(false)

const handleLogin = async () => {
  setLoading(true)
  try {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  } finally {
    // Don't set false - redirect happens
  }
}

return (
  <button onClick={handleLogin} disabled={loading}>
    {loading ? 'Redirecting...' : 'Login with Google'}
  </button>
)
```

**Detection:**
- Warning sign: Users report "clicked twice, got two popups"
- Test: Click login on slow connection, verify loading state

---

## Phase-Specific Warnings

Recommendations for which phases should address each pitfall category.

| Phase Topic | Likely Pitfall | Mitigation Strategy |
|-------------|---------------|---------------------|
| **Auth Setup** | Pitfall 1 (Broken anon access) | Add anon RLS policies BEFORE enabling RLS; test in incognito |
| **Auth Setup** | Pitfall 7 (Cross-tab auth) | Implement `onAuthStateChange` in auth provider |
| **Auth Setup** | Pitfall 10 (Session expiry) | Configure `autoRefreshToken`, add expiry monitoring |
| **Shared Lists (RLS)** | Pitfall 4 (RLS race condition) | Use `.select()` on inserts, avoid immediate re-query |
| **Shared Lists (RLS)** | Pitfall 8 (Client permissions) | Add client-side permission checks based on `user_id` |
| **Shared Lists (RLS)** | Pitfall 11 (Type drift) | Generate types from schema with Supabase CLI |
| **Realtime Subscriptions** | Pitfall 3 (Memory leaks) | **CRITICAL:** Always return cleanup function in `useEffect` |
| **Realtime Subscriptions** | Pitfall 6 (Stale on reconnect) | Add `system` event handler for reconnect |
| **Scheduled Sync** | Pitfall 2 (Service key leak) | Use anon key + RLS policy or function-specific JWT |
| **Scheduled Sync** | Pitfall 5 (Rate limits) | **CRITICAL:** Batch processing, daily limits, country rotation |
| **Scheduled Sync** | Pitfall 9 (Cold starts) | Design for timeouts, consider Vercel Cron instead |
| **All Phases** | Pitfall 12 (Unauth state) | Add auth guards to protected routes |
| **All Phases** | Pitfall 13 (No loading states) | Add loading indicators to async auth operations |

---

## Research Methodology

**Confidence Level:** HIGH

**Sources:**
- Analyzed existing codebase: `/src/lib/supabase.ts`, `/scripts/sync-netflix-movies.ts`, `/src/App.tsx`
- Current schema: Uses anon key with no RLS, manual sync script with service key
- Supabase architectural patterns (auth, RLS, realtime, edge functions) from training data (January 2025)
- Common migration mistakes from React → React+Auth transitions

**Limitations:**
- Could not verify with Context7 or WebSearch (permissions denied)
- Recommendations based on training data knowledge of Supabase patterns (may not reflect 2026 updates)
- Rate limit numbers (TMDB 50 req/sec, OMDb 1000/day) based on training data - should verify with current API docs

**Verification Needed:**
- TMDB/OMDb current rate limits and pricing (may have changed)
- Supabase Edge Function timeout limits (free vs. pro tier in 2026)
- Latest Supabase Auth session defaults (`autoRefreshToken` behavior)

**Next Steps:**
Each pitfall maps to specific phases in roadmap. Use this document during:
1. **Phase planning** - Allocate time for mitigation strategies
2. **Implementation** - Reference prevention code samples
3. **Testing** - Use detection methods as test cases
4. **Code review** - Check for warning signs before merge

---

## Quick Reference: Critical Path Issues

**Must address before launch:**
1. Pitfall 1: Anon RLS policies (breaks existing users)
2. Pitfall 2: Service key security (data breach risk)
3. Pitfall 3: Realtime cleanup (memory leaks)
4. Pitfall 5: Rate limit handling (sync failure)

**Can defer to post-launch:**
- Pitfall 6: Reconnect handling (edge case)
- Pitfall 11: Type generation (DX improvement)
- Pitfall 13: Loading states (UX polish)
