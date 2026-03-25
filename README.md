# React Dashboard

A production-quality React dashboard that demonstrates real-world architecture: multiple screens, auth flows, role-based access, REST API integration, and polished responsive UI — built with TypeScript, Tailwind CSS v3, Zustand, React Query, and Radix UI.

---

## Getting Started

```bash
git clone https://github.com/<your-username>/react-dashboard.git
cd react-dashboard
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

**Demo credentials (pre-seeded mock accounts):**

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | `admin@example.com`    | `password` |
| Member | `member@example.com`   | `password` |

You can also sign up as a new user — new accounts go through the onboarding wizard before landing on the dashboard.

**Other commands:**

```bash
npm run build       # Production build
npm run typecheck   # tsc --noEmit (zero errors)
npm run preview     # Preview production build locally
```

---

## Project Overview

Everything below is cross-referenced to source code. Every architectural decision has an inline comment explaining the reasoning so the intent is clear without additional context.

---

### Key Screens

Each screen is a separate routed view using React Router v6.

| Screen | Route | What it demonstrates | Key file(s) |
|--------|-------|----------------------|-------------|
| **Auth (Login / Signup)** | `/auth` | Tab-toggled forms, simulated async login with 1s delay, inline validation with error states, Zustand auth store, redirect logic (new → onboarding, returning → dashboard) | `src/pages/auth/AuthPage.tsx` |
| **User Onboarding Flow** | `/onboarding` | 3-step wizard — (1) name + role, (2) role-specific welcome, (3) confirm + redirect. Skippable. State in Zustand with a comment explaining why this is client state, not server state. | `src/pages/onboarding/OnboardingPage.tsx`, `src/stores/onboardingStore.ts` |
| **Dashboard — Admin (Role A)** | `/dashboard` | Summary stats row (users, projects, reviews), recent activity feed, quick-actions panel. Each widget fetches independently via React Query. | `src/pages/dashboard/AdminDashboard.tsx` |
| **Dashboard — Member (Role B)** | `/dashboard` | Task progress bars, upcoming items list, notifications widget. Same layout shell, different widget composition based on role. | `src/pages/dashboard/MemberDashboard.tsx` |
| **Review & Approval** | `/review` | Admin-only. Pending items with title, submitter, date, status badge. Approve/Reject triggers **optimistic updates** via `useMutation` — UI updates instantly, React Query rolls back on failure. Detailed comment block explains the pattern. | `src/pages/review/ReviewPage.tsx` |
| **Calendar / Timeline** | `/calendar` | 2-week window (Monday → Sunday × 2), forward/backward nav by week. Date range drives the React Query cache key — navigating to a new window fetches fresh data, returning to a previous window hits cache instantly. Adaptive design: vertical card list below 1024px, 7-column grid above. | `src/pages/calendar/CalendarPage.tsx` |
| **Settings & Notifications** | `/settings`, `/notifications` | Settings: display name, email toggles, read-only role. Notifications: system notifications with read/unread toggle, shared React Query cache so toggling on the notifications page reflects on the dashboard widget. | `src/pages/settings/SettingsPage.tsx`, `src/pages/notifications/NotificationsPage.tsx` |
| **Empty / Error / Loading states** | Used on every screen | Three reusable components — `Skeleton.tsx` (animated pulse loader), `ErrorState.tsx` (message + retry), `EmptyState.tsx` (title + description + optional CTA). Each has a comment explaining why centralizing these ensures visual consistency and independent testability. | `src/components/ui/Skeleton.tsx`, `src/components/ui/ErrorState.tsx`, `src/components/ui/EmptyState.tsx` |

---

### Architecture in Practice

#### Responsive and adaptive layouts

- **Adaptive sidebar:** On desktop (≥768px) the sidebar is permanently visible and toggles between expanded (256px) and collapsed (72px) with animated transitions. On mobile (<768px) it becomes a slide-over overlay — opening it replaces the main content with skeleton placeholders so it's clear the page is non-interactive, and selecting a nav item auto-closes the overlay.
- **Adaptive calendar:** Below 1024px the calendar renders as a vertical scrollable list of day cards with full event details. Above 1024px it renders as the traditional 7-column grid. This is adaptive (different component structure), not just responsive (same structure squeezed).
- **Scroll restoration:** A `ScrollToTop` component resets scroll position on every route change so mobile routes always load at the top of the screen.
- **Mobile-first navigation controls:** Hamburger menu, compact nav buttons, stacked form layouts on small screens.

**Key files:** `src/components/layout/Sidebar.tsx`, `src/components/layout/DashboardLayout.tsx`, `src/pages/calendar/CalendarPage.tsx`, `src/components/routing/ScrollToTop.tsx`

#### API integration and data fetching

All data flows through a simulated API layer (`src/api/`) that returns typed Promises after realistic delays — the same interface pattern used with `fetch()` or Axios against a real backend.

- **React Query** handles every fetch: automatic caching, background refetching on window focus, loading/error state management, and cache invalidation after mutations.
- **Optimistic updates** on the Review screen — `useMutation` with `onMutate` snapshots previous state, updates the cache optimistically, and `onError` rolls back. The API has a 10% simulated failure rate so the rollback behavior is visible.
- **Date-driven cache keys** on the Calendar — `['calendar', 'events', startDate, endDate]` means each 2-week window is cached independently, so navigating between weeks is instant on return visits.
- **Shared query keys** — the notifications list on the dashboard and the notifications page both use `['notifications']`, so toggling read/unread on one reflects on the other.

**Key files:** `src/api/*.ts`, `src/lib/queryClient.ts`, `src/pages/review/ReviewPage.tsx`, `src/pages/calendar/CalendarPage.tsx`

#### State management (React Query + Zustand)

Two tools for two distinct concerns:

| Concern | Tool | Why |
|---------|------|-----|
| **Client state** — auth session, sidebar toggle, onboarding wizard progress | **Zustand** | Local UI concerns. No server to sync with, no staleness to manage, no cache invalidation needed. |
| **Server state** — dashboard data, review items, calendar events, notifications, settings | **React Query** | Remote data that can become stale, benefits from background refetching, and needs cache management for mutations. |

Using one tool for both creates awkward patterns: UI toggles in React Query produce unnecessary cache entries; API data in Zustand requires manually handling loading/error/stale states that React Query provides for free. The code comment in `src/lib/queryClient.ts` explains this in detail.

**Zustand stores:**

| Store | File | Holds |
|-------|------|-------|
| `authStore` | `src/stores/authStore.ts` | Current user, auth status, login/signup/logout actions |
| `uiStore` | `src/stores/uiStore.ts` | Sidebar collapsed state, mobile nav overlay state, active nav item |
| `onboardingStore` | `src/stores/onboardingStore.ts` | Wizard step, form data, completion flag (with comment explaining why this is Zustand not React Query) |

#### Auth flows and route protection

- **Login:** Simulated 1s async call → sets user in `authStore` → redirect to `/dashboard`.
- **Signup:** Validates all fields inline → creates user → sets `isNewUser` flag → redirects to `/onboarding`.
- **Onboarding:** 3-step wizard tracked in `onboardingStore`. Completing or skipping redirects to `/dashboard`.
- **Role-based routing:** `ProtectedRoute` wrapper checks `authStore.isAuthenticated` → redirects to `/auth`. `AdminRoute` wrapper checks `user.role === 'admin'` → redirects Members to `/dashboard`.
- **Logout:** Clears `authStore`, resets mock settings, and calls `queryClient.clear()` to purge the entire React Query cache so the next user doesn't see stale data.

**Key files:** `src/components/routing/ProtectedRoute.tsx`, `src/components/routing/AdminRoute.tsx`, `src/stores/authStore.ts`

#### Polished UI: transitions, skeletons, accessibility

- **Transitions:** All interactive state changes use Tailwind's `transition`, `duration-200`, and `ease-in-out` utilities. Sidebar collapse/expand animates width. Route changes fade in via `animate-fade-in`. A comment in the codebase notes that animations are constrained to Tailwind utilities to keep the bundle small, but a production app would add Framer Motion once the component API is stable.
- **Skeletons:** `Skeleton.tsx` uses Tailwind's `animate-pulse`. Preset components (`SkeletonCard`, `SkeletonList`) ensure loading states are consistent and look like the content they replace.
- **Accessibility:** All interactive primitives use Radix UI, which handles keyboard navigation (arrow keys, Enter, Escape), focus trapping, and ARIA roles automatically:
  - `@radix-ui/react-tabs` — Auth toggle, Settings tabs
  - `@radix-ui/react-dialog` — Review confirmation modals
  - `@radix-ui/react-tooltip` — Status badge tooltips
  - `@radix-ui/react-navigation-menu` — Sidebar navigation

---

### What the Code Covers

#### Tailwind CSS and design systems

A custom design token set in `tailwind.config.ts` drives all visual styling — semantic color names (`brand-600`, `surface-secondary`, `danger-light`), custom spacing (`sidebar`, `sidebar-collapsed`), shadows (`card`, `card-hover`, `modal`), and font sizing with explicit line heights. There are zero CSS files; everything is Tailwind utility classes. The calendar switches component structure at `lg` (1024px) and the sidebar switches interaction model at `md` (768px). Custom keyframe animations (`fadeIn`, `slideIn`) are defined in the Tailwind config and applied via `animate-*` classes.

**Key file:** `tailwind.config.ts`

#### Dashboards and workflow tools

Two role-specific dashboards with independent data-fetching widgets, a review/approval workflow with optimistic updates, a calendar with date-driven caching, and a settings page that syncs display name changes back to the sidebar in real time. The application handles the full lifecycle: unauthenticated → login → onboarding → role-based dashboard → workflows → settings → logout.

#### Component architecture and state boundaries

Every component file starts with a comment block — one-sentence description, which stores or queries it depends on, and any non-obvious decisions. Small reusable primitives (`Card`, `Skeleton`, `ErrorState`, `EmptyState`, `StatusBadge`) compose into screen-level widgets, which compose into page layouts. State boundaries between Zustand and React Query are explicit, with comments at each boundary explaining why a given piece of state lives where it does.

#### TypeScript and code quality

All interfaces live in `src/types/index.ts` — zero `any` types, passes `tsc --noEmit` with no errors. All API functions in `src/api/` return typed Promises — swap the mock for a real `fetch()` call and the types still hold. A Figma-to-code workflow is documented as a code comment in `DashboardLayout.tsx`, covering the process of extracting design tokens before writing components, building bottom-up from primitives, and mapping Figma Auto Layout to Tailwind flex/grid.

---

## Directory Structure

```
src/
├── api/                  # Simulated REST API layer (typed Promises with delays)
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── review.ts
│   ├── calendar.ts
│   ├── notifications.ts
│   └── settings.ts
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx   # Shared shell — sidebar + content + mobile skeleton overlay
│   │   └── Sidebar.tsx           # Radix NavigationMenu, adaptive mobile/desktop behavior
│   ├── routing/
│   │   ├── ProtectedRoute.tsx    # Auth guard
│   │   ├── AdminRoute.tsx        # Role guard
│   │   └── ScrollToTop.tsx       # Scroll reset on route change
│   └── ui/
│       ├── Card.tsx
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       ├── Skeleton.tsx
│       └── StatusBadge.tsx
├── hooks/                # Custom hooks
├── lib/
│   └── queryClient.ts    # React Query config with state architecture comments
├── pages/
│   ├── auth/
│   ├── onboarding/
│   ├── dashboard/        # AdminDashboard.tsx + MemberDashboard.tsx
│   ├── review/
│   ├── calendar/
│   ├── notifications/
│   └── settings/
├── stores/               # Zustand stores (authStore, uiStore, onboardingStore)
├── types/                # All TypeScript interfaces
├── App.tsx               # Route definitions
└── main.tsx              # Entry point
```

## Tech Stack

| Library | Purpose |
|---------|---------|
| React 19 | UI framework |
| TypeScript 5.x | Type safety |
| Vite 5 | Build tool and dev server |
| Tailwind CSS 3 | Utility-first styling with custom design tokens |
| Zustand 5 | Client state management |
| React Query 5 | Server state management |
| React Router 7 | Client-side routing |
| Radix UI | Accessible UI primitives (tabs, dialogs, tooltips, navigation) |
| date-fns 4 | Date manipulation for the calendar view |
