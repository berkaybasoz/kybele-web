import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { GridToolbar } from '../../../components/data-grid/toolbar/GridToolbar';
import { Button } from '../../../components/ui/Button';
import { useTenant } from '../../../hooks/useTenant';
import { DailyExecutionFilter } from '../../../lib/api/reports.api';
import { formatCurrency } from '../../../lib/formatters/currency';
import { ExecutionFilters } from './ExecutionFilters';
import { ExecutionsGrid } from './ExecutionsGrid';
import { useExecutionsMeta } from './hooks/useExecutions';

export function DailyExecutionsPage() {
  const tenant = useTenant();

  const [filters, setFilters] = useState<Omit<DailyExecutionFilter, 'tenantId'>>({
    date: dayjs().format('YYYY-MM-DD'),
    accountNo: '',
    assetCode: '',
    side: 'ALL',
    assetType: 'ALL',
  });

  const [debounced, setDebounced] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(filters), 400);
    return () => clearTimeout(timer);
  }, [filters]);

  const reportFilter = useMemo(
    () => ({
      tenantId: tenant?.id ?? '',
      ...debounced,
    }),
    [debounced, tenant?.id],
  );

  const query = useExecutionsMeta(reportFilter);

  const summary = useMemo(() => {
    if (!query.data) {
      return { total: 0, net: 0 };
    }

    return {
      total: query.data.total,
      net: query.data.aggregates.netTotal,
    };
  }, [query.data]);

  return (
    <div className="page-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ExecutionFilters value={filters} onChange={setFilters} />

      <GridToolbar
        left={
          <>
            <span className="badge info">Kayıt: {summary.total.toLocaleString('tr-TR')}</span>
            <span className="badge success">Net: {formatCurrency(summary.net)}</span>
          </>
        }
        right={
          <div className="actions">
            <Button>Excel</Button>
            <Button>CSV</Button>
            <Button>PDF</Button>
          </div>
        }
      />

      <ExecutionsGrid filter={reportFilter} aggregates={query.data?.aggregates} loading={query.isFetching} />
    </div>
  );
}
