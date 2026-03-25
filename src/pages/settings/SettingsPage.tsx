/**
 * Settings page — account preferences and profile configuration.
 *
 * Depends on: React Query (fetchUserSettings, updateUserSettings),
 *             authStore (user role for read-only role field, display name sync).
 * Non-obvious: Notifications were intentionally moved to their own top-level route
 * (/notifications) so they're accessible from the sidebar and dashboard. Settings
 * is now a focused account-management screen without tab navigation.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserSettings, updateUserSettings } from '@/api/settings';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account and preferences</p>
      </div>

      <SettingsForm />
    </div>
  );
}

function SettingsForm() {
  const user = useAuthStore((s) => s.user);
  const updateDisplayName = useAuthStore((s) => s.updateDisplayName);
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  /**
   * The query key includes the user ID so each user gets their own cache entry.
   * Without this, logging out as User A and in as User B would serve User A's
   * stale cached settings before the background refetch completes — causing
   * the form to briefly (or permanently) show the wrong display name.
   */
  const settingsQuery = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: () => fetchUserSettings(user),
  });

  const [localName, setLocalName] = useState('');
  const [localEmail, setLocalEmail] = useState(true);
  const [localPush, setLocalPush] = useState(false);
  const [localDigest, setLocalDigest] = useState(true);

  /**
   * Re-seed the form whenever the query data changes AND the user changes.
   * We track the last-seeded user ID so that:
   *  - Switching users always re-seeds the form with the new user's settings.
   *  - A background refetch for the *same* user does NOT clobber in-progress edits.
   */
  const [seededForUserId, setSeededForUserId] = useState<string | null>(null);

  if (settingsQuery.data && seededForUserId !== user?.id) {
    setLocalName(settingsQuery.data.displayName);
    setLocalEmail(settingsQuery.data.emailNotifications);
    setLocalPush(settingsQuery.data.pushNotifications);
    setLocalDigest(settingsQuery.data.weeklyDigest);
    setSeededForUserId(user?.id ?? null);
  }

  const updateMutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: (data) => {
      /**
       * Sync the display name to authStore so the sidebar updates immediately.
       * We do this BEFORE invalidating the query so there's no flash of stale
       * data — the sidebar reads from Zustand, not React Query.
       */
      updateDisplayName(data.displayName);
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      displayName: localName,
      emailNotifications: localEmail,
      pushNotifications: localPush,
      weeklyDigest: localDigest,
    });
  };

  if (settingsQuery.isLoading) {
    return (
      <Card>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton height="0.75rem" width="30%" />
              <Skeleton height="2.25rem" width="100%" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (settingsQuery.isError) {
    return <ErrorState message="Failed to load settings" onRetry={() => settingsQuery.refetch()} />;
  }

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-gray-700">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
          <input
            type="text"
            value={user?.role || 'member'}
            readOnly
            className="w-full cursor-not-allowed rounded-md border border-border bg-surface-tertiary px-3 py-2 text-sm text-gray-500 capitalize"
          />
          <p className="mt-1 text-xs text-gray-400">Role is managed by your organization admin</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Email Preferences</p>
          <Toggle label="Email notifications" checked={localEmail} onChange={setLocalEmail} />
          <Toggle label="Push notifications" checked={localPush} onChange={setLocalPush} />
          <Toggle label="Weekly digest" checked={localDigest} onChange={setLocalDigest} />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && (
            <span className="text-sm text-success animate-fade-in">Settings saved!</span>
          )}
        </div>
      </div>
    </Card>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}
