/**
 * Dashboard router that renders Admin or Member dashboard based on the user's role.
 *
 * Depends on: authStore (user role).
 * Non-obvious: Both dashboards share the DashboardLayout shell (sidebar + main area)
 * but render completely different widget compositions. This component acts as the
 * role-based switch point.
 */
import { useAuthStore } from '@/stores/authStore';
import { AdminDashboard } from './AdminDashboard';
import { MemberDashboard } from './MemberDashboard';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <MemberDashboard />;
}
