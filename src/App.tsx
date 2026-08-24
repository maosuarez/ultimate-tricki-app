import { useState, useEffect, type FC } from 'react';
import { useSettingsStore } from './stores/settingsStore';
import { Icon, Avatar, Kbd, ProgressBar } from './components/ui';
import { useGameStore } from './stores/gameStore';
import { useUserStore } from './stores/userStore';
import { useCurrentUser } from './hooks/useCurrentUser';
import { useAudioSync } from './hooks/useAudioSync';
import { useOnlineGame } from './hooks/useOnlineGame';
import { useFriends } from './hooks/useFriends';
import { useAchievements } from './hooks/useAchievements';
import { useReplays } from './hooks/useReplays';
import * as audioService from '@/services/audio.service';
import type { ScreenName, ModalName, Player } from './types/game';
import type { RemoteMatch } from './types/match.types';
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
import { ViewAchievements } from './pages/AchievementsPage';
import { ViewRanking } from './pages/RankingPage';
import { ViewFriends } from './pages/FriendsPage';
import { ViewReplays } from './pages/ReplaysPage';
import { ViewDeveloperAgents } from './pages/DeveloperAgentsPage';
import { MetaBoard } from './components/game/MetaBoard';
import { buildSampleGame } from './utils/boardUtils';
import { useDeveloperMode } from './config/features';

const NAV = [
  { k: 'home', icon: 'home', label: 'Home', screen: 'home' },
  { k: 'play', icon: 'play', label: 'Play', screen: 'game' },
  { k: 'create', icon: 'plus', label: 'Create Game', screen: 'create' },
  { k: 'join', icon: 'users', label: 'Join Game', screen: 'join' },
  { k: 'lobby', icon: 'chat', label: 'Current Lobby', screen: 'lobby' },
  { k: 'history', icon: 'history', label: 'History', screen: 'history' },
  { k: 'profile', icon: 'user', label: 'My Profile', screen: 'profile' },
] as const;

const NAV_SUB_BASE: Array<{ k: string; icon: string; label: string; screen: ScreenName }> = [
  { k: 'achievements', icon: 'trophy', label: 'Achievements', screen: 'achievements' },
  { k: 'ranking', icon: 'medal', label: 'Global Ranking', screen: 'ranking' },
  { k: 'friends', icon: 'users', label: 'Friends', screen: 'friends' },
  { k: 'replays', icon: 'replay', label: 'Saved Replays', screen: 'replays' },
];

function getScreenTitle(s: ScreenName): string {
  const map: Record<ScreenName, string> = {
    home: 'Home',
    game: 'Game in Progress',
    lobby: 'Lobby',
    create: 'Create Game',
    join: 'Join Game',
    profile: 'Profile',
    history: 'History',
    replay: 'Replay',
    settings: 'Settings',
    login: 'Sign In',
    achievements: 'Achievements',
    ranking: 'Global Ranking',
    friends: 'Friends',
    replays: 'Saved Replays',
    'developer-agents': 'Python Agents',
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
    achievements: 'trophy',
    ranking: 'medal',
    friends: 'users',
    replays: 'replay',
    'developer-agents': 'cpu',
  };
  return map[s];
}

interface ResultModalProps {
  kind: 'victory' | 'defeat' | 'draw';
  playerX: string;
  playerO: string;
  xCaptures: number;
  oCaptures: number;
  movesCount: number;
  timeX: number;
  timeO: number;
  initialTime: number;
  mode: 'local' | 'ai' | 'online' | 'custom_agent';
  onClose: () => void;
  onRematch: () => void;
  blueColor: string;
  redColor: string;
  navigate: (s: ScreenName) => void;
}

interface PlayerResultProps {
  name: string;
  captures: number;
  side: Player;
  win: boolean;
  blueColor: string;
  redColor: string;
}

const PlayerResult: FC<PlayerResultProps> = ({ name, captures, side, win, blueColor, redColor }) => {
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
      {win && (
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.05em' }}>
          WINNER
        </div>
      )}
      <div style={{ fontSize: 11.5, color: 'var(--fg-muted)' }}>{captures} boards</div>
    </div>
  );
};

