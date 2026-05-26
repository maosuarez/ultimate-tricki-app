import { useState, useEffect, type FC } from 'react';
import { openPath } from '@tauri-apps/plugin-opener';
import { Icon } from '../../components/ui';
import type { ScreenName } from '../../types/game';
import type { PythonAgentInfo } from '../../types/agent.types';
import { pythonAgentService } from '../../services/pythonAgentService';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ViewDeveloperAgentsProps {
  navigate: (screen: ScreenName) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function agentsDirPath(): string {
  // This path is informational only (displayed to the user).
  // The actual resolution is handled by Rust via dirs-next.
  return '~/.tricki/agents/';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ViewDeveloperAgents: FC<ViewDeveloperAgentsProps> = ({ navigate }) => {
  const [agents, setAgents] = useState<PythonAgentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingFolder, setOpeningFolder] = useState(false);

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

  const handleOpenFolder = async () => {
    setOpeningFolder(true);
    try {
      // Open the agents directory in the OS file manager.
      await openPath(agentsDirPath());
    } catch {
      // Fallback: the folder path is shown in the UI so the user can open it manually.
    } finally {
      setOpeningFolder(false);
    }
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
      </div>

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
            <AgentCard key={agent.path} agent={agent} />
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
}

const AgentCard: FC<AgentCardProps> = ({ agent }) => (
  <div
    style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
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
      <div style={{ fontWeight: 700, fontSize: 14 }}>{agent.name}</div>
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
    <button className="btn primary sm" disabled title="Próximamente: iniciar partida contra este agente">
      Jugar
    </button>
  </div>
);
