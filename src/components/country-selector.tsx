import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { countries, getCountryByCode } from '@/lib/countries'

interface CountrySelectorProps {
  value: string
  onChange: (value: string) => void
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const selectedCountry = getCountryByCode(value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px] glass-card border-white/20 hover:border-primary/50 transition-all duration-300">
        <SelectValue>
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="font-mono text-primary">{selectedCountry.code}</span>
            </span>
          ) : (
            'Select'
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="glass-card border-white/20">
        {countries.map((country) => (
          <SelectItem 
            key={country.code} 
            value={country.code}
            className="focus:bg-primary/20 focus:text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{country.flag}</span>
              <span className="font-mono">{country.code}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
