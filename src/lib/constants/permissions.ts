export type PermissionModule = {
  module: string;
  permissions: { code: string; name: string }[];
};

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    module: 'DASHBOARD',
    permissions: [{ code: 'DASHBOARD_VIEW', name: 'Dashboard görüntüleme' }],
  },
  {
    module: 'ORDERS',
    permissions: [
      { code: 'ORDER_VIEW', name: 'Emir görüntüleme' },
      { code: 'ORDER_CREATE', name: 'Emir oluşturma' },
      { code: 'ORDER_CANCEL', name: 'Emir iptal' },
      { code: 'ORDER_AMEND', name: 'Emir düzeltme' },
    ],
  },
  {
    module: 'PORTFOLIO',
    permissions: [
      { code: 'PORTFOLIO_VIEW', name: 'Portföy görüntüleme' },
      { code: 'PORTFOLIO_EXPORT', name: 'Portföy export' },
    ],
  },
  {
    module: 'REPORTS',
    permissions: [
      { code: 'REPORT_DAILY_EXEC_VIEW', name: 'Günlük gerçekleşmeler' },
      { code: 'REPORT_ACCOUNT_STMT_VIEW', name: 'Hesap ekstresi' },
      { code: 'REPORT_PORTFOLIO_VIEW', name: 'Portföy raporu' },
      { code: 'REPORT_RISK_VIEW', name: 'Risk raporu' },
      { code: 'REPORT_COMMISSION_VIEW', name: 'Komisyon raporu' },
      { code: 'REPORT_TAX_VIEW', name: 'Vergi raporu' },
      { code: 'REPORT_EXPORT', name: 'Rapor export' },
    ],
  },
  {
    module: 'DEFINITIONS',
    permissions: [
      { code: 'ASSET_VIEW', name: 'Kıymet görüntüleme' },
      { code: 'ASSET_CREATE', name: 'Kıymet oluşturma' },
      { code: 'ASSET_EDIT', name: 'Kıymet düzenleme' },
      { code: 'ASSET_DELETE', name: 'Kıymet silme' },
      { code: 'ACCOUNT_VIEW', name: 'Hesap görüntüleme' },
      { code: 'ACCOUNT_CREATE', name: 'Hesap oluşturma' },
      { code: 'ACCOUNT_EDIT', name: 'Hesap düzenleme' },
      { code: 'ACCOUNT_STATUS_CHANGE', name: 'Hesap durum değiştirme' },
    ],
  },
  {
    module: 'ADMIN',
    permissions: [
      { code: 'USER_VIEW', name: 'Kullanıcı görüntüleme' },
      { code: 'USER_CREATE', name: 'Kullanıcı oluşturma' },
      { code: 'USER_EDIT', name: 'Kullanıcı düzenleme' },
      { code: 'USER_DELETE', name: 'Kullanıcı silme' },
      { code: 'ROLE_VIEW', name: 'Rol görüntüleme' },
      { code: 'ROLE_CREATE', name: 'Rol oluşturma' },
      { code: 'ROLE_EDIT', name: 'Rol düzenleme' },
      { code: 'ROLE_DELETE', name: 'Rol silme' },
      { code: 'PERMISSION_ASSIGN', name: 'İzin atama' },
    ],
  },
  {
    module: 'SETTINGS',
    permissions: [
      { code: 'SETTINGS_VIEW', name: 'Ayarlar görüntüleme' },
      { code: 'SETTINGS_EDIT', name: 'Ayarlar düzenleme' },
      { code: 'TENANT_MANAGE', name: 'Tenant yönetimi' },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_MODULES.flatMap((module) =>
  module.permissions.map((perm) => perm.code),
);
