import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { useTenant } from '../../../hooks/useTenant';
import { getRoles, updateRolePermissions } from '../../../lib/api/admin.api';
import { Role } from '../../../lib/api/mock-db';
import { PermissionMatrix } from './PermissionMatrix';
import { RoleList } from './RoleList';

export function RolesPage() {
  const tenant = useTenant();
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ['roles', tenant?.id],
    enabled: Boolean(tenant?.id),
    queryFn: () => getRoles(tenant!.id),
  });

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedRole && rolesQuery.data?.length) {
      setSelectedRole(rolesQuery.data[0]);
    }
  }, [rolesQuery.data, selectedRole]);

  useEffect(() => {
    if (selectedRole) {
      setDraftPermissions(selectedRole.permissions);
    }
  }, [selectedRole]);

  const mutation = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
      updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', tenant?.id] });
    },
  });

  const isDirty = useMemo(() => {
    if (!selectedRole) {
      return false;
    }

    const a = [...selectedRole.permissions].sort().join(',');
    const b = [...draftPermissions].sort().join(',');
    return a !== b;
  }, [draftPermissions, selectedRole]);

  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '320px 1fr' }}>
      <RoleList
        roles={rolesQuery.data ?? []}
        selectedRoleId={selectedRole?.id}
        onSelect={(role) => setSelectedRole(role)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PermissionMatrix selected={draftPermissions} onChange={setDraftPermissions} />
        <div className="actions" style={{ justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            disabled={!selectedRole || !isDirty || mutation.isPending}
            onClick={() => {
              if (!selectedRole) {
                return;
              }
              mutation.mutate({ roleId: selectedRole.id, permissions: draftPermissions });
              setSelectedRole({ ...selectedRole, permissions: draftPermissions });
            }}
          >
            {mutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
