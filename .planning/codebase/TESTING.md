# Testing Patterns

**Analysis Date:** 2026-02-10

## Test Framework

**Runner:**
- No test framework currently configured
- `package.json` has no testing dependencies (no jest, vitest, mocha, tape, etc.)
- No test files found in project (`src/**/*.test.*` or `src/**/*.spec.*`)

**Assertion Library:**
- Not applicable - no testing framework in use

**Build Commands:**
```bash
npm run dev              # Run dev server (Vite)
npm run build           # Build with TypeScript check + Vite
npm run preview         # Preview production build
npm run sync            # Run data sync script
```

## Test File Organization

**Current State:**
- No test files in the codebase
- No test directory structure established

**Recommended Pattern (for future implementation):**
- Co-located tests in same directory as source
- Naming: `[name].test.ts` or `[name].spec.ts`
- Example structure:
  ```
  src/
  ├── components/
  │   ├── movie-card.tsx
  │   ├── movie-card.test.tsx
  │   └── movie-filters.tsx
  │   └── movie-filters.test.tsx
  ├── lib/
  │   ├── filter-utils.ts
  │   ├── filter-utils.test.ts
  │   ├── sort-utils.ts
  │   └── sort-utils.test.ts
  ├── hooks/
  │   ├── use-local-storage.ts
  │   └── use-local-storage.test.ts
  ```

## Type Checking

**TypeScript Verification:**
- TypeScript compilation enforced in build step: `"build": "tsc && vite build"`
- Strict mode enabled: All strict type-checking options active
- Configuration file: `tsconfig.json`

**Type Coverage Areas:**
- All interfaces defined: `Movie`, `StreamingProvider`, `MovieFilters`, `SortConfig`
- All function signatures typed with return types
- React component props typed via prop interfaces
- Generic types for reusable hooks: `useLocalStorage<T>`

## Key Testable Areas (Not Yet Implemented)

**Filter Logic:**
- Location: `src/lib/filter-utils.ts`
- Functions to test:
  - `applyYearFilter()` - boundaries and null handling
  - `applyRuntimeFilter()` - boundaries and null handling
  - `applyRatingFilter()` - threshold validation
  - `applyGenreFilter()` - multiple genre selection
  - `applyStreamingProviderFilter()` - provider ID matching
  - `applyFilters()` - composition of all filters
  - `getGenresFromMovies()` - aggregation and deduplication
  - `getStreamingProvidersFromMovies()` - provider extraction
  - `getYearRange()` - min/max calculation with empty arrays
  - `getRuntimeRange()` - min/max calculation with empty arrays
  - `hasActiveFilters()` - detection of any active filter

**Sort Logic:**
- Location: `src/lib/sort-utils.ts`
- Functions to test:
  - `sortMovies()` - ascending/descending for each `SortKey`
  - Null value handling (should push to end)
  - String comparison (title) using localeCompare
  - Number comparison (year, runtime, ratings)
  - Immutability (original array not mutated)

**Custom Hook:**
- Location: `src/hooks/use-local-storage.ts`
- Functions to test:
  - Reading from localStorage on init
  - Writing to localStorage on set
  - JSON serialization/deserialization
  - Error handling for corrupted data
  - Functional update pattern: `setValue(prev => newValue)`

**Components (Integration Tests):**
- Location: `src/components/movie-card.tsx`, `src/components/movie-filters.tsx`, `src/components/movie-table.tsx`
- Test scenarios:
  - MovieCard renders movie data correctly
  - MovieCard renders rating badges conditionally
  - MovieCard renders streaming provider links
  - MovieFilters updates parent state on filter change
  - MovieFilters clears individual and all filters
  - MovieTable renders sorted columns
  - MovieTable renders movie rows with correct styling

**Async Data Fetching:**
- Location: `src/lib/supabase.ts`
- Function to test:
  - `fetchMoviesByCountry()` - success and error cases
  - Error fallback returns empty array
  - Environment variable validation on module load

## Mocking Strategy (For Future Implementation)

**Testing Framework Recommendation:**
- Vitest (modern, fast, TypeScript-first)
  ```bash
  npm install --save-dev vitest @testing-library/react @testing-library/user-event
  ```

**What to Mock:**
- External APIs:
  - `@supabase/supabase-js` - mock `createClient()` and returned client methods
  - Supabase `.select().eq().order()` chain
- Browser APIs:
  - `localStorage` - for hook testing
  - `MouseEvent` - for cursor glow effect testing
- External libraries:
  - `lucide-react` - Icon components (can use simple mocks)

**What NOT to Mock:**
- React itself or React hooks (test-library handles this)
- Utility functions like `cn()` from clsx/tailwind-merge (pure functions)
- TypeScript types and interfaces (they disappear at runtime)
- Components under test (test actual component behavior)

## Expected Test Patterns (For Future Implementation)

**Pure Function Testing (Filter Utils):**
```typescript
import { applyYearFilter, Movie } from '@/lib/filter-utils'

describe('applyYearFilter', () => {
  const mockMovies: Movie[] = [
    { year: 2020, ... },
    { year: 2022, ... },
    { year: null, ... }
  ]

  it('should filter by year range', () => {
    const result = applyYearFilter(mockMovies, [2021, 2023])
    expect(result).toHaveLength(1)
    expect(result[0].year).toBe(2022)
  })

  it('should exclude null values', () => {
    const result = applyYearFilter(mockMovies, [2020, 2025])
    expect(result.some(m => m.year === null)).toBe(false)
  })
})
```

**Hook Testing (useLocalStorage):**
```typescript
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/use-local-storage'

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('should persist to localStorage on update', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'))

    act(() => {
      result.current[1]('new value')
    })

    expect(localStorage.getItem('key')).toBe(JSON.stringify('new value'))
  })
})
```

**Component Testing (MovieCard):**
```typescript
import { render, screen } from '@testing-library/react'
import { MovieCard } from '@/components/movie-card'

describe('MovieCard', () => {
  it('should render movie title and year', () => {
    render(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByText('1999')).toBeInTheDocument()
  })

  it('should show IMDb rating badge', () => {
    render(<MovieCard movie={{ ...mockMovie, imdb_rating: 8.7 }} />)
    expect(screen.getByText('8.7')).toBeInTheDocument()
  })
})
```

## Coverage Gaps (Unimplemented)

**Critical Gaps:**
- Filter logic: 100% untested (multiple complex compositions)
- Sort logic: 100% untested (edge cases with null values)
- Custom hooks: 100% untested (state persistence)
- Components: 100% untested (visual regression, interaction)
- API integration: No tests for Supabase data fetching

**Test Coverage Recommendations:**
- Target minimum 80% code coverage for utility functions
- 60% for components (focus on critical paths)
- Unit tests: Filter and sort utilities (highest ROI)
- Integration tests: Movie data fetching + filtering pipeline
- E2E tests: User flows (select country → search → filter → sort)

---

*Testing analysis: 2026-02-10*
