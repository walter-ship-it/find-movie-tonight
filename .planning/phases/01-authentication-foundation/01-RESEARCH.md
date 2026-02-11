# Phase 1: Authentication Foundation - Research

**Researched:** 2026-02-11
**Domain:** Supabase Auth with React SPA (Vite, no SSR)
**Confidence:** HIGH

## Summary

This phase adds user authentication to an existing anonymous-browsing React + Vite + Supabase app. The app is a client-only SPA (no server-side rendering), deployed on Vercel, with Supabase already configured for data storage. The current `@supabase/supabase-js` (^2.47.0) already includes everything needed for auth -- no additional auth packages are required. The previously recommended `@supabase/auth-helpers-react` is officially deprecated and must not be used. The `@supabase/auth-ui-react` package is also unmaintained (last maintained Feb 2024) -- we will build custom auth forms instead, which is straightforward for a 2-user app.

The critical constraint is preserving anonymous browsing. Currently the app has no RLS enabled on the `movies` table and all access is anonymous via the Supabase anon key. Enabling RLS without first creating a permissive anonymous SELECT policy would immediately break the app. The migration order is: (1) add anon-friendly RLS policies to existing tables, (2) enable RLS, (3) add auth tables and auth-required policies, (4) build auth UI.

For the partner linking requirement (AUTH-04), a `profiles` table with a `partner_id` foreign key is the simplest approach. With only 2 users, a self-referencing relationship on the profiles table is sufficient -- no need for a generic "teams" or "connections" table. RLS policies can then use a subquery against the profiles table to check partnership.

**Primary recommendation:** Use `@supabase/supabase-js` directly (already installed) with a custom React AuthContext. Build simple auth forms (not a library). Add anon RLS policies BEFORE enabling RLS on existing tables.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.95.3 (latest) or ^2.47.0 (currently installed) | Auth + database client | Already installed. Includes all auth methods: signUp, signInWithPassword, signInWithOtp, signOut, onAuthStateChange, getClaims, verifyOtp. No additional auth package needed for client-only SPA. |
| React (existing) | ^18.3.1 | UI framework | Already installed. useContext + useState sufficient for auth state. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | The existing `@supabase/supabase-js` handles all auth operations. No additional packages required for Phase 1. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom auth forms | @supabase/auth-ui-react 0.4.7 | Unmaintained since Feb 2024. Not worth the dependency risk for 2 users. Custom forms are trivial. |
| Plain @supabase/supabase-js | @supabase/ssr | Only needed for SSR frameworks (Next.js, Remix). This is a client-only Vite SPA -- unnecessary complexity. |
| Plain @supabase/supabase-js | @supabase/auth-helpers-react | Officially deprecated. GitHub repo marked "now deprecated." Replaced by @supabase/ssr for SSR apps; for client-only SPAs, use supabase-js directly. |

### Do NOT Install
| Package | Why Not |
|---------|---------|
| @supabase/auth-helpers-react | Deprecated. GitHub: "now deprecated." |
| @supabase/auth-ui-react | Unmaintained since Feb 2024. Last version 0.4.7 published 2+ years ago. |
| @supabase/ssr | Only for server-rendered apps. This is a client-only SPA. |

**Installation:**
```bash
# No new packages needed for auth. @supabase/supabase-js is already installed.
# Optionally update to latest:
npm install @supabase/supabase-js@latest
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  contexts/
    auth-context.tsx       # AuthProvider + useAuth hook
  components/
    auth/
      login-form.tsx       # Email/password + magic link sign-in
      signup-form.tsx      # Email/password registration
      auth-callback.tsx    # Handles magic link redirect with token_hash
      partner-link.tsx     # Partner linking UI (simple invite flow)
    auth-guard.tsx         # Wrapper that redirects to login if not authenticated
  lib/
    supabase.ts            # Existing client (no changes needed for auth)
  hooks/
    use-local-storage.ts   # Existing hook (keep for anonymous users)
```

