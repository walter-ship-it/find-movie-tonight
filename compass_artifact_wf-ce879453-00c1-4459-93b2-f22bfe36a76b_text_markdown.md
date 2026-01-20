# Gen Z Y2K/Retro Futurism Design Specification for Movie Database UI

**Transform your React/TypeScript movie database** from minimal to maximalist with this comprehensive design system. The Y2K aesthetic revival combines nostalgic early-2000s digital optimism with modern usability, creating interfaces that feel both familiar and futuristic.

The core principle: **neon accents against dark surfaces, glassmorphism, chrome effects, and bold gradients** create the signature Y2K look. This specification provides exact values, code snippets, and component patterns ready for implementation with Tailwind CSS and shadcn/ui.

---

## Visual DNA of Y2K design

What separates authentic Y2K from generic retro is specificity. The era (1998-2003) was defined by translucent iMac G3 plastics, Windows XP's candy-colored UI, and MTV's maximalist graphics. Key visual markers include **holographic/iridescent surfaces, chrome metallic effects, neon glows, and blobby organic shapes**.

### Essential visual elements

| Element | Implementation | CSS Example |
|---------|---------------|-------------|
| **Gradients** | Multi-stop linear/radial, 115-180° angles | `linear-gradient(135deg, #FF6EC7, #7DF9FF)` |
| **Neon glow** | Layered box-shadows, 3-4 blur layers | `0 0 10px #ff6ec7, 0 0 20px #ff6ec7, 0 0 40px #ff6ec7` |
| **Chrome/metallic** | Gradient from light to dark gray with shine | `linear-gradient(135deg, #c0c0c0, #fff, #c0c0c0, #808080)` |
| **Glassmorphism** | Backdrop blur + transparency + border | `backdrop-blur-md bg-white/10 border-white/20` |
| **Holographic** | OKLCH gradients with animation | Conic gradient with color shifts |

### Typography that captures the era

**Recommended font pairings for movie database:**

- **Display/Headers**: Orbitron (Google Fonts), Space Grotesk, or Outfit with bold weights
- **Body text**: Inter or Geist Sans for readability
- **Data/Numbers**: JetBrains Mono or Geist Mono for ratings, dates, runtime
- **Accent text**: VT323 for retro digital displays (sparingly)

**Text styling techniques:**
```css
/* Gradient text */
.gradient-text {
  background: linear-gradient(90deg, #FF6EC7, #7DF9FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Neon glow text */
.neon-text {
  text-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff;
}
```

---

## Complete color palette with exact values

### Primary Y2K colors

```css
/* Core palette - use these as your primary/secondary/accent */
--neon-pink: #FF6EC7;      /* HSL: 330 100% 71%  | OKLCH: 0.75 0.22 350 */
--electric-cyan: #01CDFE;  /* HSL: 187 99% 50%   | OKLCH: 0.80 0.15 195 */
--vivid-purple: #B967FF;   /* HSL: 275 100% 70%  | OKLCH: 0.65 0.25 300 */
--hot-magenta: #FF00C1;    /* HSL: 314 100% 50%  | OKLCH: 0.65 0.30 340 */
--lime-green: #39FF14;     /* HSL: 112 100% 54%  | OKLCH: 0.85 0.30 140 */
--chrome-silver: #C0C8D8;  /* HSL: 220 20% 80%   | OKLCH: 0.82 0.02 260 */
```

### Dark mode backgrounds (never pure black)

```css
/* Recommended dark backgrounds with subtle color tints */
--bg-base: #0A0A0F;        /* Near-black with blue undertone */
--bg-card: #121218;        /* Elevated surface */
--bg-elevated: #1A1A24;    /* Cards, modals */
--bg-purple-tint: #0C0C14; /* Cyberpunk dark violet */
--bg-muted: #252532;       /* Subtle containers */
```

### Gradient combinations

**Synthwave sunset (vertical, for hero sections):**
```css
background: linear-gradient(180deg, #FFD319 0%, #FF901F 25%, #FF2975 50%, #F222FF 75%, #8C1EFF 100%);
```

