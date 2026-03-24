import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MiniSparkline } from '../../components/charts/MiniSparkline';
import { getAccounts } from '../../lib/api/accounts.api';
import { getDailyExecutions, getDailyExecutionsMeta } from '../../lib/api/reports.api';
import { formatCurrency } from '../../lib/formatters/currency';
import { useTenant } from '../../hooks/useTenant';

export function DashboardPage() {
  const tenant = useTenant();

  const accountsQuery = useQuery({
    queryKey: ['dashboard-accounts', tenant?.id],
    enabled: Boolean(tenant?.id),
    queryFn: () => getAccounts({ tenantId: tenant!.id }),
  });

  const dailyFilter = useMemo(
    () => ({
      tenantId: tenant?.id ?? '',
      date: new Date().toISOString().slice(0, 10),
      side: 'ALL' as const,
      assetType: 'ALL' as const,
    }),
    [tenant?.id],
  );

  const executionsMetaQuery = useQuery({
    queryKey: ['dashboard-executions', tenant?.id],
    enabled: Boolean(tenant?.id),
    queryFn: () => getDailyExecutionsMeta(dailyFilter),
  });

  const executionsSliceQuery = useQuery({
    queryKey: ['dashboard-executions-slice', tenant?.id],
    enabled: Boolean(tenant?.id),
    queryFn: () =>
      getDailyExecutions(dailyFilter, {
        startRow: 0,
        endRow: 1200,
      }),
  });

  const metrics = useMemo(() => {
    const cash = (accountsQuery.data ?? []).reduce((acc, account) => acc + account.cashBalance, 0);
    const available = (accountsQuery.data ?? []).reduce(
      (acc, account) => acc + account.availableBalance,
      0,
    );
    const blocked = (accountsQuery.data ?? []).reduce((acc, account) => acc + account.blockedBalance, 0);

    return {
      cash,
      available,
      blocked,
      dailyExecutions: executionsMetaQuery.data?.total ?? 0,
      volume: executionsMetaQuery.data?.aggregates.totalAmount ?? 0,
    };
  }, [accountsQuery.data, executionsMetaQuery.data]);

  const sparklineSeries = useMemo(() => {
    const rows = executionsSliceQuery.data?.data ?? [];
    if (rows.length < 2) {
      return [];
    }

    const chronological = [...rows].sort(
      (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime(),
    );

    let cumulative = 0;
    const cumulativeSeries = chronological.map((item) => {
      cumulative += item.amount;
      return cumulative;
    });

    const targetPoints = 40;
    if (cumulativeSeries.length <= targetPoints) {
      return cumulativeSeries;
    }

    const step = (cumulativeSeries.length - 1) / (targetPoints - 1);
    const sampled = Array.from({ length: targetPoints }, (_, index) => {
      const sourceIndex = Math.round(index * step);
      return cumulativeSeries[sourceIndex];
    });

    const volume = executionsMetaQuery.data?.aggregates.totalAmount ?? 0;
    const lastValue = sampled[sampled.length - 1] ?? 0;
    if (volume <= 0 || lastValue <= 0) {
      return sampled;
    }

    const scale = volume / lastValue;
    return sampled.map((value) => value * scale);
  }, [executionsMetaQuery.data?.aggregates.totalAmount, executionsSliceQuery.data]);

  return (
    <>
      <section className="metric-grid">
        <article className="metric">
          <h3>Toplam Nakit</h3>
          <p>{formatCurrency(metrics.cash)}</p>
        </article>
        <article className="metric">
          <h3>Kullanılabilir Bakiye</h3>
          <p>{formatCurrency(metrics.available)}</p>
        </article>
        <article className="metric">
          <h3>Bloke Bakiye</h3>
          <p>{formatCurrency(metrics.blocked)}</p>
        </article>
        <article className="metric">
          <h3>Bugünkü Gerçekleşme</h3>
          <p>{metrics.dailyExecutions}</p>
        </article>
      </section>

      <section className="widget-grid">
        <article className="widget">
          <h3 style={{ marginTop: 0 }}>Portföy Özet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Günlük işlem hacmi: <strong>{formatCurrency(metrics.volume)}</strong>
          </p>
          <MiniSparkline data={sparklineSeries} height={180} />
        </article>

        <article className="widget">
          <h3 style={{ marginTop: 0 }}>Son Aktiviteler</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <li>08:45 - Emir onayı gerçekleşti</li>
            <li>09:10 - Yeni kıymet tanımı eklendi</li>
            <li>10:02 - Hesap durumu güncellendi</li>
            <li>10:40 - Günlük gerçekleşmeler export edildi</li>
          </ul>
        </article>
      </section>
    </>
  );
}
