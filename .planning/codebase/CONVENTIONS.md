# Coding Conventions

**Analysis Date:** 2026-02-10

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension → `MovieCard.tsx`, `MovieFilters.tsx`
- Utilities/helpers: camelCase with `.ts` extension → `filter-utils.ts`, `sort-utils.ts`, `use-local-storage.ts`
- Hooks: `use-` prefix with kebab-case → `use-local-storage.ts`
- UI components: PascalCase in `components/ui/` → `button.tsx`, `card.tsx`, `table.tsx`

**Functions:**
- Exported functions: camelCase → `fetchMoviesByCountry()`, `applyFilters()`, `sortMovies()`, `getGenresFromMovies()`
- React components: PascalCase → `MovieCard`, `MovieFilters`, `MovieTable`, `CountrySelector`
- Private/internal functions: camelCase → `applyYearFilter()`, `applyRatingFilter()`, `updateFilter()`

**Variables:**
- Constants: UPPER_SNAKE_CASE for storage keys and config → `STORAGE_KEY`, `FILTERS_STORAGE_KEY`, `SORT_STORAGE_KEY`
- Component props/state: camelCase → `sortConfig`, `availableGenres`, `processedMovies`, `handleSortChange`
- React hooks state: camelCase → `country`, `search`, `movies`, `loading`, `filters`

**Types:**
- Interfaces: PascalCase, descriptive → `MovieFilters`, `Movie`, `StreamingProvider`, `MovieCardProps`, `MovieTableProps`, `SortConfig`
- Type aliases: PascalCase → `SortKey`, `SortDirection`
- Generic type parameters: Single letter or descriptive → `<T>`, `<K extends keyof Filters>`

## Code Style

**Formatting:**
- No explicit linter configured (eslint/prettier absent from package.json)
- TypeScript strict mode enabled in `tsconfig.json`: `"strict": true`
- Tab/space conventions inferred from code: uses 2-space indentation
- Line length: Generally kept under 100 characters, wrapped where needed

**Linting:**
- TypeScript strict compilation enabled
- Rules enforced via TypeScript:
  - `noUnusedLocals: true` - unused variables cause errors
  - `noUnusedParameters: true` - unused function parameters cause errors
  - `noFallthroughCasesInSwitch: true` - switch statements must have breaks
  - `resolveJsonModule: true` - allows JSON imports
  - `allowImportingTsExtensions: true` - allows importing .ts files

## Import Organization

**Order:**
1. External dependencies (React, third-party libraries)
2. Absolute imports from `@/` alias (app-level modules)
3. Relative imports (same-level or sibling modules) - rarely used

**Path Aliases:**
- `@/*` → `./src/*` - Use `@/` prefix for all internal imports
- Examples: `@/lib/supabase`, `@/components/ui/button`, `@/hooks/use-local-storage`

**Patterns:**
- Named exports preferred for utilities and components
- Default exports rare (only `App.tsx` uses default export)
- Destructuring imports common: `import { Movie, fetchMoviesByCountry } from '@/lib/supabase'`
- UI component exports typically include component + variants: `export { Button, buttonVariants }`

## Error Handling

**Patterns:**
- Try-catch blocks used for error-prone operations
  - File: `src/hooks/use-local-storage.ts` - localStorage read/write wrapped in try-catch with console.error fallback
  - File: `src/lib/supabase.ts` - Supabase client initialization validates env vars with throw
- Async/await with `.catch()` fallback
  - File: `src/App.tsx` line 59-61: `fetchMoviesByCountry(country).then(setMovies).finally(() => setLoading(false))`
- Missing data handled gracefully with defaults
  - File: `src/lib/filter-utils.ts` - filters check for null/undefined before processing
  - File: `src/lib/sort-utils.ts` - null values pushed to end of sort
- Console.error used for non-fatal errors
  - File: `src/lib/supabase.ts` line 58: logs error and returns empty array
  - File: `src/hooks/use-local-storage.ts` line 12: logs error and returns initialValue

## Logging

**Framework:** `console` object (no external logging library)

**Patterns:**
- `console.error()` for error conditions → Used in supabase.ts and use-local-storage.ts
- Errors include context: `console.error('Error fetching movies:', error)`
- No debug or info logging found in production code
- Error logging includes the operation context: `console.error(\`Error reading localStorage key "${key}":\`, error)`

## Comments

**When to Comment:**
- Inline comments used for non-obvious logic or workarounds
- Section headers for major code blocks (using `// [Name]` pattern)
- Purpose comments above complex functions

