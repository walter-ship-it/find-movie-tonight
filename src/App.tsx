import { useEffect, useState, useMemo, useRef } from 'react'
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
import { MovieFilters as Filters, initialFilters, applyFilters, getGenresFromMovies, getStreamingProvidersFromMovies, getYearRange, getRuntimeRange, hasActiveFilters } from '@/lib/filter-utils'
import { SortConfig, SortKey, SortDirection, defaultSort, sortMovies } from '@/lib/sort-utils'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useShortlist } from '@/contexts/shortlist-context'
import { AuthCallback } from '@/components/auth/auth-callback'
import { UserMenu } from '@/components/auth/user-menu'
import { LoginForm } from '@/components/auth/login-form'
import { SignUpForm } from '@/components/auth/signup-form'
import { Button } from '@/components/ui/button'
import { InviteAcceptModal } from '@/components/auth/invite-accept-modal'

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
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null)
  const [view, setView] = useState<'browse' | 'shortlist'>('browse')

  const { user, loading: authLoading } = useAuth()
  const { shortlistedIds, loading: shortlistLoading } = useShortlist()

  // Ref for cursor glow effect
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-close auth modal when user signs in
  useEffect(() => {
    if (user && showAuth) {
      setShowAuth(null)
    }
  }, [user, showAuth])

  // Reset to browse view if user signs out
  useEffect(() => {
    if (!user) {
      setView('browse')
    }
  }, [user])

  // Cursor glow effect (Active Theory inspired)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      container.style.setProperty('--mouse-x', `${x}%`)
      container.style.setProperty('--mouse-y', `${y}%`)
    }

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [])

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
  const availableProviders = useMemo(() => getStreamingProvidersFromMovies(movies), [movies])
  const yearRange = useMemo(() => getYearRange(movies), [movies])
  const runtimeRange = useMemo(() => getRuntimeRange(movies), [movies])

  // Process movies: search -> filters -> sort
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

  // Shortlist movies: filter loaded movies by shortlisted IDs
  const shortlistMovies = useMemo(
    () => movies.filter((m) => shortlistedIds.has(m.id)),
    [movies, shortlistedIds]
  )

  // Sort change handler
  const handleSortChange = (key: SortKey) => {
    setSortConfig((prev: SortConfig) => ({
      key,
      direction: (prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc') as SortDirection
    }))
  }

  const handleAuthRequired = () => setShowAuth('login')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Magic link callback handler */}
      <AuthCallback />

      {/* Animated mesh gradient background */}
      <div
        className={cn(
          "fixed inset-0 bg-y2k-mesh animate-mesh opacity-50",
          "pointer-events-none"
        )}
      />

      {/* Noise texture overlay */}
      <div className="fixed inset-0 noise-overlay pointer-events-none" />

      {/* Auth modal overlay */}
      {showAuth && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAuth(null)
          }}
        >
          <div className="glass-card rounded-xl p-6 w-full max-w-sm mx-4 relative">
            <button
              onClick={() => setShowAuth(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {showAuth === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            {showAuth === 'login' ? (
              <LoginForm
                onToggle={() => setShowAuth('signup')}
                onSuccess={() => setShowAuth(null)}
              />
            ) : (
              <SignUpForm
                onToggle={() => setShowAuth('login')}
                onSuccess={() => setShowAuth(null)}
              />
            )}
          </div>
        </div>
      )}

      {/* Invite accept modal */}
      {user && <InviteAcceptModal />}

      {/* Main content */}
      <div
        ref={containerRef}
        className={cn(
          "relative max-w-[1200px] mx-auto px-4 py-6 md:px-6",
          "cursor-glow"
        )}
      >
        {/* Header with animated gradient */}
        <div className="flex items-center justify-between mb-6">
          <h1 className={cn(
            "text-3xl md:text-4xl font-bold",
            "font-display text-gradient-animated"
          )}>
            Find Paulina a Movie
          </h1>
          <div className="flex-shrink-0">
            {authLoading ? null : user ? (
              <UserMenu />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuth('login')}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>

        {/* View switcher - only for logged-in users */}
        {user && (
          <div className="glass-card rounded-xl p-1.5 mb-4 inline-flex gap-1">
            <button
              onClick={() => setView('browse')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                view === 'browse'
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Browse
            </button>
            <button
              onClick={() => setView('shortlist')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                view === 'shortlist'
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              My Shortlist
              {shortlistedIds.size > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-mono rounded-full bg-pink-500/20 text-pink-400">
                  {shortlistedIds.size}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Browse view */}
        {view === 'browse' && (
          <>
            {/* Controls - glass container */}
            <div className={cn(
              "flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between",
              "p-4 rounded-xl",
              "glass-card"
            )}>
              <SearchBar value={search} onChange={setSearch} />
              <CountrySelector value={country} onChange={setCountry} />
            </div>

            {/* Filters */}
            {!loading && movies.length > 0 && (
              <div className="glass-card p-4 rounded-xl mb-4">
                <MovieFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableGenres={availableGenres}
                  availableProviders={availableProviders}
                  yearRange={yearRange}
                  runtimeRange={runtimeRange}
                />
              </div>
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
                  <span className="font-mono text-primary">{processedMovies.length}</span>
                  {' '}movie{processedMovies.length !== 1 ? 's' : ''} found
                  {hasActiveFilters(filters) && processedMovies.length < movies.length && (
                    <span className="text-muted-foreground/70">
                      {' '}(filtered from <span className="font-mono">{movies.length}</span>)
                    </span>
                  )}
                </p>

                {/* Desktop table */}
                <div className="hidden md:block">
                  <MovieTable
                    movies={processedMovies}
                    sortConfig={sortConfig}
                    onSortChange={handleSortChange}
                    onAuthRequired={handleAuthRequired}
                  />
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-4">
                  <MobileSortSelector
                    sortConfig={sortConfig}
                    onSortChange={setSortConfig}
                  />
                  {processedMovies.map((movie, index) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      index={index}
                      onAuthRequired={handleAuthRequired}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Shortlist view */}
        {view === 'shortlist' && user && (
          <>
            {shortlistLoading ? (
              <>
                <div className="hidden md:block">
                  <LoadingSkeletonTable />
                </div>
                <div className="md:hidden">
                  <LoadingSkeletonCards />
                </div>
              </>
            ) : shortlistMovies.length === 0 ? (
              <div className={cn(
                "text-center py-12 rounded-xl",
                "glass-card"
              )}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-muted-foreground/50 mb-4"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <p className="text-muted-foreground text-lg">Your shortlist is empty.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Browse movies and tap the heart icon to add them.
                </p>
                <button
                  onClick={() => setView('browse')}
                  className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Browse movies
                </button>
              </div>
            ) : (
              <>
                {/* Shortlist movie count */}
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-mono text-primary">{shortlistMovies.length}</span>
                  {' '}movie{shortlistMovies.length !== 1 ? 's' : ''} in your shortlist
                </p>

                {/* Desktop table */}
                <div className="hidden md:block">
                  <MovieTable
                    movies={shortlistMovies}
                    sortConfig={sortConfig}
                    onSortChange={handleSortChange}
                    onAuthRequired={handleAuthRequired}
                  />
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-4">
                  <MobileSortSelector
                    sortConfig={sortConfig}
                    onSortChange={setSortConfig}
                  />
                  {shortlistMovies.map((movie, index) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      index={index}
                      onAuthRequired={handleAuthRequired}
                    />
                  ))}
                </div>
              </>
            )}
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
      <div className={cn(
        "text-center py-12 rounded-xl",
        "glass-card"
      )}>
        <p className="text-muted-foreground text-lg">No movies match your search or filters.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "text-center py-12 rounded-xl",
      "glass-card animate-float"
    )}>
      <p className="text-muted-foreground mb-4 text-lg">
        No movies found for this country.
      </p>
      <p className="text-sm text-muted-foreground">
        Run: <code className="bg-muted/50 px-2 py-1 rounded font-mono text-primary">npm run sync -- --country={country}</code>
      </p>
    </div>
  )
}

export default App
