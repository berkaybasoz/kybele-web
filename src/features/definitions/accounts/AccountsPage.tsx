import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '../../../components/data-grid/DataGrid';
import { GridToolbar } from '../../../components/data-grid/toolbar/GridToolbar';
import { StatusBadge } from '../../../components/data-grid/cell-renderers/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Tabs } from '../../../components/ui/Tabs';
import { useTenant } from '../../../hooks/useTenant';
import { getAccounts } from '../../../lib/api/accounts.api';
import { Account } from '../../../lib/api/mock-db';
import { formatCurrency } from '../../../lib/formatters/currency';

const statuses = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'PASSIVE', label: 'Pasif' },
  { value: 'FROZEN', label: 'Dondurulmuş' },
  { value: 'CLOSED', label: 'Kapalı' },
] as const;

const statusMap: Record<Account['status'], { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  ACTIVE: { label: 'Aktif', variant: 'success' },
  PASSIVE: { label: 'Pasif', variant: 'neutral' },
  FROZEN: { label: 'Dondurulmuş', variant: 'warning' },
  CLOSED: { label: 'Kapalı', variant: 'neutral' },
};

export function AccountsPage() {
  const tenant = useTenant();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]['value']>('ALL');

  const query = useQuery({
    queryKey: ['accounts', tenant?.id, search, status],
    enabled: Boolean(tenant?.id),
    queryFn: () => getAccounts({ tenantId: tenant!.id, status, search }),
  });

  const columnDefs = useMemo<ColDef<Account>[]>(
    () => [
      {
        field: 'accountNo',
        headerName: 'Hesap No',
        width: 140,
        cellRenderer: (params: ICellRendererParams<Account>) => {
          const row = params.data;
          if (!row) {
            return null;
          }

          return (
            <button className="btn" onClick={() => navigate(`/definitions/accounts/${row.id}`)}>
              {row.accountNo}
            </button>
          );
        },
      },
      { field: 'accountType', headerName: 'Hesap Türü', width: 120 },
      { field: 'currency', headerName: 'PB', width: 80 },
      {
        field: 'cashBalance',
        headerName: 'Nakit Bakiye',
        width: 150,
        valueFormatter: ({ value }) => formatCurrency(Number(value ?? 0)),
      },
      {
        field: 'availableBalance',
        headerName: 'Kullanılabilir',
        width: 150,
        valueFormatter: ({ value }) => formatCurrency(Number(value ?? 0)),
      },
      {
        field: 'status',
        headerName: 'Durum',
        width: 120,
        cellRenderer: (params: ICellRendererParams<Account, Account['status']>) => {
          const value = params.value ?? 'PASSIVE';
          return <StatusBadge label={statusMap[value].label} variant={statusMap[value].variant} />;
        },
      },
    ],
    [navigate],
  );

  return (
    <div className="page-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <GridToolbar
        left={
          <>
            <Tabs
              value={status}
              onChange={(value) => setStatus(value as (typeof statuses)[number]['value'])}
              items={statuses as unknown as { value: string; label: string }[]}
            />
            <Input
              style={{ width: 220 }}
              placeholder="Hesap no ara"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </>
        }
        right={<Button variant="primary">Yeni Hesap</Button>}
      />

      <DataGrid rowData={query.data ?? []} columnDefs={columnDefs} loading={query.isLoading} height={560} />
    </div>
  );
}
