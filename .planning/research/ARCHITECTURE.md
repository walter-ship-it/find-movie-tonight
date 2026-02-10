# Architecture Patterns

**Domain:** Movie Recommendation SPA with Multi-User Features
**Researched:** 2026-02-10
**Confidence:** MEDIUM (based on training data and existing codebase analysis; no Context7/WebSearch access)

## Current Architecture (Baseline)

### Component Structure
```
App.tsx (Root)
├── State Management: useState + useLocalStorage hooks
├── Data Fetching: Direct supabase.from('movies').select()
├── UI Components: CountrySelector, SearchBar, MovieTable, MovieCard, MovieFilters
└── Utilities: filter-utils.ts, sort-utils.ts
```

### Data Flow
```
localStorage (country, filters, sort)
    ↓
App.tsx (state)
    ↓
supabase.from('movies').select()
    ↓
movies[] state
    ↓
processedMovies (search → filter → sort)
    ↓
UI Components
```

### Key Characteristics
- **Single-file state**: All state lives in App.tsx
- **Client-side filtering**: Movies fetched once per country, then filtered in memory
- **No authentication**: Anonymous Supabase access
- **Manual sync**: CLI script runs independently
- **Local preferences**: localStorage for user settings

## Recommended Architecture (With Auth + Real-Time + Scheduled Sync)

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                        │
├─────────────────────────────────────────────────────────────┤
│  AuthProvider (Context)                                      │
│    └── user, session, signIn, signOut                       │
│                                                              │
│  App.tsx                                                     │
│    ├── ShortlistProvider (Context) ← Real-time subscriptions│
│    │     └── shortlists[], addToShortlist, removeFromShort..│
│    │                                                         │
│    ├── MovieBrowser (Existing functionality)                │
│    │     └── CountrySelector, Filters, Table, Cards         │
│    │                                                         │
│    └── ShortlistView (New)                                  │
│          └── UserShortlist, PartnerShortlist, SharedView    │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                        │
├─────────────────────────────────────────────────────────────┤
│  Auth Service                                                │
│    └── Users: walter@, paulina@                            │
│                                                              │
│  Database Tables                                             │
│    ├── movies (existing)                                    │
│    ├── user_preferences (new)                               │
│    │     └── user_id, country, filters, sort                │
│    └── shortlists (new)                                     │
│          └── id, user_id, movie_id, added_at, notes         │
│                                                              │
│  Real-Time                                                   │
│    └── Subscriptions on shortlists table                    │
│                                                              │
│  Edge Functions (Deno)                                       │
│    └── sync-movies (scheduled via pg_cron)                  │
│          └── Runs TMDB+OMDb fetch for configured countries  │
└─────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With | State Owned |
|-----------|---------------|-------------------|-------------|
| **AuthProvider** | Manage user session, sign in/out | Supabase Auth API | user, session, loading |
| **ShortlistProvider** | Manage shortlist CRUD + real-time sync | Supabase DB + Realtime | shortlists[], partner shortlists[] |
| **App.tsx** | Route between views, compose providers | AuthProvider, ShortlistProvider | view state (browse vs shortlist) |
| **MovieBrowser** | Existing movie discovery UI | movies table (read-only) | search, filters, sort, movies[] |
| **ShortlistView** | Display user + partner shortlists | ShortlistProvider | UI state only |
| **UserPreferences** | Persist per-user settings | user_preferences table | Synced to Supabase, not localStorage |
| **sync-movies (Edge)** | Automated data sync | TMDB API, OMDb API, movies table | None (stateless function) |

### Data Flow Patterns

#### 1. Authentication Flow
```
User visits app
    ↓
AuthProvider checks supabase.auth.getSession()
    ↓
If session exists → Fetch user preferences from DB
If no session → Redirect to login (magic link or password)
    ↓
On successful auth → Set user context
    ↓
App renders with user-specific data
```

#### 2. Shortlist Management Flow
```
User adds movie to shortlist
    ↓
ShortlistProvider.addToShortlist(movieId)
    ↓
INSERT into shortlists table { user_id, movie_id, added_at }
    ↓
Supabase Real-time broadcasts change
    ↓
Both Walter's and Paulina's browsers receive update
    ↓
ShortlistProvider updates local state
    ↓
UI re-renders with new shortlist
```

