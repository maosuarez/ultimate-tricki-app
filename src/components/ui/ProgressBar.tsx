import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
}

export default function ProgressBar({ value, max = 100, color, height = 4 }: ProgressBarProps): React.ReactElement {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: height,
        background: 'var(--card-hi)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: height,
          background: color ?? 'var(--blue)',
          transition: 'width var(--t-base) var(--ease)',
        }}
      />
    </div>
  );
}
