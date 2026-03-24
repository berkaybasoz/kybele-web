import dayjs from 'dayjs';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Breadcrumb } from './Breadcrumb';

function getBistStatus() {
  const hour = dayjs().hour();
  const minute = dayjs().minute();
  const current = hour * 60 + minute;
  const open = 10 * 60;
  const close = 18 * 60 + 10;

  return current >= open && current <= close;
}

export function Header() {
  const tenant = useAuthStore((state) => state.tenant);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setGlobalSearch = useUIStore((state) => state.setGlobalSearch);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const isMarketOpen = getBistStatus();

  return (
    <header className="header">
      <div className="actions" style={{ minWidth: 280 }}>
        <Button onClick={toggleSidebar} title="Sidebar küçült/genişlet">
          <Menu size={16} />
        </Button>
        <div>
          <div className="tenant-pill">
            <strong>{tenant?.logoUrl ?? 'KY'}</strong>
            <span>{tenant?.name ?? 'Tenant'}</span>
          </div>
          <Breadcrumb />
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
        <Input
          onChange={(event) => setGlobalSearch(event.target.value)}
          placeholder="Hesap no, müşteri adı, kıymet kodu"
          style={{ paddingLeft: 32 }}
        />
      </div>

      <div className="actions">
        <div className={isMarketOpen ? 'badge success' : 'badge warning'}>
          BIST {isMarketOpen ? 'AÇIK' : 'KAPALI'}
        </div>
        <Button title="Bildirimler">
          <Bell size={16} />
        </Button>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13 }}>{user?.fullName}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user?.userType}</div>
        </div>
        <Button onClick={clearSession} title="Çıkış yap">
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
