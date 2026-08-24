import React from 'react';
import { Icon, Avatar, Stat } from '../components/ui';
import { MetaBoard } from '../components/game';
import { buildSampleGame } from '../utils/boardUtils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { ScreenName } from '../types/game';
import type { RemoteMatch } from '@/types/match.types';

interface ViewDashboardProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

function resolveResult(match: RemoteMatch, myId: string | undefined): 'win' | 'loss' | 'draw' {
  if (match.result === 'draw') return 'draw';
  if (match.result === 'abandoned') return 'loss';
  const iAmX = match.playerXId === myId;
  if (match.result === 'x_wins') return iAmX ? 'win' : 'loss';
  return iAmX ? 'loss' : 'win';
}

function resolveOpponent(match: RemoteMatch, myId: string | undefined): string {
  const iAmX = match.playerXId === myId;
  return iAmX ? match.playerOName : match.playerXName;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return '<1h ago';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export function ViewDashboard({ navigate, blueColor, redColor }: ViewDashboardProps): React.ReactElement {
  const { profile, stats, globalRanking, recentMatches, isLoading } = useCurrentUser();

  const displayName = profile?.displayName ?? 'Player';
  const elo = stats ? stats.wins + stats.losses + stats.draws > 0 ? profile?.rating ?? 0 : 0 : null;
  const eloDisplay = elo !== null ? elo.toLocaleString() : '—';
  const winsDisplay = stats ? String(stats.wins) : '—';
  const winrate = stats && stats.totalMatches > 0
    ? Math.round((stats.wins / stats.totalMatches) * 100)
    : null;
  const winrateSub = winrate !== null ? `${winrate}% winrate` : 'no matches';
  const streakDisplay = stats ? String(stats.winStreak) : '—';
  const streakSub = stats ? `${stats.winStreak} win streak` : '';

  const totalPlayMs = stats ? stats.totalMoves * stats.averageMoveTimeMs : 0;
  const totalHours = Math.floor(totalPlayMs / 3_600_000);
  const totalTimeDisplay = stats
    ? totalHours > 0 ? `${totalHours}h` : `${Math.floor(totalPlayMs / 60_000)}m`
    : '—';

  const lastMatchText = stats?.lastMatchAt
    ? `Last match ${formatRelative(stats.lastMatchAt)}.`
    : "You haven't played any matches yet.";

  const lastMatch = recentMatches[0] ?? null;
  const lastRatingChange = lastMatch !== null
    ? (lastMatch.playerXId === profile?.id ? lastMatch.ratingChangeX : lastMatch.ratingChangeO)
    : null;
  const eloSub = lastRatingChange !== null
    ? `${lastRatingChange >= 0 ? '+' : ''}${lastRatingChange} last match`
    : 'current rating';

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      {/* Hero */}
      <div style={{
        background: `
          radial-gradient(800px 220px at 20% 0%, rgba(59,130,246,.16), transparent 60%),
          radial-gradient(600px 180px at 90% 100%, rgba(139,92,246,.14), transparent 60%),
          linear-gradient(180deg, var(--card), var(--surface-2))
        `,
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        padding: '28px 32px',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 28,
        alignItems: 'center', marginBottom: 22,
      }}>
        <div>
          <div className="t-tag" style={{ marginBottom: 10 }}>Welcome back</div>
          <div className="t-display" style={{ marginBottom: 6 }}>Hello, <span style={{ color: blueColor }}>{displayName}</span>.</div>
          <div className="muted" style={{ fontSize: 14, marginBottom: 18, maxWidth: 540 }}>
            {lastMatchText}
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn primary lg" onClick={() => navigate('game')}>
              <Icon name="play" size={16} /> Play Now
            </button>
            <button className="btn lg" onClick={() => navigate('create')}>
              <Icon name="plus" size={16} /> Create Game
            </button>
            <button className="btn lg ghost" onClick={() => navigate('join')}>
              <Icon name="users" size={16} /> Join Room
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <MetaBoard game={buildSampleGame()} size={150} blueColor={blueColor} redColor={redColor} />
          <div className="t-cap">Think. Place. Win.</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {isLoading ? (
          <>
            <Stat label="ELO"        value="…" sub="loading" accent="var(--text)" />
            <Stat label="Wins"       value="…" sub="loading" accent="var(--green)" />
            <Stat label="Streak"     value="…" sub="loading" accent={blueColor} />
            <Stat label="Total Time" value="…" sub="this season" />
          </>
        ) : (
          <>
            <Stat label="ELO"        value={eloDisplay}        sub={eloSub}         accent="var(--text)" />
            <Stat label="Wins"       value={winsDisplay}       sub={winrateSub}      accent="var(--green)" />
            <Stat label="Streak"     value={streakDisplay}     sub={streakSub}       accent={blueColor} />
            <Stat label="Total Time" value={totalTimeDisplay}  sub="this season" />
          </>
        )}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Recent matches */}
        <div className="card" style={{ padding: 20 }}>
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="t-h2">Recent Matches</div>
            <div className="spacer" />
            <button className="btn sm ghost" onClick={() => navigate('history')}>View all <Icon name="chev-r" size={14}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  height: 48, borderRadius: 8,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  opacity: 0.5,
                }} />
              ))
            ) : recentMatches.length === 0 ? (
              <div className="muted" style={{ fontSize: 13, padding: '12px 0', textAlign: 'center' }}>
                No recent matches.
              </div>
            ) : (
              recentMatches.map((match) => {
                const result = resolveResult(match, profile?.id);
                const opponent = resolveOpponent(match, profile?.id);
                const isAI = match.mode === 'ai';
                return (
                  <div key={match.id} style={{
                    display: 'grid', gridTemplateColumns: '24px 1fr auto auto auto auto', gap: 14, alignItems: 'center',
                    padding: '10px 12px', borderRadius: 8, background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: 8, height: 24, borderRadius: 2,
                      background: result === 'win' ? 'var(--green)' :
                                  result === 'loss' ? 'var(--red)' : 'var(--text-3)',
                    }}/>
                    <div className="row" style={{ gap: 10 }}>
                      <Avatar name={opponent} size={28} gradient={isAI ? 'linear-gradient(140deg,#52525B,#27272A)' : undefined} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>vs {opponent}</div>
                        <div className="t-cap">{formatRelative(match.createdAt)}</div>
                      </div>
                    </div>
                    <span className={`chip ${result === 'win' ? 'green' : result === 'loss' ? 'red' : ''}`}>
                      {result === 'win' ? 'Victory' : result === 'loss' ? 'Defeat' : 'Draw'}
                    </span>
                    <div className="t-cap t-mono">{match.totalMoves} moves</div>
                    <div className="t-cap t-mono">{formatDuration(match.durationSeconds)}</div>
                    <div className="row" style={{ gap: 4 }}>
                      <button className="btn sm ghost" title="View replay" onClick={() => navigate('replay')}>
                        <Icon name="replay" size={14}/>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ranking */}
        <div className="card" style={{ padding: 20 }}>
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="t-h2">Global Ranking</div>
            <div className="spacer" />
            <span className="chip"><Icon name="globe" size={11}/> Global</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {isLoading || globalRanking.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  height: 36, borderRadius: 6,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  opacity: 0.5,
                }} />
              ))
            ) : (
              globalRanking.map((entry) => {
                const isMe = profile?.id === entry.profile.id;
                const winsSign = entry.stats.wins >= 0 ? '+' : '';
                return (
                  <div key={entry.profile.id} style={{
                    display: 'grid', gridTemplateColumns: '24px 28px 1fr auto auto', gap: 12, alignItems: 'center',
                    padding: '8px 10px', borderRadius: 6,
                    background: isMe ? 'rgba(59,130,246,.10)' : 'transparent',
                    border: isMe ? '1px solid rgba(59,130,246,.3)' : '1px solid transparent',
                  }}>
                    <div className="t-mono dim" style={{ fontSize: 12, textAlign: 'center' }}>#{entry.rank}</div>
                    <Avatar name={entry.profile.username} size={24} status={isMe ? 'online' : undefined} />
                    <div style={{ fontWeight: isMe ? 700 : 500, fontSize: 13 }}>{entry.profile.username}</div>
                    <div className="t-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{entry.profile.rating}</div>
                    <div className="t-mono" style={{ fontSize: 11, color: 'var(--green)' }}>
                      {winsSign}{entry.stats.wins}W
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
