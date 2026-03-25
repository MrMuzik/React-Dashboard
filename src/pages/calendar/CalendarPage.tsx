/**
 * Calendar & Timeline view showing a 2-week window centered on today.
 *
 * Depends on: React Query (fetchCalendarEvents with date-range cache keys).
 *
 * ─── DATE-DRIVEN CACHE KEY EXPLAINED ─────────────────────────────────────
 *
 * The React Query cache key includes the start and end dates of the visible
 * 2-week window: ['calendar', 'events', startDate, endDate].
 *
 * The 2-week window is calculated by:
 * 1. Taking the Monday of the current week as the start date
 * 2. Adding 13 days to get to the Sunday of the following week (14-day span)
 *
 * WHY the date range drives the cache key:
 * - Navigating forward/backward changes the date range, which changes the cache key
 * - React Query treats each unique key as a separate cache entry
 * - This means going to "next week" triggers a fresh fetch for that range
 * - But going BACK to the previous range hits the cache instantly (no loading state)
 * - Each window's data is cached independently, so switching between weeks is snappy
 *
 * This is a core React Query pattern: derive cache keys from the data's identity.
 * The date range IS the identity of calendar data — two different ranges are two
 * different datasets, and React Query should cache them separately.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * ─── ADAPTIVE DESIGN ────────────────────────────────────────────────────
 * On mobile (<md), a 7-column grid is unreadable. Instead we render a
 * vertical day-by-day list that scrolls naturally and shows event details
 * in full. The grid view is reserved for md+ where each column has room.
 * This is adaptive (different component structure) not just responsive
 * (same structure, different sizes) — the mobile layout is fundamentally
 * different, not a squeezed version of the desktop layout.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addDays, startOfWeek, format, isSameDay, parseISO } from 'date-fns';
import { fetchCalendarEvents } from '@/api/calendar';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CalendarEvent } from '@/types';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const { startDate, endDate, days } = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
    const start = weekStart;
    const end = addDays(weekStart, 13);
    const dayList = Array.from({ length: 14 }, (_, i) => addDays(start, i));

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      days: dayList,
    };
  }, [weekOffset]);

  const eventsQuery = useQuery({
    queryKey: ['calendar', 'events', startDate, endDate],
    queryFn: () => fetchCalendarEvents(startDate, endDate),
  });

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    if (!eventsQuery.data) return [];
    const dayStr = format(day, 'yyyy-MM-dd');
    return eventsQuery.data.filter((event) => event.date === dayStr);
  };

  const today = new Date();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header + navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Calendar</h1>
          <p className="text-sm text-gray-500">
            {format(parseISO(startDate), 'MMM d')} — {format(parseISO(endDate), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-surface-tertiary"
          >
            &larr; <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-surface-tertiary"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-surface-tertiary"
          >
            <span className="hidden sm:inline">Next</span> &rarr;
          </button>
        </div>
      </div>

      {/* Loading state */}
      {eventsQuery.isLoading && (
        <Card>
          {/* Desktop skeleton */}
          <div className="hidden lg:grid lg:grid-cols-7 lg:gap-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} height="8rem" className="rounded-lg" />
            ))}
          </div>
          {/* Mobile skeleton */}
          <div className="space-y-3 lg:hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height="4rem" className="rounded-lg" />
            ))}
          </div>
        </Card>
      )}

      {/* Error state */}
      {eventsQuery.isError && (
        <Card>
          <ErrorState message="Failed to load calendar events" onRetry={() => eventsQuery.refetch()} />
        </Card>
      )}

      {/* Loaded state */}
      {eventsQuery.isSuccess && (
        <>
          {/* ── DESKTOP: 7-column grid (lg / 1024px+) ───────────────── */}
          <Card className="hidden lg:block">
            <div className="mb-4 grid grid-cols-7 gap-2">
              {DAY_LABELS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Week 1 */}
            <div className="mb-2 grid grid-cols-7 gap-2">
              {days.slice(0, 7).map((day) => (
                <DayColumn key={day.toISOString()} day={day} events={getEventsForDay(day)} isToday={isSameDay(day, today)} />
              ))}
            </div>

            {/* Week 2 */}
            <div className="grid grid-cols-7 gap-2">
              {days.slice(7, 14).map((day) => (
                <DayColumn key={day.toISOString()} day={day} events={getEventsForDay(day)} isToday={isSameDay(day, today)} />
              ))}
            </div>

            {!eventsQuery.data?.length && (
              <div className="mt-4">
                <EmptyState title="No events" description="No events scheduled for this period" />
              </div>
            )}
          </Card>

          {/* ── MOBILE / TABLET: Vertical day list (<lg / <1024px) ──── */}
          <div className="space-y-3 lg:hidden">
            {!eventsQuery.data?.length && (
              <Card>
                <EmptyState title="No events" description="No events scheduled for this period" />
              </Card>
            )}

            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, today);
              // Skip empty days on mobile to reduce scrolling
              if (dayEvents.length === 0 && !isToday) return null;

              return (
                <MobileDayCard key={day.toISOString()} day={day} events={dayEvents} isToday={isToday} />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Desktop: compact column view ────────────────────────────────────── */

function DayColumn({ day, events, isToday }: { day: Date; events: CalendarEvent[]; isToday: boolean }) {
  return (
    <div
      className={`min-h-[8rem] rounded-lg border p-2 transition-colors duration-200 ${
        isToday ? 'border-brand-300 bg-brand-50/50' : 'border-border bg-surface'
      }`}
    >
      <p className={`mb-1 text-xs font-medium ${isToday ? 'text-brand-700' : 'text-gray-500'}`}>
        {format(day, 'd')}
      </p>
      <div className="space-y-1">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded px-1.5 py-1 text-xs text-white"
            style={{ backgroundColor: event.color }}
          >
            <p className="truncate font-medium">{event.title}</p>
            <p className="text-[10px] opacity-80">
              {event.startTime}–{event.endTime}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mobile: full-width card per day with readable event details ─────── */

function MobileDayCard({ day, events, isToday }: { day: Date; events: CalendarEvent[]; isToday: boolean }) {
  return (
    <Card className={isToday ? 'ring-2 ring-brand-300 ring-offset-1' : ''}>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
            isToday ? 'bg-brand-600 text-white' : 'bg-surface-tertiary text-gray-700'
          }`}
        >
          {format(day, 'd')}
        </span>
        <div>
          <p className={`text-sm font-semibold ${isToday ? 'text-brand-700' : 'text-gray-900'}`}>
            {format(day, 'EEEE')}
          </p>
          <p className="text-xs text-gray-500">{format(day, 'MMM d, yyyy')}</p>
        </div>
        {isToday && (
          <span className="ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
            TODAY
          </span>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No events</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-lg p-2.5"
              style={{ backgroundColor: event.color + '18' }}
            >
              {/* Color dot */}
              <span
                className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{event.title}</p>
                <p className="text-xs text-gray-500">
                  {event.startTime} – {event.endTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
