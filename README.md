# amandamashburn.com

Source code for my personal website. I keep this public so others can see how it's built and use it as a reference point for creating their own.

**Live site:** [amandamashburn.com](https://amandamashburn.com)

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- IBM Plex font family

## ISO 8601 Calendar

The site includes an [ISO 8601 week-based calendar](https://amandamashburn.com/calendar) — a full-year view that shows every week, day-of-year position, and year progress. It's built for personal planning in 04-week and 12-week cycles.

The calendar math is implemented from scratch in [`src/lib/calendar.ts`](./src/lib/calendar.ts) with no external date library. It handles the tricky parts of the ISO 8601 spec:

| Element | Note |
|-------|--------|
| **Week 01 definition** | The week containing the first Thursday (equivalently, January 4th), not January 1st. |
| **ISO week year vs. Gregorian year** | A few early-January and late-December dates belong to a different ISO year than their calendar year. |
| **52 vs. 53-week years** | Correctly computed via the ISO week year boundary rules. |
| **DST-safe arithmetic** | Day counting uses UTC internally to avoid daylight saving time artifacts, while display uses local date semantics. |

The module is self-validating: a set of assertions runs on import and logs warnings if any calculations are wrong. If you're working with ISO weeks in a JavaScript/TypeScript project and don't want to pull in a full date library, this file is a clean reference implementation.

## License

Source code is licensed under the [MIT License](./LICENSE) — use it freely.

Written content, images, and media are © 2026 Amanda Mashburn and may not be reproduced without permission.
