import dayjs from 'dayjs';
import { delay, Execution } from './mock-db';
import { AssetType, OrderSide } from '../constants/enums';

export const DAILY_EXECUTIONS_TOTAL_ROWS = 1_000_000;

export type DailyExecutionFilter = {
  tenantId: string;
  date: string;
  accountNo?: string;
  assetCode?: string;
  side?: 'ALL' | OrderSide;
  assetType?: 'ALL' | AssetType;
};

export type DailyExecutionAggregates = {
  totalAmount: number;
  totalCommission: number;
  totalTax: number;
  netTotal: number;
};

export type DailyExecutionMetaResponse = {
  total: number;
  aggregates: DailyExecutionAggregates;
};

export type DailyExecutionResponse = {
  data: Execution[];
  total: number;
  aggregates: DailyExecutionAggregates;
};

export type DailyExecutionSliceParams = {
  startRow: number;
  endRow: number;
};

type CacheRecord = {
  key: string;
  matchingIndices: number[];
  total: number;
  aggregates: DailyExecutionAggregates;
};

let filterCache: CacheRecord | null = null;

const isyatirimAccounts = ['TR-100001', 'TR-300210', 'TR-100777'];
const isbankasiAccounts = ['TR-200045', 'TR-200678', 'TR-200999'];

const isyatirimNames = ['Mert Kaya', 'Ayşe Yılmaz', 'Can Aras'];
const isbankasiNames = ['Elif Demir', 'Seda Aydın', 'Eren Akın'];

const assetCodes = ['THYAO', 'ASELS', 'GARAN', 'AKBNK', 'IPB', 'XU030F'];
const assetNames: Record<string, string> = {
  THYAO: 'Türk Hava Yolları',
  ASELS: 'Aselsan',
  GARAN: 'Garanti BBVA',
  AKBNK: 'Akbank',
  IPB: 'İş Portföy Birinci Değişken Fon',
  XU030F: 'BIST30 Vadeli Kontrat',
};

function normalizeFilter(filter: DailyExecutionFilter): DailyExecutionFilter {
  return {
    ...filter,
    accountNo: filter.accountNo?.trim() ?? '',
    assetCode: filter.assetCode?.trim().toUpperCase() ?? '',
    side: filter.side ?? 'ALL',
    assetType: filter.assetType ?? 'ALL',
  };
}

function buildFilterKey(filter: DailyExecutionFilter): string {
  const normalized = normalizeFilter(filter);
  return [
    normalized.tenantId,
    normalized.date,
    normalized.accountNo,
    normalized.assetCode,
    normalized.side,
    normalized.assetType,
  ].join('|');
}

function sideByIndex(index: number): OrderSide {
  return index % 2 === 0 ? 'BUY' : 'SELL';
}

function assetTypeByCode(code: string): AssetType {
  if (code === 'IPB') {
    return 'FUND';
  }
  if (code === 'XU030F') {
    return 'VIOP';
  }
  if (code === 'THYAO' || code === 'ASELS' || code === 'GARAN' || code === 'AKBNK') {
    return 'EQUITY';
  }
  return 'BOND';
}

function accountNoByIndex(index: number, tenantId: string): string {
  if (tenantId === 't-isyatirim') {
    return isyatirimAccounts[Math.floor(index / 3) % isyatirimAccounts.length];
  }

  return isbankasiAccounts[Math.floor(index / 2) % isbankasiAccounts.length];
}

function customerNameByIndex(index: number, tenantId: string): string {
  if (tenantId === 't-isyatirim') {
    return isyatirimNames[Math.floor(index / 3) % isyatirimNames.length];
  }

  return isbankasiNames[Math.floor(index / 2) % isbankasiNames.length];
}

function assetCodeByIndex(index: number): string {
  return assetCodes[index % assetCodes.length];
}

function amountByIndex(index: number): {
  quantity: number;
  price: number;
  amount: number;
  commission: number;
  tax: number;
  netAmount: number;
} {
  const side = sideByIndex(index);
  const quantity = 100 + (index % 20) * 10;
  const price = 45 + (index % 15) * 1.2;
  const amount = quantity * price;
  const commission = amount * 0.0015;
  const tax = commission * 0.05;

  return {
    quantity,
    price,
    amount,
    commission,
    tax,
    netAmount: side === 'BUY' ? amount + commission + tax : amount - commission - tax,
  };
}

