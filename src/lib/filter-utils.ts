import { Movie } from './supabase'

export interface MovieFilters {
  yearRange: [number | null, number | null]
  runtimeRange: [number | null, number | null]
  minRating: number | null
  genres: string[]
  streamingProviders: number[] // Provider IDs
}

export const initialFilters: MovieFilters = {
  yearRange: [null, null],
  runtimeRange: [null, null],
  minRating: null,
  genres: [],
  streamingProviders: []
}

function applyYearFilter(movies: Movie[], range: [number | null, number | null]): Movie[] {
  const [min, max] = range

  if (min === null && max === null) return movies

  return movies.filter(movie => {
    if (!movie.year) return false

    const matchesMin = min === null || movie.year >= min
    const matchesMax = max === null || movie.year <= max

    return matchesMin && matchesMax
  })
}

function applyRuntimeFilter(movies: Movie[], range: [number | null, number | null]): Movie[] {
  const [min, max] = range

  if (min === null && max === null) return movies

  return movies.filter(movie => {
    if (!movie.runtime) return false

    const matchesMin = min === null || movie.runtime >= min
    const matchesMax = max === null || movie.runtime <= max

    return matchesMin && matchesMax
  })
}

function applyRatingFilter(movies: Movie[], minRating: number | null): Movie[] {
  if (minRating === null) return movies

  return movies.filter(movie => {
    if (!movie.imdb_rating) return false
    return movie.imdb_rating >= minRating
  })
}

function applyGenreFilter(movies: Movie[], selectedGenres: string[]): Movie[] {
  if (selectedGenres.length === 0) return movies

  return movies.filter(movie => {
    if (!movie.genres || movie.genres.length === 0) return false
    return selectedGenres.some(genre => movie.genres!.includes(genre))
  })
}

function applyStreamingProviderFilter(movies: Movie[], selectedProviders: number[]): Movie[] {
  if (selectedProviders.length === 0) return movies

  return movies.filter(movie => {
    // Check new streaming_providers field
    if (movie.streaming_providers && movie.streaming_providers.length > 0) {
      return movie.streaming_providers.some(provider => 
        selectedProviders.includes(provider.provider_id)
      )
    }
    
    // Backward compatibility: check on_netflix for Netflix (provider_id: 8)
    if (selectedProviders.includes(8) && movie.on_netflix) {
      return true
    }
    
    return false
  })
}

export function applyFilters(movies: Movie[], filters: MovieFilters): Movie[] {
  let result = movies

  result = applyYearFilter(result, filters.yearRange)
  result = applyRuntimeFilter(result, filters.runtimeRange)
  result = applyRatingFilter(result, filters.minRating)
  result = applyGenreFilter(result, filters.genres)
  result = applyStreamingProviderFilter(result, filters.streamingProviders)

  return result
}

export function getGenresFromMovies(movies: Movie[]): string[] {
  const genreSet = new Set<string>()

  movies.forEach(movie => {
    movie.genres?.forEach(genre => genreSet.add(genre))
  })

  return Array.from(genreSet).sort()
}

export function getStreamingProvidersFromMovies(movies: Movie[]): { id: number; name: string }[] {
  const providerMap = new Map<number, string>()

  movies.forEach(movie => {
    if (movie.streaming_providers) {
      movie.streaming_providers.forEach(provider => {
        if (!providerMap.has(provider.provider_id)) {
          providerMap.set(provider.provider_id, provider.name)
        }
      })
    }
    // Backward compatibility
    if (movie.on_netflix && !providerMap.has(8)) {
      providerMap.set(8, 'Netflix')
    }
  })

  return Array.from(providerMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getYearRange(movies: Movie[]): [number, number] {
  const years = movies.map(m => m.year).filter((y): y is number => y !== null)
  if (years.length === 0) return [1900, new Date().getFullYear()]
  return [Math.min(...years), Math.max(...years)]
}

export function getRuntimeRange(movies: Movie[]): [number, number] {
  const runtimes = movies.map(m => m.runtime).filter((r): r is number => r !== null)
  if (runtimes.length === 0) return [0, 300]
  return [Math.min(...runtimes), Math.max(...runtimes)]
}

export function hasActiveFilters(filters: MovieFilters): boolean {
  return (
    filters.yearRange[0] !== null ||
    filters.yearRange[1] !== null ||
    filters.runtimeRange[0] !== null ||
    filters.runtimeRange[1] !== null ||
    filters.minRating !== null ||
    filters.genres.length > 0 ||
    filters.streamingProviders.length > 0
  )
}
