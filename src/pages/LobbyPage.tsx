import React from 'react';
import { Icon, Avatar, Kbd } from '../components/ui';
import { Mark } from '../components/ui/Mark';
import type { Player, ScreenName } from '../types/game';

interface ViewLobbyProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

interface LobbyPlayer {
  n: string;
  side: Player | '—';
  ready: boolean;
  elo: number;
  ping: number;
  host: boolean;
  spectator?: boolean;
}

interface ChatEventData {
  t?: string;
  kind: 'sys' | 'event' | 'move' | 'msg';
  txt: string;
  who?: string;
}

interface ChatEventProps {
  ev: ChatEventData;
}

function ChatEvent({ ev }: ChatEventProps): React.ReactElement {
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
      <Icon name="chev-d" size={14} style={{ color: 'var(--text-3)' }}/>
    </div>
  );
}

export function ViewLobby({ navigate, blueColor, redColor }: ViewLobbyProps): React.ReactElement {
  const players: LobbyPlayer[] = [
    { n: 'tú · Lucas', side: 'X', ready: true, elo: 1814, ping: 24, host: true },
    { n: 'maverick', side: 'O', ready: true, elo: 1842, ping: 38, host: false },
    { n: 'noahz', side: '—', ready: false, elo: 1955, ping: 102, host: false, spectator: true },
  ];

  return (
    <div className="fade-in" style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto', minHeight: 0 }}>
        <div className="row">
          <div>
            <div className="t-h1" style={{ marginBottom: 4 }}>Sala privada de Lucas</div>
            <div className="row" style={{ gap: 8 }}>
              <span className="chip green"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}/> En línea</span>
              <span className="chip"><Icon name="lock" size={11}/> Privada</span>
              <span className="chip"><Icon name="globe" size={11}/> EU-West · 24 ms</span>
            </div>
          </div>
          <div className="spacer" />
          <div className="card" style={{ padding: '10px 14px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div>
              <div className="t-tag">Código de sala</div>
              <div className="t-mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '.16em' }}>A7K-92F</div>
            </div>
            <button className="btn sm" title="Copiar"><Icon name="copy" size={14}/></button>
          </div>
        </div>

        {/* Players */}
        <div className="card" style={{ padding: 18 }}>
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="t-h2">Jugadores</div>
            <span className="chip">{players.length} / 4</span>
            <div className="spacer" />
            <button className="btn sm"><Icon name="users" size={13}/> Invitar</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map((p) => (
              <div key={p.n} className="row" style={{
                padding: '12px 14px', borderRadius: 10,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
              }}>
                <Avatar name={p.n} size={36} status="online"
                        gradient={p.side === 'X' ? 'linear-gradient(140deg,#3B82F6,#1D4ED8)' :
                                  p.side === 'O' ? 'linear-gradient(140deg,#EF4444,#B91C1C)' :
                                  'linear-gradient(140deg,#71717A,#3F3F46)'} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <b style={{ fontSize: 14 }}>{p.n}</b>
                    {p.host && <span className="chip amber"><Icon name="crown" size={11}/> HOST</span>}
                    {p.spectator && <span className="chip"><Icon name="eye" size={11}/> Espectador</span>}
                  </div>
                  <div className="t-cap t-mono">ELO {p.elo} · {p.ping} ms</div>
                </div>
                <div className="spacer" />
                {p.side !== '—' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: p.side === 'X' ? 'rgba(59,130,246,.15)' : 'rgba(239,68,68,.15)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <Mark player={p.side} size={20} blue={blueColor} red={redColor} />
                  </div>
                )}
                {p.ready
                  ? <span className="chip green"><Icon name="check" size={11}/> READY</span>
                  : <span className="chip">esperando</span>}
                <button className="btn icon ghost"><Icon name="more" size={14}/></button>
              </div>
            ))}
            {/* Empty slot */}
            <div className="row" style={{
              padding: '12px 14px', borderRadius: 10,
              border: '1px dashed var(--border-hi)',
              color: 'var(--text-3)', justifyContent: 'center', gap: 8,
            }}>
              <Icon name="plus" size={14}/> <span style={{ fontSize: 13 }}>Slot disponible · espera o invita</span>
            </div>
          </div>
        </div>

        {/* Match settings */}
        <div className="card" style={{ padding: 18 }}>
          <div className="t-h2" style={{ marginBottom: 14 }}>Configuración de la partida</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <SettingRow icon="bolt" label="Reloj" value="Blitz · 5+3" />
            <SettingRow icon="gamepad" label="Modo" value="Online · Ranked" />
            <SettingRow icon="cpu" label="Variante" value="Ultimate clásico" />
            <SettingRow icon="globe" label="Región" value="EU-West · 24 ms" />
            <SettingRow icon="lock" label="Privacidad" value="Privada · solo invitados" />
            <SettingRow icon="eye" label="Espectadores" value="Permitidos (1)" />
          </div>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button className="btn ghost" onClick={() => navigate('home')}>
            <Icon name="arrow-l" size={14}/> Volver
          </button>
          <div className="spacer"/>
          <button className="btn">Cambiar lado</button>
          <button className="btn primary lg" onClick={() => navigate('game')}>
            <Icon name="play" size={14}/> Iniciar partida <Kbd>Enter</Kbd>
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="row" style={{ padding: '14px 14px 8px' }}>
          <div className="t-h3">Chat de sala</div>
          <div className="spacer"/>
          <span className="chip green">en línea</span>
        </div>
        <div style={{ flex: 1, padding: 14, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ChatEvent ev={{ kind: 'sys', txt: 'Sala creada por Lucas' }} />
          <ChatEvent ev={{ kind: 'msg', who: 'maverick', t: '12:32', txt: '¡buenas! listo cuando quieras' }} />
          <ChatEvent ev={{ kind: 'msg', who: 'tú', t: '12:33', txt: 'va, blitz 5+3 te parece?' }} />
          <ChatEvent ev={{ kind: 'msg', who: 'maverick', t: '12:33', txt: '👍 perfecto' }} />
          <ChatEvent ev={{ kind: 'sys', txt: 'maverick está listo' }} />
          <ChatEvent ev={{ kind: 'sys', txt: 'noahz se unió como espectador' }} />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', padding: 10, display: 'flex', gap: 6 }}>
          <input className="input" placeholder="Escribe..." style={{ padding: '7px 10px', fontSize: 12 }}/>
          <button className="btn icon ghost"><Icon name="send" size={14}/></button>
        </div>
      </div>
    </div>
  );
}
