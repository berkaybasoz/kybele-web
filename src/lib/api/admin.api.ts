import { delay, roles, Role } from './mock-db';

export async function getRoles(tenantId: string): Promise<Role[]> {
  return delay(roles.filter((role) => role.tenantId === tenantId));
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]): Promise<Role> {
  const role = roles.find((item) => item.id === roleId);
  if (!role) {
    throw new Error('Rol bulunamadı.');
  }

  role.permissions = permissionIds;
  return delay(role);
}
