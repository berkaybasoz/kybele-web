import { LoginForm } from './components/LoginForm';

export function LoginPage() {
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
        </div>
      </section>

      <section className="login-right">
        <LoginForm />
      </section>
    </div>
  );
}
