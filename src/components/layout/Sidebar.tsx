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
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>KYBELE</div>
        {!collapsed && <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Backoffice</div>}
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
