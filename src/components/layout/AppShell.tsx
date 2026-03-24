import { Outlet } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const collapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <div className={collapsed ? 'layout collapsed' : 'layout'}>
      <Sidebar />
      <div>
        <Header />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
