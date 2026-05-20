import { useState, useEffect, type FC } from 'react';
import { Icon, Avatar, Kbd, ProgressBar } from './components/ui';
import { useGameStore } from './stores/gameStore';
import type { ScreenName, ModalName, Player } from './types/game';
import { ViewDashboard } from './pages/HomePage';
import { ViewGame } from './pages/GamePage';
import { ViewLobby } from './pages/LobbyPage';
import { ViewCreate } from './pages/CreatePage';
import { ViewJoin } from './pages/JoinPage';
import { ViewProfile } from './pages/ProfilePage';
import { ViewHistory } from './pages/HistoryPage';
import { ViewReplay } from './pages/ReplayPage';
import { ViewSettings } from './pages/SettingsPage';
import { ViewLogin } from './pages/LoginPage';

const NAV = [
  { k: 'home', icon: 'home', label: 'Inicio', screen: 'home' },
  { k: 'play', icon: 'play', label: 'Jugar', screen: 'game', live: true },
  { k: 'create', icon: 'plus', label: 'Crear partida', screen: 'create' },
  { k: 'join', icon: 'users', label: 'Unirse', screen: 'join' },
  { k: 'lobby', icon: 'chat', label: 'Lobby actual', screen: 'lobby', live: true },
  { k: 'history', icon: 'history', label: 'Historial', screen: 'history', count: 447 },
  { k: 'profile', icon: 'user', label: 'Mi perfil', screen: 'profile' },
] as const;

const NAV_SUB = [
  { k: 'achievements', icon: 'trophy', label: 'Logros', sub: '14 / 42' },
  { k: 'ranking', icon: 'medal', label: 'Ranking global' },
  { k: 'friends', icon: 'users', label: 'Amigos', count: '4 online' },
  { k: 'replays', icon: 'replay', label: 'Replays guardados', count: 12 },
] as const;

function getScreenTitle(s: ScreenName): string {
  const map: Record<ScreenName, string> = {
    home: 'Inicio',
    game: 'Partida en curso',
    lobby: 'Lobby',
    create: 'Crear partida',
    join: 'Unirse',
    profile: 'Perfil',
    history: 'Historial',
    replay: 'Replay',
    settings: 'Configuración',
    login: 'Acceso',
  };
  return map[s];
}

function getScreenIcon(s: ScreenName): string {
  const map: Record<ScreenName, string> = {
    home: 'home',
    game: 'play',
    lobby: 'chat',
    create: 'plus',
    join: 'users',
    profile: 'user',
    history: 'history',
    replay: 'replay',
    settings: 'settings',
    login: 'user',
  };
  return map[s];
}

interface ResultModalProps {
  kind: 'victory' | 'defeat' | 'draw';
  onClose: () => void;
  blueColor: string;
  redColor: string;
  navigate: (s: ScreenName) => void;
}

interface PlayerResultProps {
  name: string;
  elo: number;
  delta: string;
  side: Player;
  win: boolean;
  blueColor: string;
  redColor: string;
}

const PlayerResult: FC<PlayerResultProps> = ({ name, elo, delta, side, win, blueColor, redColor }) => {
  const gradient =
    side === 'X'
      ? `linear-gradient(140deg,${blueColor},#2563EB)`
      : `linear-gradient(140deg,${redColor},#DC2626)`;
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        boxShadow: win ? '0 0 0 2px var(--green)' : undefined,
      }}
    >
      <Avatar name={name} size={36} gradient={gradient} status="online" />
      <div style={{ fontSize: 12.5, fontWeight: 700, textAlign: 'center' }}>{name}</div>
      <div style={{ fontSize: 11.5, color: 'var(--fg-muted)' }}>{elo}</div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: delta.startsWith('+') ? 'var(--green)' : delta.startsWith('-') ? 'var(--red)' : 'var(--fg-muted)',
        }}
      >
        {delta}
      </div>
    </div>
  );
};

