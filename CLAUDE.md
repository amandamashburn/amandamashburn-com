# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

Next.js 16 App Router with TypeScript and Tailwind CSS v4.

- `src/app/layout.tsx` - Root layout with IBM Plex font configuration (Sans, Serif, Mono)
- `src/app/page.tsx` - Landing page
- `src/app/globals.css` - Tailwind imports and font variable mappings

## Fonts

Uses `next/font/google` for IBM Plex family. Font CSS variables:
- `--font-ibm-plex-sans` → Tailwind `font-sans`
- `--font-ibm-plex-serif` → Tailwind `font-serif`
- `--font-ibm-plex-mono` → Tailwind `font-mono`

## Licensing

- Source code: MIT License
- Written content, images, and other media: All rights reserved (© 2025 Amanda Mashburn)
