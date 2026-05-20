import React from 'react';

interface AvatarProps {
  name?: string;
  size?: number;
  gradient?: string;
  status?: 'online' | 'away' | 'offline';
  square?: boolean;
}

const STATUS_COLORS: Record<NonNullable<AvatarProps['status']>, string> = {
  online: 'var(--green)',
  away: 'var(--amber)',
  offline: 'var(--text-dim)',
};

export default function Avatar({ name, size = 32, gradient, status, square = false }: AvatarProps): React.ReactElement {
  const initials = name
    ? name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const bg = gradient ?? 'linear-gradient(140deg, #F59E0B, #EF4444)';
  const radius = square ? Math.round(size * 0.25) : '50%';
  const fontSize = Math.round(size * 0.4);
  const statusSize = Math.round(size * 0.3);
  const statusBorder = Math.round(size * 0.06);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: bg,
          display: 'grid',
          placeItems: 'center',
          fontWeight: 700,
          color: '#fff',
          fontSize,
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      {status && (
        <span
          style={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: statusSize,
            height: statusSize,
            borderRadius: '50%',
            background: STATUS_COLORS[status],
            border: `${statusBorder}px solid var(--surface)`,
          }}
        />
      )}
    </div>
  );
}
