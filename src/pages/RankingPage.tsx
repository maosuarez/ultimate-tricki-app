import React from 'react';
import { Icon, Avatar } from '../components/ui';
import type { ScreenName } from '../types/game';
import { useRanking } from '@/hooks/useRanking';
import type { RankingEntry } from '@/types/api.types';

interface ViewRankingProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

const SEASONS = ['Temporada 2', 'Temporada 3', 'Temporada 4'];

const PODIUM_STYLE: Record<number, { bg: string; border: string; iconColor: string; iconName: string }> = {
  1: { bg: 'linear-gradient(140deg, rgba(234,179,8,.15), rgba(234,179,8,.05))',     border: 'rgba(234,179,8,.4)',    iconColor: '#EAB308', iconName: 'crown' },
  2: { bg: 'linear-gradient(140deg, rgba(148,163,184,.12), rgba(148,163,184,.04))', border: 'rgba(148,163,184,.35)', iconColor: '#94A3B8', iconName: 'medal' },
  3: { bg: 'linear-gradient(140deg, rgba(180,83,9,.14), rgba(180,83,9,.05))',       border: 'rgba(180,83,9,.35)',    iconColor: '#B45309', iconName: 'medal' },
};

function winRate(entry: RankingEntry): number {
  const { wins, totalMatches } = entry.stats;
  return totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
}

interface PodiumCardProps {
  entry: RankingEntry;
}

function PodiumCard({ entry }: PodiumCardProps): React.ReactElement {
  const s = PODIUM_STYLE[entry.rank];
  const wr = winRate(entry);
  return (
    <div className="card" style={{
      padding: '20px 16px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      position: 'relative',
    }}>
      <Icon name={s.iconName} size={18} style={{ color: s.iconColor, position: 'absolute', top: 12, right: 12 }} />
      <div className="t-mono" style={{ fontSize: 11, color: s.iconColor, fontWeight: 700 }}>#{entry.rank}</div>
      <Avatar name={entry.profile.displayName || entry.profile.username} size={52} status="online" />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{entry.profile.displayName || entry.profile.username}</div>
        <div className="t-mono" style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{entry.profile.rating}</div>
      </div>
      <span className="chip green" style={{ fontSize: 11 }}>{wr}% WR</span>
    </div>
  );
}

export function ViewRanking({ navigate, blueColor: _blueColor, redColor: _redColor }: ViewRankingProps): React.ReactElement {
  const [season, setSeason] = React.useState('Temporada 4');
  const { entries, myEntry, loading, error } = useRanking();

  const podium = entries.slice(0, 3);
  const rest   = entries.slice(3);

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      {/* Header */}
      <div className="row" style={{ marginBottom: 20, alignItems: 'flex-start' }}>
        <div>
          <button className="btn ghost sm" onClick={() => navigate('home')} style={{ marginBottom: 10 }}>
            <Icon name="arrow-l" size={14}/> Inicio
          </button>
          <div className="t-h1" style={{ marginBottom: 6 }}>Ranking Global</div>
        </div>
        <div className="spacer"/>
        <div className="row" style={{ gap: 6, alignSelf: 'flex-end', paddingBottom: 2 }}>
          {SEASONS.map(s => (
            <button
              key={s}
              className="btn sm"
              onClick={() => setSeason(s)}
              style={{
                background: s === season ? 'var(--card-hi)' : 'transparent',
                border: s === season ? '1px solid var(--border-hi)' : '1px solid transparent',
                color: s === season ? 'var(--text)' : 'var(--text-2)',
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Loading / error states */}
      {loading && (
        <div className="t-cap" style={{ textAlign: 'center', padding: 32 }}>Cargando…</div>
      )}
      {error && !loading && (
        <div className="t-cap" style={{ textAlign: 'center', padding: 32, color: 'var(--red)' }}>
          Error al cargar ranking: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Podium */}
          {podium.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              {podium.map(e => <PodiumCard key={e.rank} entry={e} />)}
            </div>
          )}

          {/* List 4+ */}
          {rest.length > 0 && (
            <div className="card" style={{ overflow: 'hidden', marginBottom: 12 }}>
              {rest.map((e, i) => {
                const wr = winRate(e);
                const name = e.profile.displayName || e.profile.username;
                return (
                  <div key={e.rank} style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 36px 1fr 100px 80px 90px',
                    gap: 10, padding: '10px 14px', alignItems: 'center',
                    borderBottom: i < rest.length - 1 ? '1px solid var(--border)' : 'none',
                    fontSize: 13,
                  }}>
                    <div className="t-mono" style={{ fontWeight: 700, color: 'var(--text-2)', textAlign: 'right' }}>
                      {e.rank}
                    </div>
                    <Avatar name={name} size={28} />
                    <div style={{ fontWeight: 600 }}>{name}</div>
                    <div className="t-mono" style={{ fontSize: 12 }}>{e.profile.rating}</div>
                    <div className="t-cap">{e.stats.totalMatches} partidas</div>
                    <span className={`chip ${wr >= 60 ? 'green' : wr < 50 ? 'red' : ''}`} style={{ fontSize: 11 }}>
                      {wr}% WR
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* My position — pinned at bottom */}
          {myEntry && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 36px 1fr 100px 80px 90px',
              gap: 10, padding: '11px 14px', alignItems: 'center',
              background: 'var(--card-hi)',
              border: '1px solid var(--border-hi)',
              borderRadius: 10, fontSize: 13,
            }}>
              <div className="t-mono" style={{ fontWeight: 700, color: 'var(--text-2)', textAlign: 'right' }}>{myEntry.rank}</div>
              <Avatar name={myEntry.profile.displayName || myEntry.profile.username} size={28} status="online" />
              <div>
                <span style={{ fontWeight: 600 }}>{myEntry.profile.displayName || myEntry.profile.username}</span>
                <span className="chip" style={{ marginLeft: 8, fontSize: 10 }}>TÚ</span>
              </div>
              <div className="t-mono" style={{ fontSize: 12 }}>{myEntry.profile.rating}</div>
              <div className="t-cap">{myEntry.stats.totalMatches} partidas</div>
              <span className="chip" style={{ fontSize: 11 }}>{winRate(myEntry)}% WR</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
