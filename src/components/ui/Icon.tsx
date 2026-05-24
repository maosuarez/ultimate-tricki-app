import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const paths: Record<string, React.ReactNode> = {
  home:          <path d="M3 11l9-8 9 8M5 9.5V21h14V9.5"/>,
  play:          <path d="M6 4l14 8-14 8z" fill="currentColor"/>,
  plus:          <path d="M12 5v14M5 12h14"/>,
  users:         <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 8.5a3 3 0 100-6M22 19a5 5 0 00-5-5"/></>,
  user:          <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></>,
  trophy:        <path d="M8 4h8v4a4 4 0 11-8 0V4zM6 4H4v3a3 3 0 003 3M18 4h2v3a3 3 0 01-3 3M10 14h4v3l1 3H9l1-3v-3z"/>,
  history:       <path d="M12 4a8 8 0 11-7.7 10M4 4v4h4M12 8v5l3 2"/>,
  replay:        <path d="M3 12a9 9 0 109-9M3 3v6h6"/>,
  settings:      <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1A2 2 0 113.3 17l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H2a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8L3.2 7A2 2 0 116 4.2l.1.1a1.7 1.7 0 001.8.3h.1A1.7 1.7 0 009 3.1V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1A2 2 0 1120.7 7l-.1.1a1.7 1.7 0 00-.3 1.8v.1a1.7 1.7 0 001.5 1H22a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
  chat:          <path d="M21 12a8 8 0 11-3.5-6.6L21 4l-1.4 3.5A8 8 0 0121 12z"/>,
  send:          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>,
  search:        <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
  globe:         <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></>,
  wifi:          <path d="M5 13a11 11 0 0114 0M8.5 16.5a6 6 0 017 0M12 20h.01M2 9a16 16 0 0120 0"/>,
  lock:          <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
  check:         <path d="M5 12l5 5L20 7"/>,
  x:             <path d="M6 6l12 12M18 6L6 18"/>,
  'chev-r':      <path d="M9 6l6 6-6 6"/>,
  sidebar:       <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></>,
  'chev-d':      <path d="M6 9l6 6 6-6"/>,
  'arrow-l':     <path d="M19 12H5M12 19l-7-7 7-7"/>,
  'arrow-r':     <path d="M5 12h14M12 5l7 7-7 7"/>,
  crown:         <path d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7z"/>,
  bolt:          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>,
  clock:         <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  flag:          <path d="M5 21V4h11l-2 4 2 4H5"/>,
  cpu:           <><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"/></>,
  bell:          <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0"/>,
  eye:           <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
  mic:           <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></>,
  volume:        <path d="M11 5L6 9H2v6h4l5 4V5zM15 9a4 4 0 010 6M18 6a8 8 0 010 12"/>,
  gamepad:       <><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 12h2M8 11v2M15 11h.01M17 13h.01"/></>,
  star:          <path d="M12 2l3 7 7 .6-5.3 4.7L18 22l-6-3.5L6 22l1.3-7.7L2 9.6 9 9z" fill="currentColor"/>,
  medal:         <><circle cx="12" cy="15" r="6"/><path d="M9 9L6 3h12l-3 6"/></>,
  shield:        <path d="M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6z"/>,
  sparkle:       <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/>,
  kbd:           <><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></>,
  palette:       <><path d="M12 22a10 10 0 110-20 9 9 0 016 16h-3a2 2 0 00-2 2 2 2 0 01-1 2z"/><circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="16.5" cy="9.5" r="1"/></>,
  language:      <path d="M5 8h13M10 4v4M6 19c2-3 4-6 6.5-12.5M14 19c-2.5-4-3-5-3.5-6.5M14 19h-4M21 19l-3-7-3 7M16 17h4"/>,
  accessibility: <><circle cx="12" cy="5" r="2"/><path d="M5 9h14M9 9l1 13M15 9l-1 13M9 14h6"/></>,
  database:      <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/></>,
  mail:          <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 7l10 7 10-7"/></>,
  copy:          <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></>,
  more:          <><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></>,
  min:           <path d="M5 12h14"/>,
  max:           <rect x="4" y="4" width="16" height="16" rx="1"/>,
  pause:         <><rect x="6" y="5" width="4" height="14" fill="currentColor"/><rect x="14" y="5" width="4" height="14" fill="currentColor"/></>,
  'skip-f':      <path d="M5 4l10 8-10 8V4zM19 5v14"/>,
  'skip-b':      <path d="M19 4L9 12l10 8V4zM5 5v14"/>,
  'circle-o':    <circle cx="12" cy="12" r="9"/>,
  'circle-d':    <circle cx="12" cy="12" r="3" fill="currentColor"/>,
  spinner:       <path d="M21 12a9 9 0 11-6.2-8.5" strokeLinecap="round"/>,
  github:        <path d="M9 19c-4 1-4-2-6-2.5M15 22v-3.9c0-1.1-.1-1.5-.5-2 3-.3 6-1.5 6-6.6a5 5 0 00-1.4-3.5c.1-.4.6-1.8-.1-3.7 0 0-1.2-.4-3.9 1.5a13 13 0 00-7 0c-2.7-1.9-3.9-1.5-3.9-1.5-.7 1.9-.2 3.3-.1 3.7A5 5 0 002.5 8.6c0 5 3 6.3 6 6.6-.4.4-.7 1.1-.7 2v4.7"/>,
  google:        (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
};

export default function Icon({ name, size = 16, className, style }: IconProps): React.ReactElement {
  if (name === 'google') {
    const inner = paths['google'] as React.ReactElement;
    return (
      <span
        className={className}
        style={{ display: 'inline-flex', width: size, height: size, ...style }}
      >
        {inner}
      </span>
    );
  }

  const content = paths[name];
  const isSpinner = name === 'spinner';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[isSpinner ? 'spin' : '', className].filter(Boolean).join(' ')}
      style={style}
    >
      {content}
    </svg>
  );
}
