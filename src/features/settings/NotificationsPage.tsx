import { Button } from '../../components/ui/Button';

export function NotificationsPage() {
  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0 }}>Bildirimler</h1>
      <label style={{ display: 'block', marginBottom: 10 }}>
        <input type="checkbox" defaultChecked /> Yeni gerçekleşmelerde e-posta bildirimi
      </label>
      <label style={{ display: 'block', marginBottom: 10 }}>
        <input type="checkbox" defaultChecked /> Risk limiti aşımında kritik uyarı
      </label>
      <Button variant="primary">Tercihleri Kaydet</Button>
    </div>
  );
}
