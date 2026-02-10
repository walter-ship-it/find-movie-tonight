# Codebase Concerns

**Analysis Date:** 2026-02-10

## Tech Debt

**Dual API data structures - Movies with backward compatibility fields:**
- Issue: The Movie interface in `src/lib/supabase.ts` maintains backward compatibility with `on_netflix` and `netflix_url` fields alongside new `streaming_providers` array. This creates redundancy and confusion about which field to use.
- Files: `src/lib/supabase.ts`, `src/lib/filter-utils.ts`, `src/components/movie-table.tsx`, `src/components/movie-card.tsx`
- Impact: Code must check both fields in multiple places (`applyStreamingProviderFilter` in filter-utils has dual logic), increasing maintenance burden and risk of inconsistency. Eventually one branch will be used without updating the other.
- Fix approach: Plan a migration to remove `on_netflix` and `netflix_url` once all data has been migrated to use `streaming_providers`. Update sync script to only populate new fields, then clean deprecated fields from database schema.

**Hardcoded streaming provider mappings:**
- Issue: Streaming provider IDs and names are hardcoded in multiple places (`STREAMING_PROVIDER_INFO` in supabase.ts, `STREAMING_PROVIDERS` in sync script, provider colors in movie-filters.tsx).
- Files: `src/lib/supabase.ts` (lines 41-48), `scripts/sync-netflix-movies.ts` (lines 31-38), `src/components/movie-filters.tsx` (line 206)
- Impact: Adding a new streaming provider requires updates in 3+ places across frontend and backend. Colors and metadata are scattered, making UI updates error-prone.
- Fix approach: Create a shared provider configuration file in `src/lib/streaming-providers.ts` that is imported everywhere, or centralize in database with a lookup table.

## Known Bugs

**Incomplete IMDb link display on mobile movie cards:**
- Issue: In `src/components/movie-card.tsx`, the IMDb link shows up twice under certain conditions - once in the fallback (line 150-164) and again in the "always show" block (line 184-198). This creates duplicate IMDb buttons.
- Files: `src/components/movie-card.tsx` (lines 147-199)
- Trigger: When `streaming_providers` exists but is empty, or when both fallback and always-show conditions are true
- Workaround: The duplicate is functionally harmless but visually redundant. User sees two IMDb links instead of one.

**localStorage may not sync across tabs:**
- Issue: `useLocalStorage` hook in `src/hooks/use-local-storage.ts` reads/writes localStorage but doesn't listen to `storage` events. If user changes country in one tab, other tabs won't reflect the change.
- Files: `src/hooks/use-local-storage.ts`, `src/App.tsx` (lines 21-24, 52-54)
- Impact: Users opening app in multiple tabs get inconsistent country selections and filter states
- Workaround: None currently - tabs operate independently

## Security Considerations

**Public Supabase keys exposed in frontend:**
- Risk: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are embedded in browser code (visible in network requests and source). Anyone can read these and access the Supabase database directly.
- Files: `src/lib/supabase.ts` (lines 3-4), environment variables configured in `.env`
- Current mitigation: Supabase uses Row Level Security policies to restrict access, but keys are still visible to determined users
- Recommendations:
  - Ensure Supabase RLS policies are strict and only allow reads
  - Consider if a backend API layer is needed long-term (currently Supabase is accessed directly from frontend)
  - Monitor for unexpected database access patterns

**API keys in sync script environment variables:**
- Risk: `TMDB_API_KEY` and `OMDB_API_KEY` are loaded from `.env` in `scripts/sync-netflix-movies.ts`. If .env is accidentally committed (despite .gitignore), keys are exposed.
- Files: `scripts/sync-netflix-movies.ts` (lines 10-13), `.env` (not committed but easily accidentally committed)
- Current mitigation: `.env` is in `.gitignore` and users must set it locally
- Recommendations: Document .env setup clearly in README, use .env.example with placeholder values, consider secret management for CI/CD

**Missing error recovery - fetch failures silently fail:**
- Risk: In `src/lib/supabase.ts`, if `fetchMoviesByCountry` encounters an error, it logs and returns empty array. Frontend shows "No movies found" without indicating it's an error state.
- Files: `src/lib/supabase.ts` (lines 57-59), `src/App.tsx` (lines 159-160)
- Impact: Users can't distinguish between "no movies in country" and "API error" - they'll try the same action repeatedly
- Recommendations: Add an error state to App component, show "Failed to load movies - please try again" message, retry mechanism

