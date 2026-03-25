/**
 * Reusable error state component.
 *
 * Centralizing error states ensures visual consistency and makes them independently
 * testable. Every screen that fetches data uses this component in its error state
 * rather than inline error JSX. The optional retry callback enables one-click
 * recovery without forcing the user to refresh the page.
 */

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-danger/20 bg-danger-light/50 px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-light">
        <svg className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="mb-4 text-sm text-danger-dark">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-danger-dark"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
