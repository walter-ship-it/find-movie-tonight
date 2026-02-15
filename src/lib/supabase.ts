import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface StreamingProvider {
  provider_id: number
  name: string
  url: string
}

export interface Movie {
  id: string
  tmdb_id: number
  imdb_id: string | null
  title: string
  year: number | null
  poster_url: string | null
  backdrop_url: string | null
  overview: string | null
  runtime: number | null
  genres: string[] | null
  imdb_rating: number | null
  imdb_votes: number | null
  rotten_tomatoes_score: number | null
  metacritic_score: number | null
  country: string
  on_netflix: boolean
  netflix_url: string | null
  streaming_providers: StreamingProvider[] | null
  last_updated: string
}

// Streaming provider metadata for UI
export const STREAMING_PROVIDER_INFO: Record<number, { name: string; color: string }> = {
  8: { name: 'Netflix', color: 'text-red-500' },
  9: { name: 'Prime Video', color: 'text-cyan-400' },
  337: { name: 'Disney+', color: 'text-blue-400' },
  384: { name: 'HBO Max', color: 'text-purple-400' },
  350: { name: 'Apple TV+', color: 'text-gray-300' },
  531: { name: 'Paramount+', color: 'text-blue-500' },
}

export async function fetchMoviesByCountry(country: string): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('country', country)
    .order('imdb_rating', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Error fetching movies:', error)
    return []
  }

  return data || []
}
