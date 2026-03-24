import clsx from 'clsx';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function StatusBadge({
  label,
  variant = 'neutral',
}: {
  label: string;
  variant?: Variant;
}) {
  return <span className={clsx('badge', variant)}>{label}</span>;
}