#### 3. Real-Time Subscription Flow
```
ShortlistProvider mounts
    ↓
Subscribe to shortlists table:
  - Filter: user_id IN [walter_id, paulina_id] (both users)
  - Events: INSERT, DELETE, UPDATE
    ↓
On INSERT event → Add to local shortlists[]
On DELETE event → Remove from local shortlists[]
On UPDATE event → Update item in shortlists[]
    ↓
Cleanup on unmount: unsubscribe()
```

#### 4. Scheduled Sync Flow (Server-Side)
```
Cron job triggers (daily at 3 AM UTC)
    ↓
Invokes Edge Function: sync-movies
    ↓
Edge function reads user_preferences table
    ↓
For each configured country:
  - Fetch from TMDB discover API
  - Enrich with OMDb ratings
  - UPSERT into movies table
    ↓
Function completes → Logs results
    ↓
Client apps fetch fresh data on next load
```

## Migration Strategy: Current → Target Architecture

### Phase 1: Add Authentication (Minimal Disruption)
**Goal:** Enable user login without breaking existing functionality

**Changes:**
1. Wrap App in AuthProvider context
2. Add login page (magic link for simplicity)
3. Update Supabase RLS policies:
   - `movies` table: Allow anonymous SELECT (backward compat)
   - `shortlists` table: Require auth for all operations
4. Add user-specific preferences table
5. Migrate localStorage to user_preferences table on first login

**Key Decision:** Keep anonymous browsing available, require auth only for shortlists

**Data Model:**
```sql
-- User preferences (replaces localStorage)
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  country TEXT NOT NULL DEFAULT 'SE',
  filters JSONB DEFAULT '{}',
  sort_config JSONB DEFAULT '{"key":"imdb_rating","direction":"desc"}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only read/write their own preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);
```

### Phase 2: Add Shortlists (New Feature)
**Goal:** Enable per-user movie shortlists

**Changes:**
1. Create shortlists table
2. Add ShortlistProvider context
3. Add UI for shortlist actions (heart icon on movie cards)
4. Add shortlist view page/tab
5. Implement basic CRUD (no real-time yet)

**Data Model:**
```sql
CREATE TABLE shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  movie_id UUID NOT NULL REFERENCES movies(id),
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Index for fast lookups
CREATE INDEX idx_shortlists_user_movie ON shortlists(user_id, movie_id);

-- RLS: Users can only manage their own shortlists
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own shortlists"
  ON shortlists FOR ALL
  USING (auth.uid() = user_id);
```

### Phase 3: Add Real-Time Sharing
**Goal:** Both users see each other's shortlists in real-time

**Changes:**
1. Update RLS policy: Allow reading partner's shortlists
2. Add real-time subscription in ShortlistProvider
3. Update UI to show "Walter's picks" vs "Paulina's picks"
4. Add shared view: Movies both users added

**RLS Update:**
```sql
-- Allow Walter and Paulina to see each other's shortlists
CREATE POLICY "Partners can view each other's shortlists"
  ON shortlists FOR SELECT
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT id FROM auth.users
      WHERE email IN ('walter@example.com', 'paulina@example.com')
    )
  );
```

