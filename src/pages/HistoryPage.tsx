import React from 'react';
import { Icon, Avatar } from '../components/ui';
import type { ScreenName } from '../types/game';
import { useMatchHistory } from '@/hooks/useMatchHistory';
import { useUserStore } from '@/stores/userStore';
import type { RemoteMatch, MatchResult, MatchMode } from '@/types/match.types';

interface ViewHistoryProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
  onSelectReplay?: (match: RemoteMatch) => void;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

type LocalResult = 'victoria' | 'derrota' | 'empate';

function toLocalResult(result: MatchResult, userId: string, match: RemoteMatch): LocalResult {
  if (result === 'draw' || result === 'abandoned') return 'empate';
  const userIsX = match.playerXId === userId;
  if (result === 'x_wins') return userIsX ? 'victoria' : 'derrota';
  // o_wins
  return userIsX ? 'derrota' : 'victoria';
}

const RESULT_CHIP: Record<LocalResult, string> = {
  victoria: 'chip green',
  derrota:  'chip red',
  empate:   'chip',
};

const RESULT_LABEL: Record<LocalResult, string> = {
  victoria: 'Victoria',
  derrota:  'Derrota',
  empate:   'Empate',
};

const MODE_LABEL: Record<MatchMode, string> = {
  online: 'Online',
  ai:     'vs IA',
  local:  'Local',
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDateGroup(iso: string): string {
  const date  = new Date(iso);
  const today = new Date();
  const diff  = today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0);
  const days  = Math.floor(diff / 86_400_000);
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7)  return 'esta semana';
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Row component ────────────────────────────────────────────────────────────

interface MatchRowProps {
  match: RemoteMatch;
  userId: string;
  onReplay: () => void;
}

function MatchRow({ match, userId, onReplay }: MatchRowProps): React.ReactElement {
  const isAI        = match.mode === 'ai';
  const opponentName = match.playerXId === userId ? match.playerOName : match.playerXName;
  const localResult  = toLocalResult(match.result, userId, match);
  const eloChange    = match.playerXId === userId ? match.ratingChangeX : match.ratingChangeO;
  const eloSign      = eloChange > 0 ? '+' : '';
  const eloColor     =
    eloChange > 0 ? 'var(--green)' : eloChange < 0 ? 'var(--red)' : 'var(--text-3)';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '8px 32px 1fr 120px 100px 80px 80px 90px',
      gap: 12,
      padding: '11px 14px 11px 0',
      alignItems: 'center',
      borderBottom: '1px solid var(--border)',
      fontSize: 13,
    }}>
      {/* Result stripe */}
      <div style={{
        width: 4, height: 28, marginLeft: 14,
        background:
          localResult === 'victoria' ? 'var(--green)' :
          localResult === 'derrota'  ? 'var(--red)'   : 'var(--text-3)',
        borderRadius: 2,
      }} />

      {/* Avatar */}
      <Avatar
        name={opponentName}
        size={26}
        gradient={isAI ? 'linear-gradient(140deg,#52525B,#27272A)' : undefined}
      />

      {/* Opponent + date */}
      <div>
        <div style={{ fontWeight: 600 }}>vs {opponentName}</div>
        <div className="t-cap t-mono">{formatDate(match.endedAt)}</div>
      </div>

      {/* Result chip */}
      <span className={RESULT_CHIP[localResult]}>
        {RESULT_LABEL[localResult]}
      </span>

      {/* Mode */}
      <div className="t-cap t-mono">{MODE_LABEL[match.mode]}</div>

      {/* Moves */}
      <div className="t-cap t-mono">{match.totalMoves} mov.</div>

      {/* Duration */}
      <div className="t-cap t-mono">{formatDuration(match.durationSeconds)}</div>

      {/* Actions */}
      <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
        {!isAI && (
          <div className="t-mono" style={{ fontSize: 12, color: eloColor, fontWeight: 600, marginRight: 6 }}>
            {eloSign}{eloChange}
          </div>
        )}
        <button className="btn sm ghost" onClick={onReplay}>
          <Icon name="replay" size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ViewHistory({ navigate, blueColor: _blueColor, redColor: _redColor, onSelectReplay }: ViewHistoryProps): React.ReactElement {
  const { matches, loading, error } = useMatchHistory();
  const session = useUserStore((s) => s.session);
  const userId  = session?.userId ?? '';

  // Group consecutive rows by date label
  const grouped: Array<{ label: string; match: RemoteMatch }> = matches.map((m) => ({
    label: formatDateGroup(m.endedAt),
    match: m,
  }));

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>

      {/* Header */}
      <div className="row" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 24 }}>
          <button className="btn ghost sm" onClick={() => navigate('home')}>
            <Icon name="arrow-l" size={14} /> Inicio
          </button>
          <div className="t-h1" style={{ marginTop: 12 }}>Historial</div>
          <div className="muted" style={{ fontSize: 13 }}>
            {loading
              ? 'Cargando partidas…'
              : `${matches.length} partida${matches.length !== 1 ? 's' : ''} · filtra por modo, resultado u oponente`}
          </div>
        </div>
        <div className="spacer" />
        <button className="btn" disabled title="Próximamente" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <Icon name="database" size={14} /> Exportar PGN
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="t-cap" style={{ textAlign: 'center', padding: 48 }}>
          Cargando historial…
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="t-cap" style={{ textAlign: 'center', padding: 48, color: 'var(--red)' }}>
          Error al cargar historial: {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && matches.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '64px 0', fontSize: 13 }}>
          <Icon name="history" size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Sin partidas guardadas</div>
          <div>Juega tu primera partida para verla aquí.</div>
        </div>
      )}

      {/* Match list */}
      {!loading && !error && matches.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {grouped.map((item, i) => {
            const isNewGroup = i === 0 || grouped[i - 1].label !== item.label;
            return (
              <React.Fragment key={item.match.id}>
                {isNewGroup && (
                  <div style={{
                    padding: '8px 16px',
                    background: 'var(--surface-2)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span className="t-tag">{item.label}</span>
                  </div>
                )}
                <MatchRow
                  match={item.match}
                  userId={userId}
                  onReplay={() => { if (onSelectReplay) { onSelectReplay(item.match); } else { navigate('replay'); } }}
                />
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