const ResultModal: FC<ResultModalProps> = ({ kind, playerX, playerO, xCaptures, oCaptures, movesCount, timeX, timeO, initialTime, mode, onClose, onRematch, blueColor, redColor, navigate }) => {
  const bgMap = {
    victory: 'radial-gradient(ellipse at top,rgba(34,197,94,0.18) 0%,transparent 70%)',
    defeat: 'radial-gradient(ellipse at top,rgba(239,68,68,0.18) 0%,transparent 70%)',
    draw: 'radial-gradient(ellipse at top,rgba(120,120,120,0.18) 0%,transparent 70%)',
  } as const;
  const iconMap = { victory: '🏆', defeat: '💀', draw: '🤝' } as const;
  const titleMap = { victory: 'Victory', defeat: 'Defeat', draw: 'Draw' } as const;

  const modeLabel = mode === 'online' ? 'Ranked' : (mode === 'ai' || mode === 'custom_agent') ? 'vs Agent' : 'Local';
  const subtitle = kind === 'draw' ? 'No rating change · Local Mode' : `Match Finished · ${modeLabel}`;

  const fmt = (s: number): string =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const elapsedX = Math.max(0, initialTime - timeX);
  const elapsedO = Math.max(0, initialTime - timeO);
  const totalDuration = elapsedX + elapsedO;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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
          width: 'min(90vw, 420px)',
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
            {subtitle}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
          <PlayerResult
            name={playerX}
            captures={xCaptures}
            side="X"
            win={kind === 'victory'}
            blueColor={blueColor}
            redColor={redColor}
          />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-muted)' }}>vs</div>
          <PlayerResult
            name={playerO}
            captures={oCaptures}
            side="O"
            win={kind === 'defeat'}
            blueColor={blueColor}
            redColor={redColor}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
          {[
            { label: 'Moves',       value: String(movesCount) },
            { label: 'Boards X',    value: String(xCaptures) },
            { label: 'Boards O',    value: String(oCaptures) },
            { label: 'Duration',    value: totalDuration > 0 ? fmt(totalDuration) : '--:--' },
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
          <button className="btn ghost" style={{ flex: 1 }} onClick={() => { navigate('home'); onClose(); }}>
            Home
          </button>
          <button className="btn ghost" style={{ flex: 1 }} onClick={() => { navigate('replay'); onClose(); }}>
            View Replay
          </button>
          <button className="btn primary" style={{ flex: 1 }} onClick={onRematch}>
            Rematch
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
          <div style={{ fontWeight: 700, fontSize: 16 }}>Reconnecting…</div>
          <div className="t-cap" style={{ marginTop: 4 }}>
            Attempt 2/5 · last ping: 482ms · 14s remaining
          </div>
        </div>
        <ProgressBar value={pct} />
        <button className="btn ghost" style={{ width: '100%' }} onClick={onClose}>
          Cancel
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
      <div className="t-display">Connection Lost</div>
      <div className="t-cap" style={{ marginTop: 8, maxWidth: 260 }}>
        Lost connection with server. Check your network connection and try again.
      </div>
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="btn ghost" onClick={() => { onBack(); navigate('home'); }}>
        Back to Home
      </button>
      <button className="btn primary" onClick={onBack}>
        Reconnect
      </button>
    </div>
  </div>
);

interface FlagModalProps {
  onClose: () => void;
  navigate: (s: ScreenName) => void;
}

const FlagModal: FC<FlagModalProps> = ({ onClose, navigate }) => {
  const resetGame = useGameStore((s) => s.resetGame);
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
          <div style={{ fontWeight: 700, fontSize: 16 }}>Resign Match?</div>
          <div className="t-cap" style={{ marginTop: 6 }}>
            The match will end without rating penalty.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn"
            style={{ flex: 1, background: 'var(--red)', color: '#fff' }}
            onClick={() => { resetGame(); onClose(); navigate('home'); }}
          >
            Resign
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  onClose: () => void;
}

interface QuickStoreProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

const Quick: FC<QuickStoreProps> = ({ label, value, onChange }) => (
  <div className="row" style={{ padding: '8px 0' }}>
    <span style={{ fontSize: 13.5 }}>{label}</span>
    <div className="spacer" />
    <div className={`switch ${value ? 'on' : ''}`} onClick={() => onChange(!value)} />
  </div>
);

const SettingsModal: FC<SettingsModalProps> = ({ onClose }) => {
  const {
    showCoordinates,
    setShowCoordinates,
    highlightLastMove,
    setHighlightLastMove,
    mutedAll,
    setMutedAll,
  } = useSettingsStore();

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
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Quick Settings</div>
        <Quick label="Show coordinates" value={showCoordinates} onChange={setShowCoordinates} />
        <Quick label="Highlight last move" value={highlightLastMove} onChange={setHighlightLastMove} />
        <Quick label="Mute audio" value={mutedAll} onChange={setMutedAll} />
      </div>
    </div>
  );
};