function matchesFilter(index: number, filter: DailyExecutionFilter): boolean {
  const side = sideByIndex(index);
  if (filter.side && filter.side !== 'ALL' && side !== filter.side) {
    return false;
  }

  const assetCode = assetCodeByIndex(index);
  if (filter.assetCode && !assetCode.includes(filter.assetCode.toUpperCase())) {
    return false;
  }

  const assetType = assetTypeByCode(assetCode);
  if (filter.assetType && filter.assetType !== 'ALL' && assetType !== filter.assetType) {
    return false;
  }

  const accountNo = accountNoByIndex(index, filter.tenantId);
  if (filter.accountNo && !accountNo.includes(filter.accountNo)) {
    return false;
  }

  return true;
}

function buildExecution(index: number, date: string, tenantId: string): Execution {
  const side = sideByIndex(index);
  const accountNo = accountNoByIndex(index, tenantId);
  const customerName = customerNameByIndex(index, tenantId);
  const assetCode = assetCodeByIndex(index);
  const assetName = assetNames[assetCode] ?? assetCode;
  const assetType = assetTypeByCode(assetCode);
  const amountParts = amountByIndex(index);

  const executedAt = dayjs(date)
    .startOf('day')
    .add(index % 86400, 'second')
    .toISOString();

  return {
    id: `${tenantId}-exe-${index}`,
    tenantId,
    executionNo: `EXE-${(100000 + index).toString()}`,
    executedAt,
    accountNo,
    customerName,
    assetCode,
    assetName,
    assetType,
    side,
    quantity: amountParts.quantity,
    price: amountParts.price,
    amount: amountParts.amount,
    commission: amountParts.commission,
    tax: amountParts.tax,
    netAmount: amountParts.netAmount,
    settlementDate: dayjs(date).add(2, 'day').format('YYYY-MM-DD'),
    exchangeRef: `BIST-${900000 + index}`,
  };
}

function getOrBuildFilterCache(filter: DailyExecutionFilter): CacheRecord {
  const normalized = normalizeFilter(filter);
  const key = buildFilterKey(normalized);

  if (filterCache && filterCache.key === key) {
    return filterCache;
  }

  const matchingIndices: number[] = [];
  const aggregates: DailyExecutionAggregates = {
    totalAmount: 0,
    totalCommission: 0,
    totalTax: 0,
    netTotal: 0,
  };

  for (let i = 0; i < DAILY_EXECUTIONS_TOTAL_ROWS; i += 1) {
    if (!matchesFilter(i, normalized)) {
      continue;
    }

    matchingIndices.push(i);

    const amountParts = amountByIndex(i);
    aggregates.totalAmount += amountParts.amount;
    aggregates.totalCommission += amountParts.commission;
    aggregates.totalTax += amountParts.tax;
    aggregates.netTotal += amountParts.netAmount;
  }

  filterCache = {
    key,
    matchingIndices,
    total: matchingIndices.length,
    aggregates,
  };

  return filterCache;
}

export async function getDailyExecutionsMeta(
  filter: DailyExecutionFilter,
): Promise<DailyExecutionMetaResponse> {
  const record = getOrBuildFilterCache(filter);
  return delay({
    total: record.total,
    aggregates: record.aggregates,
  }, 120);
}

export async function getDailyExecutions(
  filter: DailyExecutionFilter,
  params: DailyExecutionSliceParams,
): Promise<DailyExecutionResponse> {
  const record = getOrBuildFilterCache(filter);

  const start = Math.max(0, params.startRow);
  const end = Math.min(record.total, params.endRow);

  const rows = record.matchingIndices
    .slice(start, end)
    .map((index) => buildExecution(index, filter.date, filter.tenantId));

  return delay({
    data: rows,
    total: record.total,
    aggregates: record.aggregates,
  }, 120);
}