const ResultModal: FC<ResultModalProps> = ({ kind, onClose, blueColor, redColor, navigate }) => {
  const bgMap = {
    victory: 'radial-gradient(ellipse at top,rgba(34,197,94,0.18) 0%,transparent 70%)',
    defeat: 'radial-gradient(ellipse at top,rgba(239,68,68,0.18) 0%,transparent 70%)',
    draw: 'radial-gradient(ellipse at top,rgba(120,120,120,0.18) 0%,transparent 70%)',
  } as const;
  const iconMap = { victory: '🏆', defeat: '💀', draw: '🤝' } as const;
  const titleMap = { victory: 'Victoria', defeat: 'Derrota', draw: 'Empate' } as const;
  const xDelta = kind === 'victory' ? '+18' : kind === 'defeat' ? '-15' : '+2';
  const oDelta = kind === 'victory' ? '-15' : kind === 'defeat' ? '+18' : '+2';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 380,
          background: `var(--bg-2), ${bgMap[kind]}`,
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              margin: '0 auto 12px',
            }}
          >
            {iconMap[kind]}
          </div>
          <div className="t-display" style={{ fontSize: 22 }}>
            {titleMap[kind]}
          </div>
          <div className="t-cap" style={{ marginTop: 4 }}>
            {kind === 'draw' ? 'Sin cambios de ELO' : `ELO ${xDelta} · 1814 → ${1814 + parseInt(xDelta)}`}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
          <PlayerResult
            name="tú · Lucas"
            elo={1814}
            delta={xDelta}
            side="X"
            win={kind === 'victory'}
            blueColor={blueColor}
            redColor={redColor}
          />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-muted)' }}>vs</div>
          <PlayerResult
            name="maverick"
            elo={1842}
            delta={oDelta}
            side="O"
            win={kind === 'defeat'}
            blueColor={blueColor}
            redColor={redColor}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Movimientos', value: '41' },
            { label: 'Subt. ganados', value: kind === 'victory' ? '5' : kind === 'defeat' ? '3' : '4' },
            { label: 'Tiempo', value: '12:04' },
            { label: 'Precisión', value: '87%' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: 'var(--surface)',
                borderRadius: 8,
                padding: '8px 6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700 }}>{s.value}</div>
              <div className="t-cap" style={{ fontSize: 10, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={() => navigate('lobby')}>
            Lobby
          </button>
          <button className="btn ghost" style={{ flex: 1 }} onClick={() => navigate('replay')}>
            Ver replay
          </button>
          <button className="btn primary" style={{ flex: 1 }} onClick={onClose}>
            Revancha
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReconnectModalProps {
  onClose: () => void;
  navigate: (s: ScreenName) => void;
}

const ReconnectModal: FC<ReconnectModalProps> = ({ onClose, navigate: _navigate }) => {
  const [pct, setPct] = useState(38);

  useEffect(() => {
    if (pct >= 100) return;
    const id = setInterval(() => {
      setPct((p) => Math.min(p + 4, 100));
    }, 200);
    return () => clearInterval(id);
  }, [pct]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: 320,
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="wifi" size={24} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Reconectando…</div>
          <div className="t-cap" style={{ marginTop: 4 }}>
            Intento 2/5 · último ping: 482ms · 14s restantes
          </div>
        </div>
        <ProgressBar value={pct} />
        <button className="btn ghost" style={{ width: '100%' }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

interface DisconnectedViewProps {
  onBack: () => void;
  navigate: (s: ScreenName) => void;
}

const DisconnectedView: FC<DisconnectedViewProps> = ({ onBack, navigate }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 60,
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'rgba(239,68,68,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--red)',
      }}
    >
      <Icon name="wifi" size={32} />
    </div>
    <div>
      <div className="t-display">Sin conexión</div>
      <div className="t-cap" style={{ marginTop: 8, maxWidth: 260 }}>
        Se perdió la conexión con el servidor. Comprueba tu red e intenta reconectar.
      </div>
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="btn ghost" onClick={() => { onBack(); navigate('home'); }}>
        Volver al inicio
      </button>
      <button className="btn primary" onClick={onBack}>
        Reconectar
      </button>
    </div>
  </div>
);

interface FlagModalProps {
  onClose: () => void;
  navigate: (s: ScreenName) => void;
}

const FlagModal: FC<FlagModalProps> = ({ onClose, navigate }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
    }}
    onClick={onClose}
  >
    <div
      style={{
        width: 320,
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'center',
        textAlign: 'center',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--red)',
          fontSize: 26,
        }}
      >
        🏳️
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>¿Abandonar la partida?</div>
        <div className="t-cap" style={{ marginTop: 6 }}>
          -15 ELO y contará como derrota
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn"
          style={{ flex: 1, background: 'var(--red)', color: '#fff' }}
          onClick={() => { onClose(); navigate('home'); }}
        >
          Abandonar
        </button>
      </div>
    </div>
  </div>
);

interface SettingsModalProps {
  onClose: () => void;
}

const Quick: FC<{ label: string; def: boolean }> = ({ label, def }) => {
  const [on, setOn] = useState(def);
  return (
    <div className="row" style={{ padding: '8px 0' }}>
      <span style={{ fontSize: 13.5 }}>{label}</span>
      <div className="spacer" />
      <div className={`switch ${on ? 'on' : ''}`} onClick={() => setOn(!on)} />
    </div>
  );
};

const SettingsModal: FC<SettingsModalProps> = ({ onClose }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
    }}
    onClick={onClose}
  >
    <div
      style={{
        width: 340,
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Ajustes rápidos</div>
      <Quick label="Mostrar coordenadas" def={true} />
      <Quick label="Resaltar último movimiento" def={true} />
      <Quick label="Sonido del cronómetro" def={false} />
      <Quick label="Mostrar miniatura meta-tablero" def={true} />
      <Quick label="Auto-promover en último movimiento" def={false} />
    </div>
  </div>
);

function App() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [modal, setModal] = useState<ModalName>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { game } = useGameStore();
  const [accentColor] = useState('#3B82F6');
  const [oColor] = useState('#EF4444');

  useEffect(() => {
    document.documentElement.style.setProperty('--blue', accentColor);
    document.documentElement.style.setProperty('--red', oColor);
  }, [accentColor, oColor]);

  const navigate = (s: ScreenName) => setScreen(s);

  const showTabs = screen === 'home' || screen === 'profile' || screen === 'history';

  if (screen === 'login') {
    return (
      <div className="app is-fullscreen">
        <ViewLogin navigate={navigate} blueColor={accentColor} />
      </div>
    );
  }

  return (
    <div className={`app${sidebarOpen ? '' : ' is-rail-only'}`}>
      {/* Rail */}
      <div className="rail">
        <div className="logo">U</div>
        <div className="sep" />
        {NAV.slice(0, 5).map((n) => (
          <button
            key={n.k}
            onClick={() => navigate(n.screen as ScreenName)}
            className={`rail-btn ${screen === n.screen ? 'active' : ''}`}
            title={n.label}
          >
            <Icon name={n.icon} size={18} />
            {'live' in n && n.live && screen !== n.screen && (
              <div className="badge" style={{ background: 'var(--green)' }}>
                •
              </div>
            )}
          </button>
        ))}
        <div className="sep" />
        {NAV.slice(5).map((n) => (
          <button
            key={n.k}
            onClick={() => navigate(n.screen as ScreenName)}
            className={`rail-btn ${screen === n.screen ? 'active' : ''}`}
            title={n.label}
          >
            <Icon name={n.icon} size={18} />
          </button>
        ))}
        <div className="spacer" />
        <button
          className="rail-expand"
          onClick={() => setSidebarOpen(true)}
          title="Expandir panel"
        >
          <Icon name="chev-r" size={14} />
        </button>
        <button
          className={`rail-btn ${screen === 'settings' ? 'active' : ''}`}
          onClick={() => navigate('settings')}
          title="Configuración"
        >
          <Icon name="settings" size={18} />
        </button>
        <button className="rail-btn" onClick={() => navigate('login')} title="Cerrar sesión">
          <Avatar
            name="Lucas H."
            size={28}
            gradient="linear-gradient(140deg,#F59E0B,#EF4444)"
            status="online"
          />
        </button>
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sb-head">
          <div className="sb-head-title">
            <div className="sb-title">Ultimate</div>
            <div className="t-cap" style={{ marginTop: -2 }}>
              Tic Tac Toe Pro
            </div>
          </div>
          <button
            className="sb-toggle"
            onClick={() => setSidebarOpen(false)}
            title="Contraer panel"
          >
            <Icon name="chev-r" size={14} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>

        <div className="sb-section">
          <div className="sb-label">Juego</div>
          {NAV.map((n) => (
            <div
              key={n.k}
              onClick={() => navigate(n.screen as ScreenName)}
              className={`sb-item ${screen === n.screen ? 'active' : ''}`}
            >
              <Icon name={n.icon} size={15} className="sb-icon" />
              <span>{n.label}</span>
              {'live' in n && n.live && <span className="live-dot" />}
              {'count' in n && n.count !== undefined && (
                <span className="sb-count">{n.count}</span>
              )}
            </div>
          ))}
        </div>

        <div className="sb-section">
          <div className="sb-label">Tu cuenta</div>
          {NAV_SUB.map((n) => (
            <div key={n.k} className="sb-item">
              <Icon name={n.icon} size={15} className="sb-icon" />
              <span>{n.label}</span>
              {'count' in n && n.count !== undefined && (
                <span className="sb-count">{n.count}</span>
              )}
              {'sub' in n && n.sub && <span className="sb-count">{n.sub}</span>}
            </div>
          ))}
        </div>

        <div className="sb-section">
          <div className="sb-label">
            <span>Amigos</span>
            <Icon name="plus" size={12} />
          </div>
          {(
            [
              { n: 'maverick', s: 'online', st: 'En partida' },
              { n: 'somnia', s: 'online', st: 'Disponible' },
              { n: 'noahz', s: 'online', st: 'En menú' },
              { n: 'baltz', s: 'away', st: 'Ausente' },
            ] as const
          ).map((f) => (
            <div key={f.n} className="sb-item" style={{ padding: '6px 10px' }}>
              <Avatar name={f.n} size={22} status={f.s} />
              <div style={{ minWidth: 0, lineHeight: 1.2 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{f.n}</div>
                <div className="t-cap" style={{ fontSize: 10.5 }}>
                  {f.st}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sb-foot">
          <div className="av">L</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="nm">Lucas H.</div>
            <div className="el">1814 · Diamante II</div>
          </div>
          <button className="btn icon ghost" onClick={() => navigate('settings')}>
            <Icon name="settings" size={14} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {showTabs && (
          <div className="view-tabs">
            <div className="view-tab active">
              <Icon name={getScreenIcon(screen)} size={13} />
              {getScreenTitle(screen)}
            </div>
            {screen === 'home' && (
              <>
                <div className="view-tab">
                  <Icon name="gamepad" size={13} />
                  Partida vs maverick
                  <div className="dot" />
                </div>
                <div className="view-tab">
                  <Icon name="trophy" size={13} />
                  Temporada actual
                </div>
              </>
            )}
            <div className="spacer" />
            <button className="btn icon ghost" style={{ width: 26, height: 26 }}>
              <Icon name="plus" size={13} />
            </button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {screen === 'home' && (
            <ViewDashboard navigate={navigate} blueColor={accentColor} redColor={oColor} />
          )}
          {screen === 'game' && (
            <ViewGame
              blueColor={accentColor}
              redColor={oColor}
              navigate={navigate}
              openModal={setModal}
            />
          )}
          {screen === 'lobby' && (
            <ViewLobby navigate={navigate} blueColor={accentColor} redColor={oColor} />
          )}
          {screen === 'create' && (
            <ViewCreate navigate={navigate} blueColor={accentColor} />
          )}
          {screen === 'join' && (
            <ViewJoin navigate={navigate} blueColor={accentColor} redColor={oColor} />
          )}
          {screen === 'profile' && (
            <ViewProfile navigate={navigate} blueColor={accentColor} redColor={oColor} />
          )}
          {screen === 'history' && (
            <ViewHistory navigate={navigate} blueColor={accentColor} redColor={oColor} />
          )}
          {screen === 'replay' && (
            <ViewReplay game={game} navigate={navigate} blueColor={accentColor} redColor={oColor} />
          )}
          {screen === 'settings' && (
            <ViewSettings navigate={navigate} blueColor={accentColor} />
          )}

          {modal === 'victory' && (
            <ResultModal
              kind="victory"
              onClose={() => setModal(null)}
              blueColor={accentColor}
              redColor={oColor}
              navigate={navigate}
            />
          )}
          {modal === 'defeat' && (
            <ResultModal
              kind="defeat"
              onClose={() => setModal(null)}
              blueColor={accentColor}
              redColor={oColor}
              navigate={navigate}
            />
          )}
          {modal === 'draw' && (
            <ResultModal
              kind="draw"
              onClose={() => setModal(null)}
              blueColor={accentColor}
              redColor={oColor}
              navigate={navigate}
            />
          )}
          {modal === 'reconnect' && (
            <ReconnectModal onClose={() => setModal(null)} navigate={navigate} />
          )}
          {modal === 'flag' && (
            <FlagModal onClose={() => setModal(null)} navigate={navigate} />
          )}
          {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} />}
          {modal === 'disconnected' && (
            <DisconnectedView onBack={() => setModal(null)} navigate={navigate} />
          )}
        </div>
      </main>

      {/* Statusbar */}
      <div className="statusbar">
        <div className="pill">
          <div className="dot g" />
          <span>Online · EU-West</span>
        </div>
        <div className="pill">
          <Icon name="wifi" size={11} />
          <span>24 ms</span>
        </div>
        <div className="pill">
          <span>jitter 4 ms</span>
        </div>
        <div className="pill">
          <span>120 FPS</span>
        </div>
        <div className="pill">
          <span>sync OK</span>
        </div>
        <div className="spacer" />
        <div className="pill">
          <span>447 partidas</span>
        </div>
        <div className="pill">
          <span>ELO 1814</span>
        </div>
        <div className="pill">
          <span style={{ color: 'var(--green)' }}>● </span>
          <span>WS conectado</span>
        </div>
        <div className="pill">
          <Icon name="kbd" size={11} />
          <Kbd>?</Kbd>
          <span style={{ marginLeft: 4 }}>atajos</span>
        </div>
        <div className="pill">
          <span>v2.1.0</span>
        </div>
      </div>
    </div>
  );
}

export default App;