## Performance Bottlenecks

**Unoptimized filtering on large datasets:**
- Problem: Filter operations in `src/lib/filter-utils.ts` iterate through entire movie array multiple times (once per filter type). With large countries like US with 500+ movies, this becomes noticeable.
- Files: `src/lib/filter-utils.ts` (lines 87-97)
- Cause: Sequential filtering instead of single-pass filtering. Each filter function creates new array.
- Improvement path: Combine all filter logic into single `applyAllFilters()` function that processes each movie once, checking all conditions in one loop. Would significantly improve responsiveness with large datasets.

**No pagination - renders all filtered results at once:**
- Problem: Desktop table and mobile cards render entire `processedMovies` list. With 500+ results (possible with no filters), this causes DOM size explosion.
- Files: `src/App.tsx` (lines 176-192), `src/components/movie-table.tsx` (lines 53-206)
- Impact: Page becomes slow with 500+ movies (> 1000 DOM nodes), scroll performance degrades
- Improvement path: Implement virtual scrolling (react-window) or pagination. Start with "Load More" button to keep UI simple.

**Heavy image operations without optimization:**
- Problem: All poster images use direct tmdb URLs (`https://image.tmdb.org/t/p/w500...`). No image optimization, no loading states beyond CSS skeletons.
- Files: `src/components/movie-table.tsx` (line 64), `src/components/movie-card.tsx` (line 38)
- Impact: Initial page load downloads all visible posters uncompressed. With glass morphism effects and animations, rendering is expensive.
- Improvement path: Use image optimization service (Vercel Image Optimization, Cloudinary) or serve WebP with fallbacks. Add progressive JPEG loading.

## Fragile Areas

**Filter utility functions don't handle malformed data gracefully:**
- Files: `src/lib/filter-utils.ts` (entire file)
- Why fragile: Filter functions assume genres and other arrays exist. If database returns malformed data (null genres instead of []), filters will fail.
  - Example: `applyGenreFilter` (line 62) accesses `movie.genres!.includes()` but doesn't validate genres structure
  - Example: `getRuntimeRange` (line 138) calls `.filter()` but assumes all runtimes are numbers
- Safe modification: Add type guards at entry points. Validate data shape in supabase.ts before passing to filters.
- Test coverage: No unit tests for filter-utils - behavior changes could break silently

**Movie-card and movie-table have duplicate conditional logic:**
- Files: `src/components/movie-card.tsx` (lines 125-199), `src/components/movie-table.tsx` (lines 147-203)
- Why fragile: Both check same conditions to display streaming providers (new vs old field). If logic changes, must update in 2 places. Already out of sync (movie-card has extra IMDb fallback).
- Safe modification: Extract streaming provider display logic to shared component `<StreamingProviderLink />`
- Test coverage: No tests to catch divergence

**App.tsx is 234 lines and handles too many concerns:**
- Files: `src/App.tsx`
- Why fragile: Component manages state for country, search, filters, sort, movies, loading all in one place. High cognitive load makes changes risky. Mouse tracking ref and cursor glow effect mixed with data logic.
- Biggest risks:
  - `processedMovies` useMemo (lines 71-84) - complex filter chain, easy to break
  - Multiple useEffect hooks for different concerns (lines 35-62)
  - Cursor glow effect (lines 31-49) - UI effect mixed with data component
- Safe modification: Extract into smaller components:
  - `<MovieDataProvider>` for country/movies/loading state
  - `<CursorGlowContainer>` for mouse tracking
  - `<MovieList>` for display logic
- Test coverage: No tests - cannot safely refactor

## Scaling Limits

**Single Supabase project for all countries:**
- Current capacity: Script fetches up to 500 movies per country (25 pages × 20 results). With 10 countries, that's 5000 rows total.
- Limit: Supabase free tier allows 500MB storage. At ~2KB per movie with images, that's room for ~250,000 movies. Currently at ~5,000, so 50× headroom.
  - However, query performance degrades with table size. Lack of indexes could cause slow filters.
  - No pagination means frontend downloads entire result set
- Scaling path:
  - Add database indexes on commonly-filtered columns (year, imdb_rating, country)
  - Implement backend API with proper pagination
  - Consider database migration if dataset grows beyond 50,000 movies

