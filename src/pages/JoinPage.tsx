import React from 'react';
import { Icon, Avatar } from '../components/ui';
import type { ScreenName } from '../types/game';
import type { RoomListing } from '../types/api.types';
import { supabaseService } from '../services/supabase.service';
import { useActiveMatchGuard } from '@/hooks/useActiveMatchGuard';
import { ActiveMatchBlockedModal } from '@/components/ui/ActiveMatchBlockedModal';

const VALID_CHAR_RE = /^[A-HJ-NP-Z2-9]$/;

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
}

function CodeInput({ value, onChange }: CodeInputProps): React.ReactElement {
  const refs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ] as const;

  const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  function focusCell(index: number): void {
    if (index >= 0 && index < 6) {
      refs[index].current?.focus();
    }
  }

  function updateChars(next: string[]): void {
    onChange(next.join(''));
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Backspace') {
      if (chars[index] !== '') {
        const next = [...chars];
        next[index] = '';
        updateChars(next);
      } else {
        const next = [...chars];
        if (index > 0) {
          next[index - 1] = '';
          updateChars(next);
          focusCell(index - 1);
        }
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      focusCell(index - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      focusCell(index + 1);
      e.preventDefault();
    } else if (e.key === 'Delete') {
      const next = [...chars];
      next[index] = '';
      updateChars(next);
      e.preventDefault();
    }
  }

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>): void {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!raw) return;

    const incoming = raw.replace(chars[index], '').slice(-1);
    if (!incoming || !VALID_CHAR_RE.test(incoming)) return;

    const next = [...chars];
    next[index] = incoming;
    updateChars(next);
    focusCell(index + 1);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>): void {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/-/g, '');
    const valid = pasted.split('').filter((c) => VALID_CHAR_RE.test(c)).slice(0, 6);
    const next = Array.from({ length: 6 }, (_, i) => valid[i] ?? '');
    updateChars(next);
    const lastFilled = valid.length - 1;
    focusCell(Math.min(lastFilled + 1, 5));
  }

  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

  function cellStyle(index: number): React.CSSProperties {
    const isFocused = focusedIndex === index;
    return {
      width: 52,
      height: 60,
      background: 'var(--surface-2)',
      border: isFocused ? '1px solid var(--blue, #3B82F6)' : '1px solid var(--border)',
      boxShadow: isFocused ? '0 0 0 3px var(--blue-dim, rgba(59,130,246,.14))' : 'none',
      borderRadius: 'var(--r-md, 10px)',
      fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
      fontSize: 24,
      fontWeight: 700,
      color: 'var(--text)',
      textAlign: 'center',
      caretColor: 'transparent',
      cursor: 'text',
      outline: 'none',
      padding: 0,
      transition: 'border-color 100ms, box-shadow 100ms',
    };
  }

  function renderCell(i: number): React.ReactElement {
    return (
      <input
        key={i}
        ref={refs[i]}
        value={chars[i]}
        maxLength={2}
        onKeyDown={(e) => handleKeyDown(i, e)}
        onChange={(e) => handleChange(i, e)}
        onPaste={handlePaste}
        onFocus={(e) => { setFocusedIndex(i); e.target.select(); }}
        onBlur={() => setFocusedIndex(null)}
        style={cellStyle(i)}
        onMouseDown={(e) => { e.preventDefault(); refs[i].current?.focus(); }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {([0, 1, 2] as const).map(renderCell)}
      <span style={{
        color: 'var(--text-3)',
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1,
        userSelect: 'none',
        paddingBottom: 2,
        fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
      }}>—</span>
      {([3, 4, 5] as const).map(renderCell)}
    </div>
  );
}

interface ViewJoinProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
  playerName?: string;
  onJoinRoom?: (code: string, playerName: string) => void;
}

type FilterKey = 'all' | 'blitz' | 'rapid' | 'ranked' | 'eu' | 'na';

const FILTERS: [FilterKey, string][] = [
  ['all', 'All'],
  ['blitz', 'Blitz'],
  ['rapid', 'Rapid'],
  ['ranked', 'Ranked'],
  ['eu', 'EU'],
  ['na', 'NA'],
];

const TIME_CONTROL_LABEL: Record<RoomListing['timeControl'], string> = {
  none:   'No limit',
  blitz:  'Blitz 5+3',
  rapid:  'Rapid 10+5',
  custom: 'Custom',
};

function relativeTime(isoStr: string): string {
  const diffMs = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'now';
  if (mins === 1) return '1 min ago';
  return `${mins} min ago`;
}