**Real-Time Subscription (React):**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('shortlists')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'shortlists'
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setShortlists(prev => [...prev, payload.new])
        } else if (payload.eventType === 'DELETE') {
          setShortlists(prev => prev.filter(s => s.id !== payload.old.id))
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### Phase 4: Scheduled Auto-Sync
**Goal:** Replace manual CLI script with automated cloud function

**Changes:**
1. Create Edge Function: `sync-movies`
2. Port CLI script logic to Deno
3. Set up pg_cron extension in Supabase
4. Schedule daily execution
5. Add admin UI to view sync logs (optional)

**Edge Function Structure:**
```typescript
// supabase/functions/sync-movies/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Read countries from user_preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('country')

  const countries = [...new Set(preferences.map(p => p.country))]

  // For each country, run sync logic
  for (const country of countries) {
    await syncCountry(country, supabase)
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Scheduling (Supabase Dashboard → Database → Functions):**
```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily sync at 3 AM UTC
SELECT cron.schedule(
  'sync-movies-daily',
  '0 3 * * *',
  $$ SELECT net.http_post(
    url := 'https://[project-ref].supabase.co/functions/v1/sync-movies',
    headers := jsonb_build_object('Authorization', 'Bearer [anon-key]')
  ) $$
);
```

## Patterns to Follow

### Pattern 1: Context + Custom Hook for Auth
**What:** Centralize authentication state in React Context with custom hook

**When:** Every component that needs user info

**Example:**
```typescript
// contexts/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Usage
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### Pattern 2: Optimistic Updates for Shortlists
**What:** Update UI immediately, sync to DB in background

**When:** Adding/removing shortlist items (feels instant)

**Example:**
```typescript
const addToShortlist = async (movieId: string) => {
  const tempId = crypto.randomUUID()
  const newItem = { id: tempId, user_id: user.id, movie_id: movieId }

  // Optimistic update
  setShortlists(prev => [...prev, newItem])

  try {
    const { data, error } = await supabase
      .from('shortlists')
      .insert(newItem)
      .select()
      .single()

    if (error) throw error

    // Replace temp item with real DB item
    setShortlists(prev => prev.map(s => s.id === tempId ? data : s))
  } catch (err) {
    // Rollback on error
    setShortlists(prev => prev.filter(s => s.id !== tempId))
    toast.error('Failed to add to shortlist')
  }
}
```

### Pattern 3: Derived State for Shared Shortlist
**What:** Compute intersection of both users' lists without extra queries

**When:** Displaying "movies we both like"

**Example:**
```typescript
const sharedMovies = useMemo(() => {
  const walterMovieIds = new Set(
    shortlists.filter(s => s.user_id === WALTER_ID).map(s => s.movie_id)
  )
  const paulinaMovieIds = new Set(
    shortlists.filter(s => s.user_id === PAULINA_ID).map(s => s.movie_id)
  )

  return [...walterMovieIds].filter(id => paulinaMovieIds.has(id))
}, [shortlists])
```

### Pattern 4: Graceful Real-Time Degradation
**What:** App works without real-time; real-time is enhancement

**When:** Network issues or real-time service down

**Example:**
```typescript
useEffect(() => {
  let channel

  try {
    channel = supabase
      .channel('shortlists')
      .on('postgres_changes', { ... }, handleChange)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time connected')
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('Real-time failed, using polling fallback')
          // Fall back to periodic fetching
          pollingInterval = setInterval(fetchShortlists, 5000)
        }
      })
  } catch (err) {
    console.error('Real-time unavailable:', err)
  }

  return () => {
    channel?.unsubscribe()
    clearInterval(pollingInterval)
  }
}, [])
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Derived Data in Supabase
**What goes wrong:** Storing computed values (e.g., "is_shared") in database

**Why bad:** Data duplication, sync issues, wasted storage

**Instead:** Compute derived state in React components/hooks

**Example:**
```typescript
// BAD: Store is_shared in database
const { data } = await supabase
  .from('shortlists')
  .select('*, is_shared')  // is_shared is computed column

// GOOD: Compute client-side
const isShared = (movieId) => {
  return shortlists.filter(s => s.movie_id === movieId).length === 2
}
```

### Anti-Pattern 2: Deeply Nested Context Providers
**What goes wrong:** AuthProvider > PreferencesProvider > ShortlistProvider > ThemeProvider > ...

**Why bad:** Hard to debug, performance issues, "wrapper hell"

**Instead:** Compose providers in single wrapper or use state library (Zustand)

**Example:**
```typescript
// GOOD: Single composed provider
export const AppProviders = ({ children }) => (
  <AuthProvider>
    <ShortlistProvider>
      {children}
    </ShortlistProvider>
  </AuthProvider>
)
```

### Anti-Pattern 3: Polling When Real-Time Available
**What goes wrong:** Using setInterval to fetch data instead of subscriptions

**Why bad:** Network waste, delayed updates, battery drain

**Instead:** Use Supabase real-time subscriptions for live data

### Anti-Pattern 4: Exposing Service Role Key Client-Side
**What goes wrong:** Using SUPABASE_SERVICE_ROLE_KEY in browser code

**Why bad:** Security vulnerability, full database access exposed

**Instead:** Use anon key in browser, service key only in Edge Functions/server

## Build Order Recommendations

### Sequential Dependencies
```
1. Auth System (foundation)
   ├── 1a. AuthProvider context
   ├── 1b. Login/logout UI
   └── 1c. Migrate localStorage → user_preferences table

2. Shortlists (requires auth)
   ├── 2a. Database table + RLS
   ├── 2b. ShortlistProvider context
   └── 2c. UI for add/remove

3. Real-Time (requires shortlists)
   ├── 3a. Update RLS for partner access
   ├── 3b. Add subscriptions to ShortlistProvider
   └── 3c. Shared view UI

4. Scheduled Sync (independent, can be parallel)
   ├── 4a. Port CLI script to Edge Function
   ├── 4b. Set up pg_cron
   └── 4c. Test with manual invocations
```

### Parallel Work Opportunities
- **Auth + Edge Function setup** can be done simultaneously (different team members)
- **UI design for shortlists** can happen during auth implementation
- **Database migrations** can be written ahead of feature implementation

### Critical Path
```
Auth → Shortlists → Real-Time
```
Scheduled sync is off critical path (improves convenience but doesn't block UX).

## Scalability Considerations

| Concern | At 2 Users (MVP) | At 100 Users (Future) | At 10K Users (Unlikely) |
|---------|------------------|----------------------|------------------------|
| **Auth** | Magic links sufficient | Add OAuth (Google) | SSO, session management |
| **Real-Time** | Single channel works | Per-user channels | Presence tracking, throttling |
| **Shortlists** | Simple table scan | Add indexes on user_id | Consider Redis cache |
| **Sync Function** | Run for 1-2 countries | Batch processing | Separate worker queues per country |
| **Database** | Supabase free tier | Paid tier (connection pooling) | Dedicated instance, read replicas |

## Testing Strategy

### Unit Tests
- AuthProvider: Session persistence, logout cleanup
- ShortlistProvider: CRUD operations, optimistic updates
- Utility functions: Shared movie computation

### Integration Tests
- Auth flow: Magic link → login → preference load
- Shortlist flow: Add → real-time propagation → remove
- Sync function: API fetch → DB upsert → error handling

### E2E Tests (Playwright/Cypress)
- User journey: Login → browse → add to shortlist → see partner's list
- Real-time: Two browser sessions, verify instant sync

## Security Checklist

- [ ] RLS policies on all tables (never trust client)
- [ ] Service role key never exposed client-side
- [ ] Auth required for all write operations
- [ ] Input validation on Edge Functions
- [ ] Rate limiting on sync function (prevent abuse)
- [ ] CORS configured for Edge Functions
- [ ] Secrets stored in Supabase vault (not .env in repo)

## Deployment Considerations

### Environment Variables
```
# Browser (Vite)
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Edge Functions (Supabase Secrets)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
TMDB_API_KEY=xxx
OMDB_API_KEY=yyy
```

### Vercel Deployment (Existing)
- No changes needed for client app
- Add environment variables via Vercel dashboard
- Ensure `@supabase/supabase-js` is in dependencies (already present)

### Supabase Deployment
1. **Database migrations**: Apply via Supabase Dashboard or CLI
2. **Edge Functions**: Deploy via `supabase functions deploy sync-movies`
3. **Cron job**: Set up in Database → Extensions → pg_cron

### Rollback Strategy
- **Phase 1 (Auth)**: Can disable RLS temporarily if issues
- **Phase 2 (Shortlists)**: Feature-flag the shortlist UI
- **Phase 3 (Real-time)**: Disable subscriptions, fall back to polling
- **Phase 4 (Sync)**: Disable cron job, run manual script

## Monitoring & Observability

### Key Metrics
- Auth: Login success rate, session duration
- Real-time: Subscription connection rate, message latency
- Shortlists: Add/remove frequency, shared movies count
- Sync: Success/failure rate, execution time, movies updated

### Logging
- Edge Function: Use `console.log` (appears in Supabase logs)
- Client errors: Send to Sentry or similar
- Database queries: Enable slow query log in Supabase

## Open Questions / Research Needed

1. **Magic link vs password auth?** (Recommend magic link for simplicity)
2. **Real-time channel limit?** (Supabase has limits, verify for free tier)
3. **Edge function timeout?** (Max execution time for long syncs)
4. **Country selection UX:** Should it move to user preferences or stay in UI?

## Sources

**Confidence: MEDIUM**
- Supabase Auth patterns: Training data (January 2025), not verified with current docs
- Real-time subscriptions: Training data, confirmed by existing `@supabase/supabase-js` v2.47.0
- Edge Functions: Training data, standard Deno patterns
- React patterns: Training data + analysis of existing codebase

**Limitations:**
- No access to Context7 for official Supabase docs
- No WebSearch to verify 2026 best practices
- Recommendations based on training data from pre-January 2025

**Recommendation:** Verify all Supabase-specific patterns against official documentation before implementation.
