/**
 * Simulated Review & Approval API.
 *
 * The updateReviewStatus function simulates a server-side status change.
 * It has a small random failure chance (~10%) to demonstrate React Query's
 * optimistic update rollback behavior in the UI.
 */
import type { ReviewItem, ReviewStatus } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchReviewItems(): Promise<ReviewItem[]> {
  await delay(600);
  return [
    { id: '1', title: 'Q4 Marketing Budget', submitterName: 'Sarah Chen', submissionDate: '2024-12-15', status: 'pending', description: 'Annual marketing budget proposal for Q4' },
    { id: '2', title: 'New Hire Onboarding Doc', submitterName: 'James Wilson', submissionDate: '2024-12-14', status: 'pending', description: 'Updated onboarding documentation for engineering' },
    { id: '3', title: 'API Rate Limiting Proposal', submitterName: 'Maria Garcia', submissionDate: '2024-12-13', status: 'pending', description: 'Proposal to implement rate limiting on public APIs' },
    { id: '4', title: 'Design System v2 Spec', submitterName: 'David Park', submissionDate: '2024-12-12', status: 'approved', description: 'Complete design system overhaul specification' },
    { id: '5', title: 'Security Patch Release Notes', submitterName: 'Lisa Thompson', submissionDate: '2024-12-11', status: 'rejected', description: 'Release notes for critical security patches' },
  ];
}

export async function updateReviewStatus(
  itemId: string,
  newStatus: ReviewStatus
): Promise<ReviewItem> {
  await delay(800);

  /* Simulate occasional server failures to demonstrate optimistic update rollback */
  if (Math.random() < 0.1) {
    throw new Error('Server error: please try again');
  }

  const items = await fetchReviewItems();
  const item = items.find((i) => i.id === itemId);
  if (!item) throw new Error('Review item not found');

  return { ...item, status: newStatus };
}
