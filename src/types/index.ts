/**
 * Central type definitions for the application.
 *
 * All interfaces live here so that components, stores, and API functions
 * share a single source of truth. This prevents type drift where a component
 * expects a shape that the API no longer returns.
 */

/* ─── Auth & User ──────────────────────────────────────────────────────── */

export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  isNewUser: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateDisplayName: (name: string) => void;
}

/* ─── Onboarding ───────────────────────────────────────────────────────── */

export type OnboardingStep = 1 | 2 | 3;

export interface OnboardingState {
  currentStep: OnboardingStep;
  userName: string;
  rolePreference: UserRole | null;
  isCompleted: boolean;
  setStep: (step: OnboardingStep) => void;
  setUserName: (name: string) => void;
  setRolePreference: (role: UserRole) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  reset: () => void;
}

/* ─── UI State ─────────────────────────────────────────────────────────── */

export interface UIState {
  sidebarCollapsed: boolean;
  activeNavItem: string;
  /** True when the mobile sidebar overlay is open and animating closed */
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setActiveNavItem: (item: string) => void;
  setMobileNavOpen: (open: boolean) => void;
}

/* ─── Dashboard Data ───────────────────────────────────────────────────── */

export interface SummaryStats {
  totalUsers: number;
  activeProjects: number;
  pendingReviews: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
}

/* ─── Member Dashboard ─────────────────────────────────────────────────── */

export interface TaskProgress {
  id: string;
  title: string;
  progress: number;
  status: 'in-progress' | 'completed' | 'blocked';
  dueDate: string;
}

export interface UpcomingItem {
  id: string;
  title: string;
  type: 'meeting' | 'deadline' | 'review';
  date: string;
  time?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}

/* ─── Review & Approval ────────────────────────────────────────────────── */

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewItem {
  id: string;
  title: string;
  submitterName: string;
  submissionDate: string;
  status: ReviewStatus;
  description?: string;
}

/* ─── Calendar ─────────────────────────────────────────────────────────── */

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  description?: string;
}

/* ─── Settings ─────────────────────────────────────────────────────────── */

export interface UserSettings {
  displayName: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  role: UserRole;
}
