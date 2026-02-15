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

interface MovieTableProps {
  movies: Movie[]
  sortConfig: SortConfig
  onSortChange: (key: SortKey) => void
}

export function MovieTable({ movies, sortConfig, onSortChange }: MovieTableProps) {
  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
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
          {movies.map((movie, index) => (
            <TableRow 
              key={movie.id}
              className={cn(
                index % 2 === 0 ? "bg-card/30" : "bg-card/10"
              )}
            >
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
                  {movie.overview || '—'}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground p-2 font-mono">
                {movie.year || '—'}
              </TableCell>
              <TableCell className="text-muted-foreground p-2">
                {movie.runtime ? `${movie.runtime} min` : '—'}
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
                  <span className="text-muted-foreground">—</span>
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
                  <span className="text-muted-foreground">—</span>
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
                  <span className="text-muted-foreground">—</span>
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
                    <span className="text-muted-foreground">—</span>
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
