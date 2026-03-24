import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tenants, users } from '../../lib/api/mock-db';
import { LoginForm } from './components/LoginForm';

const DEMO_TYPES = [
  { userType: 'CUSTOMER', label: 'Müşteri Girişi' },
  { userType: 'TRADER', label: 'Trader Girişi' },
  { userType: 'BO_ADMIN', label: 'Backoffice Girişi' },
] as const;

export function LoginPage() {
  const [searchParams] = useSearchParams();

  const defaultTenantSlug = useMemo(() => {
    const fromQuery = searchParams.get('tenant');
    if (fromQuery && tenants.some((tenant) => tenant.slug === fromQuery)) {
      return fromQuery;
    }

    return tenants[0]?.slug ?? '';
  }, [searchParams]);

  const [selectedTenantSlug, setSelectedTenantSlug] = useState(defaultTenantSlug);

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.slug === selectedTenantSlug),
    [selectedTenantSlug],
  );

  const demoCredentials = useMemo(() => {
    if (!selectedTenant) {
      return [];
    }

    return DEMO_TYPES.map((item) => {
      const user = users.find(
        (record) => record.tenantId === selectedTenant.id && record.userType === item.userType,
      );
      return {
        ...item,
        customerNo: user?.customerNo,
        password: user?.password,
      };
    });
  }, [selectedTenant]);

  return (
    <div className="login-shell">
      <section className="login-left">
        <div>
          <h2 style={{ marginTop: 0 }}>Yatırım Backoffice Platformu</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500 }}>
            Çok kiracılı mimari, rol bazlı yetkilendirme, data-dense dashboard ve raporlama altyapısı.
          </p>
        </div>

        <div>
          <div className="sparkline" />
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            TradingView esintili görünüm, gerçek zamanlı piyasa verisi altyapısına hazır.
          </p>

          <div
            style={{
              marginTop: 16,
              border: '1px solid var(--border)',
              background: 'rgba(13, 17, 23, 0.9)',
              borderRadius: 10,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Demo Hesaplar ({selectedTenant?.name ?? '-'})
            </div>
            {demoCredentials.map((item) => (
              <div key={item.userType} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                <code style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                  {item.customerNo ? `${item.customerNo} / ${item.password}` : 'Tanımlı değil'}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="login-right">
        <LoginForm initialTenantSlug={defaultTenantSlug} onTenantChange={setSelectedTenantSlug} />
      </section>
    </div>
  );
}
