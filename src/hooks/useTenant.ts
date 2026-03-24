import { useAuthStore } from '../stores/authStore';

export function useTenant() {
  return useAuthStore((state) => state.tenant);
}
