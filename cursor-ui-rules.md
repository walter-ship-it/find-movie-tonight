# Cursor UI Rules — The Future of Movie Discovery

> A Y2K-futuristic movie discovery platform with neon aesthetics, glass morphism, and premium micro-interactions.

---

## Design Philosophy

This is not a generic CRUD app. We're building a **premium, immersive experience** for discovering movies. Every interaction should feel intentional, polished, and slightly otherworldly.

**Core Principles:**
- Dark-first with vibrant neon accents
- Glass morphism meets Y2K retrofuturism
- Motion is meaning (Active Theory-inspired micro-interactions)
- Performance is non-negotiable

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS 3.4 + CSS Variables |
| Components | shadcn/ui (extended with custom variants) |
| Build | Vite 6 |
| Backend | Supabase (Postgres + Real-time) |
| Icons | Lucide React |
| Utilities | class-variance-authority (cva), clsx, tailwind-merge |

---

## Color System

### Semantic Colors (CSS Variables)
```css
--background    /* Near-black (240 10% 4%) */
--foreground    /* Off-white (0 0% 95%) */
--primary       /* Neon Pink (330 100% 71%) */
--secondary     /* Electric Cyan (187 99% 50%) */
--accent        /* Vivid Purple (275 100% 70%) */
--muted         /* Dark gray for backgrounds */
--card          /* Elevated surface color */
```

### Neon Palette (Use sparingly for impact)
| Token | HSL | Use Case |
|-------|-----|----------|
| `neon-pink` | 330 100% 71% | Primary CTAs, ratings, highlights |
| `neon-cyan` | 187 99% 50% | Secondary actions, IMDb links |
| `neon-purple` | 275 100% 70% | Accents, genre badges |
| `neon-lime` | 112 100% 54% | Success states, availability |

### Usage Rules
- **DO:** Use semantic colors (`bg-background`, `text-foreground`, `border-border`)
- **DO:** Apply neon colors for interactive elements and emphasis
- **DON'T:** Use raw color values — always use design tokens
- **DON'T:** Overuse neon — it loses impact when everything glows

---

## Typography

### Font Families
```css
font-display: "Orbitron", sans-serif;  /* Headers, branding */
font-mono: "JetBrains Mono", monospace; /* Numbers, data, code */
font-sans: system-ui;                   /* Body text */
```

### Scale
| Element | Class | Notes |
|---------|-------|-------|
| Page Title | `text-3xl md:text-4xl font-bold font-display` | Use `text-gradient-animated` |
| Section Headers | `text-xl font-semibold` | |
| Labels | `text-sm font-medium text-cyan-300` | Neon accent on form labels |
| Body | `text-sm text-foreground` | |
| Muted | `text-sm text-muted-foreground` | Secondary info |
| Data/Numbers | `font-mono` | Years, ratings, counts |

---

## Component Library

### Extended shadcn/ui Components

All components support custom Y2K variants. **Always prefer variants over custom styling.**

#### Button Variants
```tsx
<Button variant="default" />     // Pink gradient
<Button variant="glass" />       // Frosted glass (use for filters, controls)
<Button variant="neonPink" />    // Animated gradient + glow
<Button variant="neonCyan" />    // Cyan variant
<Button variant="neonPurple" />  // Purple variant
<Button variant="glowOutline" /> // Outlined with glow
<Button variant="ghost" />       // Transparent hover
```

#### Badge Variants
```tsx
<Badge variant="rating" />    // Yellow glow — IMDb ratings only
<Badge variant="genre" />     // Subtle cyan — genre tags
<Badge variant="neonPink" />  // Pink glow — active filters
<Badge variant="neonCyan" />  // Cyan glow
<Badge variant="glass" />     // Frosted effect
```

#### Card Variants
```tsx
<Card variant="default" />      // Basic card
<Card variant="glass" />        // Frosted glass (use for containers)
<Card variant="movie" />        // Optimized for movie posters (hover scale + glow)
<Card variant="neon" />         // Glowing border
<Card variant="holographic" />  // Multi-color gradient
```

