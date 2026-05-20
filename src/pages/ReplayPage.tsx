import React from 'react';
import { Icon, Avatar } from '../components/ui';
import { UltimateBoard } from '../components/game';
import type { GameState, Player, ScreenName, MoveHistory } from '../types/game';

interface ViewReplayProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
  game: GameState;
}

interface PlayerCardProps {
  name: string;
  elo: number;
  country: string;
  color: string;
  side: Player;
  timeLabel: string;
  active: boolean;
  captures: number;
  isYou?: boolean;
}

interface MovePair {
  n: number;
  X: MoveHistory | null;
  O: MoveHistory | null;
}

function PlayerCard({ name, elo, country, color, side, timeLabel, active, captures, isYou }: PlayerCardProps): React.ReactElement {
  return (
    <div className="card" style={{
      padding: 12,
      border: active ? `1px solid ${color}` : '1px solid var(--border)',
      boxShadow: active
        ? `0 0 0 1px ${color}, 0 0 20px ${color === 'var(--blue)' ? 'rgba(59,130,246,.2)' : 'rgba(239,68,68,.2)'}`
        : 'none',
      transition: 'all var(--t-base) var(--ease)',
      position: 'relative',
    }}>
      <div className="row" style={{ gap: 10 }}>
        <Avatar name={name} size={40} square status="online"
                gradient={side === 'X' ? 'linear-gradient(140deg,#3B82F6,#1D4ED8)' : 'linear-gradient(140deg,#EF4444,#B91C1C)'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{name}</span>
            {isYou && <span className="chip" style={{ padding: '1px 6px', fontSize: 9 }}>TÚ</span>}
          </div>
          <div className="t-cap t-mono">ELO {elo} · {country}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="t-mono" style={{
            fontSize: 22, fontWeight: 700, letterSpacing: '-.01em',
            color: active ? color : 'var(--text-2)',
          }}>{timeLabel}</div>
          <div className="t-cap" style={{ textAlign: 'right' }}>{captures} subt.</div>
        </div>
      </div>
      {active && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: color, borderRadius: '3px 0 0 3px',
        }}/>
      )}
    </div>
  );
}

function pairMoves(history: MoveHistory[]): MovePair[] {
  const pairs: MovePair[] = [];
  let i = 0;
  let n = Math.floor((history[0]?.n ?? 1) / 2);
  while (i < history.length) {
    const x = history[i].by === 'X' ? history[i] : null;
    let o: MoveHistory | null = null;
    if (x) {
      i++;
      if (history[i] && history[i].by === 'O') { o = history[i]; i++; }
    } else {
      o = history[i]; i++;
    }
    n++;
    pairs.push({ n, X: x, O: o });
  }
  return pairs;
}

function moveStr(m: MoveHistory): string {
  const sbLabels = ['A','B','C','D','E','F','G','H','I'];
  return `${sbLabels[m.sb]}${m.cell + 1}`;
}

export function ViewReplay({ navigate, blueColor, redColor, game }: ViewReplayProps): React.ReactElement {
  const [pos, setPos] = React.useState(28);
  const total = game.history.length;
  const pairs = pairMoves(game.history);

  return (
    <div className="fade-in game-grid" style={{ gap: 14, padding: 14, height: '100%', overflow: 'hidden' }}>
      {/* LEFT PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div className="card" style={{ padding: 14 }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <button className="btn sm ghost" onClick={() => navigate('history')}><Icon name="arrow-l" size={13}/></button>
            <span className="chip blue">REPLAY</span>
          </div>
          <div className="t-h3">tú vs maverick</div>
          <div className="t-cap" style={{ marginTop: 2 }}>Blitz 5+3 · ayer · 18 min 22 s</div>
          <div className="divider" />
          <div className="row" style={{ fontSize: 12 }}>
            <span className="muted">Resultado</span><div className="spacer"/>
            <span className="chip green">Victoria · +18</span>
          </div>
        </div>

        <PlayerCard name="maverick" elo={1842} country="ES" color={redColor} side="O" timeLabel="03:18" active={false} captures={3} />
        <PlayerCard name="tú · Lucas" elo={1814} country="MX" color={blueColor} side="X" timeLabel="04:04" active={true} captures={4} isYou />

        <div className="card" style={{ padding: 14 }}>
          <div className="t-tag" style={{ marginBottom: 10 }}>Analiza</div>
          <div className="row" style={{ marginBottom: 8, gap: 8 }}>
            <Icon name="sparkle" size={14} style={{ color: 'var(--amber)' }}/>
            <span style={{ fontSize: 12 }}>Mejor jugada: <b>D5</b></span>
          </div>
          <div className="row" style={{ marginBottom: 8, gap: 8 }}>
            <Icon name="bolt" size={14} style={{ color: 'var(--blue)' }}/>
            <span style={{ fontSize: 12 }}>Movimientos críticos: <b>3</b></span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Icon name="x" size={14} style={{ color: 'var(--red)' }}/>
            <span style={{ fontSize: 12 }}>Errores: <b>2</b></span>
          </div>
        </div>
      </div>

      {/* Board + transport */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 0 }}>
          <div style={{ width: 'min(100%, calc(100vh - 280px))', aspectRatio: '1/1', maxWidth: 680 }}>
            <UltimateBoard game={game} blueColor={blueColor} redColor={redColor} canInteract={false} onMove={() => {}} />
          </div>
        </div>
        {/* Transport */}
        <div className="card" style={{ padding: 14, marginTop: 14 }}>
          <div className="row" style={{ marginBottom: 10 }}>
            <button className="btn icon"><Icon name="skip-b" size={14}/></button>
            <button className="btn icon" title="Atrás"><Icon name="chev-r" size={14} style={{ transform: 'rotate(180deg)' }}/></button>
            <button className="btn icon primary" title="Reproducir"><Icon name="play" size={14}/></button>
            <button className="btn icon" title="Adelante"><Icon name="chev-r" size={14}/></button>
            <button className="btn icon"><Icon name="skip-f" size={14}/></button>
            <div className="spacer"/>
            <span className="t-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>
              Mov. <b style={{ color: 'var(--text)' }}>{pos}</b> / {total}
            </span>
            <div className="spacer"/>
            <button className="btn sm">0.5x</button>
            <button className="btn sm" style={{ background: 'var(--card-hi)' }}>1x</button>
            <button className="btn sm">2x</button>
          </div>
          <input
            type="range"
            min={0}
            max={total}
            value={pos}
            onChange={(e) => setPos(+e.target.value)}
            style={{ width: '100%', accentColor: blueColor }}
          />
        </div>
      </div>

      {/* Move list */}
      <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div className="t-tag" style={{ marginBottom: 10 }}>Movimientos</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'auto 1fr 1fr',
          rowGap: 3, fontSize: 12, fontFamily: 'var(--font-mono)',
          overflow: 'auto', minHeight: 0,
        }}>
          {pairs.map((pair, i) => (
            <React.Fragment key={i}>
              <div style={{ color: 'var(--text-3)', padding: '4px 8px 4px 0' }}>{pair.n}.</div>
              <div style={{ color: blueColor, padding: '4px 8px', background: i === 14 ? 'var(--card-hi)' : 'transparent', borderRadius: 4 }}>
                {pair.X ? moveStr(pair.X) : '—'}
              </div>
              <div style={{ color: redColor, padding: '4px 8px' }}>
                {pair.O ? moveStr(pair.O) : '—'}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