**Vaporwave classic (diagonal, for cards/buttons):**
```css
background: linear-gradient(135deg, #FF71CE, #01CDFE, #05FFA1);
```

**Holographic shimmer (animated):**
```css
background: linear-gradient(
  115deg,
  transparent 20%,
  oklch(0.7 0.15 200) 45%,
  oklch(0.75 0.18 320) 55%,
  transparent 80%
);
background-size: 200% 200%;
animation: shimmer 6s ease-in-out infinite;
```

---

## Tailwind CSS configuration

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic colors using CSS variables
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        
        // Y2K-specific colors with alpha support
        "neon-pink": "hsl(var(--neon-pink) / <alpha-value>)",
        "neon-cyan": "hsl(var(--neon-cyan) / <alpha-value>)",
        "neon-purple": "hsl(var(--neon-purple) / <alpha-value>)",
        "neon-lime": "hsl(var(--neon-lime) / <alpha-value>)",
      },
      
      boxShadow: {
        "neon-pink": "0 0 5px #FF6EC7, 0 0 20px #FF6EC7, 0 0 40px #FF6EC750",
        "neon-cyan": "0 0 5px #01CDFE, 0 0 20px #01CDFE, 0 0 40px #01CDFE50",
        "neon-purple": "0 0 5px #B967FF, 0 0 20px #B967FF, 0 0 40px #B967FF50",
        "glow-sm": "0 0 10px rgba(255, 110, 199, 0.3)",
        "glow-md": "0 0 20px rgba(255, 110, 199, 0.4)",
        "glow-lg": "0 0 40px rgba(255, 110, 199, 0.5)",
        "inner-glow": "inset 0 0 20px rgba(255, 110, 199, 0.2)",
      },
      
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "y2k-mesh": `radial-gradient(at 40% 40%, hsla(330, 100%, 71%, 0.3) 0px, transparent 50%),
                     radial-gradient(at 60% 60%, hsla(187, 99%, 50%, 0.3) 0px, transparent 50%),
                     radial-gradient(at 50% 50%, hsla(275, 100%, 70%, 0.2) 0px, transparent 50%)`,
      },
      
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        "gradient-y": "gradient-y 15s ease infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "shimmer": "shimmer 6s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "gradient-y": {
          "0%, 100%": { backgroundPosition: "50% 0%" },
          "50%": { backgroundPosition: "50% 100%" },
        },
        "neon-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px var(--primary), 0 0 10px var(--primary)" },
          "50%": { boxShadow: "0 0 20px var(--primary), 0 0 40px var(--primary)" },
        },
        "shimmer": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow": {
          "from": { textShadow: "0 0 5px #FF6EC7, 0 0 10px #FF6EC7" },
          "to": { textShadow: "0 0 10px #01CDFE, 0 0 20px #01CDFE" },
        },
      },
      
      backgroundSize: {
        "300%": "300%",
        "400%": "400%",
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## globals.css for shadcn/ui theming

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Y2K Dark Theme (Primary) */
    --background: 240 10% 4%;
    --foreground: 0 0% 95%;
    
    --card: 240 10% 7%;
    --card-foreground: 0 0% 95%;
    
    --popover: 240 10% 6%;
    --popover-foreground: 0 0% 95%;
    
    /* Neon Pink as Primary */
    --primary: 330 100% 71%;
    --primary-foreground: 240 10% 4%;
    
    /* Electric Cyan as Secondary */
    --secondary: 187 99% 50%;
    --secondary-foreground: 240 10% 4%;
    
    --muted: 240 10% 15%;
    --muted-foreground: 240 5% 65%;
    
    /* Vivid Purple as Accent */
    --accent: 275 100% 70%;
    --accent-foreground: 0 0% 100%;
    
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    
    --border: 240 10% 20%;
    --input: 240 10% 15%;
    --ring: 330 100% 71%;
    
    --radius: 0.75rem;
    
    /* Custom Y2K Variables */
    --neon-pink: 330 100% 71%;
    --neon-cyan: 187 99% 50%;
    --neon-purple: 275 100% 70%;
    --neon-lime: 112 100% 54%;
    
    /* Glass effect variables */
    --glass-bg: hsla(240, 10%, 10%, 0.8);
    --glass-border: hsla(0, 0%, 100%, 0.1);
    
    /* Chart colors for ratings/analytics */
    --chart-1: 330 100% 71%;
    --chart-2: 187 99% 50%;
    --chart-3: 275 100% 70%;
    --chart-4: 112 100% 54%;
    --chart-5: 45 100% 60%;
  }
  
  /* Light mode (optional, but keep for accessibility) */
  .light {
    --background: 0 0% 100%;
    --foreground: 240 10% 10%;
    --card: 0 0% 98%;
    --card-foreground: 240 10% 10%;
    --primary: 330 100% 50%;
    --primary-foreground: 0 0% 100%;
    --secondary: 187 80% 40%;
    --secondary-foreground: 0 0% 100%;
    --muted: 240 5% 92%;
    --muted-foreground: 240 5% 40%;
    --accent: 275 80% 55%;
    --accent-foreground: 0 0% 100%;
    --border: 240 5% 85%;
    --input: 240 5% 90%;
    --ring: 330 100% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* Scrollbar styling for Y2K aesthetic */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: hsl(var(--muted));
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, hsl(var(--primary)), hsl(var(--secondary)));
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent)));
  }
}

