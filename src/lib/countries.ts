export interface Country {
  code: string
  flag: string
  label: string
}

export const countries: Country[] = [
  { code: 'SE', flag: '🇸🇪', label: 'Sweden' },
  { code: 'US', flag: '🇺🇸', label: 'United States' },
  { code: 'GB', flag: '🇬🇧', label: 'United Kingdom' },
  { code: 'DE', flag: '🇩🇪', label: 'Germany' },
  { code: 'CA', flag: '🇨🇦', label: 'Canada' },
  { code: 'FR', flag: '🇫🇷', label: 'France' },
  { code: 'IT', flag: '🇮🇹', label: 'Italy' },
  { code: 'ES', flag: '🇪🇸', label: 'Spain' },
  { code: 'NL', flag: '🇳🇱', label: 'Netherlands' },
  { code: 'ZA', flag: '🇿🇦', label: 'South Africa' },
]

export const DEFAULT_COUNTRY = 'SE'

export function getCountryByCode(code: string): Country | undefined {
  return countries.find(c => c.code === code)
}
