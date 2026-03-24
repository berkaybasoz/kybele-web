import { accounts, delay, Account } from './mock-db';

export type AccountFilter = {
  tenantId: string;
  status?: 'ALL' | Account['status'];
  search?: string;
};

export async function getAccounts(filter: AccountFilter): Promise<Account[]> {
  const query = filter.search?.toLowerCase().trim();

  const result = accounts.filter((account) => {
    if (account.tenantId !== filter.tenantId) {
      return false;
    }

    if (filter.status && filter.status !== 'ALL' && account.status !== filter.status) {
      return false;
    }

    if (!query) {
      return true;
    }

    return account.accountNo.toLowerCase().includes(query);
  });

  return delay(result);
}

export async function createAccount(payload: Omit<Account, 'id'>): Promise<Account> {
  const record: Account = {
    ...payload,
    id: crypto.randomUUID(),
  };

  accounts.unshift(record);
  return delay(record);
}
