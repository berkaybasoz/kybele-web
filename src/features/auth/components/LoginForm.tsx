import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ApiError } from '../../../lib/api/auth.api';
import { tenants } from '../../../lib/api/mock-db';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  tenantSlug: z.string().min(1, 'Şirket seçimi zorunlu'),
  userType: z.enum(['CUSTOMER', 'TRADER', 'BO_ADMIN', 'SUPER_ADMIN']),
  customerNo: z
    .string()
    .min(1, 'Müşteri no zorunlu')
    .regex(/^[a-zA-Z0-9]+$/, 'Alfanümerik olmalı'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  rememberMe: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function formatCountdown(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function LoginForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [lockedRemaining, setLockedRemaining] = useState<number>(0);
  const [showPassword, setShowPassword] = useState(false);

  const defaultTenant = useMemo(() => {
    const fromQuery = searchParams.get('tenant');
    if (fromQuery && tenants.some((tenant) => tenant.slug === fromQuery)) {
      return fromQuery;
    }

    return tenants[0]?.slug ?? '';
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantSlug: defaultTenant,
      userType: 'TRADER',
      customerNo: '',
      password: '',
      rememberMe: true,
    },
  });

  useEffect(() => {
    if (lockedRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setLockedRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [lockedRemaining]);

  const selectedTenant = tenants.find((tenant) => tenant.slug === watch('tenantSlug'));

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setLockedRemaining(0);

    try {
      await login.mutateAsync(values);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);

        if (err.code === 'ACCOUNT_LOCKED') {
          const remaining = Number(err.meta?.remainingSeconds ?? 0);
          setLockedRemaining(remaining);
        }
      } else {
        setError('Beklenmeyen bir hata oluştu.');
      }
    }
  });

  return (
    <form className="login-card" onSubmit={onSubmit}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24 }}>Kybele Backoffice</h1>
        <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)' }}>
          Tenant bazlı güvenli giriş ekranı
        </p>
      </div>

      <div className="field">
        <label>Şirket</label>
        <Select {...register('tenantSlug')}>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.slug}>
              {tenant.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="actions" style={{ justifyContent: 'space-between' }}>
        {[
          ['CUSTOMER', 'Müşteri Girişi'],
          ['TRADER', 'Trader Girişi'],
          ['BO_ADMIN', 'Backoffice'],
        ].map(([value, label]) => (
          <button
            key={value}
            className="btn"
            type="button"
            style={{
              background: watch('userType') === value ? 'var(--tenant-primary)' : undefined,
              borderColor: watch('userType') === value ? 'var(--tenant-primary)' : undefined,
              flex: 1,
            }}
            onClick={() => {
              const field = register('userType');
              field.onChange({ target: { value, name: field.name } });
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="field">
        <label>Müşteri No</label>
        <Input placeholder="Örn. 300021" {...register('customerNo')} />
        {errors.customerNo && <small style={{ color: 'var(--accent-red)' }}>{errors.customerNo.message}</small>}
      </div>

      <div className="field">
        <label>Şifre</label>
        <div style={{ position: 'relative' }}>
          <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <small style={{ color: 'var(--accent-red)' }}>{errors.password.message}</small>}
      </div>

      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
        <input type="checkbox" {...register('rememberMe')} />
        Beni hatırla
      </label>

      {selectedTenant && (
        <div className="tenant-pill" style={{ width: 'fit-content' }}>
          <strong>{selectedTenant.logoUrl}</strong>
          <span>{selectedTenant.name}</span>
        </div>
      )}

      {error && (
        <div className="badge danger" style={{ justifyContent: 'flex-start', padding: '8px 10px' }}>
          {error}
          {lockedRemaining > 0 && ` (Kalan: ${formatCountdown(lockedRemaining)})`}
        </div>
      )}

      <Button className="primary" type="submit" disabled={login.isPending || lockedRemaining > 0}>
        {login.isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
        <a href="#">Şifremi unuttum</a>
        <span>v0.1.0</span>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Demo: `900001 / Password123!` (BO_ADMIN), `300021 / Password123!` (TRADER)
      </div>
    </form>
  );
}
