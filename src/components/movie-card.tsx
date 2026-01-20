import { ExternalLink } from 'lucide-react'
import { Movie } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MovieCardProps {
  movie: Movie
  index?: number
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  return (
    <div 
      className="group relative animate-reveal"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500 ease-expo-out" />
      
      {/* Card content */}
      <Card variant="movie" className="relative">
        <CardContent className="p-3">
          <div className="flex gap-3">
            {/* Poster */}
            <div className="flex-shrink-0 relative overflow-hidden rounded">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={`${movie.title} poster`}
                  className="w-[48px] h-[72px] object-cover transition-transform duration-500 ease-expo-out group-hover:scale-110"
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
              <h3 className="font-semibold text-sm truncate text-gradient-animated">
                {movie.title}
              </h3>
              
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {movie.year && <span className="font-mono">{movie.year}</span>}
                {movie.runtime && <span>• {movie.runtime} min</span>}
              </div>

              {/* IMDb Rating */}
              {movie.imdb_rating && (
                <div className="mt-2">
                  <Badge variant="rating">
                    ⭐ {movie.imdb_rating.toFixed(1)}
                  </Badge>
                </div>
              )}

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {movie.genres.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="neonCyan" className="text-xs">
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

              {/* Links */}
              <div className="flex gap-3 mt-3">
                {movie.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "text-neon-cyan hover:text-cyan-300 text-sm flex items-center gap-1",
                      "transition-all duration-300 hover:text-glow-cyan"
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
                      "transition-all duration-300 hover:text-glow-pink"
                    )}
                  >
                    Netflix
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
