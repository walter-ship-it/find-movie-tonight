import { ExternalLink } from 'lucide-react'
import { Movie } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Poster */}
          <div className="flex-shrink-0">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={`${movie.title} poster`}
                className="w-[48px] h-[72px] object-cover rounded"
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
            <h3 className="font-semibold text-sm truncate">{movie.title}</h3>
            
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {movie.year && <span>{movie.year}</span>}
              {movie.runtime && <span>• {movie.runtime} min</span>}
            </div>

            {/* IMDb Rating */}
            {movie.imdb_rating && (
              <div className="mt-2">
                <span className="font-semibold text-yellow-600">
                  ⭐ {movie.imdb_rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {movie.genres.slice(0, 2).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
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
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
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
                  className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
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
  )
}
