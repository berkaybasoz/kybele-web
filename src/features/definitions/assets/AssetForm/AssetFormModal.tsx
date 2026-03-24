import { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { Select } from '../../../../components/ui/Select';
import { Asset } from '../../../../lib/api/mock-db';
import { AssetFormValues } from './types';
import { EquityFields } from './EquityFields';
import { BondFields } from './BondFields';
import { FundFields } from './FundFields';
import { VIOPFields } from './VIOPFields';

const initialForm: AssetFormValues = {
  assetType: 'EQUITY',
  code: '',
  name: '',
  isin: '',
  currency: 'TRY',
  exchange: 'BIST',
  lotSize: 1,
  tickSize: 0.01,
  isActive: true,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Asset | null;
  onSubmit: (values: AssetFormValues) => Promise<void>;
};

export function AssetFormModal({ open, onOpenChange, initial, onSubmit }: Props) {
  const [values, setValues] = useState<AssetFormValues>(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setValues({
        assetType: initial.assetType,
        code: initial.code,
        name: initial.name,
        isin: initial.isin,
        currency: initial.currency,
        exchange: initial.exchange,
        lotSize: initial.lotSize,
        tickSize: initial.tickSize,
        isActive: initial.isActive,
        maturityDate: initial.maturityDate,
        couponRate: initial.couponRate,
        fundType: initial.fundType,
        underlyingAssetCode: initial.underlyingAssetCode,
        strikePrice: initial.strikePrice,
      });
    } else {
      setValues(initialForm);
    }
  }, [initial, open]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? 'Kıymet Düzenle' : 'Yeni Kıymet Tanımı'}
    >
      <div className="grid-3">
        <div className="field">
          <label>Tür</label>
          <Select
            value={values.assetType}
            onChange={(event) =>
              setValues({ ...values, assetType: event.target.value as AssetFormValues['assetType'] })
            }
          >
            <option value="EQUITY">Hisse</option>
            <option value="BOND">SGMK</option>
            <option value="FUND">Fon</option>
            <option value="VIOP">VIOP</option>
          </Select>
        </div>
        <div className="field">
          <label>Para Birimi</label>
          <Select
            value={values.currency}
            onChange={(event) =>
              setValues({ ...values, currency: event.target.value as AssetFormValues['currency'] })
            }
          >
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </Select>
        </div>
        <div className="field">
          <label>Durum</label>
          <Select
            value={String(values.isActive)}
            onChange={(event) => setValues({ ...values, isActive: event.target.value === 'true' })}
          >
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </Select>
        </div>
      </div>

      {values.assetType === 'EQUITY' && <EquityFields values={values} setValues={setValues} />}
      {values.assetType === 'BOND' && <BondFields values={values} setValues={setValues} />}
      {values.assetType === 'FUND' && <FundFields values={values} setValues={setValues} />}
      {values.assetType === 'VIOP' && <VIOPFields values={values} setValues={setValues} />}

      <div className="grid-2" style={{ marginTop: 12 }}>
        <div className="field">
          <label>Lot Büyüklüğü</label>
          <Input
            type="number"
            value={values.lotSize}
            onChange={(event) => setValues({ ...values, lotSize: Number(event.target.value) })}
          />
        </div>
        <div className="field">
          <label>Fiyat Adımı</label>
          <Input
            type="number"
            value={values.tickSize}
            onChange={(event) => setValues({ ...values, tickSize: Number(event.target.value) })}
          />
        </div>
      </div>

      <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
        <Button onClick={() => onOpenChange(false)}>İptal</Button>
        <Button
          variant="primary"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await onSubmit(values);
            setLoading(false);
            onOpenChange(false);
          }}
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </Modal>
  );
}
