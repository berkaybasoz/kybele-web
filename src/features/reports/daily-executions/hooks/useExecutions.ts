import { useQuery } from '@tanstack/react-query';
import { DailyExecutionFilter, getDailyExecutions } from '../../../../lib/api/reports.api';

export function useExecutions(filter: DailyExecutionFilter) {
  return useQuery({
    queryKey: ['daily-executions', filter],
    queryFn: () => getDailyExecutions(filter),
  });
}