### Pattern 1: AuthContext with onAuthStateChange
**What:** Centralized auth state via React Context, driven by Supabase's onAuthStateChange listener.
**When to use:** Every component that needs to know if a user is signed in.
**Why this pattern:** The official Supabase React quickstart uses this exact approach -- no wrapper libraries needed.
```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react
// + https://supabase.com/docs/reference/javascript/auth-onauthstatechange

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### Pattern 2: Magic Link Callback Handler
**What:** Component that parses the token_hash from URL after user clicks magic link, then calls verifyOtp.
**When to use:** On the page where magic link redirects to (e.g., the app root or a dedicated /auth/callback route).
```typescript
// Source: https://supabase.com/docs/guides/auth/auth-email-passwordless
// + https://supabase.com/docs/reference/javascript/auth-verifyotp

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    const type = params.get('type')

    if (tokenHash && type) {
      supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'email' | 'recovery' | 'invite' | 'email_change',
      }).then(({ error }) => {
        if (error) setError(error.message)
        // Clear URL params after verification
        window.history.replaceState({}, '', window.location.pathname)
      })
    }
  }, [])

  if (error) return <div>Auth error: {error}</div>
  return null // Or a loading spinner
}
```

### Pattern 3: Conditional Auth (Preserve Anonymous Browsing)
**What:** App works for both anonymous and authenticated users. Auth is optional for browsing.
**When to use:** Core app layout -- authenticated features appear conditionally.
```typescript
// Source: Project requirement -- anonymous browsing must still work

function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSkeleton />

  return (
    <div>
      {/* Header shows login button OR user menu */}
      <Header user={user} />

      {/* Movie browsing always available (anon or authenticated) */}
      <MovieBrowser />

      {/* Shortlist features only for authenticated users (Phase 2) */}
      {user && <ShortlistButton />}
    </div>
  )
}
```

### Pattern 4: Profiles Table with Partner Link
**What:** A `profiles` table in the public schema with a self-referencing `partner_id` column.
**When to use:** For AUTH-04 (partner linking) and as the foundation for user-specific features in later phases.
```sql
-- Source: https://supabase.com/docs/guides/auth/managing-user-data

-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  partner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Anti-Patterns to Avoid
- **Do NOT use `@supabase/auth-helpers-react`:** Deprecated. Use `@supabase/supabase-js` directly with a custom React context.
- **Do NOT use `@supabase/auth-ui-react`:** Unmaintained since Feb 2024. Build simple forms instead.
- **Do NOT enable RLS before creating anon policies:** Enabling RLS with no policies blocks ALL access. Create permissive anon SELECT policies on `movies` first.
- **Do NOT call Supabase methods inside `onAuthStateChange` callback:** Risk of deadlocks. Use `setTimeout(..., 0)` to defer Supabase calls triggered by auth events.
- **Do NOT store the service role key in frontend code:** Only the anon key belongs in `VITE_SUPABASE_ANON_KEY`.
- **Do NOT use `getSession()` for security-sensitive checks:** Use `getClaims()` or `getUser()` instead. `getSession()` reads from localStorage without validating the JWT.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT token refresh | Manual token refresh logic | `@supabase/supabase-js` auto-refresh | supabase-js handles refresh token rotation automatically via onAuthStateChange. Token refresh fires TOKEN_REFRESHED event. |
| Session persistence | Custom localStorage session management | `@supabase/supabase-js` built-in persistence | Client stores session in localStorage by default. Survives browser refresh and tab close. |
| Password hashing | Custom bcrypt/argon2 implementation | Supabase Auth server-side hashing | Supabase handles password hashing server-side. Never hash passwords client-side. |
| Email delivery | Custom email sending for magic links | Supabase Auth built-in email service | Built-in email service works out of the box. Rate limited to 2/hour on free tier but sufficient for 2 users. |
| PKCE flow | Manual code challenge/verifier | `@supabase/supabase-js` built-in PKCE | The client library handles PKCE automatically for magic link flows. |

**Key insight:** Supabase Auth handles the entire auth lifecycle (signup, signin, session storage, token refresh, signout) through `@supabase/supabase-js`. The only custom code needed is: (1) a React context to expose auth state, (2) auth form components, (3) database tables/policies for user data.

## Common Pitfalls

### Pitfall 1: Enabling RLS Before Creating Anon Policies
**What goes wrong:** Enabling RLS on the `movies` table with no policies blocks ALL anonymous access. The app immediately breaks for all users.
**Why it happens:** RLS default-denies when enabled with no policies. The current app uses the anon key for all data access.
**How to avoid:** Always create permissive anon SELECT policies BEFORE enabling RLS. Migration order: (1) CREATE POLICY for anon SELECT on movies, (2) ALTER TABLE movies ENABLE ROW LEVEL SECURITY.
**Warning signs:** Movies page shows empty after deploying migration.
```sql
-- CORRECT ORDER:
-- Step 1: Create permissive anon policy
create policy "Anyone can view movies"
  on public.movies for select
  to anon, authenticated
  using (true);

-- Step 2: THEN enable RLS
alter table public.movies enable row level security;
```

