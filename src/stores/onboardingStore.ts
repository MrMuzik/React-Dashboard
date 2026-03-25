/**
 * Onboarding wizard state store using Zustand.
 *
 * ARCHITECTURAL DECISION: Onboarding completion state lives in Zustand rather
 * than React Query because it is a client-side UI concern rather than server data.
 * The wizard steps, user selections, and completion flag are transient UI state
 * that drive the onboarding flow navigation. They don't represent a server resource
 * that multiple clients share or that needs cache invalidation. If we needed to
 * persist onboarding completion across devices, we'd POST the completion event to
 * the server and then this store would only hold the in-progress wizard state.
 */
import { create } from 'zustand';
import type { OnboardingState, OnboardingStep, UserRole } from '@/types';

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  userName: '',
  rolePreference: null,
  isCompleted: false,

  setStep: (step: OnboardingStep) => set({ currentStep: step }),
  setUserName: (name: string) => set({ userName: name }),
  setRolePreference: (role: UserRole) => set({ rolePreference: role }),

  completeOnboarding: () => set({ isCompleted: true, currentStep: 3 }),
  skipOnboarding: () => set({ isCompleted: true }),
  reset: () =>
    set({
      currentStep: 1,
      userName: '',
      rolePreference: null,
      isCompleted: false,
    }),
}));
