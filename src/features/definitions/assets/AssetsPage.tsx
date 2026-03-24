import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { GridToolbar } from '../../../components/data-grid/toolbar/GridToolbar';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Input } from '../../../components/ui/Input';
import { Tabs } from '../../../components/ui/Tabs';
import { usePermission } from '../../../hooks/usePermission';
import { useTenant } from '../../../hooks/useTenant';
import { Asset } from '../../../lib/api/mock-db';
import { AssetFormModal } from './AssetForm/AssetFormModal';
import { AssetFormValues } from './AssetForm/types';
import { AssetGrid } from './AssetGrid';
import { useAssets } from './hooks/useAssets';
import { Button } from '../../../components/ui/Button';

const tabItems = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'EQUITY', label: 'Hisse' },
  { value: 'BOND', label: 'SGMK' },
  { value: 'FUND', label: 'Fon' },
  { value: 'VIOP', label: 'VIOP' },
] as const;

export function AssetsPage() {
  const tenant = useTenant();
  const canCreate = usePermission('ASSET_CREATE');
  const canEdit = usePermission('ASSET_EDIT');
  const canDelete = usePermission('ASSET_DELETE');

  const [type, setType] = useState<(typeof tabItems)[number]['value']>('ALL');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Asset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  const assetsQuery = useAssets(tenant?.id, type, search);

  const rows = useMemo(() => assetsQuery.data ?? [], [assetsQuery.data]);

  async function handleSubmit(values: AssetFormValues) {
    if (!tenant) {
      return;
    }

    if (editing) {
      await assetsQuery.updateAsset.mutateAsync({
        id: editing.id,
        payload: values,
      });
      setEditing(null);
      return;
    }

    await assetsQuery.createAsset.mutateAsync({
      tenantId: tenant.id,
      ...values,
    });
  }

  return (
    <div className="page-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <GridToolbar
        left={
          <>
            <Tabs
              value={type}
              onChange={(value) => setType(value as (typeof tabItems)[number]['value'])}
              items={tabItems as unknown as { value: string; label: string }[]}
            />
            <Input
              style={{ width: 240 }}
              placeholder="Kod/isim/ISIN ara"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </>
        }
        right={
          canCreate ? (
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Yeni Kıymet
            </Button>
          ) : null
        }
      />

      <AssetGrid
        rowData={rows}
        loading={assetsQuery.isLoading}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={(asset) => {
          if (!canEdit) {
            toast.error('Kıymet düzenleme yetkiniz yok.');
            return;
          }
          setEditing(asset);
          setModalOpen(true);
        }}
        onDelete={(asset) => {
          if (!canDelete) {
            toast.error('Kıymet silme yetkiniz yok.');
            return;
          }
          setDeleteTarget(asset);
        }}
      />

      <AssetFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Kıymeti Sil"
        description={`${deleteTarget?.code ?? ''} kaydını silmek istediğinize emin misiniz?`}
        danger
        onConfirm={async () => {
          if (deleteTarget) {
            await assetsQuery.deleteAsset.mutateAsync(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
