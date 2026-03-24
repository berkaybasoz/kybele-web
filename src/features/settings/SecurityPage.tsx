import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function SecurityPage() {
  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0 }}>Güvenlik</h1>
      <div className="grid-2">
        <div className="field">
          <label>Mevcut Şifre</label>
          <Input type="password" />
        </div>
        <div className="field">
          <label>Yeni Şifre</label>
          <Input type="password" />
        </div>
      </div>
      <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
        <Button variant="primary">Şifreyi Güncelle</Button>
      </div>
    </div>
  );
}
