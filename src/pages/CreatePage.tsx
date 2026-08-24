import React from 'react';
import { Icon, Kbd } from '../components/ui';
import type { ScreenName } from '../types/game';
import { useGameStore } from '../stores/gameStore';
import { FEATURES } from '../config/features';
import { useActiveMatchGuard } from '@/hooks/useActiveMatchGuard';
import { ActiveMatchBlockedModal } from '@/components/ui/ActiveMatchBlockedModal';

interface ViewCreateProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  playerName?: string;
  onCreateRoom?: (playerName: string, isPublic: boolean, hostElo: number, timeControl: string) => string;
}

type GameMode = 'local' | 'ai' | 'online' | 'private';
type AIDiff = 'easy' | 'med' | 'hard' | 'expert';
type TimeControl = 'none' | 'blitz' | 'rapid' | 'custom';
type Privacy = 'public' | 'private';

type GameTemplate = {
  id: string;
  name: string;
  mode: GameMode;
  diff: AIDiff;
  time: TimeControl;
  customMinutes?: number;
  customIncrement?: number;
  createdAt: number;
};

interface SectionProps {
  title: string;
  step: number;
  children: React.ReactNode;
}

interface Card2Props {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  desc: string;
  badge?: string;
}

interface SummaryRowProps {
  k: string;
  v: string;
}

const TEMPLATES_KEY = 'tricki_templates';

function loadTemplates(): GameTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GameTemplate[];
  } catch {
    return [];
  }
}

function saveTemplates(templates: GameTemplate[]): void {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

function Section({ title, step, children }: SectionProps): React.ReactElement {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row" style={{ marginBottom: 14 }}>
        <span style={{
          width: 22, height: 22, borderRadius: 999,
          background: 'var(--surface-2)', border: '1px solid var(--border-hi)',
          display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 700, color: 'var(--text-2)',
          fontFamily: 'var(--font-mono)',
        }}>{step}</span>
        <span className="t-h3">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Grid4({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>{children}</div>
  );
}

function Card2({ active, onClick, icon, title, desc, badge }: Card2Props): React.ReactElement {
  return (
    <div onClick={onClick} style={{
      padding: 14, borderRadius: 10,
      background: active ? 'rgba(59,130,246,.10)' : 'var(--surface-2)',
      border: active ? '1px solid var(--blue)' : '1px solid var(--border)',
      cursor: 'default',
      transition: 'all var(--t-fast) var(--ease)',
      position: 'relative',
    }}>
      <Icon name={icon} size={18} style={{ color: active ? 'var(--blue)' : 'var(--text-2)', marginBottom: 10 }} />
      <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
      <div className="t-cap" style={{ marginTop: 2 }}>{desc}</div>
      {badge && (
        <span className="chip blue" style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, padding: '1px 6px' }}>{badge}</span>
      )}
      {active && !badge && (
        <div style={{ position: 'absolute', top: 10, right: 10, width: 16, height: 16, borderRadius: '50%', background: 'var(--blue)', display: 'grid', placeItems: 'center' }}>
          <Icon name="check" size={11} style={{ color: '#fff' }} />
        </div>
      )}
    </div>
  );
}

