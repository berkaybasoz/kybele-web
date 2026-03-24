import { formatNumber } from '../../../lib/formatters/number';

export function NumericCell({ value }: { value: number }) {
  const color = value >= 0 ? 'var(--text-primary)' : 'var(--accent-red)';
  return (
    <span style={{ color, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
      {formatNumber(value)}
    </span>
  );
}
