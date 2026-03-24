import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { RolesPage } from '../../features/admin/roles/RolesPage';
import { LoginPage } from '../../features/auth/LoginPage';
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { AccountDetailPage } from '../../features/definitions/accounts/AccountDetailPage';
import { AccountsPage } from '../../features/definitions/accounts/AccountsPage';
import { AssetsPage } from '../../features/definitions/assets/AssetsPage';
import { DailyExecutionsPage } from '../../features/reports/daily-executions/DailyExecutionsPage';
import { NotificationsPage } from '../../features/settings/NotificationsPage';
import { ProfilePage } from '../../features/settings/ProfilePage';
import { SecurityPage } from '../../features/settings/SecurityPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PlaceholderPage } from './PlaceholderPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },

          { path: '/orders/new', element: <PlaceholderPage title="Yeni Emir" /> },
          { path: '/orders/list', element: <PlaceholderPage title="Emir Listesi" /> },
          { path: '/orders/:id', element: <PlaceholderPage title="Emir Detayı" /> },

          { path: '/portfolio/positions', element: <PlaceholderPage title="Pozisyonlar" /> },
          { path: '/portfolio/pnl', element: <PlaceholderPage title="Kâr/Zarar" /> },

          { path: '/reports/daily-executions', element: <DailyExecutionsPage /> },
          { path: '/reports/account-statement', element: <PlaceholderPage title="Hesap Ekstresi" /> },
          { path: '/reports/portfolio-report', element: <PlaceholderPage title="Portföy Raporu" /> },
          { path: '/reports/risk-report', element: <PlaceholderPage title="Risk Raporu" /> },
          { path: '/reports/commission-report', element: <PlaceholderPage title="Komisyon Raporu" /> },
          { path: '/reports/tax-report', element: <PlaceholderPage title="Vergi Raporu" /> },

          { path: '/definitions/assets', element: <AssetsPage /> },
          { path: '/definitions/accounts', element: <AccountsPage /> },
          { path: '/definitions/accounts/:id', element: <AccountDetailPage /> },
          { path: '/definitions/markets', element: <PlaceholderPage title="Piyasa Tanımları" /> },

          { path: '/admin/users', element: <PlaceholderPage title="Kullanıcı Yönetimi" /> },
          { path: '/admin/roles', element: <RolesPage /> },
          { path: '/admin/permissions', element: <PlaceholderPage title="İzin Yönetimi" /> },
          { path: '/admin/tenants', element: <PlaceholderPage title="Tenant Yönetimi" /> },

          { path: '/settings/profile', element: <ProfilePage /> },
          { path: '/settings/security', element: <SecurityPage /> },
          { path: '/settings/notifications', element: <NotificationsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
