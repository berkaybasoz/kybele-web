import { Input } from '../../../../components/ui/Input';
import { AssetFormValues } from './types';

type Props = {
  values: AssetFormValues;
  setValues: (values: AssetFormValues) => void;
};

export function BondFields({ values, setValues }: Props) {
  return (
    <div className="grid-2">
      <div className="field">
        <label>Vade Tarihi</label>
        <Input
          type="date"
          value={values.maturityDate ?? ''}
          onChange={(event) => setValues({ ...values, maturityDate: event.target.value })}
        />
      </div>
      <div className="field">
        <label>Kupon Oranı</label>
        <Input
          type="number"
          value={values.couponRate ?? 0}
          onChange={(event) => setValues({ ...values, couponRate: Number(event.target.value) })}
        />
      </div>
    </div>
  );
}
