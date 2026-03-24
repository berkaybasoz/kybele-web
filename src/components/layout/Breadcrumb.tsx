import { useLocation } from 'react-router-dom';

export function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
      {segments.length === 0 ? 'dashboard' : segments.join(' / ')}
    </div>
  );
}
