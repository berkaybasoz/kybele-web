import { useId, useMemo } from 'react';

type MiniSparklineProps = {
  data: number[];
  height?: number;
};

export function MiniSparkline({ data, height = 180 }: MiniSparklineProps) {
  const gradientId = useId();

  const { linePath, areaPath, max, min } = useMemo(() => {
    const fallback = [42, 44, 43, 48, 51, 50, 53, 56, 58, 57, 60, 64];
    const values = data.length > 1 ? data : fallback;
    const width = 1000;
    const chartHeight = 320;
    const padding = 24;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = Math.max(maxValue - minValue, 1);

    const points = values.map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / (values.length - 1);
      const ratio = (value - minValue) / range;
      const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
      return { x, y };
    });

    const line = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');

    const area = `${line} L ${(width - padding).toFixed(2)} ${(chartHeight - padding).toFixed(2)} L ${padding.toFixed(2)} ${(chartHeight - padding).toFixed(2)} Z`;

    return {
      linePath: line,
      areaPath: area,
      max: maxValue,
      min: minValue,
    };
  }, [data]);

  return (
    <div
      style={{
        height,
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, rgba(88,166,255,0.08), rgba(13,17,23,0.35) 48%, rgba(13,17,23,0.82))',
      }}
    >
      <svg viewBox="0 0 1000 320" width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(88, 166, 255, 0.50)" />
            <stop offset="100%" stopColor="rgba(88, 166, 255, 0.02)" />
          </linearGradient>
        </defs>

        {[72, 136, 200, 264].map((y) => (
          <line
            key={y}
            x1="20"
            y1={y}
            x2="980"
            y2={y}
            stroke="rgba(139, 148, 158, 0.22)"
            strokeDasharray="5 8"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke="var(--accent-blue)" strokeWidth="4" strokeLinecap="round" />

        <text x="26" y="34" fill="var(--text-secondary)" fontSize="18">
          Max: {max.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
        </text>
        <text x="26" y="314" fill="var(--text-muted)" fontSize="18">
          Min: {min.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
        </text>
      </svg>
    </div>
  );
}
