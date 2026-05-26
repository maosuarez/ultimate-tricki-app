import React from 'react';
import { Icon, Avatar, Stat, ProgressBar } from '../components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import type { ScreenName } from '../types/game';
import type { UserProfile, UserStats } from '@/types/user.types';

// ─── Prop types ───────────────────────────────────────────────────────────────

interface ViewProfileProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
  /** When provided, shows the public profile of another user. Omit for own profile. */
  userId?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InsightBarProps {
  label: string;
  v: number;
  color: string;
}

function InsightBar({ label, v, color }: InsightBarProps): React.ReactElement {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="row" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
        <div className="spacer"/>
        <span className="t-mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{v}%</span>
      </div>
      <ProgressBar value={v} color={color} />
    </div>
  );
}

interface EloChartProps {
  blueColor: string;
}

function EloChart({ blueColor }: EloChartProps): React.ReactElement {
  const data = [1772,1768,1775,1781,1769,1774,1788,1795,1789,1801,1798,1810,1804,1815,1808,1820,1817,1825,1819,1828,1830,1822,1835,1840,1832,1842,1838,1845,1809,1814];
  const w = 600, h = 160, pad = 8;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts: [number, number][] = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const area = path + ` L${lastPt[0]},${h} L${firstPt[0]},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 160, display: 'block' }}>
      <defs>
        <linearGradient id="elog" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={blueColor} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={blueColor} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,1,2,3].map((i) => (
        <line key={i} x1={0} x2={w} y1={pad + i * ((h-pad*2)/3)} y2={pad + i * ((h-pad*2)/3)} stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4" />
      ))}
      <path d={area} fill="url(#elog)" />
      <path d={path} fill="none" stroke={blueColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill={blueColor} />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="8" fill={blueColor} fillOpacity="0.2" />
    </svg>
  );
}

// ─── Shared profile body ──────────────────────────────────────────────────────

interface ProfileBodyProps {
  profile: UserProfile;
  stats: UserStats | null;
  isSelf: boolean;
  blueColor: string;
  redColor: string;
  navigate: (screen: ScreenName) => void;
  /** Only shown when isSelf is false */
  friendRequestButton: React.ReactNode;
}

function ProfileBody({
  profile,
  stats,
  isSelf,
  blueColor,
  navigate,
  friendRequestButton,
}: ProfileBodyProps): React.ReactElement {
  const displayName  = profile.displayName || profile.username;
  const ratingValue  = String(profile.rating);
  const totalMatches = stats ? String(stats.totalMatches) : '—';
  const winrate      = stats && stats.totalMatches > 0
    ? Math.round((stats.wins / stats.totalMatches) * 100)
    : 0;
  const winrateSub   = stats
    ? `${stats.wins} V · ${stats.losses} D · ${stats.draws} E`
    : '— V · — D · — E';
  const streakValue  = stats ? String(stats.winStreak) : '—';

  // Format joined date from ISO string
  const joinedYear = profile.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : null;

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      {/* Header */}
      <div className="card" style={{
        padding: 0, overflow: 'hidden', marginBottom: 18,
        background: `radial-gradient(500px 200px at 10% 0%, rgba(59,130,246,.20), transparent 70%), var(--card)`,
      }}>
        <div style={{ height: 80, background: 'linear-gradient(120deg, rgba(59,130,246,.18), rgba(139,92,246,.18))' }}/>
        <div style={{
          padding: '0 22px 20px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: 18,
          alignItems: 'flex-end',
          marginTop: -28,
        }}>
          <Avatar name={displayName} size={96} square gradient="linear-gradient(140deg, #F59E0B, #EF4444)" status="online" />
          <div style={{ paddingBottom: 6 }}>
            <div className="row" style={{ gap: 8 }}>
              <div className="t-h1">{displayName}</div>
              {profile.username ? <span className="chip blue">@{profile.username}</span> : null}
            </div>
            <div className="row" style={{ gap: 14, marginTop: 6, color: 'var(--text-2)', fontSize: 12 }}>
              {profile.countryCode && <span>{profile.countryCode}</span>}
              {joinedYear && (
                <>
                  {profile.countryCode && <span>·</span>}
                  <span>Miembro desde {joinedYear}</span>
                </>
              )}
            </div>
            {profile.bio && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-2)' }}>{profile.bio}</div>
            )}
          </div>
          <div className="row" style={{ paddingBottom: 6, gap: 8 }}>
            {isSelf ? (
              <button className="btn" disabled title="Próximamente">
                <Icon name="settings" size={14}/> Editar perfil
              </button>
            ) : (
              friendRequestButton
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <Stat label="ELO"      value={ratingValue}    sub="rating actual"  accent={blueColor} />
            <Stat label="Partidas" value={totalMatches}    sub="total"          />
            <Stat label="Winrate"  value={`${winrate}%`}   sub={winrateSub}     accent="var(--green)" />
            <Stat label="Racha"    value={streakValue}     sub="actual"         accent="var(--amber)" />
          </div>

          {/* ELO graph */}
          <div className="card" style={{ padding: 20 }}>
            <div className="row" style={{ marginBottom: 14 }}>
              <div className="t-h3">Progresión ELO · últimos 30 días</div>
              <div className="spacer"/>
              <div className="row" style={{ gap: 6 }}>
                <span className="chip">7d</span>
                <span className="chip blue">30d</span>
                <span className="chip">90d</span>
              </div>
            </div>
            <EloChart blueColor={blueColor} />
          </div>
        </div>

        {/* Right column — insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="t-h3" style={{ marginBottom: 14 }}>Patrones de juego</div>
            <InsightBar label="Centro"   v={72} color={blueColor} />
            <InsightBar label="Esquinas" v={54} color={blueColor} />
            <InsightBar label="Bordes"   v={31} color={blueColor} />
            <div className="divider" />
            <InsightBar label="Como X"   v={68} color={blueColor} />
          </div>
          <div style={{ textAlign: 'center' as const }}>
            <button className="btn ghost sm" onClick={() => navigate('home')} style={{ marginTop: 4 }}>
              <Icon name="arrow-l" size={13}/> Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Own profile view ─────────────────────────────────────────────────────────

interface OwnProfileViewProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

function OwnProfileView({ navigate, blueColor, redColor }: OwnProfileViewProps): React.ReactElement {
  const { profile, stats, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="fade-in" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <div className="t-cap" style={{ color: 'var(--text-3)' }}>Cargando perfil…</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="fade-in" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center' as const }}>
          <div className="t-cap" style={{ color: 'var(--red)', marginBottom: 12 }}>
            {error ?? 'No se pudo cargar el perfil'}
          </div>
          <button className="btn ghost sm" onClick={() => navigate('home')}>
            <Icon name="arrow-l" size={13}/> Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProfileBody
      profile={profile}
      stats={stats}
      isSelf={true}
      blueColor={blueColor}
      redColor={redColor}
      navigate={navigate}
      friendRequestButton={null}
    />
  );
}

// ─── Public profile view ──────────────────────────────────────────────────────

interface PublicProfileViewProps {
  userId: string;
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

function PublicProfileView({ userId, navigate, blueColor, redColor }: PublicProfileViewProps): React.ReactElement {
  const {
    profile,
    stats,
    loading,
    error,
    isSelf,
    sendFriendRequest,
    requestSent,
    requestLoading,
    requestError,
  } = usePublicProfile(userId);

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <div className="t-cap" style={{ color: 'var(--text-3)' }}>Cargando perfil…</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="fade-in" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center' as const }}>
          <div className="t-cap" style={{ color: 'var(--red)', marginBottom: 12 }}>
            {error ?? 'No se pudo cargar el perfil'}
          </div>
          <button className="btn ghost sm" onClick={() => navigate('home')}>
            <Icon name="arrow-l" size={13}/> Inicio
          </button>
        </div>
      </div>
    );
  }

  const friendRequestButton = isSelf ? null : (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <button
        className="btn primary"
        onClick={() => void sendFriendRequest()}
        disabled={requestSent || requestLoading}
      >
        <Icon name="plus" size={14}/>
        {requestSent ? 'Solicitud enviada' : requestLoading ? 'Enviando…' : 'Solicitar amistad'}
      </button>
      {requestError && (
        <span className="t-cap" style={{ color: 'var(--red)', fontSize: 11 }}>{requestError}</span>
      )}
    </div>
  );

  return (
    <ProfileBody
      profile={profile}
      stats={stats}
      isSelf={isSelf}
      blueColor={blueColor}
      redColor={redColor}
      navigate={navigate}
      friendRequestButton={friendRequestButton}
    />
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function ViewProfile({ navigate, blueColor, redColor, userId }: ViewProfileProps): React.ReactElement {
  if (userId) {
    return <PublicProfileView userId={userId} navigate={navigate} blueColor={blueColor} redColor={redColor} />;
  }
  return <OwnProfileView navigate={navigate} blueColor={blueColor} redColor={redColor} />;
}
