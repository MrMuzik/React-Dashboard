/**
 * Admin dashboard showing summary stats, activity feed, and quick actions.
 *
 * Depends on: React Query (fetchSummaryStats, fetchActivityFeed, fetchQuickActions).
 * Non-obvious: Each widget fetches its data independently via React Query so they
 * load and cache separately. This means the stats row can display while the activity
 * feed is still loading, providing a faster perceived load time.
 */
import { useQuery } from '@tanstack/react-query';
import { fetchSummaryStats, fetchActivityFeed, fetchQuickActions } from '@/api/dashboard';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export function AdminDashboard() {
  const stats = useQuery({ queryKey: ['admin', 'stats'], queryFn: fetchSummaryStats });
  const activity = useQuery({ queryKey: ['admin', 'activity'], queryFn: fetchActivityFeed });
  const actions = useQuery({ queryKey: ['admin', 'quickActions'], queryFn: fetchQuickActions });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your workspace</p>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-surface p-5 shadow-card">
                <Skeleton height="0.75rem" width="60%" className="mb-2" />
                <Skeleton height="1.5rem" width="40%" />
              </div>
            ))}
          </>
        ) : stats.isError ? (
          <div className="col-span-3">
            <ErrorState message="Failed to load statistics" onRetry={() => stats.refetch()} />
          </div>
        ) : stats.data ? (
          <>
            <StatCard label="Total Users" value={stats.data.totalUsers.toLocaleString()} accent="brand" />
            <StatCard label="Active Projects" value={stats.data.activeProjects.toString()} accent="success" />
            <StatCard label="Pending Reviews" value={stats.data.pendingReviews.toString()} accent="warning" />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity Feed */}
        <Card title="Recent Activity">
          {activity.isLoading ? (
            <SkeletonList count={5} />
          ) : activity.isError ? (
            <ErrorState message="Failed to load activity feed" onRetry={() => activity.refetch()} />
          ) : !activity.data?.length ? (
            <EmptyState title="No recent activity" description="Activity from your team will appear here" />
          ) : (
            <div className="space-y-3">
              {activity.data.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
                    {item.user.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="text-gray-900">
                      <span className="font-medium">{item.user}</span>{' '}
                      {item.action}{' '}
                      <span className="font-medium">{item.target}</span>
                    </p>
                    <p className="text-xs text-gray-500">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          {actions.isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height="5rem" className="rounded-lg" />
              ))}
            </div>
          ) : actions.isError ? (
            <ErrorState message="Failed to load actions" onRetry={() => actions.refetch()} />
          ) : !actions.data?.length ? (
            <EmptyState title="No actions available" description="Quick actions will be configured by your admin" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {actions.data.map((action) => (
                <button
                  key={action.id}
                  className="rounded-lg border border-border p-4 text-left transition-all duration-200 hover:border-brand-300 hover:shadow-card-hover"
                >
                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{action.description}</p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  const accentClasses: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-success-light text-success-dark',
    warning: 'bg-warning-light text-warning-dark',
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${accentClasses[accent]}`}>
        Active
      </div>
    </div>
  );
}
