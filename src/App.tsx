import { useEffect, useState, useMemo } from 'react'
import { Movie, fetchMoviesByCountry } from '@/lib/supabase'
import { DEFAULT_COUNTRY } from '@/lib/countries'
import { CountrySelector } from '@/components/country-selector'
import { SearchBar } from '@/components/search-bar'
import { MovieTable } from '@/components/movie-table'
import { MovieCard } from '@/components/movie-card'
import { LoadingSkeletonTable, LoadingSkeletonCards } from '@/components/loading-skeleton'
import { MovieFilters } from '@/components/movie-filters'
import { MobileSortSelector } from '@/components/mobile-sort-selector'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { MovieFilters as Filters, initialFilters, applyFilters, getGenresFromMovies, getYearRange, getRuntimeRange, hasActiveFilters } from '@/lib/filter-utils'
import { SortConfig, SortKey, SortDirection, defaultSort, sortMovies } from '@/lib/sort-utils'

const STORAGE_KEY = 'netflix-imdb-country'
const FILTERS_STORAGE_KEY = 'netflix-imdb-filters'
const SORT_STORAGE_KEY = 'netflix-imdb-sort'

function App() {
  const [country, setCountry] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved || DEFAULT_COUNTRY
  })
  const [search, setSearch] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useLocalStorage<Filters>(FILTERS_STORAGE_KEY, initialFilters)
  const [sortConfig, setSortConfig] = useLocalStorage<SortConfig>(SORT_STORAGE_KEY, defaultSort)

  // Persist country selection
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, country)
  }, [country])

  // Fetch movies when country changes
  useEffect(() => {
    setLoading(true)
    fetchMoviesByCountry(country)
      .then(setMovies)
      .finally(() => setLoading(false))
  }, [country])

  // Derived data for filters
  const availableGenres = useMemo(() => getGenresFromMovies(movies), [movies])
  const yearRange = useMemo(() => getYearRange(movies), [movies])
  const runtimeRange = useMemo(() => getRuntimeRange(movies), [movies])

  // Process movies: search → filters → sort
  const processedMovies = useMemo(() => {
    // Step 1: Search filter
    let result = search.trim()
      ? movies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
      : movies

    // Step 2: Advanced filters
    result = applyFilters(result, filters)

    // Step 3: Sort
    result = sortMovies(result, sortConfig)

    return result
  }, [movies, search, filters, sortConfig])

  // Sort change handler
  const handleSortChange = (key: SortKey) => {
    setSortConfig((prev: SortConfig) => ({
      key,
      direction: (prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc') as SortDirection
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-6">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Netflix IMDb Movies</h1>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
          <SearchBar value={search} onChange={setSearch} />
          <CountrySelector value={country} onChange={setCountry} />
        </div>

        {/* Filters */}
        {!loading && movies.length > 0 && (
          <MovieFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableGenres={availableGenres}
            yearRange={yearRange}
            runtimeRange={runtimeRange}
          />
        )}

        {/* Content */}
        {loading ? (
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:block">
              <LoadingSkeletonTable />
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden">
              <LoadingSkeletonCards />
            </div>
          </>
        ) : processedMovies.length === 0 ? (
          <EmptyState country={country} hasSearch={!!search.trim()} hasFilters={hasActiveFilters(filters)} />
        ) : (
          <>
            {/* Movie count */}
            <p className="text-sm text-muted-foreground mb-4">
              {processedMovies.length} movie{processedMovies.length !== 1 ? 's' : ''} found
              {hasActiveFilters(filters) && processedMovies.length < movies.length && ` (filtered from ${movies.length})`}
            </p>

            {/* Desktop table */}
            <div className="hidden md:block">
              <MovieTable
                movies={processedMovies}
                sortConfig={sortConfig}
                onSortChange={handleSortChange}
              />
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              <MobileSortSelector
                sortConfig={sortConfig}
                onSortChange={setSortConfig}
              />
              {processedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  country: string
  hasSearch: boolean
  hasFilters: boolean
}

function EmptyState({ country, hasSearch, hasFilters }: EmptyStateProps) {
  if (hasSearch || hasFilters) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No movies match your search or filters.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">
        No movies found for this country.
      </p>
      <p className="text-sm text-muted-foreground">
        Run: <code className="bg-muted px-2 py-1 rounded">npm run sync -- --country={country}</code>
      </p>
    </div>
  )
}

export default App
