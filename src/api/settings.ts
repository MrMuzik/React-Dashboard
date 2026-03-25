/**
 * Simulated Settings API.
 *
 * Provides fetch and update operations for user settings.
 * The settings are server state (persisted preferences) so they're
 * managed through React Query rather than Zustand.
 *
 * Non-obvious: The mock settings are seeded from the current auth user on
 * first fetch, so a new signup sees their own name — not a hardcoded default.
 */
import type { UserSettings, User } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let mockSettings: UserSettings | null = null;

/** Seed settings from the authenticated user on first access */
function getOrCreateSettings(currentUser: User | null): UserSettings {
  if (!mockSettings) {
    mockSettings = {
      displayName: currentUser?.displayName ?? '',
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      role: currentUser?.role ?? 'member',
    };
  }
  return mockSettings;
}

export async function fetchUserSettings(currentUser: User | null): Promise<UserSettings> {
  await delay(400);
  return { ...getOrCreateSettings(currentUser) };
}

export async function updateUserSettings(
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  await delay(500);
  if (mockSettings) {
    mockSettings = { ...mockSettings, ...settings };
  }
  return { ...mockSettings! };
}

/** Reset mock settings on logout so a new user gets fresh defaults */
export function resetMockSettings(): void {
  mockSettings = null;
}
