import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import pLimit from 'p-limit'

// Load .env from project root
config({ path: resolve(process.cwd(), '.env') })

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const TMDB_API_KEY = process.env.TMDB_API_KEY
const OMDB_API_KEY = process.env.OMDB_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !TMDB_API_KEY || !OMDB_API_KEY) {
  console.error('Missing required environment variables:')
  if (!SUPABASE_URL) console.error('  - SUPABASE_URL')
  if (!SUPABASE_SERVICE_KEY) console.error('  - SUPABASE_SERVICE_KEY')
  if (!TMDB_API_KEY) console.error('  - TMDB_API_KEY')
  if (!OMDB_API_KEY) console.error('  - OMDB_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Rate limiters
const tmdbLimit = pLimit(50) // 50 concurrent requests
const omdbLimit = pLimit(10) // 10 concurrent requests

// Streaming provider configuration
const STREAMING_PROVIDERS: Record<number, string> = {
  8: 'Netflix',
  9: 'Amazon Prime Video',
  337: 'Disney+',
  384: 'HBO Max',
  350: 'Apple TV+',
  531: 'Paramount+',
}

const DEFAULT_PROVIDER_IDS = Object.keys(STREAMING_PROVIDERS).map(Number)

// TMDb types
interface TMDbMovie {
  id: number
  title: string
  release_date?: string
  poster_path?: string
  backdrop_path?: string
  overview?: string
  genre_ids?: number[]
}

interface TMDbMovieDetails {
  id: number
  title: string
  release_date?: string
  poster_path?: string
  backdrop_path?: string
  overview?: string
  runtime?: number
  genres?: { id: number; name: string }[]
  imdb_id?: string
}

interface TMDbWatchProvider {
  provider_id: number
  provider_name: string
}

interface TMDbWatchProviderResult {
  flatrate?: TMDbWatchProvider[]
  link?: string
}

// OMDb types
interface OMDbRating {
  Source: string
  Value: string
}

interface OMDbResponse {
  Response: string
  imdbRating?: string
  imdbVotes?: string
  imdbID?: string
  Ratings?: OMDbRating[]
}

// Streaming provider type for database
interface StreamingProvider {
  provider_id: number
  name: string
  url: string
}

// Parse CLI arguments
function parseArgs(): { country: string; providers: number[] } {
  const args = process.argv.slice(2)
  let country = ''
  let providers: number[] = DEFAULT_PROVIDER_IDS

  for (const arg of args) {
    if (arg.startsWith('--country=')) {
      country = arg.split('=')[1].toUpperCase()
    }
    if (arg.startsWith('--providers=')) {
      const providerStr = arg.split('=')[1]
      providers = providerStr.split(',').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p))
    }
  }

  if (!country) {
    console.error('Usage: npm run sync -- --country=SE [--providers=8,9,337]')
    console.error('Supported countries: SE, US, GB, DE, CA, FR, IT, ES, NL, ZA')
    console.error('Available streaming providers:')
    Object.entries(STREAMING_PROVIDERS).forEach(([id, name]) => {
      console.error(`  ${id}: ${name}`)
    })
    process.exit(1)
  }

  return { country, providers }
}

