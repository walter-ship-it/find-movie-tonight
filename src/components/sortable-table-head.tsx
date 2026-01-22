import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import { SortKey, SortConfig } from '@/lib/sort-utils'

interface SortableTableHeadProps {
  children: React.ReactNode
  sortKey: SortKey
  currentSort: SortConfig
  onSortChange: (key: SortKey) => void
  className?: string
}

export function SortableTableHead({
  children,
  sortKey,
  currentSort,
  onSortChange,
  className
}: SortableTableHeadProps) {
  const isActive = currentSort.key === sortKey
  const direction = isActive ? currentSort.direction : null

  const handleClick = () => {
    onSortChange(sortKey)
  }

  return (
    <TableHead className={className}>
      <button
        onClick={handleClick}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        aria-label={`Sort by ${children}${isActive ? `, currently sorted ${direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}
      >
        {children}
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-30" />
        )}
      </button>
    </TableHead>
  )
}
