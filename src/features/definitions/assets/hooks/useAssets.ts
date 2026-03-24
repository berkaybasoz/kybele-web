import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAsset, deleteAsset, getAssets, updateAsset } from '../../../../lib/api/assets.api';
import { Asset } from '../../../../lib/api/mock-db';

export function useAssets(tenantId?: string, type: Asset['assetType'] | 'ALL' = 'ALL', search = '') {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['assets', tenantId, type, search],
    enabled: Boolean(tenantId),
    queryFn: () => getAssets({ tenantId: tenantId!, type, search }),
  });

  const createMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', tenantId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Asset> }) => updateAsset(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', tenantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', tenantId] });
    },
  });

  return {
    ...query,
    createAsset: createMutation,
    updateAsset: updateMutation,
    deleteAsset: deleteMutation,
  };
}
