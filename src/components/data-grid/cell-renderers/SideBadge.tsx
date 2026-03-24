import { StatusBadge } from './StatusBadge';

export function SideBadge({ side }: { side: 'BUY' | 'SELL' }) {
  if (side === 'BUY') {
    return <StatusBadge label="Alış" variant="success" compact className="side" />;
  }

  return <StatusBadge label="Satış" variant="danger" compact className="side" />;
}
