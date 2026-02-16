import { ExternalLink } from 'lucide-react'
import { Movie, STREAMING_PROVIDER_INFO } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SortableTableHead } from '@/components/sortable-table-head'
import { SortConfig, SortKey } from '@/lib/sort-utils'
import { cn } from '@/lib/utils'
import { useShortlist } from '@/contexts/shortlist-context'
import { useAuth } from '@/contexts/auth-context'

interface MovieTableProps {
  movies: Movie[]
  sortConfig: SortConfig
  onSortChange: (key: SortKey) => void
  onAuthRequired?: () => void
}

export function MovieTable({ movies, sortConfig, onSortChange, onAuthRequired }: MovieTableProps) {
  const { isShortlisted, toggleShortlist } = useShortlist()
  const { user } = useAuth()

  const handleHeartClick = (e: React.MouseEvent, movieId: string) => {
    e.stopPropagation()
    if (!user && onAuthRequired) {
      onAuthRequired()
      return
    }
    if (user) {
      toggleShortlist(movieId)
    }
  }

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground mx-auto"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </TableHead>
            <TableHead className="w-[48px]">Poster</TableHead>
            <SortableTableHead sortKey="title" currentSort={sortConfig} onSortChange={onSortChange}>
              Title
            </SortableTableHead>
            <TableHead>Description</TableHead>
            <SortableTableHead sortKey="year" currentSort={sortConfig} onSortChange={onSortChange} className="w-[60px]">
              Year
            </SortableTableHead>
            <SortableTableHead sortKey="runtime" currentSort={sortConfig} onSortChange={onSortChange} className="w-[80px]">
              Runtime
            </SortableTableHead>
            <TableHead>Genres</TableHead>
            <SortableTableHead sortKey="imdb_rating" currentSort={sortConfig} onSortChange={onSortChange} className="w-[70px]">
              IMDb
            </SortableTableHead>
            <SortableTableHead sortKey="rotten_tomatoes_score" currentSort={sortConfig} onSortChange={onSortChange} className="w-[60px]">
              RT
            </SortableTableHead>
            <SortableTableHead sortKey="metacritic_score" currentSort={sortConfig} onSortChange={onSortChange} className="w-[60px]">
              MC
            </SortableTableHead>
            <TableHead className="w-[140px]">Streaming</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="animate-reveal-stagger">
          {movies.map((movie, index) => {
            const shortlisted = isShortlisted(movie.id)
            return (
              <TableRow
                key={movie.id}
                className={cn(
                  index % 2 === 0 ? "bg-card/30" : "bg-card/10"
                )}
              >
                {/* Heart toggle */}
                <TableCell className="p-2 text-center">
                  <button
                    onClick={(e) => handleHeartClick(e, movie.id)}
                    className={cn(
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
                      width="16"
                      height="16"
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
                </TableCell>
                <TableCell className="p-2">
                  {movie.poster_url ? (
                    <div className="relative overflow-hidden rounded group/poster">
                      <img
                        src={movie.poster_url}
                        alt={`${movie.title} poster`}
                        width={48}
                        height={72}
                        className={cn(
                          "w-[48px] h-[72px] object-cover",
                          "transition-transform duration-500 ease-expo-out",
                          "group-hover/poster:scale-110"
                        )}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-[48px] h-[72px] bg-muted rounded flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">No image</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium p-2">
                  <span className="text-gradient">{movie.title}</span>
                </TableCell>
                <TableCell className="p-2">
                  <div className="text-xs text-muted-foreground leading-tight line-clamp-3">
                    {movie.overview || '\u2014'}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground p-2 font-mono">
                  {movie.year || '\u2014'}
                </TableCell>
                <TableCell className="text-muted-foreground p-2">
                  {movie.runtime ? `${movie.runtime} min` : '\u2014'}
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {movie.genres?.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="genre" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                {/* IMDb Rating */}
                <TableCell className="p-2">
                  {movie.imdb_rating ? (
                    <Badge variant="rating" className="gap-1">
                      <span>⭐</span>
                      <span>{movie.imdb_rating.toFixed(1)}</span>
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">{'\u2014'}</span>
                  )}
                </TableCell>
                {/* Rotten Tomatoes */}
                <TableCell className="p-2">
                  {movie.rotten_tomatoes_score !== null ? (
                    <Badge variant="outline" className="gap-1 border-red-500/50 text-red-400">
                      <span>🍅</span>
                      <span>{movie.rotten_tomatoes_score}%</span>
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">{'\u2014'}</span>
                  )}
                </TableCell>
                {/* Metacritic */}
                <TableCell className="p-2">
                  {movie.metacritic_score !== null ? (
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
                  ) : (
                    <span className="text-muted-foreground">{'\u2014'}</span>
                  )}
                </TableCell>
                {/* Streaming Providers */}
                <TableCell className="p-2">
                  <div className="flex flex-wrap gap-1">
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
                              "text-xs flex items-center gap-0.5",
                              "transition-all duration-300 hover:scale-105",
                              providerInfo?.color || 'text-muted-foreground'
                            )}
                            title={providerInfo?.name || provider.name}
                          >
                            {providerInfo?.name || provider.name}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )
                      })
                    ) : movie.netflix_url ? (
                      // Backward compatibility
                      <a
                        href={movie.netflix_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "text-neon-pink hover:text-pink-300 text-xs flex items-center gap-0.5",
                          "transition-all duration-300"
                        )}
                      >
                        Netflix
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">{'\u2014'}</span>
                    )}

                    {/* IMDb link */}
                    {movie.imdb_id && (
                      <a
                        href={`https://www.imdb.com/title/${movie.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "text-neon-cyan hover:text-cyan-300 text-xs flex items-center gap-0.5",
                          "transition-all duration-300"
                        )}
                      >
                        IMDb
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
