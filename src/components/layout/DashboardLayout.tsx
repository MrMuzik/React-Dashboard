/**
 * Main dashboard layout shell shared by all authenticated screens.
 *
 * Depends on: uiStore (sidebar collapsed state for main content offset).
 * Non-obvious: The padding-left transition matches the sidebar width transition
 * so the content slides smoothly when the sidebar collapses.
 *
 * ─── FIGMA-TO-CODE WORKFLOW ──────────────────────────────────────────────
 *
 * When implementing components from Figma designs, I follow this process:
 *
 * 1. IDENTIFY COMPONENT BOUNDARIES: Walk the Figma layer tree top-down and
 *    group layers into reusable components. A group becomes a component when
 *    it appears more than once OR has distinct interactive states. This maps
 *    directly to React's composition model — each Figma component becomes a
 *    React component with props matching the Figma variants.
 *
 * 2. EXTRACT DESIGN TOKENS FIRST: Before writing any component code, pull
 *    colors, spacing, typography, radii, and shadows from Figma's design
 *    tokens (or Variables in newer Figma) into tailwind.config.ts. This
 *    ensures the Tailwind utility classes in components reference semantic
 *    token names (e.g., `bg-brand-600`) rather than raw hex values. If the
 *    designer changes the brand color, you update one line in the config.
 *
 * 3. BUILD BOTTOM-UP FROM PRIMITIVES: Start with the smallest UI elements
 *    (buttons, badges, inputs) and compose them into larger patterns (cards,
 *    list items, form groups), then into full page sections. This mirrors
 *    atomic design and ensures each piece is testable in isolation.
 *
 * 4. MAP FIGMA LAYOUT TO TAILWIND: Figma's Auto Layout directly translates
 *    to Tailwind's flex/grid utilities:
 *    - Figma "Horizontal" auto-layout → `flex flex-row`
 *    - Figma "Vertical" auto-layout → `flex flex-col`
 *    - Figma "Fill container" → `flex-1` or `w-full`
 *    - Figma "Hug contents" → `w-fit` (default flex behavior)
 *    - Figma spacing between items → `gap-{n}`
 *    - Figma padding → `p-{n}` / `px-{n}` / `py-{n}`
 *    - Figma "Grid layout" → `grid grid-cols-{n}`
 *
 * 5. HANDLE RESPONSIVE BREAKPOINTS: Figma designs are typically static at
 *    one viewport width. I define Tailwind breakpoints that match the Figma
 *    artboard sizes, then use responsive prefixes (md:, lg:) to adjust
 *    layouts for smaller screens.
 *
 * This workflow ensures the coded result matches the design pixel-for-pixel
 * while keeping the codebase maintainable through token-driven styling.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUIStore } from '@/stores/uiStore';

/**
 * Mobile skeleton placeholder shown while the sidebar overlay is open.
 * This communicates that the page behind is not interactive and will
 * "reload" once a navigation item is selected.
 */
function MobileLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton height="2rem" width="60%" />
      <Skeleton height="1rem" width="40%" />
      <div className="space-y-4 pt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height="6rem" className="rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height="5rem" className="rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar />
      <main
        className={[
          'min-h-screen transition-all duration-300 ease-in-out',
          // Desktop: offset by sidebar width
          sidebarCollapsed ? 'md:pl-sidebar-collapsed' : 'md:pl-sidebar',
          // Mobile: no left padding (sidebar is an overlay), add top padding for hamburger
          'pl-0 pt-14 md:pt-0',
        ].join(' ')}
      >
        {/*
          When the mobile nav overlay is open, swap real content for skeleton
          placeholders. This makes it clear the page is non-interactive while
          navigating, and the fresh page animates in after selection.
        */}
        {mobileNavOpen ? (
          <div className="md:hidden">
            <MobileLoadingSkeleton />
          </div>
        ) : null}

        <div className={`animate-fade-in p-6 ${mobileNavOpen ? 'hidden md:block' : ''}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