// Fetch movies from TMDb Discover API for specified streaming providers
async function fetchStreamingMovies(country: string, providers: number[]): Promise<TMDbMovie[]> {
  const movies: TMDbMovie[] = []
  let page = 1
  let totalPages = 1

  const providerNames = providers.map(id => STREAMING_PROVIDERS[id] || `Provider ${id}`).join(', ')
  console.log(`Fetching movies for ${country} from: ${providerNames}...`)

  while (page <= totalPages && page <= 25) { // TMDb limits to 500 results (20 per page * 25 pages)
    const url = new URL('https://api.themoviedb.org/3/discover/movie')
    url.searchParams.set('api_key', TMDB_API_KEY!)
    url.searchParams.set('watch_region', country)
    url.searchParams.set('with_watch_providers', providers.join('|')) // OR condition for multiple providers
    url.searchParams.set('sort_by', 'vote_average.desc')
    url.searchParams.set('vote_count.gte', '100') // Only movies with meaningful ratings
    url.searchParams.set('page', page.toString())

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      console.error(`  Failed to fetch page ${page}: ${response.status} ${response.statusText}`)
      break
    }
    
    const data = await response.json()

    if (data.results) {
      movies.push(...data.results)
    }

    totalPages = Math.min(data.total_pages || 1, 25)
    console.log(`  Page ${page}/${totalPages} - Found ${data.results?.length || 0} movies`)
    page++

    // Small delay to be respectful
    await sleep(50)
  }

  console.log(`Total: ${movies.length} movies found for ${country}`)
  return movies
}

// Fetch movie details from TMDb
async function fetchMovieDetails(movieId: number): Promise<TMDbMovieDetails | null> {
  return tmdbLimit(async () => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`Failed to fetch details for movie ${movieId}`)
      return null
    }

    return response.json()
  })
}

// Fetch watch providers and return all matching providers
async function fetchWatchProviders(
  movieId: number, 
  country: string, 
  targetProviders: number[]
): Promise<StreamingProvider[]> {
  return tmdbLimit(async () => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
    const response = await fetch(url)
    
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const countryData: TMDbWatchProviderResult = data.results?.[country]
    
    if (!countryData?.flatrate) {
      return []
    }

    // Find all matching providers
    const matchingProviders: StreamingProvider[] = []
    
    for (const provider of countryData.flatrate) {
      if (targetProviders.includes(provider.provider_id)) {
        matchingProviders.push({
          provider_id: provider.provider_id,
          name: STREAMING_PROVIDERS[provider.provider_id] || provider.provider_name,
          url: countryData.link || ''
        })
      }
    }

    return matchingProviders
  })
}

// Parse ratings from OMDb response
function parseOMDbRatings(ratings?: OMDbRating[]): { 
  rottenTomatoes: number | null
  metacritic: number | null 
} {
  let rottenTomatoes: number | null = null
  let metacritic: number | null = null

  if (!ratings) {
    return { rottenTomatoes, metacritic }
  }

  for (const rating of ratings) {
    if (rating.Source === 'Rotten Tomatoes') {
      // Format: "85%"
      const value = parseInt(rating.Value.replace('%', ''), 10)
      rottenTomatoes = isNaN(value) ? null : value
    }
    if (rating.Source === 'Metacritic') {
      // Format: "75/100"
      const value = parseInt(rating.Value.split('/')[0], 10)
      metacritic = isNaN(value) ? null : value
    }
  }

  return { rottenTomatoes, metacritic }
}

