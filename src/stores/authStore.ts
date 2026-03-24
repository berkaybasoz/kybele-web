import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '../lib/api/auth.api';
import { Tenant } from '../lib/api/mock-db';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  tenant: Tenant | null;
  rememberMe: boolean;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    tenant: Tenant;
    rememberMe: boolean;
  }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      tenant: null,
      rememberMe: true,
      setSession: ({ accessToken, refreshToken, user, tenant, rememberMe }) =>
        set({ accessToken, refreshToken, user, tenant, rememberMe }),
      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          tenant: null,
          rememberMe: true,
        }),
    }),
    {
      name: 'kybele-auth',
      partialize: (state) => ({
        accessToken: state.rememberMe ? state.accessToken : null,
        refreshToken: state.rememberMe ? state.refreshToken : null,
        user: state.rememberMe ? state.user : null,
        tenant: state.rememberMe ? state.tenant : null,
      }),
    },
  ),
);
