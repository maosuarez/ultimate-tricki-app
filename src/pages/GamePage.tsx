import React from 'react';
import { Icon, Avatar } from '../components/ui';
import { UltimateBoard, MetaBoard } from '../components/game';
import type { ScreenName, ModalName, MoveHistory } from '../types/game';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';
import { playMove, playSubBoardCapture } from '../services/audioService';
import { agentService } from '../services/agentService';

interface ViewGameProps {
  blueColor: string;
  redColor: string;
  navigate: (screen: ScreenName) => void;
  openModal?: (modal: ModalName) => void;
}

interface PlayerCardProps {
  name: string;
  elo?: number;
  country: string;
  color: string;
  side: 'X' | 'O';
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
          <div className="t-cap t-mono">{elo !== undefined ? `ELO ${elo} · ${country}` : '— Local'}</div>
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
  blueColor,
  redColor,
  navigate,
  openModal,
}: ViewGameProps): React.ReactElement {
  const { game, makeMove, playerX, playerO, chatMessages, gameWinner, isActive, timeX, timeO, tickTimer, aiAgentId, botSide } = useGameStore();
  const { showCoordinates, highlightLastMove } = useSettingsStore();

  const chatRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<'Eventos' | 'Movimientos'>('Movimientos');

  const aiSessionIdRef = React.useRef<string | null>(null);
  const isRequestingRef = React.useRef(false);
  const [isThinking, setIsThinking] = React.useState(false);

  // Play sounds on each move — detects new sub-board captures vs plain moves
  const historyLength = game.history.length;
  const prevHistoryLength = React.useRef(0);
  const prevSubWinners = React.useRef<(string | null)[]>(game.sb.map((s) => s.winner));

  React.useEffect(() => {
    if (historyLength > prevHistoryLength.current) {
      const newWin = game.sb.some((s, i) => s.winner && !prevSubWinners.current[i]);
      if (newWin) {
        playSubBoardCapture();
      } else {
        playMove();
      }
      prevHistoryLength.current = historyLength;
      prevSubWinners.current = game.sb.map((s) => s.winner);
    }
  }, [historyLength, game.sb]);

  // AI session lifecycle — open when game starts with an agent, close on cleanup
  React.useEffect(() => {
    if (!aiAgentId) return;

    let sessionId: string | null = null;

    agentService.startSession(aiAgentId).then((id) => {
      sessionId = id;
      aiSessionIdRef.current = id;
    });

    return () => {
      if (sessionId) agentService.stopSession(sessionId);
      aiSessionIdRef.current = null;
    };
  }, [aiAgentId]);

  // Trigger bot move when it's the bot's turn
  React.useEffect(() => {
    const sessionId = aiSessionIdRef.current;
    if (!sessionId) return;
    if (!botSide) return;
    if (game.turn !== botSide) return;
    if (gameWinner !== null) return;
    if (isRequestingRef.current) return;

    isRequestingRef.current = true;
    setIsThinking(true);

    agentService.requestMove(sessionId, game, 2000)
      .then((mv) => {
        makeMove(mv.sb, mv.cell);
      })
      .catch((err) => {
        console.error('[AI] request_move failed:', err);
      })
      .finally(() => {
        isRequestingRef.current = false;
        setIsThinking(false);
      });
  }, [game.turn, game, botSide, gameWinner, makeMove]);

  // Tick the active player's clock — stops when game is over
  React.useEffect(() => {
    if (gameWinner !== null) return;
    const t = setInterval(() => { tickTimer(); }, 1000);
    return () => clearInterval(t);
  }, [game.turn, gameWinner, tickTimer]);

  // Open result modal when the game ends
  React.useEffect(() => {
    if (gameWinner === null) return;
    if (gameWinner === 'draw') {
      openModal?.('draw');
    } else {
      openModal?.('victory');
    }
  }, [gameWinner, openModal]);

  // Auto-scroll chat to bottom when new messages arrive
  React.useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (!isActive) {
    return (
      <div className="fade-in game-grid" style={{ gap: 14, padding: 14, height: '100%', overflow: 'hidden' }}>
        <div />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 380 }}>
            <Icon name="grid" size={48} style={{ color: 'var(--text-3)', marginBottom: 16 }} />
            <div className="t-h2" style={{ marginBottom: 8 }}>No hay partida activa</div>
            <div className="t-cap" style={{ marginBottom: 24 }}>
              Crea una nueva partida o únete a una existente para empezar a jugar.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn primary" onClick={() => navigate('create')}>Crear partida</button>
              <button className="btn ghost" onClick={() => navigate('join')}>Unirse</button>
            </div>
          </div>
        </div>
        <div />
      </div>
    );
  }

  const fmt = (s: number): string =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const chatEvents: ChatEventData[] = chatMessages.map((m) => ({
    kind: 'msg',
    who: m.who,
    txt: m.text,
    t: m.timestamp,
  }));

  const pingBars = [12,8,14,10,16,9,11,7,13,10,12,15,8,11,9,13,10,8,12,9,11];

  return (
    <div className="fade-in game-grid" style={{ gap: 14, padding: 14, height: '100%', overflow: 'hidden' }}>
      {/* LEFT PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        {/* Game info */}
        <div className="card" style={{ padding: 14 }}>
          <div className="row" style={{ marginBottom: 10 }}>
            <span className="chip blue">
              <Icon name={aiAgentId ? 'cpu' : 'bolt'} size={11}/> {aiAgentId ? 'vs IA · Flattie' : 'Local · 5+0'}
            </span>
            <div className="spacer" />
            <span className="t-cap t-mono">{aiAgentId ? 'IA' : 'LOCAL'}</span>
          </div>
          <div className="t-tag" style={{ marginBottom: 4 }}>Modo</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Local · Dos jugadores</div>
        </div>

        <PlayerCard
          name={playerO} country="—" color={redColor}
          side="O" timeLabel={fmt(timeO)} active={game.turn === 'O'}
          captures={game.sb.filter((s) => s.winner === 'O').length}
        />
        <PlayerCard
          name={playerX} country="—" color={blueColor}
          side="X" timeLabel={fmt(timeX)} active={game.turn === 'X'}
          captures={game.sb.filter((s) => s.winner === 'X').length}
          isYou
        />

        {/* Connection */}
        <div className="card" style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <Icon name="wifi" size={14} style={{ color: 'var(--green)' }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Modo local</span>
            <div className="spacer" />
            <span className="t-cap t-mono">0 ms</span>
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
            <span className="t-cap">Sin latencia</span><div className="spacer"/>
            <span className="t-cap t-mono">partida local</span>
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
              {game.turn === 'X' ? `Turno de ${playerX}` : `Turno de ${playerO}`}
              {isThinking && (
                <span className="t-cap" style={{ color: 'var(--text-3)', marginLeft: 8 }}>
                  Pensando...
                </span>
              )}
            </div>
            <div className="t-cap" style={{ marginTop: 2 }}>
              {game.activeSb !== null
                ? `Debes jugar en el subtablero ${['↖','↑','↗','←','●','→','↙','↓','↘'][game.activeSb]}`
                : 'Puedes jugar en cualquier subtablero libre'}
            </div>
          </div>
          <div className="spacer" />
          <button className="btn ghost sm" onClick={() => openModal?.('settings')}><Icon name="settings" size={14}/></button>
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
              blueColor={blueColor}
              redColor={redColor}
              canInteract={gameWinner === null && game.turn !== botSide}
              onMove={makeMove}
              showCoordinates={showCoordinates}
              highlightLastMove={highlightLastMove}
            />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        {/* Tabs */}
        <div className="card" style={{ padding: 4, display: 'flex', gap: 2 }}>
          {(['Eventos', 'Movimientos'] as const).map((t) => (
            <div key={t} onClick={() => setActiveTab(t)} style={{
              flex: 1, padding: '7px 0', textAlign: 'center',
              fontSize: 12, fontWeight: 600,
              borderRadius: 6,
              background: activeTab === t ? 'var(--card-hi)' : 'transparent',
              color: activeTab === t ? 'var(--text)' : 'var(--text-3)',
              cursor: 'pointer',
            }}>{t}</div>
          ))}
        </div>

        {/* Tab content */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {activeTab === 'Movimientos' && (
            <>
              <div className="row" style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)' }}>
                <div className="t-tag">Movimientos · {game.history.length}</div>
                <div className="spacer" />
                <span className="chip">turno {game.history.length}</span>
              </div>
              <div style={{
                flex: 1, overflow: 'auto', padding: '10px 14px',
                display: 'grid', gridTemplateColumns: 'auto 1fr 1fr',
                rowGap: 3, fontSize: 12, fontFamily: 'var(--font-mono)',
                alignContent: 'start',
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
            </>
          )}

          {activeTab === 'Eventos' && (
            <div ref={chatRef} style={{
              flex: 1, overflow: 'auto', padding: 14,
              display: 'flex', flexDirection: 'column', gap: 8,
              minHeight: 0,
            }}>
              {chatEvents.filter((e) => e.kind === 'sys' || e.kind === 'event').length === 0 ? (
                <div className="t-cap" style={{ textAlign: 'center', padding: '4px 0' }}>
                  Partida iniciada · Modo local
                </div>
              ) : (
                chatEvents
                  .filter((e) => e.kind === 'sys' || e.kind === 'event')
                  .map((e, i) => (
                    <ChatEvent key={i} ev={e} blueColor={blueColor} redColor={redColor} />
                  ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