// Fetch IMDb rating and other ratings from OMDb
async function fetchOMDbData(imdbId: string): Promise<{ 
  rating: number | null
  votes: number | null
  rottenTomatoes: number | null
  metacritic: number | null
}> {
  return omdbLimit(async () => {
    // Add small delay for OMDb rate limiting (10 req/sec)
    await sleep(100)
    
    const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbId}`
    const response = await fetch(url)
    
    if (!response.ok) {
      return { rating: null, votes: null, rottenTomatoes: null, metacritic: null }
    }

    const data: OMDbResponse = await response.json()
    
    if (data.Response !== 'True') {
      return { rating: null, votes: null, rottenTomatoes: null, metacritic: null }
    }

    const rating = data.imdbRating && data.imdbRating !== 'N/A' 
      ? parseFloat(data.imdbRating) 
      : null
    
    const votes = data.imdbVotes && data.imdbVotes !== 'N/A'
      ? parseInt(data.imdbVotes.replace(/,/g, ''), 10)
      : null

    const { rottenTomatoes, metacritic } = parseOMDbRatings(data.Ratings)

    return { rating, votes, rottenTomatoes, metacritic }
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Main sync function
async function syncMovies(country: string, providers: number[]): Promise<void> {
  const providerNames = providers.map(id => STREAMING_PROVIDERS[id] || `Provider ${id}`).join(', ')
  console.log(`\n🎬 Starting sync for country: ${country}`)
  console.log(`📺 Streaming providers: ${providerNames}\n`)

  // Step 1: Fetch movies from TMDb
  const streamingMovies = await fetchStreamingMovies(country, providers)
  
  if (streamingMovies.length === 0) {
    console.log('No movies found. Exiting.')
    return
  }

  // Step 2: Process each movie
  let processed = 0
  let successful = 0
  let failed = 0

  for (const movie of streamingMovies) {
    processed++
    const progress = `[${processed}/${streamingMovies.length}]`

    try {
      // Fetch detailed movie info
      const details = await fetchMovieDetails(movie.id)
      
      if (!details) {
        console.log(`${progress} ⚠️  Skipping "${movie.title}" - Could not fetch details`)
        failed++
        continue
      }

      // Fetch streaming providers
      const streamingProviders = await fetchWatchProviders(movie.id, country, providers)

      // Fetch OMDb data (IMDb rating + RT + Metacritic)
      let imdbRating: number | null = null
      let imdbVotes: number | null = null
      let rottenTomatoes: number | null = null
      let metacritic: number | null = null

      if (details.imdb_id) {
        const omdbData = await fetchOMDbData(details.imdb_id)
        imdbRating = omdbData.rating
        imdbVotes = omdbData.votes
        rottenTomatoes = omdbData.rottenTomatoes
        metacritic = omdbData.metacritic
      }

      // Check if Netflix is in the providers (for backward compatibility)
      const netflixProvider = streamingProviders.find(p => p.provider_id === 8)

      // Prepare movie data for upsert
      const movieData = {
        tmdb_id: details.id,
        imdb_id: details.imdb_id || null,
        title: details.title,
        year: details.release_date ? parseInt(details.release_date.substring(0, 4), 10) : null,
        poster_url: details.poster_path 
          ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
          : null,
        backdrop_url: details.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
          : null,
        overview: details.overview || null,
        runtime: details.runtime || null,
        genres: details.genres?.map(g => g.name) || null,
        imdb_rating: imdbRating,
        imdb_votes: imdbVotes,
        rotten_tomatoes_score: rottenTomatoes,
        metacritic_score: metacritic,
        country: country,
        // Backward compatibility fields
        on_netflix: !!netflixProvider,
        netflix_url: netflixProvider?.url || null,
        // New streaming providers field
        streaming_providers: streamingProviders,
        last_updated: new Date().toISOString(),
      }

      // Upsert to Supabase
      const { error } = await supabase
        .from('movies')
        .upsert(movieData, { onConflict: 'tmdb_id,country' })

      if (error) {
        console.error(`${progress} ❌ Failed to save "${details.title}":`, error.message)
        failed++
      } else {
        const ratingStr = imdbRating ? `⭐ ${imdbRating}` : '(no rating)'
        const rtStr = rottenTomatoes ? `🍅 ${rottenTomatoes}%` : ''
        const mcStr = metacritic ? `Ⓜ️ ${metacritic}` : ''
        const providersStr = streamingProviders.map(p => p.name).join(', ') || 'No providers'
        console.log(`${progress} ✅ ${details.title} (${movieData.year}) ${ratingStr} ${rtStr} ${mcStr} [${providersStr}]`)
        successful++
      }
    } catch (err) {
      console.error(`${progress} ❌ Error processing "${movie.title}":`, err)
      failed++
    }
  }

  // Summary
  console.log(`\n📊 Sync Complete for ${country}`)
  console.log(`   ✅ Successful: ${successful}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📁 Total processed: ${processed}`)
}

// Run the sync
const { country, providers } = parseArgs()
syncMovies(country, providers)
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n💥 Fatal error:', err)
    process.exit(1)
  })
