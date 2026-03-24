import { Input } from '../../../../components/ui/Input';
import { AssetFormValues } from './types';

type Props = {
  values: AssetFormValues;
  setValues: (values: AssetFormValues) => void;
};

export function EquityFields({ values, setValues }: Props) {
  return (
    <div className="grid-2">
      <div className="field">
        <label>Kod</label>
        <Input
          value={values.code}
          onChange={(event) => setValues({ ...values, code: event.target.value.toUpperCase() })}
        />
      </div>
      <div className="field">
        <label>ISIN</label>
        <Input value={values.isin ?? ''} onChange={(event) => setValues({ ...values, isin: event.target.value })} />
      </div>
      <div className="field">
        <label>Şirket Adı</label>
        <Input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
      </div>
      <div className="field">
        <label>Borsa</label>
        <Input
          value={values.exchange}
          onChange={(event) => setValues({ ...values, exchange: event.target.value.toUpperCase() })}
        />
      </div>
    </div>
  );
}
