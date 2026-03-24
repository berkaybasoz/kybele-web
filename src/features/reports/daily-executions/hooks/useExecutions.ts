import { useQuery } from '@tanstack/react-query';
import { DailyExecutionFilter, getDailyExecutionsMeta } from '../../../../lib/api/reports.api';

export function useExecutionsMeta(filter: DailyExecutionFilter) {
  return useQuery({
    queryKey: ['daily-executions-meta', filter],
    enabled: Boolean(filter.tenantId),
    queryFn: () => getDailyExecutionsMeta(filter),
  });
}
