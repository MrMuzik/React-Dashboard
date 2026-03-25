/**
 * Scrolls the window to the top on every route change.
 *
 * Non-obvious: On desktop the main content area is short enough that scroll
 * position resets naturally, but on mobile the longer single-column layouts
 * cause the browser to restore the previous scroll position when navigating
 * back to a route. This component forces a reset so every route loads at the
 * top of the screen regardless of viewport size.
 *
 * Depends on: React Router (useLocation).
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
