/**
 * Simulated authentication API.
 *
 * Returns typed mock data after a realistic 1-second delay to simulate
 * network latency. In production, these would be fetch/axios calls to
 * your auth endpoint.
 */
import type { LoginCredentials, SignupCredentials, User } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USERS: Record<string, User> = {
  'admin@example.com': {
    id: '1',
    email: 'admin@example.com',
    displayName: 'Alex Admin',
    role: 'admin',
    isNewUser: false,
    createdAt: '2024-01-15T10:00:00Z',
  },
  'member@example.com': {
    id: '2',
    email: 'member@example.com',
    displayName: 'Morgan Member',
    role: 'member',
    isNewUser: false,
    createdAt: '2024-06-01T10:00:00Z',
  },
};

export async function simulateLogin(credentials: LoginCredentials): Promise<User> {
  await delay(1000);

  if (!credentials.email || !credentials.password) {
    throw new Error('Email and password are required');
  }

  const user = MOCK_USERS[credentials.email];
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (credentials.password.length < 6) {
    throw new Error('Invalid email or password');
  }

  return { ...user };
}

export async function simulateSignup(credentials: SignupCredentials): Promise<User> {
  await delay(1000);

  if (!credentials.email || !credentials.password || !credentials.displayName) {
    throw new Error('All fields are required');
  }

  if (credentials.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  if (MOCK_USERS[credentials.email]) {
    throw new Error('An account with this email already exists');
  }

  return {
    id: crypto.randomUUID(),
    email: credentials.email,
    displayName: credentials.displayName,
    role: 'member',
    isNewUser: true,
    createdAt: new Date().toISOString(),
  };
}
