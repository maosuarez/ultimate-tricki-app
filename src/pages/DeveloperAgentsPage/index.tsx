import { useState, useEffect, type FC } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { Icon } from '../../components/ui';
import type { ScreenName } from '../../types/game';
import type { PythonAgentInfo } from '../../types/agent.types';
import { pythonAgentService } from '../../services/pythonAgentService';
import { useGameStore } from '../../stores/gameStore';
import { useMatchStore } from '../../stores/matchStore';
import { useUserStore } from '../../stores/userStore';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ViewDeveloperAgentsProps {
  navigate: (screen: ScreenName) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  const displayName = useUserStore((s) => s.profile?.displayName ?? 'Jugador');

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
        setError(`No se pudo iniciar el agente: ${msg}`);
      })
      .finally(() => {
        setStartingAgent(null);
      });
  };

  const handleOpenFolder = async () => {
    setOpeningFolder(true);
    try {
      await pythonAgentService.openAgentsFolder();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`No se pudo abrir la carpeta: ${msg}`);
    } finally {
      setOpeningFolder(false);
    }
  };

  const handleCopyTemplate = async () => {
    if (copyingTemplate) return;
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
      setError(`No se pudo guardar la plantilla: ${msg}`);
    } finally {
      setCopyingTemplate(false);
    }
  };

  const handleLoadAgent = async () => {
    if (loadingAgent) return;
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
      setError(`No se pudo cargar el agente: ${msg}`);
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
          <Icon name="arrow-l" size={14} /> Inicio
        </button>
        <div style={{ flex: 1 }} />
        <span className="chip amber">Vista de desarrollador</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="t-h1" style={{ marginBottom: 4 }}>Agentes Python</div>
        <div className="muted" style={{ fontSize: 13.5 }}>
          Carga agentes personalizados escritos en Python y juega contra ellos.
        </div>
      </div>

      {/* Actions bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn ghost sm" onClick={loadAgents} disabled={loading}>
          <Icon name="replay" size={13} /> Recargar
        </button>
        <button
          className="btn ghost sm"
          onClick={() => void handleOpenFolder()}
          disabled={openingFolder}
        >
          <Icon name="plus" size={13} /> Abrir carpeta de agentes
        </button>
        <button
          className="btn ghost sm"
          onClick={() => void handleCopyTemplate()}
          disabled={copyingTemplate}
        >
          <Icon name={templateCopied ? 'check' : 'download'} size={13} />
          {templateCopied ? 'Plantilla lista' : 'Descargar plantilla'}
        </button>
        <button
          className="btn ghost sm"
          onClick={() => void handleLoadAgent()}
          disabled={loadingAgent}
        >
          <Icon name="plus" size={13} /> Cargar agente
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
          Plantilla guardada en {savedTemplatePath}
        </div>
      )}

      {/* Agent list */}
      {loading && (
        <div style={{ color: 'var(--fg-muted)', fontSize: 13.5, padding: '12px 0' }}>
          Cargando agentes...
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
          Error al cargar agentes: {error}
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
          Protocolo de comunicación
        </div>
        <div>
          Rust env&iacute;a al agente por stdin:{' '}
          <code style={{ fontSize: 11.5 }}>
            {'{'}board, active_subboard, player, valid_moves{'}'}
          </code>
        </div>
        <div style={{ marginTop: 4 }}>
          El agente debe responder por stdout:{' '}
          <code style={{ fontSize: 11.5 }}>{'{'}{"move"}: [macro_row, macro_col]{'}'}</code>
        </div>
        <div style={{ marginTop: 4 }}>
          Timeout: <strong>5 segundos</strong> por movimiento.
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      <div className="t-h1" style={{ marginBottom: 8 }}>Sin agentes</div>
      <div className="muted" style={{ fontSize: 13, maxWidth: 320 }}>
        Crea un archivo <code>.py</code> con una clase <code>Agent</code> y guárdalo en{' '}
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
      <div style={{ color: 'var(--green)' }}># ~/.tricki/agents/mi_agente.py</div>
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
          <span className="chip" style={{ fontSize: 10, opacity: 0.8 }}>Desactivado</span>
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
      {disabled ? 'Activar' : 'Desactivar'}
    </button>
    <button
      className="btn primary sm"
      onClick={() => onPlay(agent)}
      disabled={isStarting || disabled}
    >
      {isStarting ? 'Iniciando...' : 'Jugar'}
    </button>
  </div>
);
