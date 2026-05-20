import React from 'react';
import { Icon, Avatar, Stat, ProgressBar } from '../components/ui';
import type { ScreenName } from '../types/game';

interface ViewProfileProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

interface InsightBarProps {
  label: string;
  v: number;
  color: string;
}

interface EloChartProps {
  blueColor: string;
}

interface Achievement {
  i: string;
  n: string;
  d: boolean;
}

interface Friend {
  n: string;
  st: string;
  s: 'online' | 'away' | 'offline';
}

function InsightBar({ label, v, color }: InsightBarProps): React.ReactElement {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="row" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
        <div className="spacer"/>
        <span className="t-mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{v}%</span>
      </div>
      <ProgressBar value={v} color={color} />
    </div>
  );
}

function EloChart({ blueColor }: EloChartProps): React.ReactElement {
  const data = [1772,1768,1775,1781,1769,1774,1788,1795,1789,1801,1798,1810,1804,1815,1808,1820,1817,1825,1819,1828,1830,1822,1835,1840,1832,1842,1838,1845,1809,1814];
  const w = 600, h = 160, pad = 8;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts: [number, number][] = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const area = path + ` L${lastPt[0]},${h} L${firstPt[0]},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 160, display: 'block' }}>
      <defs>
        <linearGradient id="elog" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={blueColor} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={blueColor} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,1,2,3].map((i) => (
        <line key={i} x1={0} x2={w} y1={pad + i * ((h-pad*2)/3)} y2={pad + i * ((h-pad*2)/3)} stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4" />
      ))}
      <path d={area} fill="url(#elog)" />
      <path d={path} fill="none" stroke={blueColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill={blueColor} />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="8" fill={blueColor} fillOpacity="0.2" />
    </svg>
  );
}

const ACHIEVEMENTS: Achievement[] = [
  { i: 'crown',   n: 'Primera victoria',       d: true },
  { i: 'bolt',    n: 'Blitz x10',              d: true },
  { i: 'shield',  n: 'Imparable',              d: true },
  { i: 'sparkle', n: 'Subtablero perfecto',    d: true },
  { i: 'star',    n: 'ELO 1800+',              d: true },
  { i: 'trophy',  n: '100 victorias',          d: true },
  { i: 'cpu',     n: 'Vence a Experto',        d: false },
  { i: 'medal',   n: '500 partidas',           d: false },
  { i: 'flag',    n: 'Comeback x5',            d: false },
  { i: 'globe',   n: 'Trotamundos',            d: false },
  { i: 'sparkle', n: 'Maratón 24h',            d: false },
  { i: 'crown',   n: 'Top 100 mundial',        d: false },
];

const FRIENDS: Friend[] = [
  { n: 'maverick', st: 'En partida · Blitz', s: 'online' },
  { n: 'somnia',   st: 'Buscando rival',     s: 'online' },
  { n: 'noahz',    st: 'En menú',            s: 'online' },
  { n: 'baltz',    st: 'Ausente',            s: 'away' },
];

export function ViewProfile({ navigate, blueColor, redColor }: ViewProfileProps): React.ReactElement {
  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      {/* Header */}
      <div className="card" style={{
        padding: 0, overflow: 'hidden', marginBottom: 18,
        background: `radial-gradient(500px 200px at 10% 0%, rgba(59,130,246,.20), transparent 70%), var(--card)`,
      }}>
        <div style={{ height: 80, background: 'linear-gradient(120deg, rgba(59,130,246,.18), rgba(139,92,246,.18))' }}/>
        <div style={{ padding: '0 22px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'flex-end', marginTop: -28 }}>
          <Avatar name="Lucas H." size={96} square gradient="linear-gradient(140deg, #F59E0B, #EF4444)" status="online" />
          <div style={{ paddingBottom: 6 }}>
            <div className="row" style={{ gap: 8 }}>
              <div className="t-h1">Lucas H.</div>
              <span className="chip blue">@lucas</span>
              <span className="chip"><Icon name="medal" size={11}/> Cazador veterano</span>
            </div>
            <div className="row" style={{ gap: 14, marginTop: 6, color: 'var(--text-2)', fontSize: 12 }}>
              <span>📍 Ciudad de México</span>
              <span>·</span>
              <span>Miembro desde 2024</span>
              <span>·</span>
              <span>Última conexión hace 2 min</span>
            </div>
          </div>
          <div className="row" style={{ paddingBottom: 6, gap: 8 }}>
            <button className="btn"><Icon name="settings" size={14}/> Editar</button>
            <button className="btn primary" onClick={() => navigate('game')}><Icon name="play" size={14}/> Desafiar</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <Stat label="ELO" value="1 814" sub="Diamante II" accent={blueColor} />
            <Stat label="Partidas" value="447" sub="esta temporada" />
            <Stat label="Winrate" value="64%" sub="284 V · 142 D · 21 E" accent="var(--green)" />
            <Stat label="Racha" value="6" sub="actual" accent="var(--amber)" />
          </div>

          {/* ELO graph */}
          <div className="card" style={{ padding: 20 }}>
            <div className="row" style={{ marginBottom: 14 }}>
              <div className="t-h3">Progresión ELO · últimos 30 días</div>
              <div className="spacer"/>
              <div className="row" style={{ gap: 6 }}>
                <span className="chip">7d</span>
                <span className="chip blue">30d</span>
                <span className="chip">90d</span>
              </div>
            </div>
            <EloChart blueColor={blueColor} />
          </div>

          {/* Achievements */}
          <div className="card" style={{ padding: 20 }}>
            <div className="row" style={{ marginBottom: 14 }}>
              <div className="t-h3">Logros</div>
              <div className="spacer"/>
              <span className="chip">14 / 42</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
              {ACHIEVEMENTS.map((a, i) => (
                <div key={i} title={a.n} style={{
                  aspectRatio: '1 / 1',
                  background: a.d ? 'linear-gradient(140deg, rgba(245,158,11,.16), rgba(239,68,68,.10))' : 'var(--surface-2)',
                  border: a.d ? '1px solid rgba(245,158,11,.4)' : '1px solid var(--border)',
                  borderRadius: 10,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: 8, textAlign: 'center' as const,
                  opacity: a.d ? 1 : 0.4,
                }}>
                  <Icon name={a.i} size={22} style={{ color: a.d ? 'var(--amber)' : 'var(--text-3)' }} />
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: a.d ? 'var(--text)' : 'var(--text-3)' }}>{a.n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Insights */}
          <div className="card" style={{ padding: 18 }}>
            <div className="t-h3" style={{ marginBottom: 14 }}>Patrones de juego</div>
            <InsightBar label="Centro"  v={72} color={blueColor} />
            <InsightBar label="Esquinas" v={54} color={blueColor} />
            <InsightBar label="Bordes"   v={31} color={blueColor} />
            <div className="divider" />
            <InsightBar label="Como X" v={68} color={blueColor} />
            <InsightBar label="Como O" v={60} color={redColor} />
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div className="t-h3" style={{ marginBottom: 14 }}>Amigos en línea</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {FRIENDS.map((f) => (
                <div key={f.n} className="row" style={{ padding: '8px 10px', borderRadius: 6, gap: 10 }}>
                  <Avatar name={f.n} size={28} status={f.s} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{f.n}</div>
                    <div className="t-cap" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.st}</div>
                  </div>
                  <button className="btn icon ghost"><Icon name="play" size={13}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