### Available Components
| Component | Location | Use Case |
|-----------|----------|----------|
| `Button` | `@/components/ui/button` | All interactive buttons |
| `Badge` | `@/components/ui/badge` | Ratings, genres, filter chips |
| `Card` | `@/components/ui/card` | Movie cards, content containers |
| `Input` | `@/components/ui/input` | Search bar |
| `Select` | `@/components/ui/select` | Country selector, sort dropdown |
| `Slider` | `@/components/ui/slider` | Range filters (year, runtime, rating) |
| `Checkbox` | `@/components/ui/checkbox` | Genre multi-select |
| `Popover` | `@/components/ui/popover` | Genre selector dropdown |
| `Table` | `@/components/ui/table` | Desktop movie list |
| `Skeleton` | `@/components/ui/skeleton` | Loading states |

### Forbidden Components
Do NOT create or use:
- Modals/Dialogs (keep everything inline)
- Tabs (single-page flow)
- Carousels/Sliders for content
- Toast notifications (handle errors inline)
- Accordions (filters are always visible)

---

## CSS Utilities

### Glass Effects
```tsx
className="glass-card"     // Standard frosted glass
className="glass-strong"   // Higher blur, more opacity
```

### Neon Borders
```tsx
className="neon-border"        // Pink glow border
className="neon-border-cyan"   // Cyan glow border
className="neon-border-purple" // Purple glow border
```

### Text Effects
```tsx
className="text-gradient"          // Static pink→purple→cyan gradient
className="text-gradient-animated" // Animated gradient (use for headers)
className="text-glow-pink"         // Pink text shadow
className="text-glow-cyan"         // Cyan text shadow
```

### Hover Effects
```tsx
className="hover-glow"  // Adds neon glow on hover
```

### Cursor Glow (Active Theory)
Apply to containers for cursor-following radial glow:
```tsx
className="cursor-glow"
```
Requires JS mouse position tracking (see `App.tsx` for implementation).

---

## Animation System

### Available Animations
```tsx
animate-gradient-x    // Horizontal gradient animation
animate-neon-pulse    // Pulsing neon glow
animate-shimmer       // Holographic shimmer effect
animate-float         // Gentle floating motion
animate-glow          // Text glow color shift
animate-mesh          // Background mesh movement
animate-reveal        // Slide-up reveal (staggered lists)
animate-fade-in       // Simple fade in
```

### Easing Functions
```css
ease-expo-out: cubic-bezier(0.16, 1, 0.3, 1);      /* Smooth deceleration */
ease-expo-in-out: cubic-bezier(0.87, 0, 0.13, 1);  /* Dramatic in-out */
```

### Animation Rules
- **DO:** Use `transition-all duration-300 ease-expo-out` for hover states
- **DO:** Use `duration-500` for more significant transitions
- **DO:** Stagger list animations with `style={{ animationDelay: index * 50ms }}`
- **DON'T:** Animate layout-causing properties (width, height) — use transform
- **DON'T:** Add animations without purpose

### Reduced Motion
All animations respect `prefers-reduced-motion`. This is handled in `index.css`.

---

## Layout Guidelines

### Container
```tsx
<div className="max-w-[1200px] mx-auto px-4 py-6 md:px-6">
```

### Glass Containers
Wrap major sections in glass cards:
```tsx
<div className="glass-card p-4 rounded-xl">
  {/* Content */}
</div>
```

### Responsive Breakpoints
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Default | < 768px | Mobile (cards, stacked layout) |
| `md:` | ≥ 768px | Desktop (table, horizontal layouts) |

### Mobile/Desktop Switching Pattern
```tsx
{/* Desktop table */}
<div className="hidden md:block">
  <MovieTable />
</div>

{/* Mobile cards */}
<div className="md:hidden space-y-4">
  {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
</div>
```

---

## Data Patterns

### Movie Interface
```typescript
interface Movie {
  id: string
  tmdb_id: number
  imdb_id: string | null
  title: string
  year: number | null
  poster_url: string | null
  backdrop_url: string | null
  overview: string | null
  runtime: number | null
  genres: string[] | null
  imdb_rating: number | null
  imdb_votes: number | null
  country: string
  on_netflix: boolean
  netflix_url: string | null
  last_updated: string
}
```

### Filter State
```typescript
interface MovieFilters {
  yearRange: [number | null, number | null]
  runtimeRange: [number | null, number | null]
  minRating: number | null
  genres: string[]
}
```

### Processing Pipeline
Movies flow through: **Fetch → Search → Filters → Sort → Render**

```typescript
const processedMovies = useMemo(() => {
  let result = movies
  result = searchFilter(result, search)
  result = applyFilters(result, filters)
  result = sortMovies(result, sortConfig)
  return result
}, [movies, search, filters, sortConfig])
```