export const UnderConstruction: FC<{ label: string; icon: string; navigate: (s: ScreenName) => void }> = ({ label, icon, navigate }) => (
  <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
    <div style={{ marginBottom: 24 }}>
      <button className="btn ghost sm" onClick={() => navigate('home')}><Icon name="arrow-l" size={14}/> Home</button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 80px)', gap: 20, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={32} style={{ color: 'var(--text-3)' }} />
      </div>
      <div>
        <div className="t-h1" style={{ marginBottom: 8 }}>{label}</div>
        <div className="muted" style={{ fontSize: 14 }}>This section is under construction.</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>We are working on it — check back soon.</div>
      </div>
      <span className="chip amber">Coming Soon</span>
    </div>
  </div>
);

const SAMPLE_GAME = buildSampleGame();

function App() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [modal, setModal] = useState<ModalName>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [replayMatch, setReplayMatch] = useState<RemoteMatch | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const { game, playerX, playerO, timeX, timeO, initialTime, mode } = useGameStore();
  const isGameActive = useGameStore((s) => s.isActive);
  const startLocalGame = useGameStore((s) => s.startLocalGame);
  const startAiGame = useGameStore((s) => s.startAiGame);
  const aiAgentId = useGameStore((s) => s.aiAgentId);

  const xCaptures = game.sb.filter((s) => s.winner === 'X').length;
  const oCaptures = game.sb.filter((s) => s.winner === 'O').length;
  const movesCount = game.history.length;

  const liveDots: Partial<Record<string, boolean>> = {
    play: isGameActive,
    lobby: false,
  };

  const { colorX: accentColor, colorO: oColor, theme, reduceMotion, density } = useSettingsStore();
  const isDeveloperMode = useDeveloperMode();

  const NAV_SUB: Array<{ k: string; icon: string; label: string; screen: ScreenName }> = [
    ...NAV_SUB_BASE,
    ...(isDeveloperMode
      ? [{ k: 'developer-agents', icon: 'cpu', label: 'Python Agents', screen: 'developer-agents' as ScreenName }]
      : []),
  ];

  const { authChecked, session, isGuest, guestName } = useCurrentUser();
  const { profile, signIn, signUp, enterAsGuest, signOut } = useUserStore();

  useAudioSync();

  const { friends, loading: friendsLoading } = useFriends();
  const { unlocked: achievementsUnlocked, total: achievementsTotal, loading: achievementsLoading } = useAchievements();
  const { replays, loading: replaysLoading } = useReplays();

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  useEffect(() => {
    audioService.startMusic();
    return () => audioService.stopMusic();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--blue', accentColor);
    document.documentElement.style.setProperty('--red', oColor);
  }, [accentColor, oColor]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--duration-fast', reduceMotion ? '0ms' : '150ms');
    document.documentElement.style.setProperty('--duration-normal', reduceMotion ? '0ms' : '250ms');
  }, [reduceMotion]);

  const navigate = (s: ScreenName) => {
    if (s !== 'profile') setViewingUserId(null);
    setScreen(s);
  };

  const navigateToProfile = (userId: string) => {
    setViewingUserId(userId);
    setScreen('profile');
  };

  const handleRematch = () => {
    setModal(null);
    if (mode === 'ai' && aiAgentId) {
      startAiGame(playerX, aiAgentId, initialTime);
    } else {
      startLocalGame(playerX, playerO, initialTime);
    }
    navigate('game');
  };

  useEffect(() => {
    if (modal === 'victory' || modal === 'defeat' || modal === 'draw') {
      setModal(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const { createRoom, joinRoom, sendReady, sendStartGame, sendMove, sendChat, cleanupRoom } = useOnlineGame(navigate);

  const showTabs = screen === 'profile';

  if (!authChecked) {
    return (
      <div className="app is-fullscreen" style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(140deg,#3B82F6,#8B5CF6)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 20px rgba(59,130,246,.4)',
          }}>
            <span style={{ fontWeight: 800, color: '#fff', fontSize: 22 }}>U</span>
          </div>
          <div className="t-cap">Verifying session...</div>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!session || isGuest;

  if (!isAuthenticated) {
    return (
      <div className="app is-fullscreen">
        <ViewLogin
          navigate={navigate}
          blueColor={accentColor}
          onSignIn={async (email, password, rememberMe) => {
            await signIn(email, password, rememberMe);
            navigate('home');
          }}
          onSignUp={async (email, password, username) => {
            await signUp(email, password, username);
            navigate('home');
          }}
          onGuest={(name) => {
            enterAsGuest(name);
            navigate('home');
          }}
        />
      </div>
    );
  }

  const displayInitial = isGuest ? (guestName?.[0] ?? 'G') : (profile?.displayName?.[0] ?? '?');
  const displayName = isGuest ? (guestName ?? 'Guest') : (profile?.displayName ?? '...');
  const eloLine = isGuest ? 'Guest Mode' : (profile ? `${profile.rating} · ELO` : '...');

  return (
    <div className={`app${sidebarOpen ? '' : ' is-collapsed'}`}>
      {/* Nav panel */}
      <nav className="nav-panel">
        {/* Header */}
        <div className="nav-head">
          <button
            className="nav-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className="nav-toggle-board">
              <MetaBoard game={SAMPLE_GAME} size={34} blueColor={accentColor} redColor={oColor} />
            </span>
            <span className="nav-toggle-icon">
              <Icon name={sidebarOpen ? 'panels-left' : 'panels-right'} size={18} />
            </span>
          </button>
          {sidebarOpen && (
            <div className="nav-brand">
              <span className="nav-brand-title">Ultimate</span>
              <span className="nav-brand-sub">Tic Tac Toe</span>
            </div>
          )}
        </div>

        <div className="nav-sep" />

        {/* Primary nav */}
        <div className="nav-section">
          {sidebarOpen && <div className="nav-label">Game</div>}
          {NAV.slice(0, 5).map((n) => (
            <button
              key={n.k}
              onClick={() => navigate(n.screen as ScreenName)}
              className={`nav-item ${screen === n.screen ? 'active' : ''}`}
              title={n.label}
            >
              <Icon name={n.icon} size={16} className="nav-icon" />
              <span className="nav-text">{n.label}</span>
              {liveDots[n.k] && screen !== n.screen && <span className="live-dot" />}
            </button>
          ))}
        </div>

        <div className="nav-sep" />

        {/* Secondary nav */}
        <div className="nav-section">
          {sidebarOpen && <div className="nav-label">Account</div>}
          {NAV_SUB.map((n) => {
            let badge: string | number | undefined;
            if (n.k === 'friends') {
              if (friendsLoading) {
                badge = '...';
              } else {
                const onlineCount = friends.filter((f) => f.onlineStatus === 'online').length;
                badge = onlineCount > 0 ? `${onlineCount} online` : undefined;
              }
            } else if (n.k === 'achievements') {
              if (achievementsLoading) {
                badge = '...';
              } else {
                badge = achievementsTotal > 0 ? `${achievementsUnlocked} / ${achievementsTotal}` : undefined;
              }
            } else if (n.k === 'replays') {
              if (replaysLoading) {
                badge = '...';
              } else {
                badge = replays.length > 0 ? replays.length : undefined;
              }
            }
            return (
              <button key={n.k} className={`nav-item ${screen === n.screen ? 'active' : ''}`} onClick={() => navigate(n.screen as ScreenName)} title={n.label}>
                <Icon name={n.icon} size={16} className="nav-icon" />
                <span className="nav-text">{n.label}</span>
                {badge !== undefined && <span className="nav-count">{badge}</span>}
              </button>
            );
          })}
        </div>

        {/* Friends section — only when expanded */}
        {sidebarOpen && (
          <div className="nav-section">
            <div className="nav-label">
              <span>Friends</span>
              <button
                className="btn icon ghost"
                style={{ width: 18, height: 18, padding: 0 }}
                onClick={() => navigate('friends')}
                title="Add friend"
              >
                <Icon name="plus" size={12} />
              </button>
            </div>
            {friendsLoading ? (
              <div style={{ padding: '8px 10px', color: 'var(--fg-muted)', fontSize: 11.5 }}>
                Loading...
              </div>
            ) : friends.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px',
                  gap: 6,
                  color: 'var(--fg-muted)',
                }}
              >
                <span
                  style={{ fontSize: 22, display: 'inline-block', animation: 'mosquito-fly 3s ease-in-out infinite' }}
                  title="No friends online"
                >
                  🦟
                </span>
                <span style={{ fontSize: 10.5, textAlign: 'center', lineHeight: 1.3 }}>
                  No friends online
                </span>
              </div>
            ) : (
              <>
                {friends.slice(0, 3).map((f) => (
                  <div key={f.friendship.id} className="nav-item" style={{ padding: '6px 10px' }}>
                    <Avatar name={f.profile.displayName ?? f.profile.username} size={22} status={f.onlineStatus} />
                    <div style={{ minWidth: 0, lineHeight: 1.2 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.profile.displayName ?? f.profile.username}
                      </div>
                      <div className="t-cap" style={{ fontSize: 10.5 }}>{f.statusText}</div>
                    </div>
                  </div>
                ))}
                {friends.length > 3 && (
                  <button
                    className="nav-item"
                    style={{ padding: '5px 10px', color: 'var(--fg-muted)', fontSize: 11.5 }}
                    onClick={() => navigate('friends')}
                  >
                    <Icon name="users" size={12} />
                    <span>View more ({friends.length - 3} more)</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <div className="nav-spacer" />

        {/* Bottom items — only in collapsed state */}
        {!sidebarOpen && (
          <button
            className={`nav-item ${screen === 'settings' ? 'active' : ''}`}
            onClick={() => navigate('settings')}
            title="Settings"
          >
            <Icon name="settings" size={16} className="nav-icon" />
            <span className="nav-text">Settings</span>
          </button>
        )}

        {/* Footer */}
        <div className="nav-footer">
          <div className="nav-avatar">{displayInitial}</div>
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nm">{displayName}</div>
              <div className="el">{eloLine}</div>
            </div>
          )}
          {sidebarOpen && (
            <>
              <button className="btn icon ghost" onClick={() => navigate('settings')}>
                <Icon name="settings" size={14} />
              </button>
              <button
                className="btn icon ghost"
                onClick={() => setShowSignOutDialog(true)}
                title="Sign out"
              >
                <Icon name="log-out" size={14} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="main">
        {showTabs && (
          <div className="view-tabs">
            <div className="view-tab active">
              <Icon name={getScreenIcon(screen)} size={13} />
              {getScreenTitle(screen)}
            </div>
            <div className="spacer" />
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
              onSendMove={sendMove}
            />
          )}
          {screen === 'lobby' && (
            <ViewLobby
              navigate={navigate}
              blueColor={accentColor}
              redColor={oColor}
              onReady={sendReady}
              onStartGame={() => { cleanupRoom(); sendStartGame(); }}
              onSendChat={sendChat}
            />
          )}
          {screen === 'create' && (
            <ViewCreate
              navigate={navigate}
              blueColor={accentColor}
              playerName={displayName}
              onCreateRoom={createRoom}
            />
          )}
          {screen === 'join' && (
            <ViewJoin
              navigate={navigate}
              blueColor={accentColor}
              redColor={oColor}
              playerName={displayName}
              onJoinRoom={joinRoom}
            />
          )}
          {screen === 'profile' && (
            <ViewProfile
              navigate={navigate}
              blueColor={accentColor}
              redColor={oColor}
              userId={viewingUserId ?? undefined}
            />
          )}
          {screen === 'history' && (
            <ViewHistory
              navigate={navigate}
              blueColor={accentColor}
              redColor={oColor}
              onSelectReplay={(match) => { setReplayMatch(match); navigate('replay'); }}
            />
          )}
          {screen === 'replay' && (
            <ViewReplay
              navigate={navigate}
              blueColor={accentColor}
              redColor={oColor}
              matchId={replayMatch?.id ?? null}
              matchMeta={replayMatch}
            />
          )}
          {screen === 'settings' && (
            <ViewSettings navigate={navigate} blueColor={accentColor} />
          )}
          {screen === 'achievements' && (
            <ViewAchievements navigate={navigate} blueColor={accentColor} redColor={oColor} />
          )}
          {screen === 'ranking' && (
            <ViewRanking navigate={navigate} blueColor={accentColor} redColor={oColor} />
          )}
          {screen === 'friends' && (
            <ViewFriends navigate={navigate} blueColor={accentColor} redColor={oColor} navigateToProfile={navigateToProfile} />
          )}
          {screen === 'replays' && (
            <ViewReplays
              navigate={navigate}
              blueColor={accentColor}
              redColor={oColor}
              onSelectReplay={(match) => setReplayMatch(match)}
            />
          )}
          {screen === 'developer-agents' && isDeveloperMode && (
            <ViewDeveloperAgents navigate={navigate} />
          )}

          {(modal === 'victory' || modal === 'defeat' || modal === 'draw') && (
            <ResultModal
              kind={modal as 'victory' | 'defeat' | 'draw'}
              playerX={playerX}
              playerO={playerO}
              xCaptures={xCaptures}
              oCaptures={oCaptures}
              movesCount={movesCount}
              timeX={timeX}
              timeO={timeO}
              initialTime={initialTime}
              mode={mode}
              onClose={() => setModal(null)}
              onRematch={handleRematch}
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

      {/* Sign-out confirmation dialog */}
      {showSignOutDialog && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowSignOutDialog(false)}
        >
          <div
            style={{ width: 340, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', flexShrink: 0 }}>
                <Icon name="log-out" size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Sign Out?</div>
                <div className="t-cap" style={{ marginTop: 2 }}>Your progress is safely stored in the cloud.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setShowSignOutDialog(false)}>Cancel</button>
              <button
                className="btn"
                style={{ flex: 1, background: 'var(--red)', color: '#fff' }}
                onClick={() => { void signOut(); navigate('login'); setShowSignOutDialog(false); }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statusbar */}
      <div className="statusbar">
        <div className="pill">
          <div className={`dot ${session ? 'g' : ''}`} style={!session ? { background: 'var(--text-3)' } : undefined} />
          <span>{session ? 'Online' : isGuest ? 'Guest' : 'Signed Out'}</span>
        </div>
        <div className="spacer" />
        <div className="pill">
          <span>{replaysLoading ? '...' : `${replays.length} matches`}</span>
        </div>
        <div className="pill">
          <span>ELO {profile?.rating ?? '—'}</span>
        </div>
        <div className="pill">
          <Icon name="kbd" size={11} />
          <Kbd>?</Kbd>
          <span style={{ marginLeft: 4 }}>shortcuts</span>
        </div>
        <div className="pill">
          <span>v0.1.0</span>
        </div>
      </div>
    </div>
  );
}

export default App;
