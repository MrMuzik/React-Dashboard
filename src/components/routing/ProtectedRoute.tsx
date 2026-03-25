/**
 * Route guard that redirects unauthenticated users to the login screen.
 *
 * Depends on: authStore (isAuthenticated check).
 * Non-obvious: This is a wrapper component, not a higher-order component. Wrapping
 * the <Outlet /> in React Router v6 is the idiomatic way to protect a group of
 * routes — it composes cleanly with nested layouts.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
