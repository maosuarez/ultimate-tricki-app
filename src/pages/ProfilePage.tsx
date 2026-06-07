import React from 'react';
import { Icon, Avatar, Stat } from '../components/ui';
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

          {/* ELO graph — placeholder until real data is available */}
          <div className="card" style={{ padding: 20 }}>
            <div className="row" style={{ marginBottom: 14 }}>
              <div className="t-h3">Progresión ELO</div>
              <div className="spacer"/>
              <span className="chip amber" style={{ fontSize: 11 }}>Próximamente</span>
            </div>
            <div style={{
              height: 120,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--text-3)',
              fontSize: 13,
              borderRadius: 8,
              background: 'var(--surface-2)',
              border: '1px dashed var(--border)',
            }}>
              El historial ELO estará disponible próximamente
            </div>
          </div>
        </div>

        {/* Right column — insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="row" style={{ marginBottom: 14 }}>
              <div className="t-h3">Patrones de juego</div>
              <div className="spacer"/>
              <span className="chip amber" style={{ fontSize: 11 }}>Próximamente</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '16px 0' }}>
              El análisis de patrones estará disponible próximamente
            </div>
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
