import { PERMISSION_MODULES } from '../../../lib/constants/permissions';

type Props = {
  selected: string[];
  onChange: (permissions: string[]) => void;
};

export function PermissionMatrix({ selected, onChange }: Props) {
  function toggle(permission: string) {
    if (selected.includes(permission)) {
      onChange(selected.filter((item) => item !== permission));
      return;
    }

    onChange([...selected, permission]);
  }

  function toggleModule(modulePermissions: string[]) {
    const isEverySelected = modulePermissions.every((permission) => selected.includes(permission));

    if (isEverySelected) {
      onChange(selected.filter((permission) => !modulePermissions.includes(permission)));
      return;
    }

    onChange(Array.from(new Set([...selected, ...modulePermissions])));
  }

  return (
    <div className="page-card" style={{ padding: 10 }}>
      <h3 style={{ marginTop: 0 }}>İzin Matrisi</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PERMISSION_MODULES.map((module) => {
          const modulePermissions = module.permissions.map((item) => item.code);
          const allChecked = modulePermissions.every((permission) => selected.includes(permission));

          return (
            <div key={module.module} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
              <label style={{ display: 'flex', gap: 8, fontWeight: 600 }}>
                <input type="checkbox" checked={allChecked} onChange={() => toggleModule(modulePermissions)} />
                {module.module}
              </label>
              <div className="grid-2" style={{ marginTop: 8 }}>
                {module.permissions.map((permission) => (
                  <label key={permission.code} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(permission.code)}
                      onChange={() => toggle(permission.code)}
                    />
                    <span>
                      <strong>{permission.code}</strong> - {permission.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
