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
    <div className="min-h-screen bg-background bg-y2k-mesh animate-mesh relative">
      {/* Noise overlay for texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
      
      <div className="max-w-[1200px] mx-auto px-4 py-6 md:px-6 relative">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-6 text-gradient-animated">
          Netflix IMDb Movies
        </h1>

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
            <p className="text-sm text-muted-foreground mb-4 font-mono">
              <span className="text-primary">{processedMovies.length}</span> movie{processedMovies.length !== 1 ? 's' : ''} found
              {hasActiveFilters(filters) && processedMovies.length < movies.length && (
                <span className="text-muted-foreground/70"> (filtered from {movies.length})</span>
              )}
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
              {processedMovies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} />
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
      <div className="text-center py-12 glass-card rounded-xl animate-fade-in">
        <div className="text-6xl mb-4 animate-float">🔍</div>
        <p className="text-muted-foreground text-lg">No movies match your search or filters.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
      </div>
    )
  }

  return (
    <div className="text-center py-12 glass-card rounded-xl animate-fade-in">
      <div className="text-6xl mb-4 animate-float">🎬</div>
      <p className="text-muted-foreground mb-4 text-lg">
        No movies found for this country.
      </p>
      <p className="text-sm text-muted-foreground">
        Run: <code className="bg-primary/20 text-primary px-2 py-1 rounded font-mono">npm run sync -- --country={country}</code>
      </p>
    </div>
  )
}

export default App
