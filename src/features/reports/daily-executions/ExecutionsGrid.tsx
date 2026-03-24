import {
  ColDef,
  IDatasource,
  IGetRowsParams,
  ICellRendererParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import { SideBadge } from '../../../components/data-grid/cell-renderers/SideBadge';
import { Execution } from '../../../lib/api/mock-db';
import { formatCurrency } from '../../../lib/formatters/currency';
import { formatDate } from '../../../lib/formatters/date';
import { formatNumber } from '../../../lib/formatters/number';
import {
  DailyExecutionFilter,
  getDailyExecutions,
} from '../../../lib/api/reports.api';

type Props = {
  filter: DailyExecutionFilter;
  loading?: boolean;
};

export function ExecutionsGrid({ filter, loading }: Props) {
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
        cellRenderer: (params: ICellRendererParams<Execution, Execution['side']>) => {
          if (params.node?.rowPinned) {
            return null;
          }
          return <SideBadge side={params.value ?? 'BUY'} />;
        },
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

  const datasource = useMemo<IDatasource>(
    () => ({
      getRows: async (params: IGetRowsParams) => {
        try {
          const response = await getDailyExecutions(filter, {
            startRow: params.startRow,
            endRow: params.endRow,
          });

          params.successCallback(response.data, response.total);
        } catch {
          params.failCallback();
        }
      },
    }),
    [filter],
  );

  return (
    <div className="ag-theme-quartz ag-theme-custom-dark" style={{ height: 600, width: '100%' }}>
      <AgGridReact<Execution>
        theme="legacy"
        rowModelType="infinite"
        datasource={datasource}
        cacheBlockSize={200}
        infiniteInitialRowCount={200}
        maxBlocksInCache={15}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
        rowHeight={36}
        headerHeight={36}
        loading={loading}
      />
    </div>
  );
}