### Pitfall 2: onAuthStateChange Callback Deadlocks
**What goes wrong:** Calling `supabase.auth.getUser()` or other Supabase methods inside the onAuthStateChange callback causes deadlocks.
**Why it happens:** The callback "runs synchronously during the processing of changes." Supabase auth operations inside it create circular waits.
**How to avoid:** Use `setTimeout(() => { ... }, 0)` to defer any Supabase calls triggered by auth events. Or better: only update React state in the callback, then use useEffect to react to state changes.
**Warning signs:** App freezes or hangs after login/logout.

### Pitfall 3: Magic Link Redirect URL Not Configured
**What goes wrong:** User clicks magic link in email, gets redirected to Supabase error page or wrong domain.
**Why it happens:** The redirect URL must be explicitly configured in Supabase Dashboard under Authentication > URL Configuration. Both Site URL and Additional Redirect URLs must be set.
**How to avoid:** Configure these URLs in the Supabase dashboard BEFORE implementing magic links:
  - **Site URL:** Your production URL (e.g., `https://your-app.vercel.app`)
  - **Additional Redirect URLs:** `http://localhost:5173/**` for local development
**Warning signs:** Magic link emails work but clicking them shows an error.

### Pitfall 4: Email Rate Limiting on Free Tier
**What goes wrong:** Magic link or confirmation emails stop sending after a few attempts.
**Why it happens:** The default Supabase email service has a rate limit of 2 emails per hour. During development/testing, you hit this quickly.
**How to avoid:** For development, disable email confirmation (Dashboard > Auth > Providers > Email > toggle off "Confirm email"). For production with 2 users, the free tier is sufficient, but configure a custom SMTP if needed.
**Warning signs:** `signUp()` or `signInWithOtp()` succeeds but no email arrives.

### Pitfall 5: Trigger Function Blocking Signups
**What goes wrong:** The `on_auth_user_created` trigger function fails, which blocks the entire signup process.
**Why it happens:** If the trigger function (e.g., `handle_new_user`) has a bug or references a table that doesn't exist, the INSERT into auth.users is rolled back.
**How to avoid:** Test the trigger function thoroughly. Use `security definer set search_path = ''` to avoid search_path issues. Keep the function minimal -- just INSERT the profile row.
**Warning signs:** `signUp()` returns an error, user doesn't appear in auth.users.

### Pitfall 6: SIGNED_IN Event Fires Frequently
**What goes wrong:** Code in the SIGNED_IN handler runs unexpectedly on tab focus, causing duplicate API calls or UI flicker.
**Why it happens:** SIGNED_IN fires not just on login, but also when the tab regains focus and the session is re-established.
**How to avoid:** Keep the onAuthStateChange callback lightweight. Only update state (user/session). Derive UI behavior from state, not from events.
**Warning signs:** Network requests spike when switching between browser tabs.

### Pitfall 7: Email Confirmation Blocking Development
**What goes wrong:** After `signUp()`, user can't sign in because email confirmation is required but confirmation email didn't arrive or was rate-limited.
**Why it happens:** Email confirmation is enabled by default on hosted Supabase. Combined with the 2-email/hour rate limit, development is painful.
**How to avoid:** During development, disable "Confirm email" in Dashboard > Auth > Providers > Email. Re-enable for production.
**Warning signs:** `signUp()` returns user with `email_confirmed_at: null`, `signInWithPassword()` fails.

## Code Examples

### Sign Up with Email and Password
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signup
const { data, error } = await supabase.auth.signUp({
  email: 'walter@example.com',
  password: 'secure-password',
  options: {
    data: {
      display_name: 'Walter',
    },
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

if (error) {
  console.error('Signup error:', error.message)
} else {
  // If email confirmation enabled: data.session is null, user must confirm email
  // If email confirmation disabled: data.session is populated, user is signed in
}
```

### Sign In with Password
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'walter@example.com',
  password: 'secure-password',
})

if (error) {
  // Error message intentionally vague for security:
  // "Invalid login credentials" for both wrong password and nonexistent user
  console.error('Login error:', error.message)
}
```

### Sign In with Magic Link
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signinwithotp
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'walter@example.com',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    shouldCreateUser: false, // Don't auto-create accounts via magic link
  },
})

