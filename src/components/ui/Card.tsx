/**
 * Card wrapper providing consistent elevation and spacing for dashboard widgets.
 * Depends on: Tailwind design tokens (shadow-card, surface colors).
 */
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  /** When provided, the title renders as a clickable link with hover styling */
  onTitleClick?: () => void;
  action?: ReactNode;
}

export function Card({ children, className = '', title, onTitleClick, action }: CardProps) {
  return (
    <div className={`rounded-lg border border-border bg-surface shadow-card transition-shadow duration-200 hover:shadow-card-hover ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          {title && (
            onTitleClick ? (
              <button
                onClick={onTitleClick}
                className="text-sm font-semibold text-gray-900 transition-colors duration-200 hover:text-brand-700"
              >
                {title} <span className="text-xs text-gray-400">→</span>
              </button>
            ) : (
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            )
          )}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
