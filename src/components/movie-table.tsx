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

interface MovieTableProps {
  movies: Movie[]
  sortConfig: SortConfig
  onSortChange: (key: SortKey) => void
}

export function MovieTable({ movies, sortConfig, onSortChange }: MovieTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[48px]">Poster</TableHead>
          <SortableTableHead sortKey="title" currentSort={sortConfig} onSortChange={onSortChange}>
            Title
          </SortableTableHead>
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
      <TableBody>
        {movies.map((movie) => (
          <TableRow key={movie.id}>
            <TableCell className="p-2">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={`${movie.title} poster`}
                  className="w-[48px] h-[72px] object-cover rounded"
                  loading="lazy"
                />
              ) : (
                <div className="w-[48px] h-[72px] bg-muted rounded flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">No image</span>
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium p-2">{movie.title}</TableCell>
            <TableCell className="text-muted-foreground p-2">{movie.year || '—'}</TableCell>
            <TableCell className="text-muted-foreground p-2">
              {movie.runtime ? `${movie.runtime} min` : '—'}
            </TableCell>
            <TableCell className="p-2">
              <div className="flex flex-wrap gap-1">
                {movie.genres?.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="p-2">
              {movie.imdb_rating ? (
                <span className="font-semibold text-yellow-600">
                  ⭐ {movie.imdb_rating.toFixed(1)}
                </span>
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
