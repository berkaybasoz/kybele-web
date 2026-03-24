import { AssetType, Currency } from '../../../../lib/constants/enums';

export type AssetFormValues = {
  assetType: AssetType;
  code: string;
  name: string;
  isin?: string;
  currency: Currency;
  exchange: string;
  lotSize: number;
  tickSize: number;
  isActive: boolean;
  maturityDate?: string;
  couponRate?: number;
  fundType?: string;
  underlyingAssetCode?: string;
  strikePrice?: number;
};
