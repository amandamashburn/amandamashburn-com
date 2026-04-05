"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getISOWeekYear,
  getISOWeekNumber,
  getDayOfYear,
  getDaysInYear,
  getYearProgress,
  getWeeksRemaining,
  getDaysRemaining,
  buildCalendarWeeks,
  type CalendarWeek,
} from "@/lib/calendar";

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-base font-light mt-0.5 leading-snug">{value}</p>
    </div>
  );
}

// ─── Donut Chart ───────────────────────────────────────────────────────────

function DonutChart({ pct }: { pct: number }) {
  const r = 44;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  const filled = (pct / 100) * circumference;

  return (
    <div className="relative mx-auto w-[120px] h-[120px] flex items-center justify-center">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="-rotate-90"
        aria-hidden
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className="text-foreground/10"
        />
        {/* Fill */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="text-foreground"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-base font-light tabular-nums">
          {pct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ─── ISO Info Panel ────────────────────────────────────────────────────────

function ISOInfoPanel() {
  return (
    <div className="mt-6 border border-foreground/15 rounded px-4 py-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        About This Calendar
      </p>
      <div className="space-y-3 font-serif text-sm leading-relaxed text-foreground/80">
        <p>
          ISO 8601 is an international standard for representing dates and
          times. Its week-based calendar divides the year into 52 or 53 weeks,
          each starting on Monday.
        </p>
        <p>
          The ISO week year doesn&apos;t always start on January 1. Week 1 is
          defined as the week containing the first Thursday of the year —
          equivalently, the week containing January 4th. This means a few early
          January dates may belong to the prior ISO year, and a few late
          December dates may belong to the next.
        </p>
        <p>
          Because every year contains exactly 52 or 53 complete weeks, this
          calendar is well-suited for planning in 4-week and 12-week cycles. The
          groupings visible here divide the year into 13 periods of 4 weeks each
          (with a possible remainder), making it straightforward to structure
          sprints, reviews, and quarterly rhythms.
        </p>
      </div>
    </div>
  );
}

// ─── Stats Panel ───────────────────────────────────────────────────────────

function StatsPanel({ now }: { now: Date }) {
  const isoYear = getISOWeekYear(now);
  const dayOfYear = getDayOfYear(now);
  const daysInYear = getDaysInYear(now.getFullYear());
  const isoWeek = getISOWeekNumber(now);
  const weeksLeft = getWeeksRemaining(now);
  const daysLeft = getDaysRemaining(now);
  const progress = getYearProgress(now);

  const todayLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <aside className="flex flex-col">
      {/* Stat cards */}
      <div className="border border-foreground/15 rounded px-4">
        <StatCard label="Today" value={todayLabel} />
        <StatCard label="Day of Year" value={`Day ${dayOfYear} of ${daysInYear}`} />
        <StatCard label="ISO Week" value={`Week ${isoWeek}`} />
        <StatCard label="Weeks Remaining" value={`${weeksLeft} weeks`} />
        <StatCard label="Days Remaining" value={`${daysLeft} days`} />
      </div>

      {/* Year progress */}
      <div className="mt-6 border border-foreground/15 rounded px-4 py-4 flex flex-col items-center gap-3">
        <DonutChart pct={progress} />
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">
          {isoYear} is {progress.toFixed(1)}% complete
        </p>
      </div>

      {/* ISO 8601 info */}
      <ISOInfoPanel />
    </aside>
  );
}

// ─── Date Cell ─────────────────────────────────────────────────────────────

function DateCell({
  mmdd,
  isToday,
  isPast,
  isAdjacent,
  dayOfYear,
  daysInYear,
}: {
  mmdd: string;
  isToday: boolean;
  isPast: boolean;
  isAdjacent: boolean;
  dayOfYear: number;
  daysInYear: number;
}) {
  const base = "relative group text-center font-mono text-xs leading-none px-1.5 py-1.5 rounded";

  const state = isToday
    ? "bg-foreground text-background"
    : isAdjacent
      ? "text-muted-foreground/50 italic"
      : isPast
        ? "text-muted-foreground"
        : "";

  return (
    <td className="p-0.5 align-middle">
      <div className={`${base} ${state}`}>
        {mmdd}
        {/* Hover tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 hidden group-hover:block whitespace-nowrap bg-foreground text-background font-mono text-[10px] px-2 py-1 rounded">
          Day {dayOfYear} of {daysInYear}
        </div>
      </div>
    </td>
  );
}

// ─── Calendar Grid ─────────────────────────────────────────────────────────

const DAY_HEADERS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function CalendarGrid({
  weeks,
  todayKey,
  nowMs,
}: {
  weeks: CalendarWeek[];
  todayKey: string;
  nowMs: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse">
        <thead>
          <tr className="border-b-2 border-foreground/20">
            <th className="pb-2 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-normal w-8 pr-3">
              WK
            </th>
            {DAY_HEADERS.map((d) => (
              <th
                key={d}
                className="pb-2 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-normal"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => {
            // Heavier top border every 4 weeks
            const is4Boundary = i > 0 && i % 4 === 0;
            return (
              <tr
                key={week.weekNumber}
                className={
                  is4Boundary
                    ? "border-t-2 border-foreground/20"
                    : "border-t border-border/50"
                }
              >
                {/* Week number */}
                <td className="py-1 pr-3 font-mono text-[10px] text-muted-foreground/60 tabular-nums align-middle">
                  {String(week.weekNumber).padStart(2, "0")}
                </td>

                {week.days.map((day) => {
                  const key = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`;
                  const isToday = key === todayKey;
                  const isPast =
                    !isToday && day.date.getTime() < nowMs;
                  return (
                    <DateCell
                      key={key}
                      mmdd={day.mmdd}
                      isToday={isToday}
                      isPast={isPast}
                      isAdjacent={!day.isCurrentISOYear}
                      dayOfYear={day.dayOfYear}
                      daysInYear={day.daysInYear}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Calendar Panel ────────────────────────────────────────────────────────

function CalendarPanel({
  now,
  currentISOYear,
}: {
  now: Date;
  currentISOYear: number;
}) {
  const [selectedYear, setSelectedYear] = useState(currentISOYear);

  const weeks = buildCalendarWeeks(selectedYear);

  // Stable keys for "today" comparison — use local midnight so past/future
  // comparisons work correctly against generated calendar dates.
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const nowMs = todayMidnight.getTime();

  return (
    <section>
      {/* Year tabs */}
      <div className="flex gap-6 mb-5 border-b border-border pb-3">
        {[currentISOYear, currentISOYear + 1].map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={
              year === selectedYear
                ? "font-mono text-sm font-medium underline underline-offset-4"
                : "font-mono text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {year}
          </button>
        ))}
      </div>

      <CalendarGrid weeks={weeks} todayKey={todayKey} nowMs={nowMs} />
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  // Defer `new Date()` to client-side to avoid SSR hydration mismatches.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const currentISOYear = now ? getISOWeekYear(now) : null;

  return (
    <main className="flex min-h-svh flex-col px-6 py-12 sm:py-16">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header — static, always visible */}
        <header className="mb-8">
          <div className="flex items-baseline justify-between">
            <h1 className="font-serif text-xl font-normal uppercase tracking-[0.3em] sm:text-2xl">
              Year at a glance
            </h1>
            <Link
              href="/"
              className="font-mono text-xs font-light tracking-[0.15em] text-muted-foreground underline hover:no-underline"
            >
              ← Home
            </Link>
          </div>
          <hr className="mt-4 border-dotted border-foreground/15" />
        </header>

        {/* Two-column dashboard — rendered only after client mount */}
        {now && currentISOYear ? (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 lg:gap-14">
            <StatsPanel now={now} />
            <CalendarPanel now={now} currentISOYear={currentISOYear} />
          </div>
        ) : (
          <p className="font-mono text-xs text-muted-foreground">Loading…</p>
        )}
      </div>
    </main>
  );
}
