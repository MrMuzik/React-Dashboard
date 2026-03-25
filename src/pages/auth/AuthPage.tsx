/**
 * Auth screen with login/signup tabs.
 *
 * Depends on: authStore (login/signup actions), onboardingStore (reset on new signup).
 * Non-obvious: Uses Radix Tabs for the login/signup toggle — Radix handles
 * keyboard navigation and ARIA roles automatically, so pressing arrow keys
 * switches between Login and Sign Up tabs without custom keydown handlers.
 *
 * The form validation is inline with error states shown beneath each field.
 * The simulated async login uses a 1-second delay via the auth API layer.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

interface FormErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

function validateEmail(email: string): string | undefined {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return undefined;
}

export function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, isLoading, error, clearError } = useAuthStore();
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  const [tab, setTab] = useState<string>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const handleTabChange = (value: string) => {
    setTab(value);
    setErrors({});
    clearError();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    newErrors.email = validateEmail(email);
    newErrors.password = validatePassword(password);
    if (tab === 'signup' && !displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password && !newErrors.displayName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (tab === 'login') {
      await login({ email, password });
      const user = useAuthStore.getState().user;
      if (user) {
        navigate(user.isNewUser ? '/onboarding' : '/dashboard');
      }
    } else {
      resetOnboarding();
      await signup({ email, password, displayName });
      const user = useAuthStore.getState().user;
      if (user) {
        navigate('/onboarding');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            R
          </div>
          <h1 className="text-2xl font-bold text-gray-900">React Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Production-quality React architecture demo</p>
        </div>

        {/* Auth form card */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
          {/* Radix Tabs handle keyboard navigation and ARIA roles automatically */}
          <Tabs.Root value={tab} onValueChange={handleTabChange}>
            <Tabs.List className="mb-6 flex rounded-lg bg-surface-tertiary p-1">
              <Tabs.Trigger
                value="login"
                className="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 data-[state=active]:bg-surface data-[state=active]:text-gray-900 data-[state=active]:shadow-card data-[state=inactive]:text-gray-500"
              >
                Log In
              </Tabs.Trigger>
              <Tabs.Trigger
                value="signup"
                className="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 data-[state=active]:bg-surface data-[state=active]:text-gray-900 data-[state=active]:shadow-card data-[state=inactive]:text-gray-500"
              >
                Sign Up
              </Tabs.Trigger>
            </Tabs.List>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Server error message */}
              {error && (
                <div className="rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">
                  {error}
                </div>
              )}

              <Tabs.Content value="signup" className="space-y-4 data-[state=inactive]:hidden">
                <div>
                  <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      errors.displayName ? 'border-danger' : 'border-border'
                    }`}
                    placeholder="Your name"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-xs text-danger">{errors.displayName}</p>
                  )}
                </div>
              </Tabs.Content>

              {/* Shared fields (always visible) */}
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.email ? 'border-danger' : 'border-border'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm transition-colors duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.password ? 'border-danger' : 'border-border'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  <>{tab === 'login' ? 'Sign In' : 'Create Account'}</>
                )}
              </button>
            </form>
          </Tabs.Root>

          {/* Demo credentials hint */}
          <div className="mt-4 rounded-md bg-brand-50 px-4 py-3 text-xs text-brand-700">
            <p className="font-medium">Demo credentials:</p>
            <p>Admin: admin@example.com / password</p>
            <p>Member: member@example.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}
