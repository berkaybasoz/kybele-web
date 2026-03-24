import { Input } from '../../../../components/ui/Input';
import { AssetFormValues } from './types';

type Props = {
  values: AssetFormValues;
  setValues: (values: AssetFormValues) => void;
};

export function VIOPFields({ values, setValues }: Props) {
  return (
    <div className="grid-2">
      <div className="field">
        <label>Dayanak Varlık</label>
        <Input
          value={values.underlyingAssetCode ?? ''}
          onChange={(event) => setValues({ ...values, underlyingAssetCode: event.target.value.toUpperCase() })}
        />
      </div>
      <div className="field">
        <label>Strike Fiyatı</label>
        <Input
          type="number"
          value={values.strikePrice ?? 0}
          onChange={(event) => setValues({ ...values, strikePrice: Number(event.target.value) })}
        />
      </div>
    </div>
  );
}
