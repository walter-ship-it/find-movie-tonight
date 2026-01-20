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
      <SelectTrigger className="w-[120px]">
        <SelectValue>
          {selectedCountry ? (
            <span>
              {selectedCountry.flag} {selectedCountry.code}
            </span>
          ) : (
            'Select'
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.flag} {country.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
