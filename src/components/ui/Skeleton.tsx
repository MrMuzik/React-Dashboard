/**
 * Animated skeleton loader for loading states.
 *
 * Centralizing skeleton loaders into a single component ensures visual consistency
 * across all loading states and makes them independently testable. Every screen
 * that fetches data uses this component rather than inline placeholder JSX.
 *
 * Uses Tailwind's animate-pulse utility for the shimmer effect.
 */

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ width, height, className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading..."
    />
  );
}

/** Pre-composed skeleton for a card with title and content lines */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-3 rounded-lg border border-border bg-surface p-4 ${className}`}>
      <Skeleton height="1rem" width="60%" />
      <Skeleton height="0.75rem" width="100%" />
      <Skeleton height="0.75rem" width="80%" />
    </div>
  );
}

/** Pre-composed skeleton for a list of items */
export function SkeletonList({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton width="2rem" height="2rem" className="rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton height="0.75rem" width="70%" />
            <Skeleton height="0.625rem" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}
