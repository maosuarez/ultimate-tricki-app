import React from 'react';
import { Icon, Avatar } from '../components/ui';
import type { ScreenName } from '../types/game';
import { useFriends } from '@/hooks/useFriends';
import type { FriendEntry } from '@/types/friends.types';

interface ViewFriendsProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

interface FriendRowProps {
  friend: FriendEntry;
}

function FriendRow({ friend }: FriendRowProps): React.ReactElement {
  return (
    <div className="row" style={{
      padding: '10px 12px', borderRadius: 8,
      background: 'var(--surface-2)', border: '1px solid var(--border)', gap: 10,
    }}>
      <Avatar name={friend.profile.displayName || friend.profile.username} size={34} status={friend.onlineStatus} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>
          {friend.profile.displayName || friend.profile.username}
        </div>
        <div className="t-cap" style={{ color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {friend.statusText}
        </div>
      </div>
      {friend.onlineStatus === 'online' && (
        <button className="btn sm" title="Invitar a partida"><Icon name="play" size={13}/> Invitar</button>
      )}
      <button className="btn icon ghost" title="Ver perfil"><Icon name="user" size={14}/></button>
      <button className="btn icon ghost" title="Más opciones"><Icon name="more" size={14}/></button>
    </div>
  );
}

interface SectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

function Section({ title, count, children }: SectionProps): React.ReactElement {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="row" style={{ marginBottom: 8 }}>
        <div className="t-h3">{title}</div>
        <span className="chip" style={{ marginLeft: 8, fontSize: 11 }}>{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

export function ViewFriends({ navigate, blueColor: _blueColor, redColor: _redColor }: ViewFriendsProps): React.ReactElement {
  const [showAdd, setShowAdd] = React.useState(false);
  const [addInput, setAddInput] = React.useState('');
  const [search, setSearch]     = React.useState('');
  const [sendError, setSendError] = React.useState<string | null>(null);

  const {
    friends,
    requests,
    suggested,
    onlineCount,
    awayCount,
    offlineCount,
    loading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
  } = useFriends();

  const filtered    = friends.filter(f =>
    search.trim() === '' ||
    (f.profile.displayName || f.profile.username).toLowerCase().includes(search.toLowerCase())
  );
  const filtOnline  = filtered.filter(f => f.onlineStatus === 'online');
  const filtAway    = filtered.filter(f => f.onlineStatus === 'away');
  const filtOffline = filtered.filter(f => f.onlineStatus === 'offline');

  const handleSendRequest = async () => {
    const username = addInput.trim();
    if (!username) return;
    setSendError(null);
    try {
      await sendRequest(username);
      setAddInput('');
      setShowAdd(false);
    } catch (err) {
      const msg = err !== null && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : String(err);
      setSendError(msg);
    }
  };

  return (
    <div className="fade-in" style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, height: '100%', overflow: 'hidden' }}>

      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', minHeight: 0 }}>
        {/* Header */}
        <div className="row" style={{ marginBottom: 16, alignItems: 'flex-start' }}>
          <div>
            <button className="btn ghost sm" onClick={() => navigate('home')} style={{ marginBottom: 10 }}>
              <Icon name="arrow-l" size={14}/> Inicio
            </button>
            <div className="t-h1">Mis amigos</div>
          </div>
          <div className="spacer"/>
          <button
            className="btn primary"
            style={{ alignSelf: 'flex-end', marginBottom: 2 }}
            onClick={() => { setShowAdd(v => !v); setSendError(null); }}
          >
            <Icon name="plus" size={14}/> Agregar amigo
          </button>
        </div>

        {/* Add friend panel */}
        {showAdd && (
          <div className="card" style={{ padding: 14, marginBottom: 14 }}>
            <div className="t-h3" style={{ marginBottom: 10 }}>Agregar amigo</div>
            <div className="row" style={{ gap: 8 }}>
              <input
                className="input"
                placeholder="Nombre de usuario..."
                value={addInput}
                onChange={e => setAddInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void handleSendRequest(); }}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
              />
              <button className="btn primary sm" onClick={() => void handleSendRequest()}>
                <Icon name="send" size={13}/> Enviar solicitud
              </button>
              <button className="btn ghost sm" onClick={() => { setShowAdd(false); setSendError(null); }}>
                <Icon name="x" size={13}/>
              </button>
            </div>
            {sendError && (
              <div className="t-cap" style={{ marginTop: 8, color: 'var(--red)' }}>{sendError}</div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="row" style={{
          padding: '8px 12px', background: 'var(--surface-2)',
          border: '1px solid var(--border)', borderRadius: 8, gap: 8, marginBottom: 16,
        }}>
          <Icon name="search" size={14} style={{ color: 'var(--text-3)' }}/>
          <input
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, width: '100%' }}
            placeholder="Buscar amigos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Loading / error states */}
        {loading && (
          <div className="t-cap" style={{ textAlign: 'center', padding: 32 }}>Cargando…</div>
        )}
        {error && !loading && (
          <div className="t-cap" style={{ textAlign: 'center', padding: 32, color: 'var(--red)' }}>
            {error}
          </div>
        )}

        {/* Friend sections */}
        {!loading && (
          <>
            {filtOnline.length > 0 && (
              <Section title="En línea ahora" count={filtOnline.length}>
                {filtOnline.map(f => <FriendRow key={f.friendship.id} friend={f} />)}
              </Section>
            )}
            {filtAway.length > 0 && (
              <Section title="Ausentes" count={filtAway.length}>
                {filtAway.map(f => <FriendRow key={f.friendship.id} friend={f} />)}
              </Section>
            )}
            {filtOffline.length > 0 && (
              <Section title="Sin conexión" count={filtOffline.length}>
                {filtOffline.map(f => <FriendRow key={f.friendship.id} friend={f} />)}
              </Section>
            )}
            {filtered.length === 0 && search.trim() !== '' && (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px 0', fontSize: 13 }}>
                <Icon name="search" size={20} style={{ display: 'block', margin: '0 auto 8px' }}/>
                Sin resultados para "{search}"
              </div>
            )}
            {filtered.length === 0 && search.trim() === '' && !loading && (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px 0', fontSize: 13 }}>
                Todavía no tienes amigos agregados
              </div>
            )}
          </>
        )}

        <div className="t-cap" style={{ color: 'var(--text-3)', marginTop: 'auto', paddingTop: 8 }}>
          {onlineCount} en línea · {awayCount} ausentes · {offlineCount} sin conexión — {friends.length} amigos en total
        </div>
      </div>

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto', minHeight: 0 }}>
        {/* Requests */}
        <div className="card" style={{ padding: 16 }}>
          <div className="row" style={{ marginBottom: 12 }}>
            <div className="t-h3">Solicitudes</div>
            {requests.length > 0 && (
              <span className="chip amber" style={{ marginLeft: 8 }}>{requests.length}</span>
            )}
          </div>
          {requests.length === 0 ? (
            <div className="t-cap" style={{ color: 'var(--text-3)', fontSize: 13 }}>Sin solicitudes pendientes</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {requests.map((r, i) => (
                <div key={r.friendship.id} style={{
                  display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 10,
                  borderBottom: i < requests.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div className="row" style={{ gap: 10 }}>
                    <Avatar name={r.profile.displayName || r.profile.username} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{r.profile.displayName || r.profile.username}</div>
                      <div className="t-cap">ELO {r.profile.rating}</div>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <button
                      className="btn primary sm"
                      style={{ flex: 1 }}
                      onClick={() => void acceptRequest(r.friendship.id)}
                    >
                      <Icon name="check" size={12}/> Aceptar
                    </button>
                    <button
                      className="btn ghost sm"
                      style={{ flex: 1 }}
                      onClick={() => void rejectRequest(r.friendship.id)}
                    >
                      <Icon name="x" size={12}/> Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested */}
        <div className="card" style={{ padding: 16 }}>
          <div className="t-h3" style={{ marginBottom: 12 }}>Sugeridos</div>
          {suggested.length === 0 ? (
            <div className="t-cap" style={{ color: 'var(--text-3)', fontSize: 13 }}>Sin sugerencias disponibles</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {suggested.map(s => (
                <div key={s.id} className="row" style={{ gap: 10 }}>
                  <Avatar name={s.displayName || s.username} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.displayName || s.username}</div>
                    <div className="t-cap">ELO {s.rating}</div>
                  </div>
                  <button className="btn sm" onClick={() => { void sendRequest(s.username); }}>
                    <Icon name="plus" size={12}/> Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
