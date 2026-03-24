import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { accounts } from '../../../lib/api/mock-db';
import { formatCurrency } from '../../../lib/formatters/currency';

export function AccountDetailPage() {
  const { id } = useParams();

  const account = useMemo(() => accounts.find((item) => item.id === id), [id]);

  if (!account) {
    return <div className="page-card">Hesap bulunamadı.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <section className="page-card">
        <h2 style={{ marginTop: 0 }}>Hesap Bilgileri</h2>
        <div className="grid-3">
          <div>
            <small>Hesap No</small>
            <div>{account.accountNo}</div>
          </div>
          <div>
            <small>Tür</small>
            <div>{account.accountType}</div>
          </div>
          <div>
            <small>Durum</small>
            <div>{account.status}</div>
          </div>
        </div>
      </section>

      <section className="page-card">
        <h2 style={{ marginTop: 0 }}>Bakiye Özeti</h2>
        <div className="grid-3">
          <div>
            <small>Nakit</small>
            <div>{formatCurrency(account.cashBalance, account.currency)}</div>
          </div>
          <div>
            <small>Kullanılabilir</small>
            <div>{formatCurrency(account.availableBalance, account.currency)}</div>
          </div>
          <div>
            <small>Bloke</small>
            <div>{formatCurrency(account.blockedBalance, account.currency)}</div>
          </div>
        </div>
      </section>

      <section className="page-card">
        <h2 style={{ marginTop: 0 }}>Hesap Aktivitesi</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Pozisyonlar, emir geçmişi, gerçekleşme geçmişi ve ekstre ekranları bu MVP’de placeholder olarak eklendi.
        </p>
      </section>
    </div>
  );
}
