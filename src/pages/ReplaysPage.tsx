import React from 'react';
import { Icon } from '../components/ui';
import type { ScreenName } from '../types/game';
import { useReplays } from '@/hooks/useReplays';
import type { RemoteMatch, MatchResult } from '@/types/match.types';
import { useUserStore } from '@/stores/userStore';

interface ViewReplaysProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

type LocalResult = 'victoria' | 'derrota' | 'empate';

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

function toLocalResult(result: MatchResult, userId: string, match: RemoteMatch): LocalResult {
  if (result === 'draw') return 'empate';
  const userIsX = match.playerXId === userId;
  if (result === 'x_wins') return userIsX ? 'victoria' : 'derrota';
  if (result === 'o_wins') return userIsX ? 'derrota' : 'victoria';
  return 'empate'; // abandoned treated as neutral
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ReplayCardProps {
  match: RemoteMatch;
  userId: string;
  onView: () => void;
}

function ReplayCard({ match, userId, onView }: ReplayCardProps): React.ReactElement {
  const isAI = match.mode === 'ai';
  const opponentName = match.playerXId === userId ? match.playerOName : match.playerXName;
  const localResult = toLocalResult(match.result, userId, match);
  const title = `vs ${opponentName}`;

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Thumbnail + title */}
      <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 60, height: 60, borderRadius: 8, flexShrink: 0,
          background: isAI
            ? 'linear-gradient(140deg, #52525B, #27272A)'
            : 'linear-gradient(140deg, #1D4ED8, #7C3AED)',
          display: 'grid', placeItems: 'center',
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: 'monospace', letterSpacing: 1 }}>
            9×9
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </div>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            <span className={RESULT_CHIP[localResult]} style={{ fontSize: 11 }}>
              {RESULT_LABEL[localResult]}
            </span>
            <span className="chip" style={{ fontSize: 11 }}>vs {opponentName}</span>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="row" style={{ gap: 14, color: 'var(--text-3)' }}>
        <span className="t-cap t-mono"><Icon name="clock" size={11}/> {formatDuration(match.durationSeconds)}</span>
        <span className="t-cap t-mono">{match.totalMoves} mov.</span>
        <span className="t-cap">{formatDate(match.endedAt)}</span>
      </div>

      {/* Actions */}
      <div className="row" style={{ gap: 6, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <button className="btn primary sm" style={{ flex: 1 }} onClick={onView}>
          <Icon name="play" size={13}/> Ver replay
        </button>
        <button className="btn ghost sm"><Icon name="copy" size={13}/> Renombrar</button>
        <button className="btn ghost sm" style={{ color: 'var(--red)' }}><Icon name="x" size={13}/></button>
      </div>
    </div>
  );
}

export function ViewReplays({ navigate, blueColor: _blueColor, redColor: _redColor }: ViewReplaysProps): React.ReactElement {
  const { replays, loading, error } = useReplays();
  const session = useUserStore((s) => s.session);
  const userId = session?.userId ?? '';

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      {/* Header */}
      <div className="row" style={{ marginBottom: 20, alignItems: 'flex-start' }}>
        <div>
          <button className="btn ghost sm" onClick={() => navigate('home')} style={{ marginBottom: 10 }}>
            <Icon name="arrow-l" size={14}/> Inicio
          </button>
          <div className="t-h1" style={{ marginBottom: 6 }}>Replays guardados</div>
          <div className="row" style={{ gap: 8 }}>
            <span className="chip"><Icon name="history" size={11}/> {replays.length} guardados</span>
          </div>
        </div>
        <div className="spacer"/>
        <button className="btn ghost" style={{ alignSelf: 'flex-end', marginBottom: 2 }}>
          <Icon name="database" size={14}/> Importar PGN
        </button>
      </div>

      {/* Loading / error states */}
      {loading && (
        <div className="t-cap" style={{ textAlign: 'center', padding: 32 }}>Cargando…</div>
      )}
      {error && !loading && (
        <div className="t-cap" style={{ textAlign: 'center', padding: 32, color: 'var(--red)' }}>
          Error al cargar replays: {error}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <>
          {replays.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px 0', fontSize: 13 }}>
              Sin replays guardados todavía
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {replays.map(r => (
                <ReplayCard
                  key={r.id}
                  match={r}
                  userId={userId}
                  onView={() => navigate('replay')}
                />
              ))}
            </div>
          )}

          {replays.length > 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '24px 0', fontSize: 12 }}>
              Sin más replays guardados
            </div>
          )}
        </>
      )}
    </div>
  );
}
