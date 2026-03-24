export type UserType = 'CUSTOMER' | 'TRADER' | 'BO_ADMIN' | 'SUPER_ADMIN';

export type AssetType = 'EQUITY' | 'BOND' | 'FUND' | 'VIOP';

export type Currency = 'TRY' | 'USD' | 'EUR';

export type AccountType = 'CASH' | 'MARGIN' | 'CUSTODY' | 'FUND';

export type AccountStatus = 'ACTIVE' | 'PASSIVE' | 'FROZEN' | 'CLOSED';

export type OrderSide = 'BUY' | 'SELL';

export type RoleCode =
  | 'DASHBOARD'
  | 'ORDERS'
  | 'PORTFOLIO'
  | 'REPORTS'
  | 'DEFINITIONS'
  | 'ADMIN'
  | 'SETTINGS';