---

## Country Selector

### Supported Countries
| Code | Flag | Label |
|------|------|-------|
| SE | 🇸🇪 | Sweden (default) |
| US | 🇺🇸 | United States |
| GB | 🇬🇧 | United Kingdom |
| DE | 🇩🇪 | Germany |
| CA | 🇨🇦 | Canada |
| FR | 🇫🇷 | France |
| IT | 🇮🇹 | Italy |
| ES | 🇪🇸 | Spain |
| NL | 🇳🇱 | Netherlands |
| ZA | 🇿🇦 | South Africa |

### Behavior
- Uses `@radix-ui/react-select` via shadcn/ui
- Persists to `localStorage` under key `netflix-imdb-country`
- Triggers full data refetch on change
- Located top-right of controls section

---

## Persistence

### LocalStorage Keys
| Key | Purpose |
|-----|---------|
| `netflix-imdb-country` | Selected country code |
| `netflix-imdb-filters` | Filter state object |
| `netflix-imdb-sort` | Sort configuration |

Use the `useLocalStorage` hook from `@/hooks/use-local-storage.ts`.

---

## Performance Rules

### Images
- **Always** use `loading="lazy"` on poster images
- Set explicit `width` and `height` attributes
- Provide fallback placeholder for missing posters

### Rendering
- Use `useMemo` for expensive computations (filtering, sorting)
- Avoid unnecessary re-renders — lift state appropriately
- Use `useRef` for DOM references that don't trigger re-renders

### Bundle
- Keep dependencies minimal
- Prefer Tailwind utilities over custom CSS
- Tree-shake unused shadcn/ui components

---

## Accessibility

### Required
- Semantic HTML (`<main>`, `<nav>`, `<article>`, `<button>`)
- Alt text on all images: `alt={${movie.title} poster}`
- Keyboard navigation support (handled by Radix UI)
- Focus indicators (ring styles in Tailwind config)
- `aria-labelledby` on form controls
- Sufficient color contrast (test against dark background)

### Touch Handling
All interactive elements have `touch-action: manipulation` applied globally.

### Reduced Motion
Animations are disabled when `prefers-reduced-motion: reduce` is set.

---

## Code Style

### Imports
```typescript
// React/hooks first
import { useEffect, useState, useMemo } from 'react'

// External libraries
import { ExternalLink } from 'lucide-react'

// Internal: lib utilities
import { cn } from '@/lib/utils'
import { Movie } from '@/lib/supabase'

// Internal: components
import { Button } from '@/components/ui/button'
import { MovieCard } from '@/components/movie-card'
```

### Component Structure
```tsx
interface ComponentProps {
  // Props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  // Derived state (useMemo)
  // Event handlers
  // Return JSX
}
```

### Styling Pattern
Always use `cn()` for conditional classes:
```tsx
<div className={cn(
  "base-classes",
  "more-classes",
  condition && "conditional-classes"
)}>
```

---

## Strict Rules (Non-Negotiable)

1. **Use design tokens** — No hardcoded colors, spacing, or typography
2. **Use component variants** — Don't override with custom classes
3. **Mobile-first** — Default styles for mobile, `md:` for desktop
4. **No horizontal scroll** — Ever
5. **Lazy load images** — Always
6. **Respect animations** — Use existing utilities, don't invent new ones
7. **Keep it dark** — This is a dark-first design system
8. **Preserve the vibe** — Futuristic, premium, intentional

---

## File Structure Reference

```
src/
├── components/
│   ├── ui/                 # shadcn/ui base components (extended)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── country-selector.tsx
│   ├── loading-skeleton.tsx
│   ├── mobile-sort-selector.tsx
│   ├── movie-card.tsx
│   ├── movie-filters.tsx
│   ├── movie-table.tsx
│   ├── search-bar.tsx
│   └── sortable-table-head.tsx
├── hooks/
│   └── use-local-storage.ts
├── lib/
│   ├── countries.ts        # Country definitions
│   ├── filter-utils.ts     # Filter logic
│   ├── sort-utils.ts       # Sort logic
│   ├── supabase.ts         # Database client + types
│   └── utils.ts            # cn() helper
├── App.tsx                 # Main app component
├── index.css               # Global styles + utilities
└── main.tsx                # Entry point
```
