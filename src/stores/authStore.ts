import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserProfile } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  customIcon?: string;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User & { profile: UserProfile }>) => void;
  updateIcon: (base64: string) => void;
  updateAvatar: (avatarUrl: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      customIcon: undefined,
      login: (user) => set({ 
        user: { 
          ...user, 
          lastLogin: new Date().toISOString() 
        }, 
        isAuthenticated: true 
      }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      updateIcon: (base64) => set({ customIcon: base64 }),
      updateAvatar: (avatarUrl) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatarUrl } : null,
        })),
    }),
    {
      name: 'auth-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            user: persistedState.user ? {
              ...persistedState.user,
              lastLogin: persistedState.user.lastLogin || new Date().toISOString(),
              loginId: persistedState.user.loginId || '',
            } : null,
          };
        }
        return persistedState;
      },
    }
  )
);