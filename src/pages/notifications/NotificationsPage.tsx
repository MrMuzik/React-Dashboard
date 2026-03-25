/**
 * Notifications page — standalone view for all system notifications.
 *
 * Depends on: React Query (fetchNotifications) with query key ['notifications'].
 * Non-obvious: The query key ['notifications'] is shared with the dashboard's
 * notification widget. This is intentional — toggling read/unread here updates
 * the React Query cache, and because the dashboard widget reads from the same
 * cache entry, the change is reflected there automatically without refetching.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications } from '@/api/dashboard';
import { Card } from '@/components/ui/Card';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Notification } from '@/types';

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const notifQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  /**
   * Toggle read/unread by updating the React Query cache directly.
   * Because both this page and the dashboard notifications widget share
   * the ['notifications'] query key, changes here are immediately visible
   * on the dashboard — no prop drilling or separate state sync needed.
   */
  const toggleRead = (id: string) => {
    queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
      old?.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const unreadCount = notifQuery.data?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => {
              queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
                old?.map((n) => ({ ...n, isRead: true }))
              );
            }}
            className="rounded-md bg-surface-secondary px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors duration-200 hover:bg-surface-tertiary hover:text-gray-800"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifQuery.isLoading ? (
        <Card>
          <SkeletonList count={5} />
        </Card>
      ) : notifQuery.isError ? (
        <ErrorState message="Failed to load notifications" onRetry={() => notifQuery.refetch()} />
      ) : !notifQuery.data?.length ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <Card>
          <div className="space-y-2">
            {notifQuery.data.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 rounded-lg p-3 transition-colors duration-200 ${
                  notif.isRead ? 'bg-surface' : 'bg-brand-50'
                }`}
              >
                <NotifDot type={notif.type} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                  <p className="text-xs text-gray-500">{notif.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleRead(notif.id)}
                  className="flex-shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors duration-200 hover:bg-surface-tertiary hover:text-gray-700"
                >
                  {notif.isRead ? 'Mark unread' : 'Mark read'}
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function NotifDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    info: 'bg-brand-500',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-danger',
  };
  return (
    <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${colors[type]}`} />
  );
}
