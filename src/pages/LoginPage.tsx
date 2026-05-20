import React from 'react';
import { Icon } from '../components/ui';
import type { ScreenName } from '../types/game';

interface ViewLoginProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
}

type LoginTab = 'login' | 'register' | 'guest';

const TAB_LABELS: Record<LoginTab, string> = {
  login: 'Iniciar sesión',
  register: 'Crear cuenta',
  guest: 'Invitado',
};

export function ViewLogin({ navigate, blueColor }: ViewLoginProps): React.ReactElement {
  const [tab, setTab] = React.useState<LoginTab>('login');

  return (
    <div className="fade-in" style={{
      height: '100%', display: 'grid', placeItems: 'center',
      padding: 40,
      background: 'radial-gradient(800px 500px at 50% 0%, rgba(59,130,246,.10), transparent 70%)',
    }}>
      <div style={{
        width: 'min(420px, 100%)',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        padding: 32,
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(140deg,#3B82F6,#8B5CF6)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 20px rgba(59,130,246,.4)',
          }}>
            <span style={{ fontWeight: 800, color: '#fff', fontSize: 20 }}>U</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-.01em' }}>Ultimate</div>
            <div className="t-cap">Tic Tac Toe — el meta-juego</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 8, padding: 3, marginBottom: 20 }}>
          {(['login', 'register', 'guest'] as LoginTab[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="btn"
              style={{
                flex: 1, padding: '8px 10px',
                background: tab === k ? 'var(--card-hi)' : 'transparent',
                border: 'none',
                color: tab === k ? 'var(--text)' : 'var(--text-3)',
                fontSize: 12,
              }}
            >
              {TAB_LABELS[k]}
            </button>
          ))}
        </div>

        {tab === 'guest' ? (
          <div>
            <div className="t-tag" style={{ marginBottom: 8 }}>Modo invitado</div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
              Juega sin cuenta. Tu progreso no se guardará y no podrás jugar partidas ranked.
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="t-cap" style={{ marginBottom: 4, display: 'block' }}>Nombre temporal</label>
              <input className="input" defaultValue="Invitado_7H2K" />
            </div>
            <button className="btn primary lg" style={{ width: '100%' }} onClick={() => navigate('home')}>
              Continuar como invitado <Icon name="arrow-r" size={14}/>
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <label className="t-cap" style={{ marginBottom: 4, display: 'block' }}>Email o usuario</label>
              <input className="input" placeholder="lucas@example.com" />
            </div>
            {tab === 'register' && (
              <div style={{ marginBottom: 12 }}>
                <label className="t-cap" style={{ marginBottom: 4, display: 'block' }}>Usuario</label>
                <input className="input" placeholder="@lucas" />
                <div className="row" style={{ marginTop: 4, gap: 6 }}>
                  <Icon name="check" size={12} style={{ color: 'var(--green)' }}/>
                  <span style={{ fontSize: 11, color: 'var(--green)' }}>Usuario disponible</span>
                </div>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label className="t-cap" style={{ marginBottom: 4, display: 'block' }}>Contraseña</label>
              <input className="input" type="password" placeholder="••••••••" />
              {tab === 'register' && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[1,2,3,4].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= 3 ? 'var(--green)' : 'var(--card-hi)',
                    }}/>
                  ))}
                </div>
              )}
            </div>
            {tab === 'login' && (
              <div className="row" style={{ marginBottom: 18 }}>
                <label className="row" style={{ gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                  <span className="switch" />Recordarme
                </label>
                <div className="spacer" />
                <a style={{ fontSize: 12, color: blueColor, textDecoration: 'none', cursor: 'pointer' }}>¿Olvidaste?</a>
              </div>
            )}
            <button className="btn primary lg" style={{ width: '100%', marginBottom: 14 }} onClick={() => navigate('home')}>
              {tab === 'login' ? 'Entrar' : 'Crear cuenta'} <Icon name="arrow-r" size={14}/>
            </button>
            <div className="row" style={{ marginBottom: 14, gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
              <span className="t-cap">O continúa con</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button className="btn"><Icon name="google" size={14}/> Google</button>
              <button className="btn"><Icon name="github" size={14}/> GitHub</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
