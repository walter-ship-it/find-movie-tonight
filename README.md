# Netflix IMDb Movies

Show the best movies currently available on Netflix (any country), sorted by IMDb rating, with country switching.

## Setup

1. Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Sync movies for a country:

```bash
npm run sync -- --country=SE
```

4. Start the development server:

```bash
npm run dev
```



## Supported Countries

SE (Sweden), US (United States), GB (United Kingdom), DE (Germany), CA (Canada), FR (France), IT (Italy), ES (Spain), NL (Netherlands), ZA (South Africa)

## Features

- Poster thumbnails
- Search by title
- Genre badges
- Runtime display
- Country selector (filter by Netflix region)
- Clickable IMDb/Netflix links
- Mobile responsive (table on desktop, cards on mobile)

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Postgres)