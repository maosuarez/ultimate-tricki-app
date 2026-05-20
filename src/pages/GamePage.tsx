import React from 'react';
import { Icon, Avatar } from '../components/ui';
import { UltimateBoard, MetaBoard } from '../components/game';
import type { GameState, Player, ScreenName, ModalName, MoveHistory } from '../types/game';

interface ViewGameProps {
  game: GameState;
  setGame: (game: GameState) => void;
  blueColor: string;
  redColor: string;
  navigate: (screen: ScreenName) => void;
  isYourTurn?: boolean;
  openModal?: (modal: ModalName) => void;
  viewerSide?: Player;
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

interface CaptureRowProps {
  label: string;
  count: number;
  color: string;
}

interface ChatEventData {
  t?: string;
  kind: 'sys' | 'event' | 'move' | 'msg';
  txt: string;
  who?: string;
}

interface ChatEventProps {
  ev: ChatEventData;
  blueColor?: string;
  redColor?: string;
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
        ? `0 0 0 1px ${color}, 0 0 20px ${color === 'var(--blue)' ? 'rgba(59,130,246,.2)' : color === 'var(--red)' ? 'rgba(239,68,68,.2)' : 'rgba(0,0,0,.2)'}`
        : 'none',
      transition: 'all var(--t-base) var(--ease)',
      position: 'relative',
    }}>
      <div className="row" style={{ gap: 10 }}>
        <div style={{ position: 'relative' }}>
          <Avatar name={name} size={40} square status="online"
                  gradient={side === 'X' ? 'linear-gradient(140deg,#3B82F6,#1D4ED8)' : 'linear-gradient(140deg,#EF4444,#B91C1C)'} />
        </div>
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

