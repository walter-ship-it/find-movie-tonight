import { Movie } from './supabase'

export interface MovieFilters {
  yearRange: [number | null, number | null]
  runtimeRange: [number | null, number | null]
  minRating: number | null
  genres: string[]
}

export const initialFilters: MovieFilters = {
  yearRange: [null, null],
  runtimeRange: [null, null],
  minRating: null,
  genres: []
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

export function applyFilters(movies: Movie[], filters: MovieFilters): Movie[] {
  let result = movies

  result = applyYearFilter(result, filters.yearRange)
  result = applyRuntimeFilter(result, filters.runtimeRange)
  result = applyRatingFilter(result, filters.minRating)
  result = applyGenreFilter(result, filters.genres)

  return result
}

export function getGenresFromMovies(movies: Movie[]): string[] {
  const genreSet = new Set<string>()

  movies.forEach(movie => {
    movie.genres?.forEach(genre => genreSet.add(genre))
  })

  return Array.from(genreSet).sort()
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
    filters.genres.length > 0
  )
}