function SummaryRow({ k, v }: SummaryRowProps): React.ReactElement {
  return (
    <div className="row" style={{ fontSize: 13 }}>
      <span className="muted">{k}</span><div className="spacer"/>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}

export function ViewCreate({ navigate, blueColor: _blueColor, playerName = 'Player', onCreateRoom }: ViewCreateProps): React.ReactElement {
  const { isBlocked, closeBlockedModal } = useActiveMatchGuard('create');
  const [mode, setMode] = React.useState<GameMode>('local');
  const [diff, setDiff] = React.useState<AIDiff>('hard');
  const [time, setTime] = React.useState<TimeControl>('blitz');
  const [customMinutes, setCustomMinutes] = React.useState(7);
  const [customIncrement, setCustomIncrement] = React.useState(4);
  const [_privacy, setPrivacy] = React.useState<Privacy>('public');
  const [templateSaved, setTemplateSaved] = React.useState(false);
  const [templates, setTemplates] = React.useState<GameTemplate[]>(() => loadTemplates());
  const startLocalGame = useGameStore((s) => s.startLocalGame);
  const startAiGame = useGameStore((s) => s.startAiGame);

  React.useEffect(() => {
    if (!FEATURES.MULTIPLAYER && (mode === 'online' || mode === 'private')) {
      setMode('local');
    }
  }, []);

  React.useEffect(() => {
    if (mode === 'private') setPrivacy('private');
    else setPrivacy('public');
  }, [mode]);

  React.useEffect(() => {
    if (mode === 'ai') setDiff('easy');
  }, [mode]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleCreate();
      } else if (e.key === 'Escape') {
        navigate('home');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, time, diff]);

  function timeToSeconds(t: TimeControl): number {
    if (t === 'none') return 9999;
    if (t === 'blitz') return 300;
    if (t === 'rapid') return 600;
    if (t === 'custom') return Math.max(60, customMinutes * 60);
    return 420;
  }

  const handleCreate = () => {
    const secs = timeToSeconds(time);
    const myName = playerName.trim() || 'Player 1';
    if (mode === 'local') {
      startLocalGame(myName, 'Player 2', secs);
      navigate('game');
    } else if (mode === 'ai') {
      startAiGame(myName, 'builtin.flat_mc.easy', secs);
      navigate('game');
    } else if (mode === 'online' && onCreateRoom) {
      onCreateRoom(playerName, true, 0, time);
      navigate('lobby');
    } else if (mode === 'private' && onCreateRoom) {
      onCreateRoom(playerName, false, 0, time);
      navigate('lobby');
    }
  };

  const modeLabel = mode === 'online' ? 'Online · Ranked' : mode === 'ai' ? 'vs AI' : mode === 'local' ? 'Local' : 'Private';
  const diffLabel = diff === 'easy' ? 'Easy' : diff === 'med' ? 'Medium' : diff === 'hard' ? 'Hard' : 'Expert';
  const timeLabel = time === 'blitz' ? '5+3' : time === 'rapid' ? '10+5' : time === 'none' ? 'No limit' : `${customMinutes}+${customIncrement}`;

  const isDisabled = (mode === 'online' && !onCreateRoom) || (mode === 'private' && !onCreateRoom);
  const timeStep = mode === 'ai' ? 3 : 2;

  const handleSaveTemplate = () => {
    const name = `${modeLabel} · ${timeLabel}`;
    const newTemplate: GameTemplate = {
      id: Date.now().toString(),
      name,
      mode,
      diff,
      time,
      createdAt: Date.now(),
    };
    const existing = loadTemplates();
    const updated = [...existing, newTemplate];
    saveTemplates(updated);
    setTemplates(updated);
    setTemplateSaved(true);
    setTimeout(() => setTemplateSaved(false), 1500);
  };

  const handleApplyTemplate = (t: GameTemplate) => {
    setMode(t.mode);
    setDiff(t.diff);
    setTime(t.time);
  };

  const visibleTemplates = [...templates]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%', position: 'relative' }}>
      <ActiveMatchBlockedModal
        isOpen={isBlocked}
        onClose={closeBlockedModal}
        navigate={navigate}
      />
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <button className="btn ghost sm" onClick={() => navigate('home')}><Icon name="arrow-l" size={14}/> Home</button>
        <div className="t-h1" style={{ marginTop: 12 }}>Create Game</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Configure your match parameters.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* MODE */}
          <Section title="Game Mode" step={1}>
            <Grid4>
              <Card2 active={mode === 'local'} onClick={() => setMode('local')} icon="users" title="Local" desc="2 players on the same device" />
              <Card2 active={mode === 'ai'} onClick={() => setMode('ai')} icon="cpu" title="Against AI" desc="Challenge the engine" badge="Beta" />
              {FEATURES.MULTIPLAYER ? (
                <>
                  <Card2 active={mode === 'online'} onClick={() => setMode('online')} icon="globe" title="Online" desc="Online multiplayer" badge="Beta" />
                  <Card2 active={mode === 'private'} onClick={() => setMode('private')} icon="lock" title="Private Room" desc="With invite code" />
                </>
              ) : (
                <>
                  <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                    <Card2 active={false} onClick={() => {}} icon="globe" title="Online" desc="Online multiplayer" badge="Unavailable" />
                  </div>
                  <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                    <Card2 active={false} onClick={() => {}} icon="lock" title="Private Room" desc="With invite code" badge="Unavailable" />
                  </div>
                </>
              )}
            </Grid4>
          </Section>

          {/* DIFFICULTY (AI only) */}
          {mode === 'ai' && (
            <Section title="AI Difficulty" step={2}>
              <Grid4>
                <Card2 active={diff === 'easy'} onClick={() => setDiff('easy')} icon="star" title="Easy" desc="ELO ~1100 · ideal for learning" />
                <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                  <Card2 active={diff === 'med'} onClick={() => setDiff('med')} icon="star" title="Medium" desc="ELO ~1500 · solid play" badge="Coming Soon" />
                </div>
                <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                  <Card2 active={diff === 'hard'} onClick={() => setDiff('hard')} icon="star" title="Hard" desc="ELO ~1850 · evaluates 5 moves" badge="Coming Soon" />
                </div>
                <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                  <Card2 active={diff === 'expert'} onClick={() => setDiff('expert')} icon="sparkle" title="Expert" desc="ELO 2100+ · deep MCTS" badge="Coming Soon" />
                </div>
              </Grid4>
            </Section>
          )}

          {/* TIME */}
          <Section title="Time Control" step={timeStep}>
            <Grid4>
              <Card2 active={time === 'none'} onClick={() => setTime('none')} icon="clock" title="No Limit" desc="Casual / analysis" />
              <Card2 active={time === 'blitz'} onClick={() => setTime('blitz')} icon="bolt" title="Blitz" desc="5 min + 3 s/move" />
              <Card2 active={time === 'rapid'} onClick={() => setTime('rapid')} icon="clock" title="Rapid" desc="10 min + 5 s/move" />
              <Card2 active={time === 'custom'} onClick={() => setTime('custom')} icon="settings" title="Custom" desc="Define parameters" />
            </Grid4>
            {time === 'custom' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <div className="t-cap" style={{ marginBottom: 4 }}>Base minutes</div>
                  <input className="input mono" value={customMinutes} onChange={e => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))} type="number" min="1" max="60" />
                </div>
                <div>
                  <div className="t-cap" style={{ marginBottom: 4 }}>Increment per move (s)</div>
                  <input className="input mono" value={customIncrement} onChange={e => setCustomIncrement(Math.max(0, parseInt(e.target.value) || 0))} type="number" min="0" max="60" />
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Sidebar Panel */}
        <div style={{ position: 'sticky', top: 0 }}>
          {/* Summary */}
          <div className="card" style={{ padding: 18 }}>
            <div className="t-tag" style={{ marginBottom: 10 }}>Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <SummaryRow k="Mode" v={modeLabel} />
              {mode === 'ai' && <SummaryRow k="Difficulty" v={diffLabel} />}
              <SummaryRow k="Time" v={timeLabel} />
              <SummaryRow k="Rating Impact" v={mode === 'online' ? 'Yes, ±18' : 'No'} />
              <SummaryRow k="Spectators" v="Allowed" />
            </div>
            <button
              className="btn primary lg"
              style={{ width: '100%', marginBottom: 8 }}
              onClick={handleCreate}
              disabled={isDisabled}
            >
              <Icon name="play" size={14}/>
              {mode === 'online' ? 'Create Public Room' : mode === 'private' ? 'Create Private Room' : mode === 'ai' ? 'Play against Flattie' : 'Start Local Game'}
            </button>
            <button className="btn ghost" style={{ width: '100%' }} onClick={handleSaveTemplate}>
              {templateSaved ? 'Saved!' : 'Save as template'}
            </button>
          </div>

          {/* Keyboard shortcuts */}
          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div className="t-tag" style={{ marginBottom: 6 }}>Keyboard Shortcuts</div>
            <div className="row" style={{ marginBottom: 4, fontSize: 12 }}>
              <span className="muted">Create game</span><div className="spacer"/><Kbd>Ctrl</Kbd><Kbd>Enter</Kbd>
            </div>
            <div className="row" style={{ fontSize: 12 }}>
              <span className="muted">Cancel</span><div className="spacer"/><Kbd>Esc</Kbd>
            </div>
          </div>

          {/* My templates */}
          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div className="t-tag" style={{ marginBottom: 8 }}>My Templates</div>
            {visibleTemplates.length === 0 ? (
              <span className="muted" style={{ fontSize: 12 }}>No saved templates</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {visibleTemplates.map((t) => (
                  <button
                    key={t.id}
                    className="btn ghost sm"
                    style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
                    onClick={() => handleApplyTemplate(t)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
