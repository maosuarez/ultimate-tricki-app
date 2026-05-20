import React from 'react';
import { Icon, Avatar, Stat } from '../components/ui';
import { MetaBoard } from '../components/game';
import { buildSampleGame } from '../utils/boardUtils';
import type { ScreenName } from '../types/game';

interface ViewDashboardProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

interface RecentMatch {
  id: string;
  op: string;
  opElo: number;
  result: 'win' | 'loss' | 'draw';
  moves: number;
  time: string;
  when: string;
}

interface RankingEntry {
  rk: number;
  n: string;
  elo: number;
  gd: string;
  me?: boolean;
}

export function ViewDashboard({ navigate, blueColor, redColor }: ViewDashboardProps): React.ReactElement {
  const recent: RecentMatch[] = [
    { id: 'r1', op: 'maverick', opElo: 1842, result: 'win',  moves: 41, time: '12m 04s', when: 'hace 2h' },
    { id: 'r2', op: 'kira_99',  opElo: 1701, result: 'loss', moves: 28, time: '06m 18s', when: 'hace 5h' },
    { id: 'r3', op: 'noahz',    opElo: 1955, result: 'win',  moves: 53, time: '18m 22s', when: 'ayer' },
    { id: 'r4', op: 'IA · Difícil', opElo: 1700, result: 'win', moves: 35, time: '09m 47s', when: 'ayer' },
    { id: 'r5', op: 'somnia',   opElo: 1788, result: 'draw', moves: 81, time: '24m 11s', when: 'hace 2d' },
  ];
  const ranking: RankingEntry[] = [
    { rk: 1, n: 'noahz', elo: 1955, gd: '+312' },
    { rk: 2, n: 'somnia', elo: 1888, gd: '+184' },
    { rk: 3, n: 'maverick', elo: 1842, gd: '+98' },
    { rk: 4, n: 'tú', elo: 1814, gd: '+42', me: true },
    { rk: 5, n: 'kira_99', elo: 1701, gd: '-15' },
    { rk: 6, n: 'baltz', elo: 1644, gd: '-72' },
  ];

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      {/* Hero */}
      <div style={{
        background: `
          radial-gradient(800px 220px at 20% 0%, rgba(59,130,246,.16), transparent 60%),
          radial-gradient(600px 180px at 90% 100%, rgba(139,92,246,.14), transparent 60%),
          linear-gradient(180deg, var(--card), var(--surface-2))
        `,
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        padding: '28px 32px',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 28,
        alignItems: 'center', marginBottom: 22,
      }}>
        <div>
          <div className="t-tag" style={{ marginBottom: 10 }}>Bienvenido de vuelta</div>
          <div className="t-display" style={{ marginBottom: 6 }}>Hola, <span style={{ color: blueColor }}>Lucas</span>.</div>
          <div className="muted" style={{ fontSize: 14, marginBottom: 18, maxWidth: 540 }}>
            Tienes una partida pendiente de rematch contra <b style={{ color: 'var(--text)' }}>maverick</b> y 3 invitaciones nuevas.
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn primary lg" onClick={() => navigate('game')}>
              <Icon name="play" size={16} /> Jugar ahora
            </button>
            <button className="btn lg" onClick={() => navigate('create')}>
              <Icon name="plus" size={16} /> Crear partida
            </button>
            <button className="btn lg ghost" onClick={() => navigate('join')}>
              <Icon name="users" size={16} /> Unirse a sala
            </button>
          </div>
        </div>
        {/* Mini meta-board preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <MetaBoard game={buildSampleGame()} size={150} blueColor={blueColor} redColor={redColor} />
          <div className="t-cap">Última partida · turno 31</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        <Stat label="ELO" value="1 814" sub="+42 esta semana" accent="var(--text)" />
        <Stat label="Victorias" value="284" sub="64% winrate" accent="var(--green)" />
        <Stat label="Racha" value="6" sub="6 victorias seguidas" accent={blueColor} />
        <Stat label="Tiempo total" value="42h" sub="esta temporada" />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Recent matches */}
        <div className="card" style={{ padding: 20 }}>
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="t-h2">Historial reciente</div>
            <div className="spacer" />
            <button className="btn sm ghost" onClick={() => navigate('history')}>Ver todo <Icon name="chev-r" size={14}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recent.map((r) => (
              <div key={r.id} style={{
                display: 'grid', gridTemplateColumns: '24px 1fr auto auto auto auto', gap: 14, alignItems: 'center',
                padding: '10px 12px', borderRadius: 8, background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 8, height: 24, borderRadius: 2,
                  background: r.result === 'win' ? 'var(--green)' :
                              r.result === 'loss' ? 'var(--red)' : 'var(--text-3)',
                }}/>
                <div className="row" style={{ gap: 10 }}>
                  <Avatar name={r.op} size={28} gradient={r.op.includes('IA') ? 'linear-gradient(140deg,#52525B,#27272A)' : undefined} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>vs {r.op}</div>
                    <div className="t-cap">ELO {r.opElo}</div>
                  </div>
                </div>
                <span className={`chip ${r.result === 'win' ? 'green' : r.result === 'loss' ? 'red' : ''}`}>
                  {r.result === 'win' ? 'Victoria' : r.result === 'loss' ? 'Derrota' : 'Empate'}
                </span>
                <div className="t-cap t-mono">{r.moves} mov.</div>
                <div className="t-cap t-mono">{r.time}</div>
                <div className="row" style={{ gap: 4 }}>
                  <button className="btn sm ghost" title="Ver replay" onClick={() => navigate('replay')}>
                    <Icon name="replay" size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking */}
        <div className="card" style={{ padding: 20 }}>
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="t-h2">Ranking local</div>
            <div className="spacer" />
            <span className="chip"><Icon name="globe" size={11}/> Global</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ranking.map((r) => (
              <div key={r.rk} style={{
                display: 'grid', gridTemplateColumns: '24px 28px 1fr auto auto', gap: 12, alignItems: 'center',
                padding: '8px 10px', borderRadius: 6,
                background: r.me ? 'rgba(59,130,246,.10)' : 'transparent',
                border: r.me ? '1px solid rgba(59,130,246,.3)' : '1px solid transparent',
              }}>
                <div className="t-mono dim" style={{ fontSize: 12, textAlign: 'center' }}>#{r.rk}</div>
                <Avatar name={r.n} size={24} status={r.me ? 'online' : undefined} />

                <div style={{ fontWeight: r.me ? 700 : 500, fontSize: 13 }}>{r.n}</div>
                <div className="t-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.elo}</div>
                <div className="t-mono" style={{ fontSize: 11, color: r.gd.startsWith('+') ? 'var(--green)' : 'var(--text-3)' }}>
                  {r.gd}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
