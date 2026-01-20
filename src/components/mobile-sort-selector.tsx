import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SortConfig, SortKey, SortDirection } from '@/lib/sort-utils'

interface MobileSortSelectorProps {
  sortConfig: SortConfig
  onSortChange: (config: SortConfig) => void
}

interface SortOption {
  key: SortKey
  direction: SortDirection
  label: string
}

const sortOptions: SortOption[] = [
  { key: 'imdb_rating', direction: 'desc', label: 'IMDb Rating (High to Low)' },
  { key: 'imdb_rating', direction: 'asc', label: 'IMDb Rating (Low to High)' },
  { key: 'title', direction: 'asc', label: 'Title (A to Z)' },
  { key: 'title', direction: 'desc', label: 'Title (Z to A)' },
  { key: 'year', direction: 'desc', label: 'Year (Newest First)' },
  { key: 'year', direction: 'asc', label: 'Year (Oldest First)' },
  { key: 'runtime', direction: 'desc', label: 'Runtime (Longest First)' },
  { key: 'runtime', direction: 'asc', label: 'Runtime (Shortest First)' },
]

export function MobileSortSelector({ sortConfig, onSortChange }: MobileSortSelectorProps) {
  const currentValue = `${sortConfig.key}-${sortConfig.direction}`

  return (
    <div className="mb-4 glass-card rounded-lg p-4">
      <label className="text-sm font-medium mb-2 block text-cyan-300">Sort by</label>
      <Select
        value={currentValue}
        onValueChange={(value) => {
          const [key, direction] = value.split('-')
          onSortChange({ key: key as SortKey, direction: direction as SortDirection })
        }}
      >
        <SelectTrigger className="w-full bg-card/50 border-white/20 hover:border-primary/50 transition-all duration-300">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent className="glass-card border-white/20">
          {sortOptions.map(option => (
            <SelectItem
              key={`${option.key}-${option.direction}`}
              value={`${option.key}-${option.direction}`}
              className="focus:bg-primary/20 focus:text-primary transition-colors"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
