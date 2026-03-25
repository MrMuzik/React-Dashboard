/**
 * React Query client configuration.
 *
 * STATE ARCHITECTURE DECISION: This application uses both Zustand and React Query,
 * each for a distinct responsibility:
 *
 * - Zustand manages CLIENT STATE: authentication session, UI preferences (sidebar
 *   collapsed, active nav item), and onboarding wizard progress. These are local
 *   concerns that don't come from a server and don't need cache invalidation,
 *   background refetching, or stale-while-revalidate semantics.
 *
 * - React Query manages SERVER STATE: dashboard data, review items, calendar events,
 *   notifications, and user settings. These represent remote data that can become
 *   stale, needs to be refetched on window focus, supports optimistic updates, and
 *   benefits from automatic cache management.
 *
 * Using one tool for both concerns leads to awkward patterns: putting UI toggles in
 * React Query means unnecessary cache entries; putting API data in Zustand means
 * manually handling loading/error/stale states that React Query gives you for free.
 * The two libraries complement each other without overlap.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /* Keep data fresh for 30 seconds before marking stale */
      staleTime: 30 * 1000,
      /* Retry failed requests once before showing error state */
      retry: 1,
      /* Refetch when user returns to the tab — keeps dashboard data current */
      refetchOnWindowFocus: true,
    },
  },
});
