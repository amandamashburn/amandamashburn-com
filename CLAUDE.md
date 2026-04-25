# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (includes type checking)
npm start        # Run production build locally
npm run lint     # Run ESLint
```

## Tech Stack

- **Next.js 16** - App Router, React Server Components, Turbopack
- **React 19** - With React Compiler enabled for automatic memoization
- **TypeScript 5** - Strict mode, path aliases (`@/*` → `./src/*`)
- **Tailwind CSS v4** - CSS-based config, oklch color space, CSS variables
- **shadcn/ui** - New York style, Lucide icons, neutral color palette

## Project Structure

```
personal-website/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── calendar/
│   │   │   └── page.tsx        # ISO week-based year dashboard
│   │   ├── layout.tsx          # Root layout, font loading, metadata
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Tailwind config, design tokens, themes
│   │   └── favicon.ico
│   └── lib/
│       ├── calendar.ts         # Calendar/week utilities
│       └── utils.ts            # cn() helper for className merging
├── public/                     # Static assets
├── components.json             # shadcn/ui configuration
├── next.config.ts              # Next.js config (React Compiler enabled)
├── tsconfig.json               # TypeScript config with path aliases
├── postcss.config.mjs          # PostCSS with Tailwind v4
└── eslint.config.mjs           # ESLint for Next.js + TypeScript
```

## App Router Files

### `src/app/layout.tsx`
Root layout that:
- Loads IBM Plex fonts (Sans, Serif, Mono) via `next/font/google`
- Exports font CSS variables for Tailwind
- Sets page metadata (title, description)
- Applies antialiasing

### `src/app/page.tsx`
Landing page with responsive design using all three font families.

### `src/app/globals.css`
Tailwind v4 configuration using CSS-based setup:
- `@import "tailwindcss"` - Framework import
- `@theme inline` - Design token definitions
- `:root` / `.dark` - Light and dark mode color schemes
- `@layer base` - Base element styling

## Styling System

### Tailwind CSS v4
Uses the new CSS-based configuration (no `tailwind.config.js`). All customization happens in `globals.css` via `@theme inline`.

### Design Tokens
Colors use oklch color space for perceptual uniformity:
- `--background`, `--foreground` - Page colors
- `--primary`, `--secondary`, `--accent` - UI colors
- `--muted`, `--destructive` - State colors
- `--border`, `--input`, `--ring` - Form colors
- `--card`, `--popover` - Surface colors
- `--chart-1` through `--chart-5` - Data visualization
- `--sidebar-*` - Sidebar component colors

### Border Radius
Configurable via `--radius` variable with computed variants (sm, md, lg, xl, 2xl, 3xl, 4xl).

### Dark Mode
Toggle by adding `.dark` class to root element. All color tokens have dark mode variants.

## Fonts

IBM Plex family loaded via `next/font/google`:

| Font | CSS Variable | Tailwind Class | Usage |
|------|--------------|----------------|-------|
| IBM Plex Sans | `--font-ibm-plex-sans` | `font-sans` | Body text, UI |
| IBM Plex Serif | `--font-ibm-plex-serif` | `font-serif` | Headlines |
| IBM Plex Mono | `--font-ibm-plex-mono` | `font-mono` | Code, tech text |

All weights (100-700) and styles (normal, italic) are available.

## shadcn/ui

Configured but no components installed yet. Configuration in `components.json`:
- **Style:** New York
- **Base color:** Neutral (grayscale)
- **Icons:** Lucide React
- **RSC:** Enabled

### Adding Components
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add [component]
```

Components are copied to `src/components/ui/` and can be customized.

### Path Aliases
- `@/components` - All components
- `@/components/ui` - shadcn/ui components
- `@/lib` - Utilities and helpers
- `@/hooks` - Custom React hooks

## Utilities

### `cn()` Function
Located in `src/lib/utils.ts`. Combines `clsx` and `tailwind-merge` for className handling:

```tsx
import { cn } from "@/lib/utils"

cn("px-4 py-2", isActive && "bg-primary", className)
```

## Development Workflow

### Adding Pages
Create files in `src/app/`:
- `src/app/about/page.tsx` → `/about`
- `src/app/blog/page.tsx` → `/blog`
- `src/app/blog/[slug]/page.tsx` → `/blog/:slug`

### Adding API Routes
Create files in `src/app/api/`:
- `src/app/api/hello/route.ts` → `GET /api/hello`

### Adding Components
1. For shadcn/ui: `npx shadcn@latest add [component]`
2. For custom: Create in `src/components/`

## Working Notes

### Pages at a Glance

| Route | File | Type | Purpose |
|-------|------|------|---------|
| `/` | `src/app/page.tsx` | Server Component | Homepage / landing |
| `/calendar` | `src/app/calendar/page.tsx` | Client Component (`"use client"`) | ISO 8601 Calendar dashboard |

### Site Content Reference

**Homepage (`/`):**
- Tagline: "Systems Thinker. Technical Non-Engineer. Generalist."
- Bio: decade in tech, systems-building, documentation-first approach
- External links: `docs.amandamashburn.com`, X (`x.com/amandamashburn`), GitHub (`github.com/amandamashburn`)
- Contact: `amandamashburn@proton.me`
- Last updated footer: "Last updated March 14, 2026"

**Calendar (`/calendar`):**
- Title: "ISO 8601 Calendar"
- Displays all ISO 8601 weeks for a selected year (current or next)
- Sidebar: day-of-year, ISO week number, year progress %, days/weeks remaining
- Donut chart SVG showing year progress
- No event data — purely visual progress tracker

### Design Patterns to Maintain

- **External links:** always `target="_blank" rel="noopener noreferrer"`
- **Buttons/tags:** `rounded-full border border-black bg-white text-black hover:bg-black hover:text-white` pattern
- **Typography:** serif (`font-serif`) for headlines, mono (`font-mono`) for metadata/numbers, sans (`font-sans`) for body
- **Layout:** centered single-column, `max-w-[640px] mx-auto`, horizontal padding `px-6`
- **Vertical spacing:** responsive `py-16 sm:py-24 md:py-32` on page sections
- **Section dividers:** `<hr className="border-dotted border-neutral-300" />`
- **Color palette:** intentionally neutral/grayscale — avoid introducing brand colors

### Client-Side Hydration Pattern

The calendar page defers all date initialization to avoid SSR/client hydration mismatches:

```tsx
const [now, setNow] = useState<Date | null>(null)
useEffect(() => { setNow(new Date()) }, [])
if (!now) return <p>Loading…</p>
```

Any feature that depends on `new Date()` or browser APIs must follow this same pattern.

### Custom Date Library (`src/lib/calendar.ts`)

- All ISO 8601 math is custom — no external date library (no dayjs, date-fns)
- UTC internally for day arithmetic; local date semantics for display
- Self-validating: assertions run at module import and `console.warn` on failure
- **Extend this file** for new date/week utilities — do not add a date library dependency

### Deployment & Analytics

- Deployed on Vercel; `@vercel/analytics` is wired in `layout.tsx` and works automatically
- `npm run build` runs TypeScript type checking — fix type errors before deploying

### Installed but Currently Unused Packages

- `lucide-react` — icon library, not yet imported anywhere; use this for any icons needed
- `class-variance-authority` — available for component variant patterns (shadcn pattern)
- `cn()` (`src/lib/utils.ts`) — class merging utility, not yet called in current pages but available

## Licensing

- **Source code:** MIT License
- **Written content, images, media:** All rights reserved (© 2026 Amanda Mashburn)
