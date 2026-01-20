Frontend Guidelines

Stack:
- React + TypeScript + Tailwind CSS
- Vite for dev server (fast refresh)
- shadcn/ui components only

General rules:
- No custom CSS files (use Tailwind classes only)
- No animations (keep it fast)
- Mobile-first responsive design

Layout:
- Single-column layout
- Max width 1200px
- Centered content
- 16px padding on mobile, 24px on desktop

Typography:
- System font stack (Inter or default)
- Page title: text-3xl font-bold
- Section titles: text-xl font-semibold
- Body text: text-sm
- Muted text: text-muted-foreground

Components to use:
- Table (desktop movie list)
- Card (mobile movie cards)
- Badge (genres)
- Input (search bar)
- Select (country selector)
- Button (external links)

Components forbidden:
- Modals/Dialogs
- Tabs
- Charts
- Carousels
- Dropdowns (except country selector)

Images:
- Poster thumbnails: 92px wide (w-23)
- Lazy loading enabled
- Fallback for missing posters: gray placeholder

Responsive breakpoints:
- Mobile: default (< 768px)
- Desktop: md: (≥ 768px)
- Use md:hidden and hidden md:block for layout switching

Country Selector:
- Position: Top-right, same row as search bar
- Shows: Country code + flag emoji (e.g., "🇸🇪 SE")
- Behavior: Filters movies by country instantly
- Persistence: Save selection to localStorage
- Default: SE (Sweden)