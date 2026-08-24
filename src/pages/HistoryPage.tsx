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

type LocalResult = 'win' | 'loss' | 'draw';

function toLocalResult(result: MatchResult, userId: string, match: RemoteMatch): LocalResult {
  if (result === 'draw' || result === 'abandoned') return 'draw';
  const userIsX = match.playerXId === userId;
  if (result === 'x_wins') return userIsX ? 'win' : 'loss';
  return userIsX ? 'loss' : 'win';
}

const RESULT_CHIP: Record<LocalResult, string> = {
  win:  'chip green',
  loss: 'chip red',
  draw: 'chip',
};

const RESULT_LABEL: Record<LocalResult, string> = {
  win:  'Victory',
  loss: 'Defeat',
  draw: 'Draw',
};

const MODE_LABEL: Record<MatchMode, string> = {
  online: 'Online',
  ai:     'vs AI',
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
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7)  return 'this week';
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

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
      <div style={{
        width: 4, height: 28, marginLeft: 14,
        background:
          localResult === 'win'  ? 'var(--green)' :
          localResult === 'loss' ? 'var(--red)'   : 'var(--text-3)',
        borderRadius: 2,
      }} />

      <Avatar
        name={opponentName}
        size={26}
        gradient={isAI ? 'linear-gradient(140deg,#52525B,#27272A)' : undefined}
      />

      <div>
        <div style={{ fontWeight: 600 }}>vs {opponentName}</div>
        <div className="t-cap t-mono">{formatDate(match.endedAt)}</div>
      </div>

      <span className={RESULT_CHIP[localResult]}>
        {RESULT_LABEL[localResult]}
      </span>

      <div className="t-cap t-mono">{MODE_LABEL[match.mode]}</div>

      <div className="t-cap t-mono">{match.totalMoves} moves</div>

      <div className="t-cap t-mono">{formatDuration(match.durationSeconds)}</div>

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

export function ViewHistory({ navigate, blueColor: _blueColor, redColor: _redColor, onSelectReplay }: ViewHistoryProps): React.ReactElement {
  const { matches, loading, error } = useMatchHistory();
  const session = useUserStore((s) => s.session);
  const userId  = session?.userId ?? '';

  const grouped: Array<{ label: string; match: RemoteMatch }> = matches.map((m) => ({
    label: formatDateGroup(m.endedAt),
    match: m,
  }));

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      <div className="row" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 24 }}>
          <button className="btn ghost sm" onClick={() => navigate('home')}>
            <Icon name="arrow-l" size={14} /> Home
          </button>
          <div className="t-h1" style={{ marginTop: 12 }}>History</div>
          <div className="muted" style={{ fontSize: 13 }}>
            {loading
              ? 'Loading matches…'
              : `${matches.length} match${matches.length !== 1 ? 'es' : ''} · filter by mode, outcome or opponent`}
          </div>
        </div>
        <div className="spacer" />
        <button className="btn" disabled title="Coming soon" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <Icon name="database" size={14} /> Export PGN
        </button>
      </div>

      {loading && (
        <div className="t-cap" style={{ textAlign: 'center', padding: 48 }}>
          Loading history…
        </div>
      )}

      {error && !loading && (
        <div className="t-cap" style={{ textAlign: 'center', padding: 48, color: 'var(--red)' }}>
          Error loading history: {error}
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '64px 0', fontSize: 13 }}>
          <Icon name="history" size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No saved matches</div>
          <div>Play your first match to see it recorded here.</div>
        </div>
      )}

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
