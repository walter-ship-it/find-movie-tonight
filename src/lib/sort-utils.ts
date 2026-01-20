import { Movie } from './supabase'

export type SortKey = 'title' | 'year' | 'runtime' | 'imdb_rating'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  key: SortKey
  direction: SortDirection
}

export const defaultSort: SortConfig = {
  key: 'imdb_rating',
  direction: 'desc'
}

export function sortMovies(movies: Movie[], config: SortConfig): Movie[] {
  const { key, direction } = config

  const sorted = [...movies].sort((a, b) => {
    let aValue = a[key]
    let bValue = b[key]

    // Handle null values - always push to end
    if (aValue === null && bValue === null) return 0
    if (aValue === null) return 1
    if (bValue === null) return -1

    // String comparison (title)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    // Number comparison (year, runtime, imdb_rating)
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc'
        ? aValue - bValue
        : bValue - aValue
    }

    return 0
  })

  return sorted
}
