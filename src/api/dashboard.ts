/**
 * Simulated dashboard API functions.
 *
 * Each function returns a Promise that resolves after a realistic delay (300-800ms)
 * to simulate network conditions. The typed return values ensure React Query
 * consumers get full type inference without manual generics.
 */
import type {
  SummaryStats,
  ActivityItem,
  QuickAction,
  TaskProgress,
  UpcomingItem,
  Notification,
} from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ─── Admin Dashboard API ──────────────────────────────────────────────── */

export async function fetchSummaryStats(): Promise<SummaryStats> {
  await delay(600);
  return {
    totalUsers: 1284,
    activeProjects: 42,
    pendingReviews: 7,
  };
}

export async function fetchActivityFeed(): Promise<ActivityItem[]> {
  await delay(500);
  return [
    { id: '1', user: 'Sarah Chen', action: 'submitted', target: 'Q4 Budget Report', timestamp: '2 minutes ago' },
    { id: '2', user: 'James Wilson', action: 'approved', target: 'Design System Update', timestamp: '15 minutes ago' },
    { id: '3', user: 'Maria Garcia', action: 'commented on', target: 'API Migration Plan', timestamp: '1 hour ago' },
    { id: '4', user: 'David Park', action: 'created', target: 'New Onboarding Flow', timestamp: '2 hours ago' },
    { id: '5', user: 'Lisa Thompson', action: 'completed', target: 'Security Audit', timestamp: '3 hours ago' },
  ];
}

export async function fetchQuickActions(): Promise<QuickAction[]> {
  await delay(300);
  return [
    { id: '1', label: 'Create Project', description: 'Start a new project workspace', icon: 'plus' },
    { id: '2', label: 'Invite Member', description: 'Add a team member to the org', icon: 'user-plus' },
    { id: '3', label: 'Generate Report', description: 'Export analytics data', icon: 'chart' },
    { id: '4', label: 'Review Queue', description: 'Process pending approvals', icon: 'check' },
  ];
}

/* ─── Member Dashboard API ─────────────────────────────────────────────── */

export async function fetchTaskProgress(): Promise<TaskProgress[]> {
  await delay(500);
  return [
    { id: '1', title: 'Update user documentation', progress: 75, status: 'in-progress', dueDate: '2024-12-20' },
    { id: '2', title: 'Fix login page responsive layout', progress: 100, status: 'completed', dueDate: '2024-12-15' },
    { id: '3', title: 'API integration tests', progress: 30, status: 'in-progress', dueDate: '2024-12-22' },
    { id: '4', title: 'Database migration script', progress: 0, status: 'blocked', dueDate: '2024-12-25' },
  ];
}

export async function fetchUpcomingItems(): Promise<UpcomingItem[]> {
  await delay(400);
  return [
    { id: '1', title: 'Sprint Planning', type: 'meeting', date: '2024-12-18', time: '10:00 AM' },
    { id: '2', title: 'Design Review Deadline', type: 'deadline', date: '2024-12-19' },
    { id: '3', title: 'Code Review: Auth Module', type: 'review', date: '2024-12-20', time: '2:00 PM' },
    { id: '4', title: 'Team Standup', type: 'meeting', date: '2024-12-18', time: '9:00 AM' },
  ];
}

export async function fetchNotifications(): Promise<Notification[]> {
  await delay(350);
  return [
    { id: '1', title: 'New comment', message: 'Sarah left a comment on your PR', type: 'info', isRead: false, createdAt: '2024-12-17T14:30:00Z' },
    { id: '2', title: 'Build succeeded', message: 'CI pipeline completed for main branch', type: 'success', isRead: false, createdAt: '2024-12-17T13:00:00Z' },
    { id: '3', title: 'Review requested', message: 'James requested your review on Auth Module', type: 'warning', isRead: true, createdAt: '2024-12-17T11:00:00Z' },
    { id: '4', title: 'Deployment failed', message: 'Staging deployment failed — check logs', type: 'error', isRead: true, createdAt: '2024-12-16T16:00:00Z' },
    { id: '5', title: 'Welcome!', message: 'You have been added to the Dashboard project', type: 'info', isRead: true, createdAt: '2024-12-15T10:00:00Z' },
  ];
}