function CaptureRow({ label, count, color }: CaptureRowProps): React.ReactElement {
  return (
    <div className="row" style={{ gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color, width: 16 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${(count / 9) * 100}%`, height: '100%', background: color, borderRadius: 3 }}/>
      </div>
      <span className="t-mono" style={{ fontSize: 11, color: 'var(--text-2)', width: 18, textAlign: 'right' }}>{count}/9</span>
    </div>
  );
}

function ChatEvent({ ev, blueColor: _blueColor, redColor: _redColor }: ChatEventProps): React.ReactElement {
  if (ev.kind === 'sys') {
    return (
      <div className="t-cap" style={{ textAlign: 'center', padding: '4px 0', borderBottom: '1px dashed var(--border)' }}>
        {ev.txt}
      </div>
    );
  }
  if (ev.kind === 'event') {
    return <div style={{ fontSize: 12, color: 'var(--text-2)', padding: '4px 0' }}>{ev.txt}</div>;
  }
  if (ev.kind === 'move') {
    return (
      <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: 'var(--text-dim)' }}>{ev.t}</span> · {ev.txt}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Avatar name={ev.who ?? '?'} size={24} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
          <b style={{ color: 'var(--text-2)' }}>{ev.who}</b> · {ev.t}
        </div>
        <div style={{ fontSize: 13 }}>{ev.txt}</div>
      </div>
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
  return pairs.slice(-12);
}

function moveStr(m: MoveHistory): string {
  const sbLabels = ['A','B','C','D','E','F','G','H','I'];
  return `${sbLabels[m.sb]}${m.cell + 1}`;
}

export function ViewGame({
  game,
  setGame,
  blueColor,
  redColor,
  navigate: _navigate,
  isYourTurn: _isYourTurn,
  openModal,
  viewerSide = 'X',
}: ViewGameProps): React.ReactElement {
  const chatRef = React.useRef<HTMLDivElement>(null);
  const [chatMsg, setChatMsg] = React.useState('');
  const [timeX, setTimeX] = React.useState(244);
  const [timeO, setTimeO] = React.useState(198);

  React.useEffect(() => {
    const t = setInterval(() => {
      if (game.turn === 'X') setTimeX((s) => Math.max(0, s - 1));
      else setTimeO((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [game.turn]);

  const fmt = (s: number): string =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const events: ChatEventData[] = [
    { t: '12:04', kind: 'sys', txt: 'Partida iniciada · Blitz 5+3' },
    { t: '12:05', kind: 'move', txt: 'X juega 5,5 (centro)' },
    { t: '12:07', kind: 'msg', who: 'maverick', txt: 'gl hf' },
    { t: '12:07', kind: 'msg', who: 'tú', txt: 'gl' },
    { t: '12:11', kind: 'event', txt: '🏆 X gana subtablero superior izquierdo' },
    { t: '12:14', kind: 'event', txt: '🏆 O gana subtablero inferior derecho' },
    { t: '12:16', kind: 'move', txt: 'X juega 4,5' },
    { t: '12:17', kind: 'msg', who: 'maverick', txt: 'wow nice' },
  ];

  const pingBars = [12,8,14,10,16,9,11,7,13,10,12,15,8,11,9,13,10,8,12,9,11];

  return (
    <div className="fade-in game-grid" style={{ gap: 14, padding: 14, height: '100%', overflow: 'hidden' }}>
      {/* LEFT PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        {/* Game info */}
        <div className="card" style={{ padding: 14 }}>
          <div className="row" style={{ marginBottom: 10 }}>
            <span className="chip blue"><Icon name="bolt" size={11}/> Blitz · 5+3</span>
            <div className="spacer" />
            <span className="t-cap t-mono">#A7K-92F</span>
          </div>
          <div className="t-tag" style={{ marginBottom: 4 }}>Sala</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Ranked · EU-West</div>
        </div>

        <PlayerCard
          name="maverick" elo={1842} country="ES" color={redColor}
          side="O" timeLabel={fmt(timeO)} active={game.turn === 'O'}
          captures={game.sb.filter((s) => s.winner === 'O').length}
        />
        <PlayerCard
          name="tú · Lucas" elo={1814} country="MX" color={blueColor}
          side="X" timeLabel={fmt(timeX)} active={game.turn === 'X'}
          captures={game.sb.filter((s) => s.winner === 'X').length}
          isYou
        />

        {/* Connection */}
        <div className="card" style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <Icon name="wifi" size={14} style={{ color: 'var(--green)' }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Conexión estable</span>
            <div className="spacer" />
            <span className="t-cap t-mono">24 ms</span>
          </div>
          <div style={{ display: 'flex', gap: 2, height: 18, alignItems: 'flex-end' }}>
            {pingBars.map((h, i) => (
              <div key={i} style={{
                flex: 1, height: h, background: 'var(--green)',
                borderRadius: 1, opacity: 0.45 + (i / 30),
              }}/>
            ))}
          </div>
          <div className="row" style={{ marginTop: 6 }}>
            <span className="t-cap">Avg ping</span><div className="spacer"/>
            <span className="t-cap t-mono">22 ms · jitter 4 ms</span>
          </div>
        </div>

        {/* Meta overview */}
        <div className="card" style={{ padding: 14 }}>
          <div className="t-tag" style={{ marginBottom: 10 }}>Vista general</div>
          <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
            <MetaBoard game={game} size={96} blueColor={blueColor} redColor={redColor} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <CaptureRow label="X" count={game.sb.filter((s) => s.winner === 'X').length} color={blueColor} />
              <CaptureRow label="O" count={game.sb.filter((s) => s.winner === 'O').length} color={redColor} />
              <CaptureRow label="Libres" count={game.sb.filter((s) => !s.winner).length} color="var(--text-3)" />
            </div>
          </div>
        </div>

        <div className="spacer" />
      </div>

      {/* CENTER (BOARD) */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        {/* Header */}
        <div className="row" style={{ marginBottom: 12 }}>
          <div>
            <div className="t-h3" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: game.turn === 'X' ? blueColor : redColor,
                boxShadow: `0 0 8px ${game.turn === 'X' ? blueColor : redColor}`,
              }}/>
              {game.turn === viewerSide ? 'Tu turno' : 'Turno del oponente'}
            </div>
            <div className="t-cap" style={{ marginTop: 2 }}>
              {game.activeSb !== null
                ? `Debes jugar en el subtablero ${['↖','↑','↗','←','●','→','↙','↓','↘'][game.activeSb]}`
                : 'Puedes jugar en cualquier subtablero libre'}
            </div>
          </div>
          <div className="spacer" />
          <button className="btn ghost sm" onClick={() => openModal?.('settings')}><Icon name="settings" size={14}/></button>
          <button className="btn ghost sm" onClick={() => openModal?.('victory')}>Test: Victoria</button>
          <button className="btn ghost sm" onClick={() => openModal?.('defeat')}>Derrota</button>
          <button className="btn ghost sm" onClick={() => openModal?.('draw')}>Empate</button>
          <button className="btn ghost sm" onClick={() => openModal?.('reconnect')}><Icon name="wifi" size={14}/></button>
          <button className="btn danger sm" onClick={() => openModal?.('flag')}><Icon name="flag" size={13}/> Abandonar</button>
        </div>

        {/* Board */}
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 0 }}>
          <div style={{
            width: 'min(100%, calc(100vh - 220px))',
            aspectRatio: '1/1',
            maxWidth: 680,
          }}>
            <UltimateBoard
              game={game}
              setGame={setGame}
              blueColor={blueColor}
              redColor={redColor}
              viewerTurn={game.turn === viewerSide}
            />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        {/* Tabs */}
        <div className="card" style={{ padding: 4, display: 'flex', gap: 2 }}>
          {(['Eventos', 'Movimientos', 'Chat'] as const).map((t, i) => (
            <div key={t} style={{
              flex: 1, padding: '7px 0', textAlign: 'center',
              fontSize: 12, fontWeight: 600,
              borderRadius: 6,
              background: i === 0 ? 'var(--card-hi)' : 'transparent',
              color: i === 0 ? 'var(--text)' : 'var(--text-3)',
              cursor: 'default',
            }}>{t}</div>
          ))}
        </div>

        {/* Move history */}
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="row" style={{ marginBottom: 10 }}>
            <div className="t-tag">Movimientos · {game.history.length}</div>
            <div className="spacer" />
            <span className="chip">turno {game.history.length}</span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr 1fr',
            rowGap: 3, fontSize: 12, fontFamily: 'var(--font-mono)',
            maxHeight: 180, overflow: 'auto', paddingRight: 4,
          }}>
            {pairMoves(game.history).map((pair, i) => (
              <React.Fragment key={i}>
                <div style={{ color: 'var(--text-3)', padding: '2px 8px 2px 0' }}>{pair.n}.</div>
                <div style={{ color: blueColor, padding: '2px 8px' }}>
                  {pair.X ? moveStr(pair.X) : '—'}
                </div>
                <div style={{ color: redColor, padding: '2px 8px' }}>
                  {pair.O ? moveStr(pair.O) : '—'}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Events feed + chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div ref={chatRef} style={{
            flex: 1, overflow: 'auto', padding: 14,
            display: 'flex', flexDirection: 'column', gap: 8,
            minHeight: 0,
          }}>
            {events.map((e, i) => (
              <ChatEvent key={i} ev={e} blueColor={blueColor} redColor={redColor} />
            ))}
          </div>
          {/* Chat input */}
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: 10,
            display: 'flex', gap: 6, alignItems: 'center',
          }}>
            <input
              className="input"
              placeholder="Mensaje al oponente..."
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setChatMsg(''); }}
              style={{ flex: 1, padding: '7px 10px', fontSize: 12 }}
            />
            <button className="btn icon ghost"><Icon name="send" size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
