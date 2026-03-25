/**
 * Simulated Calendar API.
 *
 * Accepts a date range and returns events within that window. In production,
 * you'd pass the start/end dates as query parameters to your API. The date
 * range is what drives the React Query cache key — see the calendar page
 * component for a detailed explanation of this pattern.
 */
import type { CalendarEvent } from '@/types';
import { addDays, format, isWithinInterval, parseISO } from 'date-fns';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function generateMockEvents(startDate: Date, endDate: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const titles = [
    'Team Standup', 'Sprint Review', 'Design Sync', '1:1 with Manager',
    'Client Call', 'Code Review', 'Planning Session', 'Demo Day',
    'Retrospective', 'Workshop', 'Lunch & Learn', 'Architecture Review',
  ];
  const colors = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

  /* Generate 8-12 events spread across the date range */
  const numEvents = 8 + Math.floor(Math.random() * 5);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = 0; i < numEvents; i++) {
    const dayOffset = Math.floor(Math.random() * totalDays);
    const eventDate = addDays(startDate, dayOffset);
    const startHour = 8 + Math.floor(Math.random() * 8);
    const duration = 1 + Math.floor(Math.random() * 2);

    const event: CalendarEvent = {
      id: `event-${format(startDate, 'yyyy-MM-dd')}-${i}`,
      title: titles[i % titles.length],
      date: format(eventDate, 'yyyy-MM-dd'),
      startTime: `${String(startHour).padStart(2, '0')}:00`,
      endTime: `${String(startHour + duration).padStart(2, '0')}:00`,
      color: colors[i % colors.length],
    };

    events.push(event);
  }

  return events;
}

export async function fetchCalendarEvents(
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  await delay(500);

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const allEvents = generateMockEvents(start, end);

  return allEvents.filter((event) =>
    isWithinInterval(parseISO(event.date), { start, end })
  );
}
