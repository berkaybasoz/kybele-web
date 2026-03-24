import { ColDef, ICellRendererParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DataGrid } from '../../../components/data-grid/DataGrid';
import { GridToolbar } from '../../../components/data-grid/toolbar/GridToolbar';
import { StatusBadge } from '../../../components/data-grid/cell-renderers/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Tabs } from '../../../components/ui/Tabs';
import { useTenant } from '../../../hooks/useTenant';
import { createAccount, getAccounts } from '../../../lib/api/accounts.api';
import { Account, users } from '../../../lib/api/mock-db';
import { formatCurrency } from '../../../lib/formatters/currency';

const statuses = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'PASSIVE', label: 'Pasif' },
  { value: 'FROZEN', label: 'Dondurulmuş' },
  { value: 'CLOSED', label: 'Kapalı' },
] as const;

const statusMap: Record<Account['status'], { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  ACTIVE: { label: 'Aktif', variant: 'success' },
  PASSIVE: { label: 'Pasif', variant: 'neutral' },
  FROZEN: { label: 'Dondurulmuş', variant: 'warning' },
  CLOSED: { label: 'Kapalı', variant: 'neutral' },
};

export function AccountsPage() {
  const tenant = useTenant();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]['value']>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    accountType: 'CASH' as Account['accountType'],
    currency: 'TRY' as Account['currency'],
    riskClass: 'MEDIUM' as Account['riskClass'],
    iban: 'TR',
    openingBalance: 0,
    openedAt: dayjs().format('YYYY-MM-DD'),
  });

  const tenantUsers = useMemo(
    () => users.filter((user) => user.tenantId === tenant?.id),
    [tenant?.id],
  );

  useEffect(() => {
    if (createOpen && tenantUsers.length > 0 && !form.userId) {
      setForm((prev) => ({ ...prev, userId: tenantUsers[0].id }));
    }
  }, [createOpen, form.userId, tenantUsers]);

  const query = useQuery({
    queryKey: ['accounts', tenant?.id, search, status],
    enabled: Boolean(tenant?.id),
    queryFn: () => getAccounts({ tenantId: tenant!.id, status, search }),
  });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', tenant?.id] });
      toast.success('Hesap başarıyla oluşturuldu.');
      setCreateOpen(false);
      setForm({
        userId: tenantUsers[0]?.id ?? '',
        accountType: 'CASH',
        currency: 'TRY',
        riskClass: 'MEDIUM',
        iban: 'TR',
        openingBalance: 0,
        openedAt: dayjs().format('YYYY-MM-DD'),
      });
    },
    onError: () => {
      toast.error('Hesap oluşturulurken hata oluştu.');
    },
  });

  const columnDefs = useMemo<ColDef<Account>[]>(
    () => [
      {
        field: 'accountNo',
        headerName: 'Hesap No',
        width: 140,
        cellRenderer: (params: ICellRendererParams<Account>) => {
          const row = params.data;
          if (!row) {
            return null;
          }

          return (
            <button className="btn compact" onClick={() => navigate(`/definitions/accounts/${row.id}`)}>
              {row.accountNo}
            </button>
          );
        },
      },
      { field: 'accountType', headerName: 'Hesap Türü', width: 120 },
      { field: 'currency', headerName: 'PB', width: 80 },
      {
        field: 'cashBalance',
        headerName: 'Nakit Bakiye',
        width: 150,
        valueFormatter: ({ value }) => formatCurrency(Number(value ?? 0)),
      },
      {
        field: 'availableBalance',
        headerName: 'Kullanılabilir',
        width: 150,
        valueFormatter: ({ value }) => formatCurrency(Number(value ?? 0)),
      },
      {
        field: 'status',
        headerName: 'Durum',
        width: 120,
        cellRenderer: (params: ICellRendererParams<Account, Account['status']>) => {
          const value = params.value ?? 'PASSIVE';
          return <StatusBadge label={statusMap[value].label} variant={statusMap[value].variant} compact />;
        },
      },
    ],
    [navigate],
  );

  function generateAccountNo() {
    return `TR-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  async function handleCreateAccount() {
    if (!tenant) {
      toast.error('Tenant bilgisi bulunamadı.');
      return;
    }

    if (!form.userId) {
      toast.error('Lütfen bir müşteri seçin.');
      return;
    }

    if (!/^TR\\d{24}$/i.test(form.iban.trim())) {
      toast.error('IBAN formatı geçersiz. Örn: TR + 24 hane');
      return;
    }

    const openingBalance = Number(form.openingBalance);
    const blockedBalance = 0;
    const availableBalance = openingBalance - blockedBalance;

    await createMutation.mutateAsync({
      tenantId: tenant.id,
      userId: form.userId,
      accountNo: generateAccountNo(),
      accountType: form.accountType,
      currency: form.currency,
      status: 'ACTIVE',
      cashBalance: openingBalance,
      availableBalance,
      blockedBalance,
      riskClass: form.riskClass,
      iban: form.iban.toUpperCase().trim(),
      openedAt: form.openedAt,
    });
  }

  return (
    <div className="page-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <GridToolbar
        left={
          <>
            <Tabs
              value={status}
              onChange={(value) => setStatus(value as (typeof statuses)[number]['value'])}
              items={statuses as unknown as { value: string; label: string }[]}
            />
            <Input
              style={{ width: 220 }}
              placeholder="Hesap no ara"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </>
        }
        right={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            Yeni Hesap
          </Button>
        }
      />

      <DataGrid rowData={query.data ?? []} columnDefs={columnDefs} loading={query.isLoading} height={560} />

      <Modal open={createOpen} onOpenChange={setCreateOpen} title="Yeni Hesap">
        <div className="grid-2">
          <div className="field">
            <label>Müşteri</label>
            <Select
              value={form.userId}
              onChange={(event) => setForm((prev) => ({ ...prev, userId: event.target.value }))}
            >
              {tenantUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.customerNo} - {user.fullName}
                </option>
              ))}
            </Select>
          </div>

          <div className="field">
            <label>Hesap Türü</label>
            <Select
              value={form.accountType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, accountType: event.target.value as Account['accountType'] }))
              }
            >
              <option value="CASH">Nakit</option>
              <option value="MARGIN">Marjin</option>
              <option value="CUSTODY">Saklama</option>
              <option value="FUND">Fon</option>
            </Select>
          </div>

          <div className="field">
            <label>Para Birimi</label>
            <Select
              value={form.currency}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, currency: event.target.value as Account['currency'] }))
              }
            >
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Select>
          </div>

          <div className="field">
            <label>Risk Sınıfı</label>
            <Select
              value={form.riskClass}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, riskClass: event.target.value as Account['riskClass'] }))
              }
            >
              <option value="LOW">Düşük</option>
              <option value="MEDIUM">Orta</option>
              <option value="HIGH">Yüksek</option>
            </Select>
          </div>

          <div className="field">
            <label>IBAN</label>
            <Input
              value={form.iban}
              onChange={(event) => setForm((prev) => ({ ...prev, iban: event.target.value.toUpperCase() }))}
              placeholder="TRxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </div>

          <div className="field">
            <label>Başlangıç Bakiyesi</label>
            <Input
              type="number"
              value={form.openingBalance}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, openingBalance: Number(event.target.value || 0) }))
              }
            />
          </div>

          <div className="field">
            <label>Açılış Tarihi</label>
            <Input
              type="date"
              value={form.openedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, openedAt: event.target.value }))}
            />
          </div>
        </div>

        <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <Button onClick={() => setCreateOpen(false)}>İptal</Button>
          <Button variant="primary" disabled={createMutation.isPending} onClick={handleCreateAccount}>
            {createMutation.isPending ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
