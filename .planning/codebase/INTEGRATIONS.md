# External Integrations

**Analysis Date:** 2026-02-10

## APIs & External Services

**Movie Database (TMDb):**
- TMDb Discover API - Fetches streaming movies by region and provider
  - SDK/Client: Custom fetch implementation in `scripts/sync-netflix-movies.ts`
  - Auth: `TMDB_API_KEY` environment variable
  - Endpoints:
    - `https://api.themoviedb.org/3/discover/movie` - Search movies by streaming provider
    - `https://api.themoviedb.org/3/movie/{movieId}` - Get movie details (title, runtime, genres, IMDb ID)
    - `https://api.themoviedb.org/3/movie/{movieId}/watch/providers` - Get streaming provider availability by country
  - Rate Limit: 50 concurrent requests (enforced via `p-limit` in sync script)

**IMDb Ratings (OMDb):**
- OMDb API - Fetches IMDb ratings, Rotten Tomatoes, and Metacritic scores
  - SDK/Client: Custom fetch implementation in `scripts/sync-netflix-movies.ts`
  - Auth: `OMDB_API_KEY` environment variable
  - Endpoints:
    - `https://www.omdbapi.com/?apikey={key}&i={imdbId}` - Get ratings and metadata
  - Rate Limit: 10 concurrent requests, 100ms delay between requests

**Google Fonts:**
- CDN: `fonts.googleapis.com` and `fonts.gstatic.com`
- Fonts: Orbitron (display), JetBrains Mono (data/monospace)
- Used in: `index.html` preconnect, `tailwind.config.ts` fontFamily config

## Data Storage

**Databases:**
- Supabase PostgreSQL (production database)
  - Connection: `VITE_SUPABASE_URL` (frontend), `SUPABASE_URL` (scripts)
  - Client: `@supabase/supabase-js` (createClient)
  - Table: `public.movies`
    - Columns: tmdb_id, imdb_id, title, year, poster_url, backdrop_url, overview, runtime, genres (JSONB), imdb_rating, imdb_votes, rotten_tomatoes_score, metacritic_score, country, on_netflix, netflix_url, streaming_providers (JSONB), last_updated
    - Indices: idx_movies_rating, idx_movies_country, idx_movies_title, idx_movies_country_rating, idx_movies_streaming_providers
    - Unique constraint: (tmdb_id, country)
    - Schema file: `supabase_schma`
    - Migration: `supabase/migrations/20260122000000_add_streaming_providers_and_ratings.sql`

**File Storage:**
- TMDb Image CDN - Poster and backdrop images
  - URLs: `https://image.tmdb.org/t/p/w500/{poster_path}` and `/w1280/{backdrop_path}`
  - Served through: `poster_url` and `backdrop_url` columns in database

**Caching:**
- Browser localStorage - Client-side persistent storage
  - Keys: `netflix-imdb-country`, `netflix-imdb-filters`, `netflix-imdb-sort`
  - Used in: `src/App.tsx` for user preferences

## Authentication & Identity

**Auth Provider:**
- Supabase anonymous key - Public, read-only access to database
  - Implementation: `VITE_SUPABASE_ANON_KEY` in frontend via `src/lib/supabase.ts`
- Supabase service key - Admin access for sync operations
  - Implementation: `SUPABASE_SERVICE_KEY` in scripts for data mutations

**Frontend Queries:**
- Anonymous queries via `createClient(url, anonKey)` in `src/lib/supabase.ts`
- fetchMoviesByCountry() function calls `.from('movies').select()` with country filter

**Admin/Script Access:**
- Service key via `createClient(url, serviceKey)` in `scripts/sync-netflix-movies.ts`
- Used for upsert operations during sync

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, Rollbar, or error tracking service

**Logs:**
- Console-based logging in:
  - `src/lib/supabase.ts` - Database errors logged to console
  - `scripts/sync-netflix-movies.ts` - Sync progress and errors logged to stdout with emoji indicators

## CI/CD & Deployment

**Hosting:**
- Static site hosting (Vercel inferred from `.vercel` in `.gitignore`)

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or other CI service configured

## Environment Configuration

**Required env vars (Frontend):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key for read-only access

**Required env vars (Scripts):**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key (admin access)
- `TMDB_API_KEY` - The Movie Database API key
- `OMDB_API_KEY` - OMDb API key for ratings

**Secrets location:**
- `.env` file (root directory) - Contains all secrets, in `.gitignore`

## Webhooks & Callbacks

**Incoming:**
- Not detected

**Outgoing:**
- Not detected - Sync is manual via `npm run sync` script, not triggered by webhooks

## Data Flow

**Movie Display Pipeline:**
1. User loads app
2. Frontend reads country from localStorage or DEFAULT_COUNTRY
3. `fetchMoviesByCountry(country)` queries Supabase movies table via anonymous key
4. Results displayed with filters, search, and sorting applied client-side
5. User preferences (country, filters, sort) persisted to localStorage

**Data Population Pipeline (Manual Sync):**
1. `npm run sync -- --country=SE [--providers=8,9,337]` runs script
2. Script loads env vars from `.env` via dotenv
3. TMDb API discovers movies available on specified providers in country
4. For each movie, fetch details and streaming provider info (50 concurrent reqs)
5. For IMDb IDs found, fetch ratings from OMDb (10 concurrent reqs, 100ms delay)
6. Upsert all data to Supabase movies table using service key
7. Log progress and summary to console

## Country Support

**Supported countries in sync script:**
- SE (Sweden), US (United States), GB (United Kingdom), DE (Germany), CA (Canada), FR (France), IT (Italy), ES (Spain), NL (Netherlands), ZA (South Africa)

---

*Integration audit: 2026-02-10*
