import React from 'react';

interface KbdProps {
  children: React.ReactNode;
}

export default function Kbd({ children }: KbdProps): React.ReactElement {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 6px',
        borderRadius: 'var(--r-xs)',
        background: 'var(--card)',
        border: '1px solid var(--border-hi)',
        borderBottomWidth: 2,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--text-2)',
        lineHeight: 1.4,
        boxShadow: 'var(--shadow-sm)',
        userSelect: 'none',
      }}
    >
      {children}
    </kbd>
  );
}
