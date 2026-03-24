import { useCurrentUser } from '../../hooks/useCurrentUser';

export function ProfilePage() {
  const user = useCurrentUser();

  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0 }}>Profil</h1>
      <div className="grid-2">
        <div className="field">
          <label>Ad Soyad</label>
          <div>{user?.fullName}</div>
        </div>
        <div className="field">
          <label>Email</label>
          <div>{user?.email}</div>
        </div>
        <div className="field">
          <label>Kullanıcı Türü</label>
          <div>{user?.userType}</div>
        </div>
      </div>
    </div>
  );
}