if (error) {
  console.error('Magic link error:', error.message)
} else {
  // User sees "Check your email" message
}
```

### Handle Magic Link Callback (token_hash from URL)
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-verifyotp
// Called on the page where the magic link redirects to

const params = new URLSearchParams(window.location.search)
const tokenHash = params.get('token_hash')
const type = params.get('type')

if (tokenHash && type) {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as 'email',
  })
  // Clean up URL
  window.history.replaceState({}, '', window.location.pathname)
}
```

### Sign Out
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signout
const { error } = await supabase.auth.signOut()
// Clears localStorage, fires SIGNED_OUT event
// Access token JWT remains valid until natural expiration
// Refresh token is revoked server-side
```

### RLS Migration: Preserve Anonymous Access
```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security

-- CRITICAL: Add anon policy BEFORE enabling RLS
-- This preserves anonymous browsing for existing users

-- Policy: Anyone (anon or authenticated) can read movies
create policy "Anyone can view movies"
  on public.movies for select
  to anon, authenticated
  using (true);

-- NOW safe to enable RLS
alter table public.movies enable row level security;
```

### Profiles Table with Partner Linking
```sql
-- Source: https://supabase.com/docs/guides/auth/managing-user-data

-- Profiles table with partner relationship
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  partner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- Users can read their partner's profile
create policy "Users can view partner profile"
  on public.profiles for select
  to authenticated
  using (
    id = (
      select partner_id from public.profiles
      where id = (select auth.uid())
    )
  );

