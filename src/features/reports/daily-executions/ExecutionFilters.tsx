import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DailyExecutionFilter } from '../../../lib/api/reports.api';

type Props = {
  value: Omit<DailyExecutionFilter, 'tenantId'>;
  onChange: (value: Omit<DailyExecutionFilter, 'tenantId'>) => void;
};

export function ExecutionFilters({ value, onChange }: Props) {
  return (
    <div className="filter-bar">
      <Input
        type="date"
        value={value.date}
        onChange={(event) => onChange({ ...value, date: event.target.value })}
      />
      <Input
        placeholder="Hesap No"
        value={value.accountNo ?? ''}
        onChange={(event) => onChange({ ...value, accountNo: event.target.value })}
      />
      <Input
        placeholder="Kıymet Kodu"
        value={value.assetCode ?? ''}
        onChange={(event) => onChange({ ...value, assetCode: event.target.value.toUpperCase() })}
      />
      <Select
        value={value.side ?? 'ALL'}
        onChange={(event) => onChange({ ...value, side: event.target.value as DailyExecutionFilter['side'] })}
      >
        <option value="ALL">Tümü</option>
        <option value="BUY">Alış</option>
        <option value="SELL">Satış</option>
      </Select>
      <Select
        value={value.assetType ?? 'ALL'}
        onChange={(event) =>
          onChange({ ...value, assetType: event.target.value as DailyExecutionFilter['assetType'] })
        }
      >
        <option value="ALL">Tümü</option>
        <option value="EQUITY">Hisse</option>
        <option value="BOND">SGMK</option>
        <option value="FUND">Fon</option>
        <option value="VIOP">VIOP</option>
      </Select>
      <button className="btn" onClick={() => onChange({ ...value, accountNo: '', assetCode: '', side: 'ALL', assetType: 'ALL' })}>
        Temizle
      </button>
    </div>
  );
}
