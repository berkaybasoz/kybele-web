import { ReactNode } from 'react';

type GridToolbarProps = {
  left?: ReactNode;
  right?: ReactNode;
};

export function GridToolbar({ left, right }: GridToolbarProps) {
  return (
    <div
      className="actions"
      style={{
        justifyContent: 'space-between',
        border: '1px solid var(--border)',
        borderRadius: 10,
        background: 'var(--bg-secondary)',
        padding: '10px 12px',
      }}
    >
      <div className="actions">{left}</div>
      <div className="actions">{right}</div>
    </div>
  );
}
