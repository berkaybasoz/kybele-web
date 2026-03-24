import { useMutation } from '@tanstack/react-query';
import { login, LoginPayload, logout } from '../../../lib/api/auth.api';
import { useAuthStore } from '../../../stores/authStore';

export function useAuth() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload & { rememberMe: boolean }) => login(payload),
    onSuccess: (response, payload) => {
      setSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
        tenant: response.tenant,
        rememberMe: payload.rememberMe,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession();
    },
  });

  return {
    login: loginMutation,
    logout: logoutMutation,
  };
}
