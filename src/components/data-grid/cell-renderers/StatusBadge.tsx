import clsx from 'clsx';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function StatusBadge({
  label,
  variant = 'neutral',
  compact,
  className,
}: {
  label: string;
  variant?: Variant;
  compact?: boolean;
  className?: string;
}) {
  return <span className={clsx('badge', variant, compact && 'compact', className)}>{label}</span>;
}
