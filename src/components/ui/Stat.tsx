import React from 'react';

interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function Stat({ label, value, sub, accent }: StatProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="t-tag">{label}</span>
      <span
        className="t-h2 t-mono"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>
      {sub && <span className="t-cap">{sub}</span>}
    </div>
  );
}
