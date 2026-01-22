import { ExternalLink } from 'lucide-react'
import { Movie } from '@/lib/supabase'
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
    <div className="glass-card rounded-lg overflow-hidden holo-card">
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
            <SortableTableHead sortKey="imdb_rating" currentSort={sortConfig} onSortChange={onSortChange} className="w-[100px]">
              IMDb
            </SortableTableHead>
            <TableHead className="w-[100px]">Links</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="animate-reveal-stagger">
          {movies.map((movie, index) => (
            <TableRow
              key={movie.id}
              className={cn(
                index % 2 === 0 ? "bg-card/30" : "bg-card/10",
                "transition-all duration-300 ease-expo-out",
                "hover:bg-primary/10 hover:shadow-[inset_0_0_30px_rgba(255,110,199,0.1)]"
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
                <span className="text-gradient glitch" data-text={movie.title}>{movie.title}</span>
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
              <TableCell className="p-2">
                <div className="flex gap-2">
                  {movie.imdb_id && (
                    <a
                      href={`https://www.imdb.com/title/${movie.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "text-neon-cyan hover:text-cyan-300 text-sm flex items-center gap-1",
                        "transition-all duration-300"
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
                        "transition-all duration-300"
                      )}
                    >
                      Netflix
                      <ExternalLink className="h-3 w-3" />
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
