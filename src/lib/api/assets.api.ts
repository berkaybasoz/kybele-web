import { Asset, assets, delay } from './mock-db';
import { AssetType } from '../constants/enums';

export type AssetFilter = {
  tenantId: string;
  type?: AssetType | 'ALL';
  search?: string;
};

export async function getAssets(filter: AssetFilter): Promise<Asset[]> {
  const query = filter.search?.trim().toLowerCase();

  const data = assets.filter((asset) => {
    if (asset.tenantId !== filter.tenantId) {
      return false;
    }

    if (filter.type && filter.type !== 'ALL' && asset.assetType !== filter.type) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      asset.code.toLowerCase().includes(query) ||
      asset.name.toLowerCase().includes(query) ||
      asset.isin?.toLowerCase().includes(query)
    );
  });

  return delay(data);
}

export async function createAsset(payload: Omit<Asset, 'id'>): Promise<Asset> {
  const record: Asset = {
    ...payload,
    id: crypto.randomUUID(),
  };
  assets.unshift(record);

  return delay(record);
}

export async function updateAsset(id: string, payload: Partial<Asset>): Promise<Asset> {
  const index = assets.findIndex((asset) => asset.id === id);
  if (index < 0) {
    throw new Error('Kıymet bulunamadı.');
  }

  assets[index] = { ...assets[index], ...payload };
  return delay(assets[index]);
}

export async function deleteAsset(id: string): Promise<{ ok: boolean }> {
  const index = assets.findIndex((asset) => asset.id === id);
  if (index >= 0) {
    assets.splice(index, 1);
  }

  return delay({ ok: true }, 120);
}