export function ViewJoin({ navigate, blueColor: _blueColor, redColor: _redColor, playerName = 'Player', onJoinRoom }: ViewJoinProps): React.ReactElement {
  const { isBlocked, closeBlockedModal } = useActiveMatchGuard('join');
  const [filter, setFilter] = React.useState<FilterKey>('all');
  const [joinCode, setJoinCode] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [rooms, setRooms] = React.useState<RoomListing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void supabaseService.rooms.listWaiting().then((data) => {
      setRooms(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const unsub = supabaseService.rooms.subscribeToWaiting(
      (r) => setRooms((prev) => [r, ...prev]),
      (code) => setRooms((prev) => prev.filter((r) => r.code !== code)),
      (r) => setRooms((prev) => prev.map((x) => (x.code === r.code ? r : x))),
    );

    return unsub;
  }, []);

  const filtered = rooms.filter((r) => {
    if (filter === 'blitz' && r.timeControl !== 'blitz') return false;
    if (filter === 'rapid' && r.timeControl !== 'rapid') return false;
    if (search) {
      return r.hostName.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%', position: 'relative' }}>
      <ActiveMatchBlockedModal
        isOpen={isBlocked}
        onClose={closeBlockedModal}
        navigate={navigate}
      />
      <div className="row" style={{ marginBottom: 18 }}>
        <button className="btn ghost sm" onClick={() => navigate('home')}><Icon name="arrow-l" size={14}/> Home</button>
        <div className="spacer"/>
        <button className="btn primary" onClick={() => navigate('create')}><Icon name="plus" size={14}/> Create Game</button>
      </div>
      <div className="t-h1" style={{ marginBottom: 4 }}>Join Game</div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 22 }}>Enter a room code or browse public games.</div>

      {/* Code joiner */}
      <div className="card" style={{ padding: 20, marginBottom: 18 }}>
        <div className="t-tag" style={{ marginBottom: 12 }}>Private Room Code</div>
        <CodeInput
          value={joinCode.replace(/-/g, '')}
          onChange={(raw) => {
            const withDash = raw.length > 3 ? raw.slice(0, 3) + '-' + raw.slice(3) : raw;
            setJoinCode(withDash);
          }}
        />
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn primary lg"
            disabled={joinCode.length < 7 || !onJoinRoom}
            onClick={() => { onJoinRoom?.(joinCode, playerName); navigate('lobby'); }}
          >
            Join <Icon name="arrow-r" size={14}/>
          </button>
          <span className="t-cap">Paste a shared code or browse available rooms below.</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 14, marginBottom: 12 }}>
        <div className="row" style={{ gap: 10 }}>
          <div className="row" style={{
            padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 8,
            border: '1px solid var(--border)', flex: 1, gap: 8,
          }}>
            <Icon name="search" size={14} style={{ color: 'var(--text-3)' }}/>
            <input
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, width: '100%' }}
              placeholder="Search by host..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="row" style={{ gap: 4 }}>
            {FILTERS.map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className="btn sm"
                style={{
                  background: filter === k ? 'var(--card-hi)' : 'transparent',
                  border: filter === k ? '1px solid var(--border-hi)' : '1px solid transparent',
                  color: filter === k ? 'var(--text)' : 'var(--text-2)',
                }}
              >{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Rooms list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '110px 1fr 140px 120px 80px 110px',
          gap: 12, padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)',
          fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' as const,
          color: 'var(--text-3)',
        }}>
          <div>Room</div><div>Host</div><div>Mode</div><div>Created</div><div>Players</div><div></div>
        </div>

        {loading && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            Loading games…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 600 }}>No public games available</div>
            <div className="t-cap" style={{ marginTop: 6 }}>Create one to start playing</div>
          </div>
        )}

        {!loading && filtered.map((r) => (
          <div key={r.id} style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr 140px 120px 80px 110px',
            gap: 12, padding: '12px 16px', alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            fontSize: 13,
          }}>
            <div className="t-mono" style={{ fontWeight: 600 }}>{r.code}</div>
            <div className="row" style={{ gap: 10 }}>
              <Avatar name={r.hostName} size={26} status="online" />
              <div>
                <div style={{ fontWeight: 600 }}>{r.hostName}</div>
                <div className="t-cap t-mono">{r.hostElo > 0 ? `ELO ${r.hostElo}` : '—'}</div>
              </div>
            </div>
            <div className="t-mono" style={{ fontSize: 12 }}>{TIME_CONTROL_LABEL[r.timeControl]}</div>
            <div className="t-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{relativeTime(r.createdAt)}</div>
            <div className="t-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>1/2</div>
            <button
              className="btn sm primary"
              onClick={() => { onJoinRoom?.(r.code, playerName); navigate('lobby'); }}
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
