/**
 * Route guard that restricts access to Admin-only pages.
 *
 * Depends on: authStore (user role).
 * Non-obvious: Members who try to access admin routes (e.g., /review) get
 * redirected to their dashboard with a state flag that could be used to
 * show a "you don't have permission" toast. We redirect rather than showing
 * a 403 page because Members shouldn't even know the route exists.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function AdminRoute() {
  const user = useAuthStore((s) => s.user);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace state={{ message: 'Admin access required' }} />;
  }

  return <Outlet />;
}
