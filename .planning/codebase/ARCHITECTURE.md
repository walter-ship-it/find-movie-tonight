# Architecture

**Analysis Date:** 2026-02-10

## Pattern Overview

**Overall:** Client-side SPA with data layer separation

**Key Characteristics:**
- Vite + React frontend with TypeScript
- Data fetching abstracted to Supabase client in `src/lib/supabase.ts`
- UI state and filters managed at App root level with custom hooks
- Component-driven UI with Radix UI primitives and custom styling
- Utility-first CSS with Tailwind and custom CSS variables
- Functional components with hooks pattern (useState, useEffect, useMemo)
- Path alias `@/*` pointing to `src/` for clean imports

## Layers

**Presentation (Components):**
- Purpose: Render UI and handle user interactions
- Location: `src/components/` and `src/components/ui/`
- Contains: React functional components (MovieTable, MovieCard, MovieFilters, CountrySelector, SearchBar, etc.)
- Depends on: UI primitives, utils, lib (supabase types, filter-utils, sort-utils)
- Used by: App component

**Application Logic (Hooks & Utilities):**
- Purpose: Encapsulate stateful logic and UI behavior
- Location: `src/hooks/` and `src/lib/`
- Contains: Custom hooks (useLocalStorage), utility functions (cn for class merging, sort/filter logic)
- Depends on: External libraries (clsx, tailwind-merge)
- Used by: Components and App

**Data Access:**
- Purpose: Fetch and serialize data from Supabase
- Location: `src/lib/supabase.ts`
- Contains: Supabase client initialization, Movie interface, fetchMoviesByCountry function, STREAMING_PROVIDER_INFO metadata
- Depends on: @supabase/supabase-js
- Used by: App component for initial data load

**Data Transformation:**
- Purpose: Process and filter movie data
- Location: `src/lib/filter-utils.ts`, `src/lib/sort-utils.ts`
- Contains: Pure functions for filtering (year, runtime, rating, genres, providers), sorting, and metadata extraction
- Depends on: Movie type from supabase.ts
- Used by: App component for derived data and processed movies

**Configuration:**
- Purpose: Define application constants
- Location: `src/lib/countries.ts`
- Contains: Country list, flags, default country, and lookup function
- Depends on: None (pure data)
- Used by: CountrySelector component, App component

**Styling:**
- Purpose: Theme and global styles
- Location: `src/index.css`, individual component Tailwind classes
- Contains: CSS custom properties for Y2K dark theme colors, glass effects, animations, Tailwind directives
- Depends on: tailwindcss, postcss, autoprefixer
- Used by: All components

## Data Flow

**Movie Discovery Pipeline:**

1. User loads app → App component mounts
2. App initializes state: country (from localStorage or default), filters (from localStorage or initial), sort (from localStorage or default)
3. User selects country or navigates
4. `fetchMoviesByCountry(country)` called → Supabase query → returns Movie[] ordered by IMDb rating DESC
5. Movies loaded, derived data computed via useMemo: available genres, providers, year/runtime ranges
6. Loading state cleared, UI renders MovieFilters component with available options
7. User enters search text OR adjusts filters
8. processedMovies computed via useMemo pipeline:
   - Filter by search query (case-insensitive title match)
   - Apply all filter constraints via applyFilters()
   - Sort via sortMovies() using sortConfig
9. Filtered/sorted movies rendered as:
   - Desktop: MovieTable (responsive columns with sort headers)
   - Mobile: MovieCard array (compact card layout)
10. Filter state persisted to localStorage
11. Sort state persisted to localStorage

**State Persistence:**

- Country selection: stored in localStorage key `netflix-imdb-country`
- Filters: stored in localStorage key `netflix-imdb-filters` via useLocalStorage hook
- Sort config: stored in localStorage key `netflix-imdb-sort` via useLocalStorage hook

## Key Abstractions

**Movie Type:**
- Purpose: Represent Netflix/IMDb movie data with ratings and metadata
- Examples: `src/lib/supabase.ts` (interface Movie), `src/components/movie-table.tsx`, `src/components/movie-card.tsx`
- Pattern: TypeScript interface with optional fields, uses null for missing data

**MovieFilters Type:**
- Purpose: Encapsulate all filterable dimensions (year, runtime, rating, genres, providers)
- Examples: `src/lib/filter-utils.ts` (interface + functions)
- Pattern: Tuple ranges for continuous values [min, max], arrays for discrete selections

**SortConfig Type:**
- Purpose: Track current sort key and direction
- Examples: `src/lib/sort-utils.ts`
- Pattern: Discriminated union of sort keys (title, year, runtime, imdb_rating, rotten_tomatoes_score, metacritic_score)

**Component Composition:**
- Purpose: Build UI from small, reusable pieces
- Examples: Button, Badge, Select, Checkbox, Slider, Popover, Card from `src/components/ui/`
- Pattern: Radix UI (unstyled, accessible) + Tailwind styling via className composition

**Custom Hooks Pattern:**
- Purpose: Reuse stateful logic
- Examples: `useLocalStorage<T>` in `src/hooks/use-local-storage.ts`
- Pattern: Functional hooks returning [state, setState] tuple matching useState API

## Entry Points

**Browser Entry Point:**
- Location: `src/main.tsx`
- Triggers: Vite dev server or production build
- Responsibilities: Mount React app to DOM element with id="root"

**Application Entry Point:**
- Location: `src/App.tsx`
- Triggers: Loaded by main.tsx via ReactDOM.createRoot
- Responsibilities:
  - Manage all application state (country, search, movies, filters, sort, loading)
  - Fetch movies based on country selection
  - Compute derived data (available genres, providers, ranges)
  - Process movies through search → filters → sort pipeline
  - Render responsive layout with conditional components
  - Handle sort header clicks
  - Apply cursor glow effect via mouse tracking

**Data Sync Script:**
- Location: `scripts/sync-netflix-movies.ts`
- Triggers: `npm run sync -- --country=SE` (manual CLI execution)
- Responsibilities:
  - Fetch Netflix catalog data from TMDB API
  - Enrich with IMDb ratings and Rotten Tomatoes/Metacritic scores from OMDb API
  - Query watch providers (Netflix, Prime, Disney+, etc.)
  - Insert/update movies table in Supabase
  - Handle rate limiting and concurrent requests

## Error Handling

**Strategy:** Graceful degradation with console warnings

**Patterns:**
- Data fetch errors logged to console, empty array returned (movies display empty state)
- Missing environment variables throw error and halt execution (sync script only)
- Missing optional fields in Movie type handled via null coalescing and optional chaining
- localStorage errors caught, initial value returned (useLocalStorage hook)
- Invalid filter ranges silently clamped (Slider component behavior)

## Cross-Cutting Concerns

**Logging:** Console methods (console.error for failures) in supabase.ts and useLocalStorage hook

**Validation:** Data shape validation via TypeScript interfaces; runtime validation minimal (relies on Supabase schema)

**Authentication:** None in app layer; Supabase anon key used (public read access to movies table)

**Accessibility:**
- Semantic HTML: table, form elements with labels
- ARIA labels on interactive elements: aria-labelledby for sliders, aria-label for icon buttons
- Keyboard navigation: native HTML elements support tab/arrow key interaction
- Color contrast: Neon theme tested for WCAG AA compliance in previous iterations
