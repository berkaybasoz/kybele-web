import dayjs from 'dayjs';
import { delay, executions, Execution } from './mock-db';
import { AssetType, OrderSide } from '../constants/enums';

export type DailyExecutionFilter = {
  tenantId: string;
  date: string;
  accountNo?: string;
  assetCode?: string;
  side?: 'ALL' | OrderSide;
  assetType?: 'ALL' | AssetType;
};

export type DailyExecutionResponse = {
  data: Execution[];
  total: number;
  aggregates: {
    totalAmount: number;
    totalCommission: number;
    totalTax: number;
    netTotal: number;
  };
};

export async function getDailyExecutions(
  filter: DailyExecutionFilter,
): Promise<DailyExecutionResponse> {
  const result = executions.filter((execution) => {
    if (execution.tenantId !== filter.tenantId) {
      return false;
    }

    if (filter.date && dayjs(execution.executedAt).format('YYYY-MM-DD') !== filter.date) {
      return false;
    }

    if (filter.accountNo && !execution.accountNo.includes(filter.accountNo)) {
      return false;
    }

    if (filter.assetCode && !execution.assetCode.includes(filter.assetCode.toUpperCase())) {
      return false;
    }

    if (filter.side && filter.side !== 'ALL' && execution.side !== filter.side) {
      return false;
    }

    if (filter.assetType && filter.assetType !== 'ALL' && execution.assetType !== filter.assetType) {
      return false;
    }

    return true;
  });

  const aggregates = result.reduce(
    (acc, row) => {
      acc.totalAmount += row.amount;
      acc.totalCommission += row.commission;
      acc.totalTax += row.tax;
      acc.netTotal += row.netAmount;
      return acc;
    },
    { totalAmount: 0, totalCommission: 0, totalTax: 0, netTotal: 0 },
  );

  return delay({
    data: result,
    total: result.length,
    aggregates,
  });
}
