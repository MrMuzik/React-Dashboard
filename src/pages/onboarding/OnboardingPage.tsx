/**
 * Three-step onboarding wizard for new users.
 *
 * Depends on: onboardingStore (wizard state, step transitions), authStore (user info).
 * Non-obvious: The wizard is skippable — clicking "Skip" marks onboarding as complete
 * and redirects to the dashboard. This is tracked in Zustand because onboarding
 * completion is a client-side UI concern (see onboardingStore.ts for full rationale).
 */
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

const ROLE_FEATURES: Record<UserRole, string[]> = {
  admin: [
    'Full dashboard with team-wide analytics and summary stats',
    'Review & approval queue for pending submissions',
    'Quick actions panel for common administrative tasks',
    'Calendar view with team events and deadlines',
  ],
  member: [
    'Personal task progress tracker with status indicators',
    'Upcoming items list with meetings and deadlines',
    'Notification center for updates and mentions',
    'Calendar view for your schedule at a glance',
  ],
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const { currentStep, userName, rolePreference, setStep, setUserName, setRolePreference, completeOnboarding, skipOnboarding } = useOnboardingStore();
  const user = useAuthStore((s) => s.user);

  const handleSkip = () => {
    skipOnboarding();
    navigate('/dashboard');
  };

  const handleComplete = () => {
    completeOnboarding();
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 w-12 rounded-full transition-colors duration-300 ${
                step <= currentStep ? 'bg-brand-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-8 shadow-card">
          {/* Step 1: Name and role */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">Welcome! Let&apos;s get started</h2>
                <p className="mt-1 text-sm text-gray-500">Tell us a bit about yourself</p>
              </div>

              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                  What should we call you?
                </label>
                <input
                  id="name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder={user?.displayName || 'Your name'}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select your role preference
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['admin', 'member'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => setRolePreference(role)}
                      className={`rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                        rolePreference === role
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-border hover:border-brand-300'
                      }`}
                    >
                      <p className="text-sm font-semibold capitalize text-gray-900">{role}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {role === 'admin' ? 'Manage team & approvals' : 'Track tasks & progress'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={handleSkip} className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                  Skip onboarding
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!rolePreference}
                  className="rounded-md bg-brand-600 px-6 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Welcome message and feature overview */}
          {currentStep === 2 && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Welcome{userName ? `, ${userName}` : ''}!
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Here&apos;s what you&apos;ll have access to as{' '}
                  {rolePreference === 'admin' ? 'an Admin' : 'a Member'}
                </p>
              </div>

              <div className="space-y-3">
                {rolePreference &&
                  ROLE_FEATURES[rolePreference].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-surface-secondary p-3">
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
                        <svg className="h-3 w-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700">{feature}</p>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="rounded-md bg-brand-600 px-6 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-700"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="animate-fade-in space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">You&apos;re all set!</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your workspace is configured and ready to go.
                </p>
              </div>

              <button
                onClick={handleComplete}
                className="w-full rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-700"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
