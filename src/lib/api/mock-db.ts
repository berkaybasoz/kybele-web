import dayjs from 'dayjs';
import {
  AccountStatus,
  AccountType,
  AssetType,
  Currency,
  OrderSide,
  UserType,
} from '../constants/enums';
import { ALL_PERMISSIONS } from '../constants/permissions';

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  isActive: boolean;
  settings: Record<string, unknown>;
};

export type User = {
  id: string;
  tenantId: string;
  customerNo: string;
  userType: UserType;
  fullName: string;
  email: string;
  password: string;
  permissions: string[];
  roles: string[];
  failedLoginCount: number;
  lockedUntil: string | null;
};

export type Asset = {
  id: string;
  tenantId: string;
  assetType: AssetType;
  code: string;
  name: string;
  isin?: string;
  currency: Currency;
  exchange: string;
  lotSize: number;
  tickSize: number;
  isActive: boolean;
  maturityDate?: string;
  couponRate?: number;
  fundType?: string;
  underlyingAssetCode?: string;
  strikePrice?: number;
};

export type Account = {
  id: string;
  tenantId: string;
  userId: string;
  accountNo: string;
  accountType: AccountType;
  currency: Currency;
  status: AccountStatus;
  cashBalance: number;
  availableBalance: number;
  blockedBalance: number;
  riskClass: 'LOW' | 'MEDIUM' | 'HIGH';
  iban: string;
  openedAt: string;
};

export type Execution = {
  id: string;
  tenantId: string;
  executionNo: string;
  executedAt: string;
  accountNo: string;
  customerName: string;
  assetCode: string;
  assetName: string;
  assetType: AssetType;
  side: OrderSide;
  quantity: number;
  price: number;
  amount: number;
  commission: number;
  tax: number;
  netAmount: number;
  settlementDate: string;
  exchangeRef: string;
};

export type Role = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
};

const uid = () => crypto.randomUUID();

export const tenants: Tenant[] = [
  {
    id: 't-isyatirim',
    slug: 'isyatirim',
    name: 'İş Yatırım',
    logoUrl: 'İY',
    primaryColor: '#0f62fe',
    isActive: true,
    settings: {},
  },
  {
    id: 't-isbankasi',
    slug: 'isbankasi',
    name: 'İş Bankası',
    logoUrl: 'İB',
    primaryColor: '#0062ff',
    isActive: true,
    settings: {},
  },
];

const adminPermissions = ALL_PERMISSIONS;
const traderPermissions = [
  'DASHBOARD_VIEW',
  'ORDER_VIEW',
  'ORDER_CREATE',
  'ORDER_CANCEL',
  'PORTFOLIO_VIEW',
  'REPORT_DAILY_EXEC_VIEW',
  'REPORT_EXPORT',
  'ASSET_VIEW',
  'ASSET_EDIT',
  'ASSET_DELETE',
  'ACCOUNT_VIEW',
  'SETTINGS_VIEW',
];
const customerPermissions = [
  'DASHBOARD_VIEW',
  'PORTFOLIO_VIEW',
  'REPORT_ACCOUNT_STMT_VIEW',
  'SETTINGS_VIEW',
];

export const users: User[] = [
  {
    id: 'u-admin-1',
    tenantId: 't-isyatirim',
    customerNo: '900001',
    userType: 'BO_ADMIN',
    fullName: 'Ayşe Yılmaz',
    email: 'ayse.yilmaz@isyatirim.com',
    password: 'Password123!',
    permissions: adminPermissions,
    roles: ['Backoffice Yönetici'],
    failedLoginCount: 0,
    lockedUntil: null,
  },
  {
    id: 'u-trader-1',
    tenantId: 't-isyatirim',
    customerNo: '300021',
    userType: 'TRADER',
    fullName: 'Mert Kaya',
    email: 'mert.kaya@isyatirim.com',
    password: 'Password123!',
    permissions: traderPermissions,
    roles: ['Trader'],
    failedLoginCount: 0,
    lockedUntil: null,
  },
  {
    id: 'u-customer-1',
    tenantId: 't-isbankasi',
    customerNo: '100452',
    userType: 'CUSTOMER',
    fullName: 'Elif Demir',
    email: 'elif.demir@email.com',
    password: 'Password123!',
    permissions: customerPermissions,
    roles: ['Müşteri'],
    failedLoginCount: 0,
    lockedUntil: null,
  },
  {
    id: 'u-super-admin-1',
    tenantId: 't-isbankasi',
    customerNo: '999000',
    userType: 'SUPER_ADMIN',
    fullName: 'Sistem Yönetici',
    email: 'super@platform.com',
    password: 'Password123!',
    permissions: adminPermissions,
    roles: ['Super Admin'],
    failedLoginCount: 0,
    lockedUntil: null,
  },
];

