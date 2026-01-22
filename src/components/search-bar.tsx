import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative group magnetic">
      {/* Glow effect behind input */}
      <div
        className={cn(
          "absolute -inset-1 rounded-lg blur-md opacity-0",
          "bg-gradient-to-r from-pink-600/50 via-purple-600/50 to-cyan-600/50",
          "transition-all duration-500 ease-expo-out",
          "group-focus-within:opacity-70 group-focus-within:blur-lg",
          "group-hover:opacity-30"
        )}
      />
      
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
          "text-muted-foreground transition-colors duration-300",
          "group-focus-within:text-primary"
        )} />
        <Input
          type="search"
          name="search"
          autoComplete="off"
          placeholder="Search movies…"
          aria-label="Search movies"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "pl-9 w-full md:w-[300px]",
            "bg-card/50 backdrop-blur-sm"
          )}
        />
      </div>
    </div>
  )
}
