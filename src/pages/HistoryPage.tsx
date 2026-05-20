import React from 'react';
import { Icon, Avatar } from '../components/ui';
import type { ScreenName } from '../types/game';

interface ViewHistoryProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

type MatchResult = 'win' | 'loss' | 'draw';

interface MatchEntry {
  id: string;
  op: string;
  elo: number;
  result: MatchResult;
  mode: string;
  moves: number;
  eloDelta: string;
  time: string;
  when: string;
}

const OPS = ['maverick','kira_99','noahz','somnia','baltz','rin','IA · Difícil','IA · Experto'];
const RESULTS: MatchResult[] = ['win','loss','win','draw','win','win','loss','win'];
const MODES = ['Blitz','Rápida','Casual','Blitz','Ultra','Blitz','Rápida','Casual'];
const ELO_DELTAS = ['+18','-15','+22','0','+12','+9','-19','+24'];

function buildMatches(): MatchEntry[] {
  return Array.from({ length: 18 }, (_, i) => ({
    id: `m${i}`,
    op: OPS[i % 8],
    elo: 1700 + ((i * 47) % 300),
    result: RESULTS[i % 8],
    mode: MODES[i % 8],
    moves: 28 + ((i * 11) % 50),
    eloDelta: ELO_DELTAS[i % 8],
    time: `${10 + (i % 14)}m`,
    when: i < 3 ? 'hoy' : i < 8 ? 'ayer' : 'esta semana',
  }));
}

export function ViewHistory({ navigate, blueColor: _blueColor, redColor: _redColor }: ViewHistoryProps): React.ReactElement {
  const matches = buildMatches();

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      <div className="row" style={{ marginBottom: 16 }}>
        <div>
          <div className="t-h1">Historial</div>
          <div className="muted" style={{ fontSize: 13 }}>{matches.length} partidas · filtra por modo, resultado u oponente</div>
        </div>
        <div className="spacer"/>
        <button className="btn"><Icon name="database" size={14}/> Exportar PGN</button>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: 12, marginBottom: 12 }}>
        <div className="row" style={{ gap: 8 }}>
          <div className="row" style={{ padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)', flex: 1, gap: 8 }}>
            <Icon name="search" size={14} style={{ color: 'var(--text-3)' }}/>
            <input style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, width: '100%' }} placeholder="Buscar oponente..." />
          </div>
          {[['all','Todas'],['win','Victorias'],['loss','Derrotas'],['draw','Empates'],['ranked','Ranked'],['ai','vs IA']].map(([f, l], i) => (
            <button key={f} className="btn sm" style={{
              background: i === 0 ? 'var(--card-hi)' : 'transparent',
              border: i === 0 ? '1px solid var(--border-hi)' : '1px solid transparent',
              color: i === 0 ? 'var(--text)' : 'var(--text-2)',
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {matches.map((m, i) => {
          const isNewDay = i === 0 || matches[i - 1].when !== m.when;
          const eloColor = m.eloDelta.startsWith('+') ? 'var(--green)' : m.eloDelta.startsWith('-') ? 'var(--red)' : 'var(--text-3)';
          return (
            <React.Fragment key={m.id}>
              {isNewDay && (
                <div style={{ padding: '8px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <span className="t-tag">{m.when}</span>
                </div>
              )}
              <div style={{
                display: 'grid', gridTemplateColumns: '8px 32px 1fr 120px 100px 80px 80px 90px',
                gap: 12, padding: '11px 14px 11px 0', alignItems: 'center',
                borderBottom: '1px solid var(--border)', fontSize: 13,
              }}>
                <div style={{
                  width: 4, height: 28, marginLeft: 14,
                  background: m.result === 'win' ? 'var(--green)' : m.result === 'loss' ? 'var(--red)' : 'var(--text-3)',
                  borderRadius: 2,
                }}/>
                <Avatar name={m.op} size={26} gradient={m.op.includes('IA') ? 'linear-gradient(140deg,#52525B,#27272A)' : undefined} />
                <div>
                  <div style={{ fontWeight: 600 }}>vs {m.op}</div>
                  <div className="t-cap t-mono">ELO {m.elo}</div>
                </div>
                <span className={`chip ${m.result === 'win' ? 'green' : m.result === 'loss' ? 'red' : ''}`}>
                  {m.result === 'win' ? 'Victoria' : m.result === 'loss' ? 'Derrota' : 'Empate'}
                </span>
                <div className="t-cap t-mono">{m.mode}</div>
                <div className="t-cap t-mono">{m.moves} mov.</div>
                <div className="t-mono" style={{ fontSize: 12, color: eloColor, fontWeight: 600 }}>
                  {m.eloDelta}
                </div>
                <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                  <button className="btn sm ghost" onClick={() => navigate('replay')}><Icon name="replay" size={13}/></button>
                  <button className="btn icon ghost"><Icon name="more" size={14}/></button>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
