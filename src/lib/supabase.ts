import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  country: string
  on_netflix: boolean
  netflix_url: string | null
  last_updated: string
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
