import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useMemo } from 'react';
import { DataGrid } from '../../../components/data-grid/DataGrid';
import { SideBadge } from '../../../components/data-grid/cell-renderers/SideBadge';
import { Execution } from '../../../lib/api/mock-db';
import { formatCurrency } from '../../../lib/formatters/currency';
import { formatDate } from '../../../lib/formatters/date';
import { formatNumber } from '../../../lib/formatters/number';
import { DailyExecutionResponse } from '../../../lib/api/reports.api';

type Props = {
  response?: DailyExecutionResponse;
  loading?: boolean;
};

export function ExecutionsGrid({ response, loading }: Props) {
  const rowData = response?.data ?? [];

  const columnDefs = useMemo<ColDef<Execution>[]>(
    () => [
      { field: 'executionNo', headerName: 'Gerçekleşme No', width: 160, pinned: 'left' },
      {
        field: 'executedAt',
        headerName: 'Saat',
        width: 90,
        valueFormatter: ({ value }) => formatDate(value, 'HH:mm:ss'),
      },
      { field: 'accountNo', headerName: 'Hesap No', width: 120 },
      { field: 'customerName', headerName: 'Müşteri', width: 180 },
      { field: 'assetCode', headerName: 'Kıymet', width: 100 },
      { field: 'assetName', headerName: 'Kıymet Adı', minWidth: 170, flex: 1 },
      { field: 'assetType', headerName: 'Tür', width: 90 },
      {
        field: 'side',
        headerName: 'A/S',
        width: 70,
        cellRenderer: (params: ICellRendererParams<Execution, Execution['side']>) => (
          <SideBadge side={params.value ?? 'BUY'} />
        ),
      },
      {
        field: 'quantity',
        headerName: 'Adet',
        width: 100,
        valueFormatter: ({ value }) => formatNumber(Number(value)),
      },
      {
        field: 'price',
        headerName: 'Fiyat',
        width: 100,
        valueFormatter: ({ value }) => formatNumber(Number(value), 4),
      },
      {
        field: 'amount',
        headerName: 'Tutar',
        width: 130,
        valueFormatter: ({ value }) => formatCurrency(Number(value)),
      },
      {
        field: 'commission',
        headerName: 'Komisyon',
        width: 120,
        valueFormatter: ({ value }) => formatCurrency(Number(value)),
      },
      {
        field: 'tax',
        headerName: 'Vergi',
        width: 110,
        valueFormatter: ({ value }) => formatCurrency(Number(value)),
      },
      {
        field: 'netAmount',
        headerName: 'Net Tutar',
        width: 140,
        pinned: 'right',
        valueFormatter: ({ value }) => formatCurrency(Number(value)),
      },
      { field: 'settlementDate', headerName: 'Valör', width: 100 },
      { field: 'exchangeRef', headerName: 'Borsa Ref', width: 130 },
    ],
    [],
  );

  const pinnedBottomRowData = response
    ? [
        {
          executionNo: 'TOPLAM',
          amount: response.aggregates.totalAmount,
          commission: response.aggregates.totalCommission,
          tax: response.aggregates.totalTax,
          netAmount: response.aggregates.netTotal,
        } as unknown as Execution,
      ]
    : undefined;

  return (
    <DataGrid
      rowData={rowData}
      columnDefs={columnDefs}
      loading={loading}
      height={600}
      pinnedBottomRowData={pinnedBottomRowData}
    />
  );
}
