# Technology Stack

**Analysis Date:** 2026-02-10

## Languages

**Primary:**
- TypeScript 5.7.2 - Frontend and backend scripts
- HTML5 - Static markup in `index.html`
- CSS3 - Tailwind-based styling with PostCSS

**Secondary:**
- SQL - Supabase PostgreSQL migrations in `supabase/migrations/`

## Runtime

**Environment:**
- Node.js 18+ (inferred from dev dependencies)

**Package Manager:**
- npm (v9+) - `package-lock.json` v3 lockfile format

## Frameworks

**Core:**
- React 18.3.1 - UI framework for building components
- Vite 6.0.3 - Frontend build tool and development server

**UI & Styling:**
- Tailwind CSS 3.4.16 - Utility-first CSS framework
- PostCSS 8.4.49 - CSS transformation (autoprefixer plugin)
- Tailwind CSS Animate 1.0.7 - Animation utilities

**Component Library:**
- Radix UI 1.x - Headless component primitives:
  - `@radix-ui/react-checkbox` 1.3.3
  - `@radix-ui/react-popover` 1.1.15
  - `@radix-ui/react-select` 2.1.2
  - `@radix-ui/react-slider` 1.3.6
  - `@radix-ui/react-slot` 1.2.4

**Icons:**
- Lucide React 0.468.0 - SVG icon library

**Utilities:**
- Class Variance Authority 0.7.1 - Component variant management
- clsx 2.1.1 - Conditional className composition
- Tailwind Merge 2.6.0 - Tailwind class utility resolution

**Backend Scripts:**
- tsx 4.19.2 - TypeScript script runner (used for `npm run sync`)

**Testing & Type Safety:**
- TypeScript 5.7.2 - Type checking
- @types/react 18.3.12 - React type definitions
- @types/react-dom 18.3.1 - React DOM type definitions
- @types/node 22.10.0 - Node.js type definitions

**Configuration & Build:**
- Vite React Plugin 4.3.4 - React JSX support in Vite
- Autoprefixer 10.4.20 - CSS vendor prefixes
- dotenv 16.4.7 - Environment variable loading

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.47.0 - PostgreSQL/Supabase database client and API
- p-limit 6.1.0 - Rate limiting for concurrent API requests in sync script

**Infrastructure:**
- None - This is a static site with backend through Supabase

## Configuration

**Environment:**
- Frontend: Uses Vite environment variables loaded via `import.meta.env`
  - Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Scripts: Uses Node.js `process.env` loaded via dotenv
  - Required: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `TMDB_API_KEY`, `OMDB_API_KEY`

**Build:**
- `vite.config.ts` - Vite configuration with React plugin and `@/*` path alias
- `tsconfig.json` - TypeScript configuration targeting ES2020, React JSX
- `tailwind.config.ts` - Tailwind theme extensions with Y2K neon colors and animations
- `postcss.config.js` - PostCSS plugins for Tailwind and autoprefixer
- `components.json` - shadcn/ui configuration for component generation

## Platform Requirements

**Development:**
- Node.js 18+ with npm
- TypeScript 5.7+
- Modern browser (ES2020 support)

**Production:**
- Static hosting (Vercel, Netlify, etc.)
- Supabase PostgreSQL database
- External API access to TMDb and OMDb (for sync script)

---

*Stack analysis: 2026-02-10*
