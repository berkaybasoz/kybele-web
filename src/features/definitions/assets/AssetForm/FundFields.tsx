import { Input } from '../../../../components/ui/Input';
import { AssetFormValues } from './types';

type Props = {
  values: AssetFormValues;
  setValues: (values: AssetFormValues) => void;
};

export function FundFields({ values, setValues }: Props) {
  return (
    <div className="grid-2">
      <div className="field">
        <label>Fon Türü</label>
        <Input value={values.fundType ?? ''} onChange={(event) => setValues({ ...values, fundType: event.target.value })} />
      </div>
      <div className="field">
        <label>Fon Kodu</label>
        <Input value={values.code} onChange={(event) => setValues({ ...values, code: event.target.value.toUpperCase() })} />
      </div>
    </div>
  );
}
