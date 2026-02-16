import { ExternalLink } from 'lucide-react'
import { Movie, STREAMING_PROVIDER_INFO } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useShortlist } from '@/contexts/shortlist-context'
import { useAuth } from '@/contexts/auth-context'

interface MovieCardProps {
  movie: Movie
  index?: number // For staggered animation
  onAuthRequired?: () => void
}

export function MovieCard({ movie, index = 0, onAuthRequired }: MovieCardProps) {
  const { isShortlisted, toggleShortlist } = useShortlist()
  const { user } = useAuth()

  const shortlisted = isShortlisted(movie.id)

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user && onAuthRequired) {
      onAuthRequired()
      return
    }
    if (user) {
      toggleShortlist(movie.id)
    }
  }

  return (
    <div
      className="group relative"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Glow effect on hover - Active Theory inspired */}
      <div
        className={cn(
          "absolute -inset-1 rounded-xl blur-lg opacity-0",
          "bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600",
          "transition-opacity duration-500 ease-expo-out",
          "group-hover:opacity-60"
        )}
      />

      {/* Card content */}
      <Card variant="movie" className="relative">
        <CardContent className="p-3">
          {/* Heart toggle - top right */}
          <button
            onClick={handleHeartClick}
            className={cn(
              "absolute top-2 right-2 z-10 p-1.5 rounded-full",
              "transition-all duration-300",
              "hover:scale-110",
              shortlisted
                ? "text-pink-500"
                : "text-muted-foreground hover:text-pink-400"
            )}
            aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={shortlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <div className="flex gap-3">
            {/* Poster */}
            <div className="flex-shrink-0 relative overflow-hidden rounded">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={`${movie.title} poster`}
                  width={48}
                  height={72}
                  className={cn(
                    "w-[48px] h-[72px] object-cover",
                    "transition-transform duration-500 ease-expo-out",
                    "group-hover:scale-110"
                  )}
                  loading="lazy"
                />
              ) : (
                <div className="w-[48px] h-[72px] bg-muted rounded flex items-center justify-center">
                  <span className="text-muted-foreground text-xs text-center">No image</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              {/* Title with gradient text */}
              <h3 className={cn(
                "font-semibold text-sm truncate",
                "text-gradient-animated"
              )}>
                {movie.title}
              </h3>

              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {movie.year && <span className="font-mono">{movie.year}</span>}
                {movie.runtime && <span>• {movie.runtime} min</span>}
              </div>

              {/* Ratings row */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* IMDb Rating */}
                {movie.imdb_rating && (
                  <Badge variant="rating" className="gap-1">
                    <span>⭐</span>
                    <span>{movie.imdb_rating.toFixed(1)}</span>
                  </Badge>
                )}

                {/* Rotten Tomatoes */}
                {movie.rotten_tomatoes_score !== null && (
                  <Badge variant="outline" className="gap-1 border-red-500/50 text-red-400">
                    <span>🍅</span>
                    <span>{movie.rotten_tomatoes_score}%</span>
                  </Badge>
                )}

                {/* Metacritic */}
                {movie.metacritic_score !== null && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1",
                      movie.metacritic_score >= 75 && "border-green-500/50 text-green-400",
                      movie.metacritic_score >= 50 && movie.metacritic_score < 75 && "border-yellow-500/50 text-yellow-400",
                      movie.metacritic_score < 50 && "border-red-500/50 text-red-400"
                    )}
                  >
                    <span className="font-bold text-xs">M</span>
                    <span>{movie.metacritic_score}</span>
                  </Badge>
                )}
              </div>

              {/* Genres with neon badges */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {movie.genres.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="genre" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Description */}
              {movie.overview && (
                <div className="mt-2 text-xs text-muted-foreground leading-tight line-clamp-3">
                  {movie.overview}
                </div>
              )}

              {/* Streaming provider links */}
              <div className="flex flex-wrap gap-2 mt-3">
                {movie.streaming_providers && movie.streaming_providers.length > 0 ? (
                  movie.streaming_providers.map((provider) => {
                    const providerInfo = STREAMING_PROVIDER_INFO[provider.provider_id]
                    return (
                      <a
                        key={provider.provider_id}
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "text-sm flex items-center gap-1",
                          "transition-all duration-300",
                          "hover:scale-105",
                          providerInfo?.color || 'text-muted-foreground'
                        )}
                      >
                        {providerInfo?.name || provider.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )
                  })
                ) : (
                  // Fallback to old netflix_url for backward compatibility
                  <>
                    {movie.imdb_id && (
                      <a
                        href={`https://www.imdb.com/title/${movie.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "text-neon-cyan hover:text-cyan-300 text-sm flex items-center gap-1",
                          "transition-all duration-300",
                          "hover:text-glow-cyan"
                        )}
                      >
                        IMDb
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {movie.netflix_url && (
                      <a
                        href={movie.netflix_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "text-neon-pink hover:text-pink-300 text-sm flex items-center gap-1",
                          "transition-all duration-300",
                          "hover:text-glow-pink"
                        )}
                      >
                        Netflix
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </>
                )}

                {/* Always show IMDb link */}
                {movie.imdb_id && movie.streaming_providers && movie.streaming_providers.length > 0 && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "text-neon-cyan hover:text-cyan-300 text-sm flex items-center gap-1",
                      "transition-all duration-300",
                      "hover:text-glow-cyan"
                    )}
                  >
                    IMDb
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