**Patterns Observed:**
- File: `src/App.tsx`
  - Line 31: `// Ref for cursor glow effect` - explains ref purpose
  - Line 34-35: `// Cursor glow effect (Active Theory inspired)` - explains effect
  - Line 51: `// Persist country selection` - explains useEffect purpose
  - Line 56: `// Fetch movies when country changes` - explains dependency
  - Line 64: `// Derived data for filters` - section header
  - Line 70: `// Process movies: search → filters → sort` - explains pipeline
  - Line 86: `// Sort change handler` - explains handler purpose
- File: `src/components/movie-filters.tsx`
  - Line 61: `// Filter Controls Grid` - section header
  - Line 220: `// Active Filter Chips` - section header
- File: `src/lib/filter-utils.ts`
  - Line 71: `// Check new streaming_providers field` - explains logic branch
  - Line 78: `// Backward compatibility: check on_netflix for Netflix` - explains legacy code
  - Line 120: `// Backward compatibility` - explains migration handling

**JSDoc/TSDoc:**
- Used minimally, only for exported interfaces and functions
- File: `src/lib/supabase.ts` - Interfaces have no JSDoc
- File: `src/hooks/use-local-storage.ts` - Hook has no JSDoc
- File: `src/components/movie-filters.tsx` - Components have no JSDoc; uses props interfaces instead

## Function Design

**Size:**
- Functions kept focused and single-responsibility
- Filter functions: 10-20 lines each
- Component functions: 50-200 lines (includes JSX rendering)
- Utility functions: 5-50 lines

**Parameters:**
- Component props passed as object destructuring
  - File: `src/components/movie-card.tsx` line 12: `{ movie, index = 0 }`
  - File: `src/components/movie-filters.tsx` line 20-27: Destructured from props object
- Filter and utility functions take data + config
  - File: `src/lib/filter-utils.ts` - Functions take `(movies: Movie[], config)` pattern
- Optional parameters use default values
  - File: `src/components/movie-card.tsx` line 9: `index?: number` with default `index = 0`

**Return Values:**
- Utilities return new data (immutable pattern)
  - File: `src/lib/filter-utils.ts` - Filter functions return new arrays, never mutate
  - File: `src/lib/sort-utils.ts` line 19: `[...movies].sort()` - creates copy before sorting
- React hooks return tuple `[value, setter]`
  - File: `src/hooks/use-local-storage.ts` line 27: `return [storedValue, setValue]`
- Async functions return Promises
  - File: `src/lib/supabase.ts` line 50: `async function fetchMoviesByCountry(country: string): Promise<Movie[]>`

## Module Design

**Exports:**
- Named exports for functions and components
  - `export function MovieCard({ movie, index = 0 }: MovieCardProps)`
  - `export const supabase = createClient(...)`
  - `export interface Movie { ... }`
- Default export only for main App component
  - `export default App` in src/App.tsx

**Barrel Files:**
- Not used in this codebase
- Each component/utility exports directly from its own file
- UI components imported individually: `import { Button } from '@/components/ui/button'`

## Type Safety

**Generics:**
- Used in custom hooks
  - File: `src/hooks/use-local-storage.ts` line 3: `useLocalStorage<T>(...): [T, (value: T | ((prev: T) => T)) => void]`
- Used in filter update function for type-safe object updates
  - File: `src/components/movie-filters.tsx` line 29: `const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K])`

**Union Types:**
- Used for limited string values
  - File: `src/lib/sort-utils.ts` line 3-4: `type SortKey = 'title' | 'year' | ...`
  - File: `src/lib/sort-utils.ts` line 4: `type SortDirection = 'asc' | 'desc'`

**Null Handling:**
- Nullish coalescing operator: `filters.yearRange[0] ?? yearRange[0]`
- Optional chaining: `movie.genres?.forEach()`
- Type guards: `filter((y): y is number => y !== null)`

## Component Patterns

**Functional Components:**
- All components are functional with hooks
- No class components in codebase

**Props Pattern:**
- Props interface defined above component
  - File: `src/components/movie-card.tsx` lines 7-10: `interface MovieCardProps { ... }`
- Destructured in component signature
  - `export function MovieCard({ movie, index = 0 }: MovieCardProps)`

**Event Handlers:**
- Named with `handle` prefix
  - File: `src/App.tsx` line 87: `const handleSortChange = (key: SortKey) => { ... }`
  - File: `src/App.tsx` line 39: `const handleMouseMove = (e: MouseEvent) => { ... }`

**State Management:**
- `useState` for component-level state
- `useLocalStorage` custom hook for persisted state
- `useMemo` for derived/computed values
- `useRef` for DOM element references
- Props drilling for passing data to child components

---

*Convention analysis: 2026-02-10*
