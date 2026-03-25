/**
 * Application sidebar navigation using Radix UI NavigationMenu.
 *
 * Radix UI's NavigationMenu primitive handles keyboard navigation and ARIA roles
 * automatically — arrow keys move focus between items, and the menu is announced
 * correctly to screen readers without manual role assignments.
 *
 * The sidebar collapse/expand animation uses Tailwind's transition utilities.
 * Animation is intentionally constrained to Tailwind utilities rather than a motion
 * library to keep the bundle small for an MVP, but a production app would likely
 * add Framer Motion once the component API is stable.
 *
 * ─── MOBILE ADAPTIVE BEHAVIOR ──────────────────────────────────────────
 * On screens < md (768px) the sidebar becomes a slide-over overlay.
 * When the overlay is open the main content area blurs and shows skeleton
 * placeholders so it's clear the content is not interactive. Selecting a
 * nav item auto-closes the overlay and reveals the freshly-loaded page.
 * ───────────────────────────────────────────────────────────────────────
 *
 * Non-obvious: Navigation items are split into two groups — primary items at the top
 * and secondary items (Settings) anchored to the bottom, just above the user section.
 *
 * Depends on: uiStore (sidebar collapsed state, mobileNavOpen), authStore (user role).
 */
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

/** Primary navigation — visible at the top of the sidebar */
const PRIMARY_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { id: 'review', label: 'Review & Approval', path: '/review', icon: '✅', adminOnly: true },
  { id: 'calendar', label: 'Calendar', path: '/calendar', icon: '📅' },
  { id: 'notifications', label: 'Notifications', path: '/notifications', icon: '🔔' },
];

/** Secondary navigation — anchored to the bottom, above user info */
const SECONDARY_NAV: NavItem[] = [
  { id: 'settings', label: 'Settings', path: '/settings', icon: '⚙️' },
];

function NavItemList({ items, collapsed, location, onNavigate }: {
  items: NavItem[];
  collapsed: boolean;
  location: { pathname: string };
  onNavigate: (path: string) => void;
}) {
  return (
    <NavigationMenu.List className="space-y-1">
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavigationMenu.Item key={item.id}>
            <NavigationMenu.Link
              active={isActive}
              onClick={() => onNavigate(item.path)}
              className={[
                'flex cursor-pointer items-center rounded-lg text-sm font-medium transition-colors duration-200',
                /*
                 * When collapsed the anchor must be exactly 48px (w-12) so the
                 * active highlight forms a centered rounded square. When expanded
                 * we restore horizontal padding and a gap for the label.
                 */
                collapsed
                  ? 'h-10 w-12 justify-center'
                  : 'gap-3 px-2.5 py-2',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-surface-tertiary hover:text-gray-900',
              ].join(' ')}
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-base">
                {item.icon}
              </span>
              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        );
      })}
    </NavigationMenu.List>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    queryClient.clear();
    logout();
  };

  /**
   * On mobile: close the overlay then navigate — the page underneath will
   * show loading skeletons briefly as React Query fetches fresh data.
   * On desktop: navigate immediately (sidebar stays visible).
   */
  const handleNavigate = (path: string) => {
    if (mobileNavOpen) {
      setMobileNavOpen(false);
    }
    navigate(path);
  };

  const visiblePrimary = PRIMARY_NAV.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <>
      {/* ── Mobile hamburger button (visible < md) ────────────────────── */}
      <button
        onClick={() => setMobileNavOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-surface shadow-card md:hidden"
        aria-label="Open navigation"
      >
        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Backdrop overlay (mobile only) ────────────────────────────── */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Sidebar panel ─────────────────────────────────────────────── */}
      <aside
        className={[
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out',
          // Desktop: always visible, width toggles between collapsed / expanded
          'max-md:translate-x-full',
          // Mobile: slide-over — translate based on mobileNavOpen
          mobileNavOpen ? 'max-md:!translate-x-0 max-md:w-72' : 'max-md:!-translate-x-full',
          // Desktop widths
          sidebarCollapsed ? 'md:w-sidebar-collapsed' : 'md:w-sidebar',
        ].join(' ')}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center border-b border-border px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              R
            </div>
            {/* Show text on mobile (always expanded) or desktop when not collapsed */}
            {(mobileNavOpen || !sidebarCollapsed) && (
              <span className="text-sm font-semibold text-gray-900 animate-fade-in">
                React Dashboard
              </span>
            )}
          </div>
          {/* Mobile close button */}
          {mobileNavOpen && (
            <button
              onClick={() => setMobileNavOpen(false)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-surface-tertiary hover:text-gray-600 md:hidden"
              aria-label="Close navigation"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Primary Navigation */}
        <NavigationMenu.Root orientation="vertical" className="flex-1 px-2 py-4">
          <NavItemList
            items={visiblePrimary}
            collapsed={!mobileNavOpen && sidebarCollapsed}
            location={location}
            onNavigate={handleNavigate}
          />
        </NavigationMenu.Root>

        {/* Secondary Navigation — anchored above user section */}
        <NavigationMenu.Root orientation="vertical" className="px-2 pb-2">
          <NavItemList
            items={SECONDARY_NAV}
            collapsed={!mobileNavOpen && sidebarCollapsed}
            location={location}
            onNavigate={handleNavigate}
          />
        </NavigationMenu.Root>

        {/* User section & collapse toggle */}
        <div className="border-t border-border p-3">
          {(mobileNavOpen || !sidebarCollapsed) && user && (
            <div className="mb-3 animate-fade-in">
              <p className="truncate text-sm font-medium text-gray-900">{user.displayName}</p>
              <p className="truncate text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Desktop-only collapse toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors duration-200 hover:bg-surface-tertiary hover:text-gray-600 md:flex"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            {(mobileNavOpen || !sidebarCollapsed) && (
              <button
                onClick={handleLogout}
                className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors duration-200 hover:bg-surface-tertiary hover:text-gray-700 animate-fade-in"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