**No caching - Supabase queried on every country change:**
- Problem: `fetchMoviesByCountry` runs every time user changes country, even if recently loaded
- Files: `src/App.tsx` (lines 57-62), `src/lib/supabase.ts` (lines 50-63)
- Impact: Users switching back to previous country re-download data. With poor connection, noticeable delay.
- Scaling path: Add simple cache using `useRef` or Context API to store last 3 countries' data. Avoid re-fetching if within 5 minute window.

## Dependencies at Risk

**Supabase version pinning:**
- Risk: `@supabase/supabase-js` at ^2.47.0 may have breaking changes in v3
- Files: `package.json` (line 18)
- Impact: Automatic npm updates could break client initialization (line 10 in supabase.ts)
- Migration plan: Pin to specific version (2.47.0 not ^2.47.0), monitor Supabase v3 announcement and plan migration when needed

**outdated Radix UI components:**
- Risk: Multiple Radix UI dependencies at ^1.x versions (Checkbox, Popover, Select, Slider)
- Files: `package.json` (lines 13-17)
- Impact: Bug fixes in newer versions won't be applied
- Migration plan: Test upgrade to latest Radix UI v2 (if available), check for breaking changes in form components

**No TypeScript strict mode:**
- Risk: TypeScript config likely not strict, allowing implicit `any` types
- Files: `tsconfig.json` (not reviewed)
- Impact: Type safety gaps in complex areas like filter-utils and supabase types
- Improvement: Enable `strict: true`, fix type errors, add proper typing to external API responses

## Missing Critical Features

**No loading state during fetch:**
- Problem: When user switches countries, data fetches but UI doesn't indicate loading until 1+ second later
- Files: `src/App.tsx` (lines 57-62)
- Blocks: Users don't know if click worked, might click again
- Improvement: Set `loading = true` immediately on country change

**No error boundary:**
- Problem: Single error in a component crashes entire app
- Files: App-level only - no React.ErrorBoundary wrapper
- Blocks: Production bugs become unusable app instead of degraded feature
- Improvement: Add ErrorBoundary component at top level, fallback UI

**No offline support:**
- Problem: App requires online connection to fetch data. No cache strategy.
- Files: All data fetching
- Blocks: Users opening app while offline get blank screen
- Improvement: Cache API responses and serve from cache when offline, indicate "offline mode"

**No search debounce:**
- Problem: Search filter runs on every keystroke (onChange handler without debounce)
- Files: `src/App.tsx` (lines 25, 74)
- Blocks: Typing quickly in search causes multiple full re-renders
- Improvement: Add 300ms debounce to search input using useDeferredValue (React 18)

## Test Coverage Gaps

**No unit tests for utility functions:**
- What's not tested:
  - `filter-utils.ts` - All filter logic, genre extraction, provider extraction
  - `sort-utils.ts` - Sort direction logic, null handling
  - `countries.ts` - Country lookup
- Files: `src/lib/filter-utils.ts`, `src/lib/sort-utils.ts`, `src/lib/countries.ts`
- Risk: Changes to filter logic could break without detection. Found duplicate IMDb link bug through code review only.
- Priority: High - filtering is core feature

**No component tests:**
- What's not tested:
  - `MovieTable` - Displays all columns correctly, handles null data
  - `MovieCard` - Mobile display, streaming links work
  - `MovieFilters` - All filter UI interactions, Clear All button
  - `SearchBar` - Input works, onChange fires
- Files: All components in `src/components/`
- Risk: UI regressions go unnoticed until user reports
- Priority: High - complex UI logic

**No integration tests:**
- What's not tested:
  - Full flow: Load country → search → filter → sort
  - Data persistence: Change country, reload page, settings still there
  - Error cases: Network error, malformed data from API
- Risk: End-to-end flows could break from small changes
- Priority: Medium - basic functionality works but edge cases untested

**No sync script tests:**
- What's not tested:
  - `sync-netflix-movies.ts` - Rate limiting, API failures, database upsert, data parsing
  - Error handling when TMDB/OMDb APIs are down
  - Pagination logic (stops at 25 pages)
- Files: `scripts/sync-netflix-movies.ts`
- Risk: Sync script breaks silently, incomplete data in database, script hangs on errors
- Priority: Medium - affects data quality but doesn't affect live users immediately

---

*Concerns audit: 2026-02-10*
