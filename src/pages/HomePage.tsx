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
  if (hours < 1) return 'hace <1h';
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ayer';
  return `hace ${days}d`;
}

export function ViewDashboard({ navigate, blueColor, redColor }: ViewDashboardProps): React.ReactElement {
  const { profile, stats, globalRanking, recentMatches, isLoading } = useCurrentUser();

  const displayName = profile?.displayName ?? 'Jugador';
  const elo = stats ? stats.wins + stats.losses + stats.draws > 0 ? profile?.rating ?? 0 : 0 : null;
  const eloDisplay = elo !== null ? elo.toLocaleString() : '—';
  const winsDisplay = stats ? String(stats.wins) : '—';
  const winrate = stats && stats.totalMatches > 0
    ? Math.round((stats.wins / stats.totalMatches) * 100)
    : null;
  const winrateSub = winrate !== null ? `${winrate}% winrate` : 'sin partidas';
  const streakDisplay = stats ? String(stats.winStreak) : '—';
  const streakSub = stats ? `${stats.winStreak} victorias seguidas` : '';

  // Tiempo total calculado desde stats
  const totalPlayMs = stats ? stats.totalMoves * stats.averageMoveTimeMs : 0;
  const totalHours = Math.floor(totalPlayMs / 3_600_000);
  const totalTimeDisplay = stats
    ? totalHours > 0 ? `${totalHours}h` : `${Math.floor(totalPlayMs / 60_000)}m`
    : '—';

  // Subtítulo del hero: última partida relativa
  const lastMatchText = stats?.lastMatchAt
    ? `Última partida ${formatRelative(stats.lastMatchAt)}.`
    : 'Aún no has jugado ninguna partida.';

  // ELO sub: rating change de la última partida
  const lastMatch = recentMatches[0] ?? null;
  const lastRatingChange = lastMatch !== null
    ? (lastMatch.playerXId === profile?.id ? lastMatch.ratingChangeX : lastMatch.ratingChangeO)
    : null;
  const eloSub = lastRatingChange !== null
    ? `${lastRatingChange >= 0 ? '+' : ''}${lastRatingChange} última partida`
    : 'rating actual';

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
          <div className="t-tag" style={{ marginBottom: 10 }}>Bienvenido de vuelta</div>
          <div className="t-display" style={{ marginBottom: 6 }}>Hola, <span style={{ color: blueColor }}>{displayName}</span>.</div>
          <div className="muted" style={{ fontSize: 14, marginBottom: 18, maxWidth: 540 }}>
            {lastMatchText}
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn primary lg" onClick={() => navigate('game')}>
              <Icon name="play" size={16} /> Jugar ahora
            </button>
            <button className="btn lg" onClick={() => navigate('create')}>
              <Icon name="plus" size={16} /> Crear partida
            </button>
            <button className="btn lg ghost" onClick={() => navigate('join')}>
              <Icon name="users" size={16} /> Unirse a sala
            </button>
          </div>
        </div>
        {/* Mini meta-board preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <MetaBoard game={buildSampleGame()} size={150} blueColor={blueColor} redColor={redColor} />
          <div className="t-cap">Última partida · turno 31</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {isLoading ? (
          <>
            <Stat label="ELO"          value="…" sub="cargando" accent="var(--text)" />
            <Stat label="Victorias"    value="…" sub="cargando" accent="var(--green)" />
            <Stat label="Racha"        value="…" sub="cargando" accent={blueColor} />
            <Stat label="Tiempo total" value="…" sub="esta temporada" />
          </>
        ) : (
          <>
            <Stat label="ELO"          value={eloDisplay}        sub={eloSub}         accent="var(--text)" />
            <Stat label="Victorias"    value={winsDisplay}       sub={winrateSub}      accent="var(--green)" />
            <Stat label="Racha"        value={streakDisplay}     sub={streakSub}       accent={blueColor} />
            <Stat label="Tiempo total" value={totalTimeDisplay}  sub="esta temporada" />
          </>
        )}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Recent matches */}
        <div className="card" style={{ padding: 20 }}>
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="t-h2">Historial reciente</div>
            <div className="spacer" />
            <button className="btn sm ghost" onClick={() => navigate('history')}>Ver todo <Icon name="chev-r" size={14}/></button>
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
                Sin partidas recientes.
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
                      {result === 'win' ? 'Victoria' : result === 'loss' ? 'Derrota' : 'Empate'}
                    </span>
                    <div className="t-cap t-mono">{match.totalMoves} mov.</div>
                    <div className="t-cap t-mono">{formatDuration(match.durationSeconds)}</div>
                    <div className="row" style={{ gap: 4 }}>
                      <button className="btn sm ghost" title="Ver replay" onClick={() => navigate('replay')}>
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
            <div className="t-h2">Ranking global</div>
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
                      {winsSign}{entry.stats.wins}V
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