-- Users can update their own profile (but NOT partner_id directly -- use a function)
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Partner Linking Function (Secure)
```sql
-- Use a database function for partner linking to enforce bidirectional consistency
-- Both users must agree (or for 2 users, one initiates and the other accepts)

create or replace function public.link_partner(target_user_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  -- Prevent self-linking
  if current_user_id = target_user_id then
    raise exception 'Cannot link to yourself';
  end if;

  -- Verify target user exists
  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'User not found';
  end if;

  -- Set bidirectional partnership
  update public.profiles set partner_id = target_user_id, updated_at = now()
    where id = current_user_id;
  update public.profiles set partner_id = current_user_id, updated_at = now()
    where id = target_user_id;
end;
$$;

-- Unlink partner
create or replace function public.unlink_partner()
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_partner_id uuid;
begin
  select partner_id into current_partner_id from public.profiles where id = current_user_id;

  if current_partner_id is not null then
    update public.profiles set partner_id = null, updated_at = now()
      where id = current_user_id;
    update public.profiles set partner_id = null, updated_at = now()
      where id = current_partner_id;
  end if;
end;
$$;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers-react | Direct @supabase/supabase-js usage | 2024 (deprecated) | No wrapper libraries needed for client SPAs. Use createClient + onAuthStateChange directly. |
| @supabase/auth-ui-react | Custom auth forms | Feb 2024 (unmaintained) | Build your own forms. Trivial for 2-user app. |
| getSession() for auth checks | getClaims() for JWT validation | 2025 (asymmetric JWT keys) | getClaims() validates JWT locally via WebCrypto API without server round-trip. Preferred over getSession() for security. |
| SessionContextProvider wrapper | Custom AuthContext with onAuthStateChange | 2024 | No external session provider needed. Roll your own Context in ~30 lines. |
| Implicit auth flow | PKCE flow (default) | supabase-js v2 | PKCE is now default for email flows. Magic links use token_hash parameter instead of fragment-based tokens. |

**Deprecated/outdated:**
- `@supabase/auth-helpers-react`: Deprecated. GitHub repo literally titled "now deprecated."
- `@supabase/auth-ui-react`: Unmaintained since Feb 2024. "Repository is no longer maintained by the Supabase Team."
- `SessionContextProvider` from auth-helpers: Replaced by custom AuthContext pattern.
- `useSession` / `useUser` from auth-helpers: Replaced by custom `useAuth` hook wrapping onAuthStateChange.

## Open Questions

1. **Email confirmation: enabled or disabled for production?**
   - What we know: Email confirmation is enabled by default on hosted Supabase. For 2 known users, it adds friction but improves security.
   - What's unclear: Whether Walter and Paulina will create accounts together (in-person) or separately.
   - Recommendation: Disable during development. For production, keep disabled since there are only 2 known users who will create accounts intentionally. Can always re-enable later.

2. **Magic link email template customization**
   - What we know: Default email templates use `{{ .ConfirmationURL }}` which works for implicit flow. For PKCE flow (now default), templates should use `{{ .SiteURL }}?token_hash={{ .TokenHash }}&type=email`.
   - What's unclear: Whether the default Supabase email template already supports the PKCE flow or needs manual customization.
   - Recommendation: Test with default template first. If magic links don't work, update the template in Dashboard > Auth > Email Templates to use the token_hash format.

3. **Partner linking UX: How does user discover partner's ID?**
   - What we know: With only 2 users, this could be as simple as "link to the only other user." A database function handles the bidirectional update.
   - What's unclear: Whether to auto-link (detect 2nd signup and auto-pair), use a simple "link" button (show the other user), or use an invite code flow.
   - Recommendation: Show a simple "Link with partner" button that lists unlinked users (will only ever show 0 or 1 result). No invite codes needed for 2 users.

4. **getClaims() availability in current installed version**
   - What we know: `getClaims()` is the recommended way to validate JWT in the latest docs. The project has `@supabase/supabase-js ^2.47.0` installed.
   - What's unclear: Exactly which version introduced `getClaims()`. It may be very recent.
   - Recommendation: Update to `@supabase/supabase-js@latest` (2.95.3) to ensure access to `getClaims()`. If not available, fall back to `getSession()` which is acceptable for a client-only SPA where localStorage is the storage medium anyway.

## Sources

### Primary (HIGH confidence)
- [Supabase Auth React Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react) - Setup pattern for Vite SPA, no SSR
- [Supabase Auth Sessions](https://supabase.com/docs/guides/auth/sessions) - Session persistence, token refresh, SPA storage in localStorage
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS policies, auth.uid(), anon/authenticated roles, relationship-based access
- [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data) - Profiles table, trigger function, on_auth_user_created
- [Supabase Passwordless Email Auth](https://supabase.com/docs/guides/auth/auth-email-passwordless) - Magic link flow, signInWithOtp, token_hash, redirect URL config
- [Supabase Password-Based Auth](https://supabase.com/docs/guides/auth/passwords) - signUp, signInWithPassword, email confirmation flow
- [signUp API Reference](https://supabase.com/docs/reference/javascript/auth-signup) - Method signature, user metadata, email confirmation behavior
- [signInWithPassword API Reference](https://supabase.com/docs/reference/javascript/auth-signinwithpassword) - Method signature, error handling
- [signInWithOtp API Reference](https://supabase.com/docs/reference/javascript/auth-signinwithotp) - Magic link vs OTP, options, rate limiting
- [onAuthStateChange API Reference](https://supabase.com/docs/reference/javascript/auth-onauthstatechange) - Event types (INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY), cleanup, React useEffect pattern
- [getClaims API Reference](https://supabase.com/docs/reference/javascript/auth-getclaims) - Local JWT validation via WebCrypto
- [getSession API Reference](https://supabase.com/docs/reference/javascript/auth-getsession) - Session retrieval, auto-refresh, security warnings
- [signOut API Reference](https://supabase.com/docs/reference/javascript/auth-signout) - Scope options (global, local, others), localStorage cleanup
- [verifyOtp API Reference](https://supabase.com/docs/reference/javascript/auth-verifyotp) - token_hash verification, type values
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates) - Template variables, PKCE token_hash format, Go templating
- [supabase/auth-helpers GitHub](https://github.com/supabase/auth-helpers) - Confirmed "now deprecated" status

### Secondary (MEDIUM confidence)
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) - Latest version 2.95.3, published 4 days ago
- [@supabase/auth-ui-react npm](https://www.npmjs.com/package/@supabase/auth-ui-react) - Version 0.4.7, last published 2+ years ago, unmaintained since Feb 2024
- [Supabase General Auth Configuration](https://supabase.com/docs/guides/auth/general-configuration) - Email confirmation toggle location

### Tertiary (LOW confidence)
- None. All findings verified against official Supabase documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified against official Supabase React quickstart and npm registry. Only @supabase/supabase-js needed, already installed.
- Architecture: HIGH - Patterns from official Supabase docs (profiles table, RLS policies, onAuthStateChange). Auth context pattern matches official React quickstart.
- Pitfalls: HIGH - RLS ordering pitfall from official docs ("no data accessible until you create policies"). Deprecated package status confirmed on GitHub. onAuthStateChange gotchas from official API reference.
- Partner linking: MEDIUM - The profiles table with partner_id is a standard relational pattern, but the specific UX for 2-user linking is a design choice not covered by docs.

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (Supabase Auth is stable; core APIs unlikely to change in 30 days)
