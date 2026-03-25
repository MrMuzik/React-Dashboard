/**
 * Member dashboard showing personal task progress, upcoming items, and notifications.
 *
 * Depends on: React Query (fetchTaskProgress, fetchUpcomingItems, fetchNotifications).
 * Non-obvious: Same independent-fetch pattern as AdminDashboard — each widget loads
 * independently so the fastest widget renders first.
 */
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchTaskProgress, fetchUpcomingItems, fetchNotifications } from '@/api/dashboard';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_COLORS: Record<string, string> = {
  'in-progress': 'bg-brand-500',
  completed: 'bg-success',
  blocked: 'bg-danger',
};

const TYPE_ICONS: Record<string, string> = {
  meeting: '📅',
  deadline: '⏰',
  review: '👁️',
};

export function MemberDashboard() {
  const navigate = useNavigate();
  const tasks = useQuery({ queryKey: ['member', 'tasks'], queryFn: fetchTaskProgress });
  const upcoming = useQuery({ queryKey: ['member', 'upcoming'], queryFn: fetchUpcomingItems });
  /**
   * Query key is ['notifications'] — NOT ['member', 'notifications'].
   * This shares the cache with the standalone NotificationsPage so toggling
   * read/unread there is immediately reflected here, and vice versa.
   */
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500">Your personal workspace overview</p>
      </div>

      {/* Task Progress */}
      <Card title="Task Progress">
        {tasks.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton height="0.75rem" width="60%" />
                <Skeleton height="0.5rem" width="100%" />
              </div>
            ))}
          </div>
        ) : tasks.isError ? (
          <ErrorState message="Failed to load tasks" onRetry={() => tasks.refetch()} />
        ) : !tasks.data?.length ? (
          <EmptyState title="No tasks yet" description="Tasks assigned to you will appear here" />
        ) : (
          <div className="space-y-4">
            {tasks.data.map((task) => (
              <div key={task.id}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <span className="text-xs text-gray-500 capitalize">{task.status.replace('-', ' ')}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[task.status]}`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Items — title links to today's view on the calendar */}
        <Card title="Upcoming" onTitleClick={() => navigate('/calendar')}>
          {upcoming.isLoading ? (
            <SkeletonList count={4} />
          ) : upcoming.isError ? (
            <ErrorState message="Failed to load upcoming items" onRetry={() => upcoming.refetch()} />
          ) : !upcoming.data?.length ? (
            <EmptyState title="Nothing upcoming" description="Your upcoming meetings and deadlines will appear here" />
          ) : (
            <div className="space-y-3">
              {upcoming.data.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg bg-surface-secondary p-3">
                  <span className="text-lg">{TYPE_ICONS[item.type]}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.date}{item.time ? ` at ${item.time}` : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-xs text-gray-600 capitalize">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notifications Widget — title links to the full notifications page */}
        <Card title="Notifications" onTitleClick={() => navigate('/notifications')}>
          {notifications.isLoading ? (
            <SkeletonList count={4} />
          ) : notifications.isError ? (
            <ErrorState message="Failed to load notifications" onRetry={() => notifications.refetch()} />
          ) : !notifications.data?.length ? (
            <EmptyState title="No notifications" description="You're all caught up!" />
          ) : (
            <div className="space-y-2">
              {notifications.data.slice(0, 4).map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 rounded-lg p-3 transition-colors duration-200 ${
                    notif.isRead ? 'bg-surface' : 'bg-brand-50'
                  }`}
                >
                  <NotifIcon type={notif.type} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function NotifIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    info: 'bg-brand-100 text-brand-600',
    success: 'bg-success-light text-success-dark',
    warning: 'bg-warning-light text-warning-dark',
    error: 'bg-danger-light text-danger-dark',
  };

  return (
    <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${colors[type]}`}>
      <div className="h-2 w-2 rounded-full bg-current" />
    </div>
  );
}
