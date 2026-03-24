import { Role } from '../../../lib/api/mock-db';

type Props = {
  roles: Role[];
  selectedRoleId?: string;
  onSelect: (role: Role) => void;
};

export function RoleList({ roles, selectedRoleId, onSelect }: Props) {
  return (
    <div className="page-card" style={{ padding: 10 }}>
      <h3 style={{ marginTop: 0 }}>Rol Listesi</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {roles.map((role) => (
          <button
            key={role.id}
            className="btn"
            style={{
              textAlign: 'left',
              background:
                selectedRoleId === role.id
                  ? 'color-mix(in srgb, var(--tenant-primary) 18%, transparent)'
                  : undefined,
            }}
            onClick={() => onSelect(role)}
          >
            <div style={{ fontWeight: 600 }}>{role.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{role.description}</div>
            <div className="actions" style={{ marginTop: 6 }}>
              {role.isSystem && <span className="badge warning">Sistem</span>}
              <span className="badge neutral">Kullanıcı: {role.userCount}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
