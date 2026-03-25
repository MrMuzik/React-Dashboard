/**
 * UI state store using Zustand.
 *
 * Tracks ephemeral UI concerns like sidebar collapse state and active navigation.
 * These are purely visual preferences that don't need server persistence or
 * React Query's caching/refetching behavior.
 *
 * Non-obvious: `mobileNavOpen` is separate from `sidebarCollapsed` because on
 * desktop the sidebar is always visible (just narrow vs wide), while on mobile
 * it's an overlay that opens on top of the content. Different interaction models
 * need different state.
 */
import { create } from 'zustand';
import type { UIState } from '@/types';

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeNavItem: 'dashboard',
  mobileNavOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveNavItem: (item: string) => set({ activeNavItem: item }),
  setMobileNavOpen: (open: boolean) => set({ mobileNavOpen: open }),
}));
