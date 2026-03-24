import { ChartColumnBig, CircleDollarSign, FileText, LayoutDashboard, Shield, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useUIStore } from '../../stores/uiStore';

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  permissions: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={16} />,
    permissions: ['DASHBOARD_VIEW'],
  },
  {
    to: '/reports/daily-executions',
    label: 'Günlük Gerçekleşmeler',
    icon: <FileText size={16} />,
    permissions: ['REPORT_DAILY_EXEC_VIEW'],
  },
  {
    to: '/definitions/assets',
    label: 'Kıymet Tanımları',
    icon: <ChartColumnBig size={16} />,
    permissions: ['ASSET_VIEW'],
  },
  {
    to: '/definitions/accounts',
    label: 'Hesap Tanımları',
    icon: <CircleDollarSign size={16} />,
    permissions: ['ACCOUNT_VIEW'],
  },
  {
    to: '/admin/roles',
    label: 'Rol Tanımları',
    icon: <Shield size={16} />,
    permissions: ['ROLE_VIEW'],
  },
  {
    to: '/settings/profile',
    label: 'Ayarlar',
    icon: <User size={16} />,
    permissions: ['SETTINGS_VIEW'],
  },
];

export function Sidebar() {
  const user = useCurrentUser();
  const collapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'color-mix(in srgb, var(--tenant-primary) 25%, transparent)',
            border: '1px solid color-mix(in srgb, var(--tenant-primary) 55%, black 12%)',
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          K
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>KYBELE</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Backoffice</div>
          </div>
        )}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {NAV_ITEMS.filter((item) => item.permissions.some((perm) => user?.permissions.includes(perm))).map(
          (item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                background: isActive ? 'color-mix(in srgb, var(--tenant-primary) 18%, transparent)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              })}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  );
}
