import { useState, useEffect, type FC } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { Icon } from '../../components/ui';
import type { ScreenName } from '../../types/game';
import type { PythonAgentInfo } from '../../types/agent.types';
import { pythonAgentService } from '@/services/native/python-agent.service';
import { isTauri } from '@/services/transport/localTransport';
import { useGameStore } from '../../stores/gameStore';
import { useMatchStore } from '../../stores/matchStore';
import { useUserStore } from '../../stores/userStore';

export interface ViewDeveloperAgentsProps {
  navigate: (screen: ScreenName) => void;
}

export const ViewDeveloperAgents: FC<ViewDeveloperAgentsProps> = ({ navigate }) => {
  const [agents, setAgents] = useState<PythonAgentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingFolder, setOpeningFolder] = useState(false);
  const [startingAgent, setStartingAgent] = useState<string | null>(null);
  const [copyingTemplate, setCopyingTemplate] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);
  const [savedTemplatePath, setSavedTemplatePath] = useState<string | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [disabledPaths, setDisabledPaths] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('tricki_disabled_agents') ?? '[]'));
    } catch {
      return new Set();
    }
  });

  const startAgentGame = useGameStore((s) => s.startAgentGame);
  const setAgentSession = useMatchStore((s) => s.setAgentSession);
  const displayName = useUserStore((s) => s.profile?.displayName ?? 'Player');

  const loadAgents = () => {
    setLoading(true);
    setError(null);
    pythonAgentService
      .listAgents()
      .then(setAgents)
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handlePlay = (agent: PythonAgentInfo) => {
    if (startingAgent) return;
    setStartingAgent(agent.path);
    setError(null);

    pythonAgentService
      .startSession(agent.path)
      .then((sessionId) => {
        setAgentSession(sessionId, agent.name);
        startAgentGame(displayName, agent.name, 300);
        navigate('game');
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Could not start agent: ${msg}`);
      })
      .finally(() => {
        setStartingAgent(null);
      });
  };

  const handleOpenFolder = async () => {
    if (!isTauri()) {
      setError('Local filesystem folder access is only available on the desktop version.');
      return;
    }
    setOpeningFolder(true);
    try {
      await pythonAgentService.openAgentsFolder();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Could not open folder: ${msg}`);
    } finally {
      setOpeningFolder(false);
    }
  };

  const handleCopyTemplate = async () => {
    if (copyingTemplate) return;
    if (!isTauri()) {
      setError('Direct local filesystem download requires the desktop version.');
      return;
    }
    setCopyingTemplate(true);
    try {
      const destPath = await save({
        defaultPath: 'agent-template.py',
        filters: [{ name: 'Python', extensions: ['py'] }],
      });
      if (!destPath) return;
      const written = await pythonAgentService.saveTemplate(destPath);
      setSavedTemplatePath(written);
      setTemplateCopied(true);
      setTimeout(() => {
        setTemplateCopied(false);
        setSavedTemplatePath(null);
      }, 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Could not save template: ${msg}`);
    } finally {
      setCopyingTemplate(false);
    }
  };

  const handleLoadAgent = async () => {
    if (loadingAgent) return;
    if (!isTauri()) {
      setError('Loading agents from the local filesystem requires the desktop version.');
      return;
    }
    setLoadingAgent(true);
    try {
      const selected = await open({
        filters: [{ name: 'Python', extensions: ['py'] }],
        multiple: false,
      });
      if (!selected) return;
      const sourcePath = typeof selected === 'string' ? selected : selected[0];
      await pythonAgentService.importAgent(sourcePath);
      loadAgents();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Could not load agent: ${msg}`);
    } finally {
      setLoadingAgent(false);
    }
  };

  const toggleAgent = (path: string) => {
    setDisabledPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      localStorage.setItem('tricki_disabled_agents', JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn ghost sm" onClick={() => navigate('home')}>
          <Icon name="arrow-l" size={14} /> Home
        </button>
        <div style={{ flex: 1 }} />
        <span className="chip amber">Developer View</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="t-h1" style={{ marginBottom: 4 }}>Python Agents</div>
        <div className="muted" style={{ fontSize: 13.5 }}>
          Load custom Python agents and play matches against them.
        </div>
      </div>

      {!isTauri() && (
        <div
          style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: 13,
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon name="info" size={16} />
          <span>Web Mode active: Python agents and local filesystem access require the desktop app.</span>
        </div>
      )}

      {/* Actions bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn ghost sm" onClick={loadAgents} disabled={loading}>
          <Icon name="replay" size={13} /> Reload
        </button>
        <button
          className="btn ghost sm"
          onClick={() => void handleOpenFolder()}
          disabled={openingFolder}
        >
          <Icon name="plus" size={13} /> Open agents folder
        </button>
        <button
          className="btn ghost sm"
          onClick={() => void handleCopyTemplate()}
          disabled={copyingTemplate}
        >
          <Icon name={templateCopied ? 'check' : 'download'} size={13} />
          {templateCopied ? 'Template ready' : 'Download template'}
        </button>
        <button
          className="btn ghost sm"
          onClick={() => void handleLoadAgent()}
          disabled={loadingAgent}
        >
          <Icon name="plus" size={13} /> Load agent
        </button>
      </div>

      {savedTemplatePath && (
        <div
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            color: 'var(--green)',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          Template saved to {savedTemplatePath}
        </div>
      )}

      {/* Agent list */}
      {loading && (
        <div style={{ color: 'var(--fg-muted)', fontSize: 13.5, padding: '12px 0' }}>
          Loading agents...
        </div>
      )}

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            padding: '12px 16px',
            color: 'var(--red)',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          Error loading agents: {error}
        </div>
      )}

      {!loading && !error && agents.length === 0 && (
        <EmptyState />
      )}

      {!loading && agents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {agents.map((agent) => (
            <AgentCard
              key={agent.path}
              agent={agent}
              onPlay={handlePlay}
              isStarting={startingAgent === agent.path}
              disabled={disabledPaths.has(agent.path)}
              onToggle={toggleAgent}
            />
          ))}
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          marginTop: 32,
          background: 'var(--surface)',
          borderRadius: 10,
          padding: '16px 18px',
          fontSize: 12.5,
          color: 'var(--fg-muted)',
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--fg)' }}>
          Communication Protocol
        </div>
        <div>
          Host sends to agent via stdin:{' '}
          <code style={{ fontSize: 11.5 }}>
            {'{'}board, active_subboard, player, valid_moves{'}'}
          </code>
        </div>
        <div style={{ marginTop: 4 }}>
          Agent must respond via stdout:{' '}
          <code style={{ fontSize: 11.5 }}>{'{'}{"move"}: [macro_row, macro_col]{'}'}</code>
        </div>
        <div style={{ marginTop: 4 }}>
          Timeout: <strong>5 seconds</strong> per move.
        </div>
      </div>
    </div>
  );
};

