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
│   │   ├── layout.tsx          # Root layout, font loading, metadata
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Tailwind config, design tokens, themes
│   │   └── favicon.ico
│   ├── components/             # React components (empty, ready for use)
│   │   └── ui/                 # shadcn/ui components go here
│   └── lib/
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

## Licensing

- **Source code:** MIT License
- **Written content, images, media:** All rights reserved (© 2026 Amanda Mashburn)