export const assets: Asset[] = [
  {
    id: uid(),
    tenantId: 't-isyatirim',
    assetType: 'EQUITY',
    code: 'THYAO',
    name: 'Türk Hava Yolları',
    isin: 'TRATHYAO91M5',
    currency: 'TRY',
    exchange: 'BIST',
    lotSize: 1,
    tickSize: 0.05,
    isActive: true,
  },
  {
    id: uid(),
    tenantId: 't-isyatirim',
    assetType: 'BOND',
    code: 'TR220520T13',
    name: 'Hazine Bonosu',
    isin: 'TR220520T13',
    currency: 'TRY',
    exchange: 'BIST',
    lotSize: 1000,
    tickSize: 0.01,
    maturityDate: dayjs().add(8, 'month').format('YYYY-MM-DD'),
    couponRate: 23.5,
    isActive: true,
  },
  {
    id: uid(),
    tenantId: 't-isbankasi',
    assetType: 'FUND',
    code: 'IPB',
    name: 'İş Portföy Birinci Değişken Fon',
    currency: 'TRY',
    exchange: 'TEFAS',
    lotSize: 1,
    tickSize: 0.0001,
    fundType: 'Karma',
    isActive: true,
  },
  {
    id: uid(),
    tenantId: 't-isbankasi',
    assetType: 'VIOP',
    code: 'XU030F',
    name: 'BIST30 Vadeli Kontrat',
    currency: 'TRY',
    exchange: 'VIOP',
    lotSize: 1,
    tickSize: 0.25,
    underlyingAssetCode: 'XU030',
    strikePrice: 12000,
    isActive: true,
  },
];

export const accounts: Account[] = [
  {
    id: uid(),
    tenantId: 't-isyatirim',
    userId: 'u-trader-1',
    accountNo: 'TR-100001',
    accountType: 'MARGIN',
    currency: 'TRY',
    status: 'ACTIVE',
    cashBalance: 1250000,
    availableBalance: 1195000,
    blockedBalance: 55000,
    riskClass: 'HIGH',
    iban: 'TR100006200119000006672315',
    openedAt: dayjs().subtract(300, 'day').format('YYYY-MM-DD'),
  },
  {
    id: uid(),
    tenantId: 't-isbankasi',
    userId: 'u-customer-1',
    accountNo: 'TR-200045',
    accountType: 'CASH',
    currency: 'TRY',
    status: 'ACTIVE',
    cashBalance: 235000,
    availableBalance: 225000,
    blockedBalance: 10000,
    riskClass: 'MEDIUM',
    iban: 'TR440006200119000006672315',
    openedAt: dayjs().subtract(95, 'day').format('YYYY-MM-DD'),
  },
  {
    id: uid(),
    tenantId: 't-isyatirim',
    userId: 'u-admin-1',
    accountNo: 'TR-300210',
    accountType: 'CUSTODY',
    currency: 'USD',
    status: 'FROZEN',
    cashBalance: 14000,
    availableBalance: 4000,
    blockedBalance: 10000,
    riskClass: 'LOW',
    iban: 'TR220006200119000006672315',
    openedAt: dayjs().subtract(420, 'day').format('YYYY-MM-DD'),
  },
];

export const executions: Execution[] = Array.from({ length: 180 }, (_, i) => {
  const side: OrderSide = i % 2 === 0 ? 'BUY' : 'SELL';
  const quantity = 100 + (i % 20) * 10;
  const price = 45 + (i % 15) * 1.2;
  const amount = quantity * price;
  const commission = amount * 0.0015;
  const tax = commission * 0.05;

  return {
    id: uid(),
    tenantId: i % 3 === 0 ? 't-isyatirim' : 't-isbankasi',
    executionNo: `EXE-${(100000 + i).toString()}`,
    executedAt: dayjs().subtract(i * 4, 'minute').toISOString(),
    accountNo: i % 3 === 0 ? 'TR-100001' : 'TR-200045',
    customerName: i % 3 === 0 ? 'Mert Kaya' : 'Elif Demir',
    assetCode: i % 5 === 0 ? 'THYAO' : i % 2 === 0 ? 'ASELS' : 'GARAN',
    assetName:
      i % 5 === 0
        ? 'Türk Hava Yolları'
        : i % 2 === 0
          ? 'Aselsan'
          : 'Garanti BBVA',
    assetType: i % 7 === 0 ? 'VIOP' : 'EQUITY',
    side,
    quantity,
    price,
    amount,
    commission,
    tax,
    netAmount: side === 'BUY' ? amount + commission + tax : amount - commission - tax,
    settlementDate: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    exchangeRef: `BIST-${900000 + i}`,
  };
});

export const roles: Role[] = [
  {
    id: uid(),
    tenantId: 't-isyatirim',
    name: 'Backoffice Yönetici',
    description: 'Tam yetkili operasyon rolü',
    isSystem: true,
    permissions: ALL_PERMISSIONS,
    userCount: 5,
  },
  {
    id: uid(),
    tenantId: 't-isyatirim',
    name: 'Risk Yöneticisi',
    description: 'Risk ve rapor ekranlarını yönetir',
    isSystem: false,
    permissions: ['DASHBOARD_VIEW', 'REPORT_RISK_VIEW', 'REPORT_PORTFOLIO_VIEW'],
    userCount: 2,
  },
  {
    id: uid(),
    tenantId: 't-isbankasi',
    name: 'Trader',
    description: 'Emir operasyonları',
    isSystem: true,
    permissions: traderPermissions,
    userCount: 8,
  },
];

export function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
