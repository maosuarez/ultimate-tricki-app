import React from 'react';
import { Icon, Avatar, Kbd } from '../components/ui';
import { Mark } from '../components/ui/Mark';
import type { Player, ScreenName } from '../types/game';
import { useNetworkStore } from '../stores/network.store';
import { useMatchStore } from '@/stores/matchStore';

interface ViewLobbyProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
  onReady?: (ready: boolean) => void;
  onStartGame?: () => void;
  onSendChat?: (text: string) => void;
}

interface ChatEventData {
  t?: string;
  kind: 'sys' | 'msg';
  txt: string;
  who?: string;
}

function ChatEvent({ ev }: { ev: ChatEventData }): React.ReactElement {
  if (ev.kind === 'sys') {
    return (
      <div className="t-cap" style={{ textAlign: 'center', padding: '4px 0', borderBottom: '1px dashed var(--border)' }}>
        {ev.txt}
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

interface SettingRowProps {
  icon: string;
  label: string;
  value: string;
}

function SettingRow({ icon, label, value }: SettingRowProps): React.ReactElement {
  return (
    <div className="row" style={{
      padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 8,
      border: '1px solid var(--border)', gap: 10,
    }}>
      <Icon name={icon} size={16} style={{ color: 'var(--text-3)' }}/>
      <div>
        <div className="t-cap">{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
      </div>
      <div className="spacer"/>
    </div>
  );
}

export function ViewLobby({ navigate, blueColor, redColor, onReady, onStartGame, onSendChat }: ViewLobbyProps): React.ReactElement {
  const { roomCode, players, isHost, phase, chatItems, status, mySide, myName, reset: resetNetwork } = useNetworkStore();
  const leaveLobby = useMatchStore((s) => s.leaveLobby);
  const [chatInput, setChatInput] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const chatRef = React.useRef<HTMLDivElement>(null);

  const myPlayer = players.find(p => p.name === myName);
  const isReady = myPlayer?.ready ?? false;
  const allReady = players.length >= 2 && players.every(p => p.ready);

  // Navigate to game when phase changes to playing
  React.useEffect(() => {
    if (phase === 'playing') navigate('game');
  }, [phase, navigate]);

  // Auto-scroll chat
  React.useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatItems]);

  const handleSendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    onSendChat?.(text);
    setChatInput('');
  };

  const handleChatKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendChat();
  };

  const copyCode = () => {
    if (!roomCode) return;
    void navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      const timer = window.setTimeout(() => setCopied(false), 2000);
      return timer;
    });
  };

  const handleLeaveLobby = () => {
    leaveLobby();
    resetNetwork();
    navigate('home');
  };

  const isConnecting = status === 'connecting' || status === 'idle';
  const isInLobby = roomCode !== null;

  const chatEvents: ChatEventData[] = chatItems.map(item => ({
    kind: item.kind,
    txt: item.text,
    who: item.kind === 'msg' ? item.from : undefined,
    t: item.t,
  }));

  if (!isInLobby) {
    const lobbyIdleKeyframes = `
      @keyframes piece-enter-l {
        from { opacity: 0; transform: translateX(-18px) scale(.7); }
        to   { opacity: 1; transform: none; }
      }
      @keyframes piece-enter-r {
        from { opacity: 0; transform: translateX(18px) scale(.7); }
        to   { opacity: 1; transform: none; }
      }
      @keyframes ping-ball {
        0%   { opacity: 1; transform: translate(0px,    0px); }
        25%  { opacity: 1; transform: translate(66px,  -32px); }
        50%  { opacity: 1; transform: translate(132px,  0px); }
        75%  { opacity: 1; transform: translate(66px,  -32px); }
        100% { opacity: 1; transform: translate(0px,    0px); }
      }
      @keyframes x-react {
        0%          { transform: scale(1.22); }
        10%         { transform: scale(1);    }
        35%, 65%    { transform: scale(.88); opacity: .5; }
        90%         { transform: scale(1);   opacity: 1; }
        100%        { transform: scale(1.22); }
      }
      @keyframes o-react {
        0%,  40%    { transform: scale(.88); opacity: .5; }
        50%         { transform: scale(1.22); opacity: 1; }
        60%         { transform: scale(1);   opacity: 1; }
        90%, 100%   { transform: scale(.88); opacity: .5; }
      }
      @media (prefers-reduced-motion: reduce) {
        .lobby-ping * { animation: none !important; }
      }
    `;

    const DUR = 2.2;

    return (
      <div className="fade-in" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style dangerouslySetInnerHTML={{ __html: lobbyIdleKeyframes }} />
        <div className="card" style={{ padding: '44px 40px 40px', textAlign: 'center', maxWidth: 420 }}>

          {/* X vs O ping-pong */}
          <div
            className="lobby-ping"
            style={{ position: 'relative', width: 180, height: 80, margin: '0 auto 28px' }}
          >
            {/* X piece — center at x:24, y:40 */}
            <div style={{
              position: 'absolute', left: 4, top: '50%', marginTop: -20,
              width: 40, height: 40,
              animation: `piece-enter-l .4s cubic-bezier(.34,1.56,.64,1) .1s both, x-react ${DUR}s ease-in-out .9s infinite`,
            }}>
              <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
                <line x1="8" y1="8" x2="32" y2="32" stroke="var(--blue,#3B82F6)" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="32" y1="8" x2="8" y2="32" stroke="var(--blue,#3B82F6)" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* O piece — center at x:156, y:40 */}
            <div style={{
              position: 'absolute', right: 4, top: '50%', marginTop: -20,
              width: 40, height: 40,
              animation: `piece-enter-r .4s cubic-bezier(.34,1.56,.64,1) .2s both, o-react ${DUR}s ease-in-out .9s infinite`,
            }}>
              <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="12" stroke="var(--red,#EF4444)" strokeWidth="3.5" fill="none" />
              </svg>
            </div>

            {/* Ball — starts at X center (x:24-5=19), opacity:0 until animation kicks in */}
            <div style={{
              position: 'absolute',
              left: 19,
              top: '50%',
              marginTop: -5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--text-2,#A1A1AA)',
              boxShadow: '0 0 6px rgba(255,255,255,.28)',
              opacity: 0,
              animation: `ping-ball ${DUR}s cubic-bezier(.45,.05,.55,.95) .9s infinite`,
            }} />
          </div>

          <div className="t-h2" style={{ marginBottom: 8 }}>La partida está por comenzar</div>
          <div className="t-cap" style={{ marginBottom: 24, color: 'var(--text-2, #A1A1AA)', maxWidth: 320, marginInline: 'auto' }}>
            Crea una sala y comparte el código con tu rival, o únete a una partida existente para comenzar.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn primary" onClick={() => navigate('create')}>Crear partida</button>
            <button className="btn ghost" onClick={() => navigate('join')}>Ingresar código</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto', minHeight: 0 }}>
        <div>
          {/* Top bar: room code + leave button in same row */}
          <div className="row" style={{ marginBottom: 12, gap: 12 }}>
            {roomCode ? (
              <div className="card" style={{ padding: '10px 14px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div>
                  <div className="t-tag">Código de sala</div>
                  <div className="t-mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '.16em' }}>{roomCode}</div>
                </div>
                <button
                  className="btn sm"
                  title={copied ? 'Copiado' : 'Copiar código'}
                  aria-label={copied ? 'Código copiado al portapapeles' : 'Copiar código de sala'}
                  onClick={copyCode}
                  style={{ minWidth: 80, transition: 'color 150ms ease-out' }}
                >
                  {copied ? (
                    <><Icon name="check" size={14}/> Copiado!</>
                  ) : (
                    <Icon name="copy" size={14}/>
                  )}
                </button>
              </div>
            ) : (
              <div />
            )}

            <div className="spacer" />

            <button
              className="btn danger sm"
              aria-label="Abandonar sala y volver al inicio"
              onClick={handleLeaveLobby}
            >
              <Icon name="x" size={14}/> Abandonar sala
            </button>
          </div>

          {/* Title + status chips + host/ready controls */}
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <div>
              <div className="t-h1" style={{ marginBottom: 4 }}>
                {isConnecting ? 'Conectando a la sala…' : `Sala de ${myName}`}
              </div>
              <div className="row" style={{ gap: 8 }}>
                {isConnecting ? (
                  <span className="chip amber">Conectando…</span>
                ) : (
                  <span className="chip green"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}/> En línea</span>
                )}
                <span className="chip"><Icon name="lock" size={11}/> Privada</span>
                {mySide && (
                  <span className="chip"><Icon name="user" size={11}/> Juegas como {mySide}</span>
                )}
              </div>
            </div>
            <div className="spacer" />
            {!isHost && (
              <button
                className={`btn${isReady ? '' : ' primary'}`}
                onClick={() => onReady?.(!isReady)}
              >
                {isReady ? 'No listo' : 'Estoy listo'}
              </button>
            )}
            {isHost && (
              <button
                className="btn primary lg"
                disabled={!allReady}
                onClick={() => onStartGame?.()}
              >
                <Icon name="play" size={14}/> Iniciar partida <Kbd>Enter</Kbd>
              </button>
            )}
          </div>
        </div>

        {/* Players */}
        <div className="card" style={{ padding: 18 }}>
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="t-h2">Jugadores</div>
            <span className="chip">{players.length} / 2</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map((p) => (
              <div key={p.name} className="row" style={{
                padding: '12px 14px', borderRadius: 10,
                background: p.name === myName ? 'rgba(59,130,246,.05)' : 'var(--surface-2)',
                border: p.name === myName ? '1px solid rgba(59,130,246,.25)' : '1px solid var(--border)',
              }}>
                <Avatar name={p.name} size={36} status="online"
                        gradient={p.side === 'X' ? 'linear-gradient(140deg,#3B82F6,#1D4ED8)' :
                                  p.side === 'O' ? 'linear-gradient(140deg,#EF4444,#B91C1C)' :
                                  'linear-gradient(140deg,#71717A,#3F3F46)'} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <b style={{ fontSize: 14 }}>{p.name}</b>
                    {p.name === myName && <span className="chip" style={{ fontSize: 9 }}>TÚ</span>}
                    {p.isHost && <span className="chip amber"><Icon name="crown" size={11}/> HOST</span>}
                  </div>
                  <div className="t-cap t-mono">{p.elo > 0 ? `ELO ${p.elo}` : '—'}</div>
                </div>
                <div className="spacer" />
                {p.side && (
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: p.side === 'X' ? 'rgba(59,130,246,.15)' : 'rgba(239,68,68,.15)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <Mark player={p.side as Player} size={20} blue={blueColor} red={redColor} />
                  </div>
                )}
                {p.ready
                  ? <span className="chip green"><Icon name="check" size={11}/> LISTO</span>
                  : <span className="chip">esperando</span>}
              </div>
            ))}
            {players.length < 2 && (
              <div className="row" style={{
                padding: '12px 14px', borderRadius: 10,
                border: '1px dashed var(--border-hi)',
                color: 'var(--text-3)', justifyContent: 'center', gap: 8,
              }}>
                <Icon name="plus" size={14}/> <span style={{ fontSize: 13 }}>Esperando oponente…</span>
              </div>
            )}
          </div>
        </div>

        {/* Match settings */}
        <div className="card" style={{ padding: 18 }}>
          <div className="t-h2" style={{ marginBottom: 14 }}>Configuración</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <SettingRow icon="lock" label="Privacidad" value="Privada · solo invitados" />
            <SettingRow icon="gamepad" label="Modo" value="Online · Privado" />
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="row" style={{ padding: '14px 14px 8px' }}>
          <div className="t-h3">Chat de sala</div>
          <div className="spacer"/>
          <span className={`chip ${status === 'connected' ? 'green' : 'amber'}`}>
            {status === 'connected' ? 'en línea' : 'conectando…'}
          </span>
        </div>
        <div ref={chatRef} style={{ flex: 1, padding: 14, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chatEvents.length === 0 && (
            <div className="t-cap" style={{ textAlign: 'center', color: 'var(--text-3)' }}>
              {isConnecting ? 'Conectando…' : 'Sin mensajes aún'}
            </div>
          )}
          {chatEvents.map((ev, i) => <ChatEvent key={i} ev={ev} />)}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', padding: 10, display: 'flex', gap: 6 }}>
          <input
            className="input"
            placeholder="Escribe..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={handleChatKey}
            style={{ padding: '7px 10px', fontSize: 12 }}
            disabled={status !== 'connected'}
          />
          <button className="btn icon ghost" onClick={handleSendChat} disabled={status !== 'connected'}>
            <Icon name="send" size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}
