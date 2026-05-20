import React from 'react';
import type { Player } from '../../types/game';

interface XMarkProps {
  size?: number | string;
  animate?: boolean;
  dim?: boolean;
  color?: string;
}

interface OMarkProps {
  size?: number | string;
  animate?: boolean;
  dim?: boolean;
  color?: string;
}

interface MarkProps {
  player: Player | null;
  size?: number | string;
  animate?: boolean;
  dim?: boolean;
  blue?: string;
  red?: string;
}

export function XMark({ size = 48, animate = false, dim = false, color }: XMarkProps): React.ReactElement {
  const len = 33.94;
  const strokeColor = color ?? 'var(--blue)';
  const opacity = dim ? 0.35 : 1;

  const lineStyle: React.CSSProperties = animate
    ? {
        strokeDasharray: len,
        strokeDashoffset: 0,
        animation: `mark-draw 260ms cubic-bezier(.22,.61,.36,1) forwards`,
      }
    : {};

  return (
    <div className="mark" style={{ width: size, height: size, opacity }}>
      <svg viewBox="0 0 48 48" fill="none" stroke={strokeColor} strokeWidth={5} strokeLinecap="round">
        <line
          x1="12" y1="12" x2="36" y2="36"
          style={animate ? { ...lineStyle, ['--len' as string]: len } : undefined}
        />
        <line
          x1="36" y1="12" x2="12" y2="36"
          style={animate ? { ...lineStyle, animationDelay: '60ms', ['--len' as string]: len } : undefined}
        />
      </svg>
    </div>
  );
}

export function OMark({ size = 48, animate = false, dim = false, color }: OMarkProps): React.ReactElement {
  const circumference = 2 * Math.PI * 17;
  const strokeColor = color ?? 'var(--red)';
  const opacity = dim ? 0.35 : 1;

  const circleStyle: React.CSSProperties = animate
    ? {
        strokeDasharray: circumference,
        strokeDashoffset: 0,
        animation: `mark-draw 300ms cubic-bezier(.22,.61,.36,1) forwards`,
        ['--len' as string]: circumference,
      }
    : {};

  return (
    <div className="mark" style={{ width: size, height: size, opacity }}>
      <svg viewBox="0 0 48 48" fill="none" stroke={strokeColor} strokeWidth={5} strokeLinecap="round">
        <circle cx="24" cy="24" r="17" style={animate ? circleStyle : undefined} />
      </svg>
    </div>
  );
}

export function Mark({ player, size = 48, animate = false, dim = false, blue, red }: MarkProps): React.ReactElement | null {
  if (player === 'X') {
    return <XMark size={size} animate={animate} dim={dim} color={blue} />;
  }
  if (player === 'O') {
    return <OMark size={size} animate={animate} dim={dim} color={red} />;
  }
  return null;
}
