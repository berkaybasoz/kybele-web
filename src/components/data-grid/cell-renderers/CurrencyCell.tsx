import { formatCurrency } from '../../../lib/formatters/currency';

export function CurrencyCell({ value, currency = 'TRY' }: { value: number; currency?: string }) {
  const color = value >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  return (
    <span style={{ color, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
      {formatCurrency(value, currency)}
    </span>
  );
}
