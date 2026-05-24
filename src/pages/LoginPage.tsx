import React from 'react';
import { Icon } from '../components/ui';
import { supabaseService } from '../services/supabase.service';
import type { ScreenName } from '../types/game';

interface ViewLoginProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  onSignIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  onSignUp: (email: string, password: string, username: string) => Promise<void>;
  onGuest: (name: string) => void;
}

type LoginTab = 'login' | 'register' | 'guest';

const TAB_LABELS: Record<LoginTab, string> = {
  login: 'Iniciar sesion',
  register: 'Crear cuenta',
  guest: 'Invitado',
};

function calcPasswordStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export function ViewLogin({ navigate: _navigate, blueColor, onSignIn, onSignUp, onGuest }: ViewLoginProps): React.ReactElement {
  const [tab, setTab] = React.useState<LoginTab>('login');

  // Shared form state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [guestName, setGuestName] = React.useState('Invitado_7H2K');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [rememberMe, setRememberMe] = React.useState(true);

  // Username availability
  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = React.useState(false);

  // Reset error when switching tabs
  const handleTabChange = (k: LoginTab) => {
    setTab(k);
    setErrorMsg(null);
  };

  // Debounced username availability check
  React.useEffect(() => {
    if (tab !== 'register' || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const available = await supabaseService.profile.checkUsernameAvailable(username);
        setUsernameAvailable(available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username, tab]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Email inválido'); setIsSubmitting(false); return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres'); setIsSubmitting(false); return;
    }

    try {
      await onSignIn(email, password, rememberMe);
    } catch (err) {
      const msg = err !== null && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : String(err);
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Email inválido'); setIsSubmitting(false); return;
    }
    if (username.length < 3 || username.length > 20) {
      setErrorMsg('El usuario debe tener entre 3 y 20 caracteres'); setIsSubmitting(false); return;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
      setErrorMsg('El usuario solo puede contener letras, números y guiones bajos, y debe empezar con una letra'); setIsSubmitting(false); return;
    }
    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres'); setIsSubmitting(false); return;
    }

    try {
      await onSignUp(email, password, username);
    } catch (err) {
      const msg = err !== null && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : String(err);
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = (e: React.FormEvent) => {
    e.preventDefault();
    onGuest(guestName || 'Invitado_7H2K');
  };

  const pwStrength = calcPasswordStrength(password);

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
              onClick={() => handleTabChange(k)}
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
          <form onSubmit={handleGuest}>
            <div className="t-tag" style={{ marginBottom: 8 }}>Modo invitado</div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
              Juega sin cuenta. Tu progreso no se guardara y no podras jugar partidas ranked.
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="t-cap" style={{ marginBottom: 4, display: 'block' }}>Nombre temporal</label>
              <input
                className="input"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            {errorMsg && (
              <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10 }}>{errorMsg}</div>
            )}
            <button
              type="submit"
              className="btn primary lg"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cargando...' : <>Continuar como invitado <Icon name="arrow-r" size={14}/></>}
            </button>
          </form>
        ) : (
          <form onSubmit={tab === 'login' ? handleSignIn : handleSignUp}>
            <div style={{ marginBottom: 12 }}>
              <label className="t-cap" style={{ marginBottom: 4, display: 'block' }}>Email o usuario</label>
              <input
                className="input"
                placeholder="lucas@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {tab === 'register' && (
              <div style={{ marginBottom: 12 }}>
                <label className="t-cap" style={{ marginBottom: 4, display: 'block' }}>Usuario</label>
                <input
                  className="input"
                  placeholder="@lucas"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className="row" style={{ marginTop: 4, gap: 6 }}>
                  {checkingUsername && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Verificando...</span>}
                  {!checkingUsername && usernameAvailable === true && (
                    <><Icon name="check" size={12} style={{ color: 'var(--green)' }}/><span style={{ fontSize: 11, color: 'var(--green)' }}>Usuario disponible</span></>
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <><Icon name="x" size={12} style={{ color: 'var(--red)' }}/><span style={{ fontSize: 11, color: 'var(--red)' }}>Usuario no disponible</span></>
                  )}
                </div>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label className="t-cap" style={{ marginBottom: 4, display: 'block' }}>Contrasena</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {tab === 'register' && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[1,2,3,4].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= pwStrength
                        ? pwStrength <= 1 ? 'var(--red)' : pwStrength <= 2 ? 'var(--amber)' : 'var(--green)'
                        : 'var(--card-hi)',
                    }}/>
                  ))}
                </div>
              )}
            </div>
            {tab === 'login' && (
              <div className="row" style={{ marginBottom: 18 }}>
                <label className="row" style={{ gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                  <span
                    className={`switch${rememberMe ? ' on' : ''}`}
                    onClick={() => setRememberMe(r => !r)}
                    style={{ cursor: 'pointer' }}
                  />Recordarme
                </label>
                <div className="spacer" />
                <a style={{ fontSize: 12, color: blueColor, textDecoration: 'none', cursor: 'pointer' }}>Olvidaste?</a>
              </div>
            )}
            {errorMsg && (
              <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10 }}>{errorMsg}</div>
            )}
            <button
              type="submit"
              className="btn primary lg"
              style={{ width: '100%', marginBottom: 14 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cargando...' : <>{tab === 'login' ? 'Entrar' : 'Crear cuenta'} <Icon name="arrow-r" size={14}/></>}
            </button>
            <div className="row" style={{ marginBottom: 14, gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
              <span className="t-cap">O continua con</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button type="button" className="btn"><Icon name="google" size={14}/> Google</button>
              <button type="button" className="btn"><Icon name="github" size={14}/> GitHub</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
