/**
 * Status badge with Radix UI Tooltip for additional context.
 *
 * Radix UI's Tooltip primitive handles keyboard navigation and ARIA roles
 * automatically — hovering or focusing the badge shows context without
 * needing manual aria-describedby wiring or keydown listeners.
 */
import * as Tooltip from '@radix-ui/react-tooltip';
import type { ReviewStatus } from '@/types';

const statusConfig: Record<ReviewStatus, { label: string; className: string; tooltip: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning-light text-warning-dark',
    tooltip: 'Awaiting review',
  },
  approved: {
    label: 'Approved',
    className: 'bg-success-light text-success-dark',
    tooltip: 'Approved by reviewer',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-danger-light text-danger-dark',
    tooltip: 'Changes requested',
  },
};

interface StatusBadgeProps {
  status: ReviewStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-modal animate-fade-in"
            sideOffset={5}
          >
            {config.tooltip}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
