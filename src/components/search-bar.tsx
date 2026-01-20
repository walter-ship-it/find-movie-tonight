import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative group">
      {/* Subtle glow effect behind the search bar */}
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-600/20 to-cyan-600/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
        <Input
          type="text"
          placeholder="Search movies..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 w-full md:w-[300px] bg-card/50"
        />
      </div>
    </div>
  )
}
