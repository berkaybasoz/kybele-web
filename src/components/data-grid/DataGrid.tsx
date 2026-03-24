import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

type DataGridProps<T extends object> = {
  rowData: T[];
  columnDefs: ColDef<T>[];
  loading?: boolean;
  height?: number;
  rowHeight?: number;
  pinnedBottomRowData?: T[];
};

export function DataGrid<T extends object>({
  rowData,
  columnDefs,
  loading,
  height = 520,
  rowHeight = 36,
  pinnedBottomRowData,
}: DataGridProps<T>) {
  return (
    <div className="ag-theme-quartz ag-theme-custom-dark" style={{ height, width: '100%' }}>
      <AgGridReact<T>
        theme="legacy"
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
        animateRows
        rowHeight={rowHeight}
        headerHeight={36}
        loading={loading}
        pinnedBottomRowData={pinnedBottomRowData}
      />
    </div>
  );
}