@layer utilities {
  /* Gradient text utility */
  .text-gradient {
    @apply bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent;
  }
  
  /* Animated gradient text */
  .text-gradient-animated {
    @apply bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent bg-300% animate-gradient-x;
  }
  
  /* Glass card effect */
  .glass-card {
    @apply bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl;
  }
  
  /* Neon border glow */
  .neon-border {
    @apply border-2 border-primary shadow-neon-pink;
  }
  
  /* Chrome/metallic surface */
  .chrome-surface {
    background: linear-gradient(135deg, #e8e8e8 0%, #ffffff 25%, #d0d0d0 50%, #a0a0a0 75%, #c0c0c0 100%);
  }
  
  /* Glow on hover */
  .hover-glow {
    @apply transition-shadow duration-300;
  }
  
  .hover-glow:hover {
    @apply shadow-neon-pink;
  }
  
  /* Text glow effect */
  .text-glow-pink {
    text-shadow: 0 0 5px #FF6EC7, 0 0 10px #FF6EC7, 0 0 20px #FF6EC7;
  }
  
  .text-glow-cyan {
    text-shadow: 0 0 5px #01CDFE, 0 0 10px #01CDFE, 0 0 20px #01CDFE;
  }
}

/* Custom keyframe for mesh gradient background */
@keyframes mesh-move {
  0% { background-position: 0% 0%, 100% 100%, 50% 50%; }
  50% { background-position: 100% 100%, 0% 0%, 50% 50%; }
  100% { background-position: 0% 0%, 100% 100%, 50% 50%; }
}

.animate-mesh {
  animation: mesh-move 20s ease infinite;
}
```

---

## shadcn/ui component customizations

### Button variants with Y2K styling

```tsx
// components/ui/button.tsx - Add these variants to buttonVariants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Y2K Custom Variants
        neonPink: [
          "bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500",
          "bg-[length:200%_auto] hover:bg-[position:right_center]",
          "text-white font-bold border border-pink-400/50",
          "shadow-[0_0_15px_rgba(236,72,153,0.5)]",
          "hover:shadow-[0_0_25px_rgba(236,72,153,0.8)]",
          "transition-all duration-300",
        ].join(" "),
        
        neonCyan: [
          "bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400",
          "bg-[length:200%_auto] hover:bg-[position:right_center]",
          "text-white font-bold",
          "shadow-[0_0_15px_rgba(34,211,238,0.5)]",
          "hover:shadow-[0_0_25px_rgba(34,211,238,0.8)]",
          "transition-all duration-300",
        ].join(" "),
        
        glowOutline: [
          "bg-transparent border-2 border-primary",
          "text-primary hover:bg-primary/10",
          "shadow-[0_0_10px_hsl(var(--primary)/0.5)]",
          "hover:shadow-[0_0_20px_hsl(var(--primary)/0.8)]",
          "transition-all duration-300",
        ].join(" "),
        
        glass: [
          "bg-white/10 backdrop-blur-md",
          "border border-white/20",
          "text-foreground",
          "hover:bg-white/20",
          "transition-all duration-300",
        ].join(" "),
        
        chrome: [
          "bg-gradient-to-b from-gray-100 via-gray-300 to-gray-400",
          "text-gray-900 font-semibold",
          "border border-gray-500",
          "shadow-inner",
          "hover:from-gray-200 hover:via-gray-400 hover:to-gray-500",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Card variants for movie display

```tsx
// components/ui/card.tsx - Extended with Y2K variants
const cardVariants = cva(
  "rounded-lg border text-card-foreground",
  {
    variants: {
      variant: {
        default: "bg-card border-border",
        
        glass: [
          "bg-white/5 backdrop-blur-xl",
          "border border-white/10",
          "shadow-xl shadow-purple-500/5",
        ].join(" "),
        
        neon: [
          "bg-card border-2 border-primary/50",
          "shadow-[0_0_15px_hsl(var(--primary)/0.3)]",
          "hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)]",
          "hover:border-primary",
          "transition-all duration-300",
        ].join(" "),
        
        holographic: [
          "bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10",
          "border border-white/20",
          "backdrop-blur-sm",
          "hover:from-pink-500/20 hover:via-purple-500/20 hover:to-cyan-500/20",
          "transition-all duration-500",
        ].join(" "),
        
        movie: [
          "bg-card/80 backdrop-blur-sm",
          "border border-border/50",
          "overflow-hidden",
          "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20",
          "hover:border-primary/50",
          "transition-all duration-300",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

### Input styling for search bars

```tsx
// Y2K-styled input with glow focus
<Input 
  className={cn(
    "bg-background/50 border-2 border-muted",
    "focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.5)]",
    "placeholder:text-muted-foreground/70",
    "transition-all duration-300"
  )}
  placeholder="Search movies..."
/>
```

### Table styling for movie data

```tsx
// Y2K-themed data table
<Table className="border-separate border-spacing-0">
  <TableHeader>
    <TableRow className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b-2 border-primary/30">
      <TableHead className="text-cyan-300 font-bold uppercase tracking-wider text-xs">
        Title
      </TableHead>
      <TableHead className="text-cyan-300 font-bold uppercase tracking-wider text-xs">
        Rating
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {movies.map((movie, index) => (
      <TableRow 
        key={movie.id}
        className={cn(
          "border-b border-primary/10",
          "hover:bg-primary/10",
          "transition-colors duration-200",
          index % 2 === 0 ? "bg-card/50" : "bg-card/30"
        )}
      >
        <TableCell>{movie.title}</TableCell>
        <TableCell>
          <Badge variant="outline" className="border-primary/50 text-primary">
            ⭐ {movie.rating}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Movie database-specific components

### Movie poster card

```tsx
// components/movie-card.tsx
export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-500" />
      
      {/* Card content */}
      <Card variant="movie" className="relative">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          {/* Rating badge */}
          <div className="absolute top-2 right-2">
            <Badge className="bg-black/70 backdrop-blur-sm border border-primary/50 text-primary font-mono">
              ⭐ {movie.rating.toFixed(1)}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-lg truncate text-gradient-animated">
            {movie.title}
          </h3>
          <p className="text-muted-foreground text-sm">
            {movie.year} • {movie.runtime}m
          </p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {movie.genres.slice(0, 2).map(genre => (
              <Badge 
                key={genre} 
                variant="outline" 
                className="text-xs border-secondary/50 text-secondary"
              >
                {genre}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Star rating component with Y2K flair

```tsx
// components/star-rating.tsx
export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-5 h-5 transition-all duration-200",
            i < rating
              ? "fill-primary text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}
```

### Genre filter chips

```tsx
// components/genre-filter.tsx
export function GenreFilter({ genres, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map(genre => (
        <button
          key={genre}
          onClick={() => onSelect(genre)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
            "border-2",
            selected.includes(genre)
              ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
              : "bg-transparent border-muted text-muted-foreground hover:border-primary/50 hover:text-primary"
          )}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
```

---

## Streaming service UI patterns that work

Letterboxd and Netflix offer valuable lessons for movie database UI. **Letterboxd's dark backgrounds mirror the cinema experience**, while poster-dominant layouts let imagery speak. Netflix's **large singular hero items reduce decision fatigue** on landing pages.

### Effective patterns to adopt

- **Poster-first design**: Movie posters should be the visual anchor, sized at minimum 200px wide for recognition
- **Dark gradient backdrops**: Pull colors from movie posters for dynamic theming per detail page
- **Bite-sized metadata**: Runtime as `2h 15m`, release year prominent, genres as colored chips
- **Horizontal scroll carousels**: For genre rows, trending lists—reduces vertical scroll fatigue
- **Glass overlays for hoverstates**: Reveal synopsis, quick actions without navigating away

### Layout structure recommendation

```
┌─────────────────────────────────────────────────────────┐
│  [Logo]    [Search...🔍]    [Nav Links]    [User Menu]  │  ← Glass nav bar
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ╔═══════════════════════════════════════════════════╗ │
│   ║  FEATURED MOVIE HERO                              ║ │  ← Full-width, gradient overlay
│   ║  Title • Rating • Year                            ║ │
│   ║  [Watch Trailer] [Add to List]                    ║ │
│   ╚═══════════════════════════════════════════════════╝ │
│                                                         │
│   Trending Now →                                        │
│   [Poster][Poster][Poster][Poster][Poster] →           │  ← Horizontal scroll
│                                                         │
│   Action Movies →                                       │
│   [Poster][Poster][Poster][Poster][Poster] →           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Reference implementations and resources

### GitHub repositories to study

| Repository | Description |
|------------|-------------|
| **ZenithResearch/y2k-ui** | Full Y2K React component library with TypeScript + Tailwind |
| **songexile/Y2K-Website-Aesthetic** | Windows XP-style React + Three.js implementation |
| **torch2424/aesthetic-css** | Vaporwave CSS framework (~40KB) |

### Figma resources

- **Y2K Design System**: `figma.com/community/file/1088531660789691371`
- **Letterboxd UI Kit**: `figma.com/community/file/1263143926984042964`

### CodePen examples

Search for "vaporwave", "neon UI", or "movie card" on CodePen for interactive examples of gradients, glows, and card layouts.

---

## Implementation checklist

**Phase 1: Foundation**
- [ ] Update `tailwind.config.ts` with custom colors, shadows, animations
- [ ] Replace `globals.css` with Y2K-themed CSS variables
- [ ] Add custom utility classes for gradients and glows

**Phase 2: Core components**
- [ ] Extend Button with neon variants
- [ ] Create Card variants for movie posters
- [ ] Style Input/Search with glow focus states
- [ ] Theme Table for data-heavy views
- [ ] Style Badge components for ratings/genres

**Phase 3: Movie-specific**
- [ ] Build MovieCard component with hover effects
- [ ] Create StarRating with glow
- [ ] Implement genre filter chips
- [ ] Design hero section with gradient overlay

**Phase 4: Polish**
- [ ] Add custom scrollbar styling
- [ ] Implement loading skeletons with shimmer
- [ ] Add `prefers-reduced-motion` fallbacks
- [ ] Ensure WCAG color contrast compliance
- [ ] Test glassmorphism browser support (add solid fallbacks)

---

## Conclusion

The Y2K aesthetic transforms utilitarian movie databases into immersive visual experiences. The key is **restraint within maximalism**: use neon glows sparingly as accents against dark surfaces, let movie posters carry visual weight, and ensure interactive elements have unmistakable feedback through shadow and color shifts.

This specification provides the exact values and patterns needed to implement a cohesive Y2K theme. Start with the CSS variables and Tailwind config, then progressively enhance components with the custom variants. The result will feel both nostalgically familiar to millennials and fresh to Gen Z users discovering the aesthetic for the first time.