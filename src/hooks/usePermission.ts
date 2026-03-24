import { useCurrentUser } from './useCurrentUser';

export function usePermission(permission: string): boolean {
  const user = useCurrentUser();
  return Boolean(user?.permissions.includes(permission));
}

export function useHasAnyPermission(permissions: string[]): boolean {
  const user = useCurrentUser();
  if (!user) {
    return false;
  }

  return permissions.some((permission) => user.permissions.includes(permission));
}
