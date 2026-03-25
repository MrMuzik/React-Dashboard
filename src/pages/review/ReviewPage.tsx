/**
 * Review & Approval interface for Admin users.
 *
 * Depends on: React Query (fetchReviewItems, updateReviewStatus).
 * Non-obvious: Uses optimistic updates via React Query's useMutation hook.
 *
 * ─── OPTIMISTIC UPDATES EXPLAINED ────────────────────────────────────────
 *
 * Optimistic updates improve perceived performance by immediately updating the UI
 * before the server confirms the change. Here's how the pattern works:
 *
 * 1. When the user clicks Approve or Reject, we update the React Query cache
 *    instantly (onMutate) so the status badge changes immediately.
 *
 * 2. The actual API call runs in the background. If it succeeds, the cache already
 *    has the correct data — no additional UI update is needed.
 *
 * 3. If the mutation FAILS, React Query automatically rolls back to the previous
 *    cache snapshot that we saved in onMutate. The user sees the status revert
 *    to its original value, and we show an error toast.
 *
 * 4. onSettled always runs (success or failure) and invalidates the query to ensure
 *    the cache re-syncs with the server's actual state.
 *
 * This pattern is ideal for actions where the success rate is high (>95%) and the
 * user benefits from instant feedback. Without optimistic updates, every click
 * would show a spinner for 500-800ms before the UI changed.
 * ──────────────────────────────────────────────────────────────────────────
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { fetchReviewItems, updateReviewStatus } from '@/api/review';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ReviewItem, ReviewStatus } from '@/types';

export function ReviewPage() {
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{
    item: ReviewItem;
    action: ReviewStatus;
  } | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const reviewQuery = useQuery({
    queryKey: ['review', 'items'],
    queryFn: fetchReviewItems,
  });

  const mutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: ReviewStatus }) =>
      updateReviewStatus(itemId, status),

    /* Save current cache state before optimistic update */
    onMutate: async ({ itemId, status }) => {
      setMutationError(null);
      await queryClient.cancelQueries({ queryKey: ['review', 'items'] });

      const previousItems = queryClient.getQueryData<ReviewItem[]>(['review', 'items']);

      /* Optimistically update the item's status in the cache */
      queryClient.setQueryData<ReviewItem[]>(['review', 'items'], (old) =>
        old?.map((item) =>
          item.id === itemId ? { ...item, status } : item
        )
      );

      return { previousItems };
    },

    /* Rollback on failure using the saved snapshot */
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['review', 'items'], context.previousItems);
      }
      setMutationError('Action failed — the change was reverted. Please try again.');
    },

    /* Always re-sync with server regardless of outcome */
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['review', 'items'] });
    },
  });

  const handleAction = (item: ReviewItem, action: ReviewStatus) => {
    setConfirmDialog({ item, action });
  };

  const confirmAction = () => {
    if (!confirmDialog) return;
    mutation.mutate({
      itemId: confirmDialog.item.id,
      status: confirmDialog.action,
    });
    setConfirmDialog(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review & Approval</h1>
        <p className="text-sm text-gray-500">Process pending submissions</p>
      </div>

      {mutationError && (
        <div className="rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark animate-fade-in">
          {mutationError}
        </div>
      )}

      <Card>
        {reviewQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex-1 space-y-2">
                  <Skeleton height="0.875rem" width="50%" />
                  <Skeleton height="0.75rem" width="30%" />
                </div>
                <Skeleton height="1.5rem" width="4rem" className="rounded-full" />
              </div>
            ))}
          </div>
        ) : reviewQuery.isError ? (
          <ErrorState message="Failed to load review items" onRetry={() => reviewQuery.refetch()} />
        ) : !reviewQuery.data?.length ? (
          <EmptyState title="No items to review" description="Submitted items will appear here for your approval" />
        ) : (
          <div className="divide-y divide-border">
            {reviewQuery.data.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Submitted by {item.submitterName} on {item.submissionDate}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-xs text-gray-400">{item.description}</p>
                  )}
                </div>

                <StatusBadge status={item.status} />

                {item.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(item, 'approved')}
                      disabled={mutation.isPending}
                      className="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-success-dark disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(item, 'rejected')}
                      disabled={mutation.isPending}
                      className="rounded-md bg-danger px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-danger-dark disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Radix Dialog for confirmation — handles focus trap and ARIA automatically */}
      <Dialog.Root open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-modal animate-fade-in focus:outline-none">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Confirm {confirmDialog?.action === 'approved' ? 'Approval' : 'Rejection'}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Are you sure you want to {confirmDialog?.action === 'approved' ? 'approve' : 'reject'}{' '}
              &ldquo;{confirmDialog?.item.title}&rdquo;? This action can be undone later.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="rounded-md border border-border px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-surface-tertiary">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={confirmAction}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors duration-200 ${
                  confirmDialog?.action === 'approved'
                    ? 'bg-success hover:bg-success-dark'
                    : 'bg-danger hover:bg-danger-dark'
                }`}
              >
                {confirmDialog?.action === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
