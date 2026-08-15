import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth';

let isCheckingSession = false;

interface UserContext {
  id: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
  certificateName?: string;
  phone?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserContext | null;
  isLoading: boolean;
  isHydrated: boolean;
  lastChecked: number | null; // unix ms timestamp of last successful session check

  // Actions
  setAuth: (user: UserContext, token?: string) => void;
  logout: () => Promise<void>;
  checkSession: (force?: boolean) => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      isHydrated: false,
      lastChecked: null,

      setAuth: (user, token) => {
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
        }
        set({ isAuthenticated: true, user, isLoading: false });
      },

      logout: async () => {
        // 1. Instantly clear local token and state (Optimistic UI)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
        }
        set({ isAuthenticated: false, user: null, isLoading: false, lastChecked: null });

        // 2. Perform backend logout silently in the background without blocking the UI
        authApi.logout().catch(() => {
          // Ignore logout errors (e.g. 401 Unauthorized if token expired) to avoid console pollution
        });
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },

      checkSession: async (force = false) => {
        const state = get();
        // Use a private module variable to prevent concurrent checks, 
        // instead of state.isLoading (which defaults to true)
        if (isCheckingSession) return;
        isCheckingSession = true;

        // --- SESSION CACHE: skip network call if checked within last 5 minutes ---
        const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes
        if (!force && state.lastChecked && state.isAuthenticated && state.user) {
          if (Date.now() - state.lastChecked < SESSION_TTL_MS) {
            // Session is still fresh — no network call needed
            isCheckingSession = false;
            set({ isLoading: false }); // Ensure we clear the loading state!
            return;
          }
        }

        set({ isLoading: true });

        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        try {
          if (!token) {
            // Attempt to restore via HttpOnly cookie (OAuth flow)
            const response: any = await authApi.refresh();
            const accessToken = response?.accessToken || response?.data?.accessToken;
            
            if (accessToken) {
              if (typeof window !== 'undefined') localStorage.setItem('access_token', accessToken);
              // Fall through to getMe() below to fetch user data
            } else {
              isCheckingSession = false;
              set({ isAuthenticated: false, user: null, isLoading: false, lastChecked: null });
              return;
            }
          }

          const response: any = await authApi.getMe();
          const userData = response?.data;
          
          if (userData) {
            set({ isAuthenticated: true, user: userData, isLoading: false, lastChecked: Date.now() });
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false, lastChecked: null });
          }
        } catch (err) {
          // If refresh or getMe fails, clear token but keep lastChecked so we don't spam retries
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
          }
          set({ isAuthenticated: false, user: null, isLoading: false, lastChecked: null });
        } finally {
          isCheckingSession = false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user,
        lastChecked: state.lastChecked,
      }),
      merge: (persistedState: any, currentState) => {
        // BUG FIX #20: onRehydrateStorage fired setHydrated() (isHydrated: true),
        // but then merge() ran AFTER and reset isHydrated: false — causing components
        // that gate on isHydrated to flash as unauthenticated on every page load.
        //
        // Fix: merge() is the final step of rehydration — set isHydrated: true here
        // unconditionally. onRehydrateStorage is kept as a fallback only.
        const isFresh = persistedState?.lastChecked && (Date.now() - persistedState.lastChecked < 5 * 60 * 1000);
        return {
          ...currentState,
          ...persistedState,
          isLoading: !isFresh,
          isHydrated: true, // Always true after merge — this IS the end of hydration
        };
      },
    }
  )
);
