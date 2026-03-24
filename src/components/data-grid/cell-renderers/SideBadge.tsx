import { StatusBadge } from './StatusBadge';

export function SideBadge({ side }: { side: 'BUY' | 'SELL' }) {
  if (side === 'BUY') {
    return <StatusBadge label="AL" variant="success" />;
  }

  return <StatusBadge label="SAT" variant="danger" />;
}
