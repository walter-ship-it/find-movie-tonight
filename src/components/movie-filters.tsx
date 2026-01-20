import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { MovieFilters as Filters, hasActiveFilters as checkActiveFilters } from '@/lib/filter-utils'
import { cn } from '@/lib/utils'

interface MovieFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  availableGenres: string[]
  yearRange: [number, number]
  runtimeRange: [number, number]
}

export function MovieFilters({
  filters,
  onFiltersChange,
  availableGenres,
  yearRange,
  runtimeRange
}: MovieFiltersProps) {

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilter = (key: keyof Filters) => {
    const defaults: Filters = {
      yearRange: [null, null],
      runtimeRange: [null, null],
      minRating: null,
      genres: []
    }
    onFiltersChange({ ...filters, [key]: defaults[key] })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      yearRange: [null, null],
      runtimeRange: [null, null],
      minRating: null,
      genres: []
    })
  }

  const hasActiveFilters = checkActiveFilters(filters)

  const hasYearFilter = filters.yearRange[0] !== null || filters.yearRange[1] !== null
  const hasRuntimeFilter = filters.runtimeRange[0] !== null || filters.runtimeRange[1] !== null

  return (
    <div className="space-y-4 mb-6">
      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Year Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cyan-300">Year Range</label>
          <Slider
            min={yearRange[0]}
            max={yearRange[1]}
            step={1}
            value={[
              filters.yearRange[0] ?? yearRange[0],
              filters.yearRange[1] ?? yearRange[1]
            ]}
            onValueChange={([min, max]) => {
              const newMin = min === yearRange[0] ? null : min
              const newMax = max === yearRange[1] ? null : max
              updateFilter('yearRange', [newMin, newMax])
            }}
          />
          <p className="text-xs text-muted-foreground font-mono">
            {filters.yearRange[0] ?? yearRange[0]} - {filters.yearRange[1] ?? yearRange[1]}
          </p>
        </div>

        {/* Runtime Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cyan-300">Runtime (min)</label>
          <Slider
            min={runtimeRange[0]}
            max={runtimeRange[1]}
            step={1}
            value={[
              filters.runtimeRange[0] ?? runtimeRange[0],
              filters.runtimeRange[1] ?? runtimeRange[1]
            ]}
            onValueChange={([min, max]) => {
              const newMin = min === runtimeRange[0] ? null : min
              const newMax = max === runtimeRange[1] ? null : max
              updateFilter('runtimeRange', [newMin, newMax])
            }}
          />
          <p className="text-xs text-muted-foreground font-mono">
            {filters.runtimeRange[0] ?? runtimeRange[0]} - {filters.runtimeRange[1] ?? runtimeRange[1]} min
          </p>
        </div>

        {/* Min Rating */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cyan-300">Min IMDb Rating</label>
          <Slider
            min={0}
            max={10}
            step={0.1}
            value={[filters.minRating ?? 0]}
            onValueChange={([value]) => {
              updateFilter('minRating', value > 0 ? value : null)
            }}
          />
          <p className="text-xs text-muted-foreground font-mono">
            {filters.minRating ? `≥ ${filters.minRating.toFixed(1)}` : 'All Ratings'}
          </p>
        </div>

        {/* Genre Multi-Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cyan-300">Genres</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="glass" className="w-full justify-start">
                {filters.genres.length > 0
                  ? `${filters.genres.length} selected`
                  : 'All Genres'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className={cn(
              "w-[200px] p-3",
              "bg-card/90 backdrop-blur-xl border-white/10",
              "shadow-glass-lg"
            )}>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableGenres.map(genre => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre}`}
                      checked={filters.genres.includes(genre)}
                      onCheckedChange={(checked) => {
                        const newGenres = checked
                          ? [...filters.genres, genre]
                          : filters.genres.filter(g => g !== genre)
                        updateFilter('genres', newGenres)
                      }}
                      className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor={`genre-${genre}`}
                      className="text-sm cursor-pointer flex-1 hover:text-primary transition-colors"
                    >
                      {genre}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active:</span>

          {/* Year chip */}
          {hasYearFilter && (
            <FilterChip onRemove={() => clearFilter('yearRange')}>
              {filters.yearRange[0] ?? yearRange[0]} - {filters.yearRange[1] ?? yearRange[1]}
            </FilterChip>
          )}

          {/* Runtime chip */}
          {hasRuntimeFilter && (
            <FilterChip onRemove={() => clearFilter('runtimeRange')}>
              {filters.runtimeRange[0] ?? runtimeRange[0]} - {filters.runtimeRange[1] ?? runtimeRange[1]} min
            </FilterChip>
          )}

          {/* Rating chip */}
          {filters.minRating !== null && (
            <FilterChip onRemove={() => clearFilter('minRating')}>
              Rating ≥ {filters.minRating.toFixed(1)}
            </FilterChip>
          )}

          {/* Genre chips */}
          {filters.genres.map(genre => (
            <FilterChip
              key={genre}
              onRemove={() => {
                const newGenres = filters.genres.filter(g => g !== genre)
                updateFilter('genres', newGenres)
              }}
            >
              {genre}
            </FilterChip>
          ))}

          {/* Clear All button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs text-muted-foreground hover:text-primary"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}

interface FilterChipProps {
  children: React.ReactNode
  onRemove: () => void
}

function FilterChip({ children, onRemove }: FilterChipProps) {
  return (
    <Badge 
      variant="neonPink" 
      className="gap-1 pl-2 pr-1 py-1"
    >
      <span className="text-xs">{children}</span>
      <button
        onClick={onRemove}
        className={cn(
          "rounded-full p-0.5 transition-all duration-300",
          "hover:bg-white/20 hover:scale-110"
        )}
        aria-label="Remove filter"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}
