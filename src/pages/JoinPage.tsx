import React from 'react';
import { Icon, Avatar } from '../components/ui';
import type { ScreenName } from '../types/game';

interface ViewJoinProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

type FilterKey = 'all' | 'blitz' | 'rapid' | 'ranked' | 'eu' | 'na';

interface Room {
  id: string;
  host: string;
  elo: number;
  mode: string;
  reg: string;
  ping: number;
  pl: string;
  private: boolean;
  ranked?: boolean;
  spectators?: boolean;
}

const FILTERS: [FilterKey, string][] = [
  ['all', 'Todas'],
  ['blitz', 'Blitz'],
  ['rapid', 'Rápida'],
  ['ranked', 'Ranked'],
  ['eu', 'EU'],
  ['na', 'NA'],
];

const CODE_CHARS = ['A', '7', 'K', '-', '9', '2', 'F'];

export function ViewJoin({ navigate, blueColor: _blueColor, redColor: _redColor }: ViewJoinProps): React.ReactElement {
  const [filter, setFilter] = React.useState<FilterKey>('all');

  const rooms: Room[] = [
    { id: 'CR3-99A', host: 'kira_99',  elo: 1701, mode: 'Blitz 5+3',       reg: 'EU-W',  ping: 24,  pl: '1/2', private: false },
    { id: 'LM2-K4B', host: 'noahz',    elo: 1955, mode: 'Rápida 10+5',     reg: 'NA-E',  ping: 88,  pl: '1/2', private: false, ranked: true },
    { id: 'XX9-77Q', host: 'somnia',   elo: 1888, mode: 'Casual',           reg: 'EU-W',  ping: 28,  pl: '1/4', private: false, spectators: true },
    { id: 'JF2-001', host: 'baltz',    elo: 1644, mode: 'Blitz 3+2',       reg: 'SA',    ping: 142, pl: '1/2', private: false },
    { id: 'AB7-J22', host: 'maverick', elo: 1842, mode: 'Ultra-bullet 1+1', reg: 'EU-W', ping: 22,  pl: '1/2', private: false, ranked: true },
    { id: 'OPN-008', host: 'rin',      elo: 1490, mode: 'Casual',           reg: 'AS',    ping: 248, pl: '1/4', private: false },
  ];

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      <div className="row" style={{ marginBottom: 18 }}>
        <button className="btn ghost sm" onClick={() => navigate('home')}><Icon name="arrow-l" size={14}/> Inicio</button>
        <div className="spacer"/>
        <button className="btn primary" onClick={() => navigate('create')}><Icon name="plus" size={14}/> Crear partida</button>
      </div>
      <div className="t-h1" style={{ marginBottom: 4 }}>Unirse a partida</div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 22 }}>Introduce un código de sala o explora partidas públicas.</div>

      {/* Code joiner */}
      <div className="card" style={{ padding: 20, marginBottom: 18, display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
        <div>
          <div className="t-tag" style={{ marginBottom: 8 }}>Código de sala</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {CODE_CHARS.map((c, i) => (
              <div key={i} style={{
                width: 44, height: 52,
                background: c === '-' ? 'transparent' : 'var(--surface-2)',
                border: c === '-' ? 'none' : '1px solid var(--border-hi)',
                borderRadius: 8,
                display: 'grid', placeItems: 'center',
                fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: c === '-' ? 'var(--text-3)' : 'var(--text)',
              }}>{c}</div>
            ))}
            <button className="btn primary lg" style={{ marginLeft: 12 }} onClick={() => navigate('lobby')}>
              Unirse <Icon name="arrow-r" size={14}/>
            </button>
          </div>
          <div className="t-cap" style={{ marginTop: 8 }}>Pega un código compartido o usa el explorador abajo.</div>
        </div>
        <div style={{
          width: 110, height: 110, background: 'var(--surface-2)',
          border: '1px solid var(--border)', borderRadius: 10,
          display: 'grid', placeItems: 'center',
          backgroundImage: 'repeating-conic-gradient(#1A1A1D 0% 25%, var(--card) 0% 50%)',
          backgroundSize: '12px 12px',
        }}>
          <Icon name="kbd" size={32} style={{ color: 'var(--text-3)' }} />
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
            <input style={{
              background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)',
              fontSize: 13, width: '100%',
            }} placeholder="Buscar por host, modo o región..." />
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
          gridTemplateColumns: '110px 1fr 120px 120px 90px 80px 110px',
          gap: 12, padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)',
          fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' as const,
          color: 'var(--text-3)',
        }}>
          <div>Sala</div><div>Host</div><div>Modo</div><div>Región</div><div>Ping</div><div>Jug.</div><div></div>
        </div>
        {rooms.map((r) => (
          <div key={r.id} style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr 120px 120px 90px 80px 110px',
            gap: 12, padding: '12px 16px', alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            fontSize: 13,
          }}>
            <div className="t-mono" style={{ fontWeight: 600 }}>{r.id}</div>
            <div className="row" style={{ gap: 10 }}>
              <Avatar name={r.host} size={26} status="online" />
              <div>
                <div style={{ fontWeight: 600 }}>{r.host}</div>
                <div className="t-cap t-mono">ELO {r.elo}</div>
              </div>
              {r.ranked && <span className="chip blue" style={{ fontSize: 9 }}>RANKED</span>}
              {r.spectators && <span className="chip" style={{ fontSize: 9 }}><Icon name="eye" size={10}/> spec</span>}
            </div>
            <div className="t-mono" style={{ fontSize: 12 }}>{r.mode}</div>
            <div className="row" style={{ gap: 6 }}><Icon name="globe" size={13} style={{ color: 'var(--text-3)' }}/> <span style={{ fontSize: 12 }}>{r.reg}</span></div>
            <div className="row" style={{ gap: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: r.ping < 50 ? 'var(--green)' : r.ping < 150 ? 'var(--amber)' : 'var(--red)',
              }}/>
              <span className="t-mono" style={{ fontSize: 12 }}>{r.ping} ms</span>
            </div>
            <div className="t-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.pl}</div>
            <button className="btn sm primary" onClick={() => navigate('lobby')}>Unirme</button>
          </div>
        ))}
      </div>
    </div>
  );
}
