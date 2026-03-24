import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useMemo } from 'react';
import { DataGrid } from '../../../components/data-grid/DataGrid';
import { StatusBadge } from '../../../components/data-grid/cell-renderers/StatusBadge';
import { Asset } from '../../../lib/api/mock-db';

type Props = {
  rowData: Asset[];
  loading?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
};

export function AssetGrid({ rowData, loading, canEdit, canDelete, onEdit, onDelete }: Props) {
  const columnDefs = useMemo<ColDef<Asset>[]>(
    () => [
      { field: 'code', headerName: 'Kod', width: 120 },
      { field: 'isin', headerName: 'ISIN', width: 160 },
      { field: 'name', headerName: 'Ad', flex: 1, minWidth: 220 },
      { field: 'exchange', headerName: 'Borsa', width: 100 },
      { field: 'currency', headerName: 'Para Birimi', width: 110 },
      {
        field: 'isActive',
        headerName: 'Durum',
        width: 100,
        cellRenderer: (params: ICellRendererParams<Asset, boolean>) =>
          params.value ? (
            <StatusBadge label="Aktif" variant="success" compact />
          ) : (
            <StatusBadge label="Pasif" variant="neutral" compact />
          ),
      },
      {
        headerName: 'İşlemler',
        width: 170,
        filter: false,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Asset>) => {
          const row = params.data;
          if (!row) {
            return null;
          }

          return (
            <div className="grid-actions">
              <button className="btn compact" disabled={!canEdit} onClick={() => onEdit(row)}>
                Düzenle
              </button>
              <button className="btn danger compact" disabled={!canDelete} onClick={() => onDelete(row)}>
                Sil
              </button>
            </div>
          );
        },
      },
    ],
    [canDelete, canEdit, onDelete, onEdit],
  );

  return <DataGrid rowData={rowData} columnDefs={columnDefs} loading={loading} height={560} />;
}
