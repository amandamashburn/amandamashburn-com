// ISO 8601 date utilities — written from scratch per spec.
// Rules:
//   - ISO Week 1 = week containing January 4th (= week containing first Thursday)
//   - Week starts on Monday (ISO day 1); Sunday is ISO day 7
//   - ISO week year = Gregorian year of the Thursday in that week

export interface CalendarDay {
  date: Date;
  isoWeekYear: number;
  isCurrentISOYear: boolean;
  mmdd: string; // "MM.DD"
  dayOfYear: number;
  daysInYear: number;
}

export interface CalendarWeek {
  weekNumber: number;
  days: CalendarDay[]; // always 7, Mon–Sun
}

// --- Internal helpers ---

/** Normalize a Date to local midnight. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Days between two dates using UTC to avoid DST artifacts. */
function daysBetween(from: Date, to: Date): number {
  const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const utcTo = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((utcTo - utcFrom) / 86_400_000);
}

/** Add N days to a date using local year/month/date arithmetic (DST-safe). */
function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// --- ISO day normalization ---
// getDay() → 0=Sun, 1=Mon, ..., 6=Sat
// ISO      → 1=Mon, 2=Tue, ..., 6=Sat, 7=Sun
function toISODay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

// --- Public API ---

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/** Day number within the Gregorian calendar year (Jan 1 = 1). */
export function getDayOfYear(date: Date): number {
  const janFirst = new Date(date.getFullYear(), 0, 1);
  return daysBetween(janFirst, startOfDay(date)) + 1;
}

/**
 * Returns the Monday that begins ISO Week 1 for the given ISO week year.
 * ISO Week 1 contains January 4th of that year.
 */
export function getISOWeekYearStart(year: number): Date {
  const jan4 = new Date(year, 0, 4);
  const isoDay = toISODay(jan4.getDay()); // 1=Mon … 7=Sun
  // Subtract (isoDay - 1) days to get back to Monday
  return new Date(year, 0, 4 - (isoDay - 1));
}

/**
 * Returns the ISO week year for a given date.
 * The ISO week year is the Gregorian year of the Thursday of the date's week.
 */
export function getISOWeekYear(date: Date): number {
  const d = startOfDay(date);
  const isoDay = toISODay(d.getDay());
  // Thursday is ISO day 4; offset = 4 - isoDay (can be negative)
  const thursday = addDays(d, 4 - isoDay);
  return thursday.getFullYear();
}

/** ISO week number (1–53) for a given date. */
export function getISOWeekNumber(date: Date): number {
  const isoYear = getISOWeekYear(date);
  const yearStart = getISOWeekYearStart(isoYear);
  return Math.floor(daysBetween(yearStart, startOfDay(date)) / 7) + 1;
}

/** Number of ISO weeks in the given ISO week year (52 or 53). */
export function getISOWeekCount(year: number): number {
  const thisStart = getISOWeekYearStart(year);
  const nextStart = getISOWeekYearStart(year + 1);
  return daysBetween(thisStart, nextStart) / 7;
}

/**
 * Percentage of the ISO week year elapsed as of `now`, one decimal place.
 * Progress is based on elapsed whole days.
 */
export function getYearProgress(now: Date): number {
  const isoYear = getISOWeekYear(now);
  const yearStart = getISOWeekYearStart(isoYear);
  const nextYearStart = getISOWeekYearStart(isoYear + 1);
  const totalDays = daysBetween(yearStart, nextYearStart);
  const elapsedDays = daysBetween(yearStart, startOfDay(now));
  const pct = (elapsedDays / totalDays) * 100;
  return parseFloat(Math.min(100, Math.max(0, pct)).toFixed(1));
}

/** Full days remaining until the start of the next ISO week year. */
export function getDaysRemaining(now: Date): number {
  const isoYear = getISOWeekYear(now);
  const nextYearStart = getISOWeekYearStart(isoYear + 1);
  return Math.max(0, daysBetween(startOfDay(now), nextYearStart));
}

/** Full weeks remaining until the start of the next ISO week year. */
export function getWeeksRemaining(now: Date): number {
  return Math.floor(getDaysRemaining(now) / 7);
}

/**
 * Generates all weeks (52 or 53) for the given ISO week year.
 * Each week contains 7 CalendarDay entries, Monday through Sunday.
 */
export function buildCalendarWeeks(isoYear: number): CalendarWeek[] {
  const weekCount = getISOWeekCount(isoYear);
  const weeks: CalendarWeek[] = [];
  let weekStart = getISOWeekYearStart(isoYear);

  for (let w = 1; w <= weekCount; w++) {
    const days: CalendarDay[] = [];

    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d);
      const dayISOYear = getISOWeekYear(date);
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      days.push({
        date,
        isoWeekYear: dayISOYear,
        isCurrentISOYear: dayISOYear === isoYear,
        mmdd: `${mm}.${dd}`,
        dayOfYear: getDayOfYear(date),
        daysInYear: getDaysInYear(date.getFullYear()),
      });
    }

    weeks.push({ weekNumber: w, days });
    weekStart = addDays(weekStart, 7);
  }

  return weeks;
}

// --- Inline assertions (non-blocking; log warnings if wrong) ---
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.warn(`[calendar.ts] assertion failed: ${message}`);
  }
}

(function runAssertions() {
  // 2026: ISO Week 1 starts Dec 29, 2025 (Monday)
  const start2026 = getISOWeekYearStart(2026);
  assert(
    start2026.getFullYear() === 2025 &&
      start2026.getMonth() === 11 &&
      start2026.getDate() === 29,
    `getISOWeekYearStart(2026) → expected 2025-12-29, got ${start2026.toDateString()}`
  );

  // Dec 29, 2025 belongs to ISO week year 2026
  assert(
    getISOWeekYear(new Date(2025, 11, 29)) === 2026,
    `getISOWeekYear(2025-12-29) → expected 2026`
  );

  // 2026 has 53 ISO weeks
  assert(
    getISOWeekCount(2026) === 53,
    `getISOWeekCount(2026) → expected 53`
  );

  // Jan 5, 2026 is in Week 2
  assert(
    getISOWeekNumber(new Date(2026, 0, 5)) === 2,
    `getISOWeekNumber(2026-01-05) → expected 2`
  );

  // Jan 1, 2026 is in Week 1
  assert(
    getISOWeekNumber(new Date(2026, 0, 1)) === 1,
    `getISOWeekNumber(2026-01-01) → expected 1`
  );

  // Dec 28, 2025 is in ISO week year 2025 (its Thursday is Dec 25, 2025)
  assert(
    getISOWeekYear(new Date(2025, 11, 28)) === 2025,
    `getISOWeekYear(2025-12-28) → expected 2025`
  );
})();