const EmptyState: FC = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: '48px 24px',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 14,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="cpu" size={28} style={{ color: 'var(--fg-muted)' }} />
    </div>
    <div>
      <div className="t-h1" style={{ marginBottom: 8 }}>No Agents Found</div>
      <div className="muted" style={{ fontSize: 13, maxWidth: 320 }}>
        Create a <code>.py</code> file defining an <code>Agent</code> class and save it to{' '}
        <code style={{ whiteSpace: 'nowrap' }}>~/.tricki/agents/</code>
      </div>
    </div>
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        color: 'var(--fg-muted)',
        textAlign: 'left',
        fontFamily: 'monospace',
        lineHeight: 1.7,
      }}
    >
      <div style={{ color: 'var(--green)' }}># ~/.tricki/agents/my_agent.py</div>
      <div>class Agent:</div>
      <div>&nbsp;&nbsp;def mount(self): pass</div>
      <div>&nbsp;&nbsp;def act(self, state) -&gt; tuple:</div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;return tuple(state[&apos;valid_moves&apos;][0])</div>
    </div>
  </div>
);

interface AgentCardProps {
  agent: PythonAgentInfo;
  onPlay: (agent: PythonAgentInfo) => void;
  isStarting: boolean;
  disabled: boolean;
  onToggle: (path: string) => void;
}

const AgentCard: FC<AgentCardProps> = ({ agent, onPlay, isStarting, disabled, onToggle }) => (
  <div
    style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'linear-gradient(140deg,#3B82F6,#8B5CF6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: 18,
      }}
    >
      🐍
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{agent.name}</span>
        {disabled && (
          <span className="chip" style={{ fontSize: 10, opacity: 0.8 }}>Disabled</span>
        )}
      </div>
      <div
        className="t-cap"
        style={{
          fontSize: 11,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={agent.path}
      >
        {agent.path}
      </div>
    </div>
    <button
      className="btn ghost sm"
      onClick={() => onToggle(agent.path)}
    >
      {disabled ? 'Enable' : 'Disable'}
    </button>
    <button
      className="btn primary sm"
      onClick={() => onPlay(agent)}
      disabled={isStarting || disabled}
    >
      {isStarting ? 'Starting...' : 'Play'}
    </button>
  </div>
);
