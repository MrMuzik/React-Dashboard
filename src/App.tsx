/**
 * Application root — defines all routes and wraps providers.
 *
 * Route structure:
 * - /auth          → public, login/signup screen
 * - /onboarding    → protected, 3-step wizard for new users
 * - /dashboard     → protected, role-based (Admin or Member dashboard)
 * - /review        → protected + admin-only, review & approval interface
 * - /calendar      → protected, calendar & timeline view
 * - /notifications → protected, system notifications with read/unread toggling
 * - /settings      → protected, account settings and preferences
 *
 * Non-obvious: Route transitions use a simple fade via Tailwind's animate-fade-in
 * on the DashboardLayout's <Outlet /> wrapper. This keeps the bundle small compared
 * to adding a full animation library like Framer Motion for route transitions alone.
 */
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ScrollToTop } from '@/components/routing/ScrollToTop';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { AdminRoute } from '@/components/routing/AdminRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthPage } from '@/pages/auth/AuthPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ReviewPage } from '@/pages/review/ReviewPage';
import { CalendarPage } from '@/pages/calendar/CalendarPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/*
        HashRouter is used instead of BrowserRouter for GitHub Pages compatibility.
        GitHub Pages serves static files and can't rewrite URLs to index.html, so
        /dashboard would 404 on a hard refresh. HashRouter uses /#/dashboard which
        works on any static host without server-side configuration.
      */}
      <HashRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected routes — require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Dashboard layout shell — sidebar + main content area */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Admin-only routes — Members are redirected to /dashboard */}
              <Route element={<AdminRoute />}>
                <Route path="/review" element={<ReviewPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}
