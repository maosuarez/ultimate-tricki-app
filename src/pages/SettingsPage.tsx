import React, { type FC } from 'react';
import { Icon } from '../components/ui';
import type { ScreenName } from '../types/game';
import { useSettingsStore } from '../stores/settingsStore';
import { useUserStore } from '../stores/userStore';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ViewSettingsProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
}

// ─── Section definition ───────────────────────────────────────────────────────

type SectionKey = 'apariencia' | 'audio' | 'juego' | 'a11y' | 'account';

interface SectionDef {
  k: SectionKey;
  icon: string;
  label: string;
}

const SECTIONS: SectionDef[] = [
  { k: 'apariencia', icon: 'palette',       label: 'Apariencia' },
  { k: 'audio',      icon: 'volume',        label: 'Audio' },
  { k: 'juego',      icon: 'gamepad',       label: 'Juego' },
  { k: 'a11y',       icon: 'accessibility', label: 'Accesibilidad' },
  { k: 'account',    icon: 'user',          label: 'Cuenta' },
];

// ─── Shared primitives ────────────────────────────────────────────────────────

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}

function SettingsGroup({ title, children }: SettingsGroupProps): React.ReactElement {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="t-h3" style={{ marginBottom: 12 }}>{title}</div>
      <div className="card" style={{ overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  desc?: string;
  control: React.ReactNode;
  last?: boolean;
}

function SettingsRow({ label, desc, control, last }: SettingsRowProps): React.ReactElement {
  return (
    <div
      className="row"
      style={{
        padding: '14px 18px',
        borderBottom: last ? 'none' : '1px solid var(--border)',
        gap: 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
        {desc && <div className="t-cap" style={{ marginTop: 2 }}>{desc}</div>}
      </div>
      {control}
    </div>
  );
}

interface ToggleProps {
  on: boolean;
  onChange: (v: boolean) => void;
}

const Toggle: FC<ToggleProps> = ({ on, onChange }) => (
  <div className={`switch ${on ? 'on' : ''}`} onClick={() => onChange(!on)} />
);

// ─── Apariencia ───────────────────────────────────────────────────────────────

const COLORS_X = ['#3B82F6', '#06B6D4', '#8B5CF6', '#22C55E'] as const;
const COLORS_O = ['#EF4444', '#F59E0B', '#EC4899', '#71717A'] as const;

type ThemeValue = 'dark' | 'light' | 'system';
type DensityValue = 'compact' | 'comfortable' | 'spacious';

function SettingsApariencia(): React.ReactElement {
  const { theme, density, colorX, colorO, setTheme, setDensity, setColorX, setColorO } =
    useSettingsStore();

  const themeOptions: { v: ThemeValue; label: string }[] = [
    { v: 'dark', label: 'Oscuro' },
    { v: 'light', label: 'Claro' },
    { v: 'system', label: 'Sistema' },
  ];

  const densityOptions: { v: DensityValue; label: string }[] = [
    { v: 'compact', label: 'Compacta' },
    { v: 'comfortable', label: 'Cómoda' },
    { v: 'spacious', label: 'Amplia' },
  ];

  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Apariencia</div>
      <SettingsGroup title="Tema">
        <SettingsRow
          label="Modo"
          desc="Recomendado: oscuro"
          control={
            <div className="row" style={{ gap: 4 }}>
              {themeOptions.map(({ v, label }) => (
                <button
                  key={v}
                  className="btn sm"
                  style={theme === v ? { background: 'var(--card-hi)' } : undefined}
                  onClick={() => setTheme(v)}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        />
        <SettingsRow
          label="Densidad"
          desc="Espaciado entre elementos"
          control={
            <div className="row" style={{ gap: 4 }}>
              {densityOptions.map(({ v, label }) => (
                <button
                  key={v}
                  className="btn sm"
                  style={density === v ? { background: 'var(--card-hi)' } : undefined}
                  onClick={() => setDensity(v)}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        />
      </SettingsGroup>
      <SettingsGroup title="Colores de jugadores">
        <SettingsRow
          label="Color de X"
          desc="Tu lado en partidas"
          control={
            <div className="row" style={{ gap: 6 }}>
              {COLORS_X.map((c) => (
                <div
                  key={c}
                  onClick={() => setColorX(c)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: c,
                    border: c === colorX ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          }
        />
        <SettingsRow
          label="Color de O"
          desc="Oponente"
          last
          control={
            <div className="row" style={{ gap: 6 }}>
              {COLORS_O.map((c) => (
                <div
                  key={c}
                  onClick={() => setColorO(c)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: c,
                    border: c === colorO ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          }
        />
      </SettingsGroup>
    </div>
  );
}

// ─── Audio ────────────────────────────────────────────────────────────────────

function SettingsAudio(): React.ReactElement {
  const { colorX, volumeMaster, volumeSfx, volumeMusic, setVolumeMaster, setVolumeSfx, setVolumeMusic } =
    useSettingsStore();

  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Audio</div>
      <SettingsGroup title="Mezcla">
        <SettingsRow
          label="Volumen general"
          desc={`Maestro · ${volumeMaster}%`}
          control={
            <input
              type="range"
              min={0}
              max={100}
              value={volumeMaster}
              onChange={(e) => setVolumeMaster(Number(e.target.value))}
              style={{ width: 180, accentColor: colorX }}
            />
          }
        />
        <SettingsRow
          label="Efectos de juego"
          desc={`Click, victoria, contador · ${volumeSfx}%`}
          control={
            <input
              type="range"
              min={0}
              max={100}
              value={volumeSfx}
              onChange={(e) => setVolumeSfx(Number(e.target.value))}
              style={{ width: 180, accentColor: colorX }}
            />
          }
        />
        <SettingsRow
          label="Música ambiente"
          desc={`Lobby y menús · ${volumeMusic}%`}
          last
          control={
            <input
              type="range"
              min={0}
              max={100}
              value={volumeMusic}
              onChange={(e) => setVolumeMusic(Number(e.target.value))}
              style={{ width: 180, accentColor: colorX }}
            />
          }
        />
      </SettingsGroup>
    </div>
  );
}

// ─── Juego ────────────────────────────────────────────────────────────────────

function SettingsJuego(): React.ReactElement {
  const {
    showCoordinates,
    highlightLastMove,
    confirmResign,
    setShowCoordinates,
    setHighlightLastMove,
    setConfirmResign,
  } = useSettingsStore();

  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Juego</div>
      <SettingsGroup title="Comportamiento">
        <SettingsRow
          label="Mostrar coordenadas"
          desc="Fila y columna de cada celda"
          control={<Toggle on={showCoordinates} onChange={setShowCoordinates} />}
        />
        <SettingsRow
          label="Resaltar último movimiento"
          desc="Indica visualmente la última jugada"
          control={<Toggle on={highlightLastMove} onChange={setHighlightLastMove} />}
        />
        <SettingsRow
          label="Confirmar al rendirse"
          desc="Muestra diálogo antes de abandonar"
          last
          control={<Toggle on={confirmResign} onChange={setConfirmResign} />}
        />
      </SettingsGroup>
    </div>
  );
}

// ─── Accesibilidad ────────────────────────────────────────────────────────────

function SettingsA11y(): React.ReactElement {
  const { reduceMotion, setReduceMotion } = useSettingsStore();

  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Accesibilidad</div>
      <SettingsGroup title="Visual">
        <SettingsRow
          label="Reducir movimiento"
          desc="Desactiva animaciones largas"
          last
          control={<Toggle on={reduceMotion} onChange={setReduceMotion} />}
        />
      </SettingsGroup>
    </div>
  );
}

// ─── Cuenta ───────────────────────────────────────────────────────────────────

interface SettingsAccountProps {
  navigate: (screen: ScreenName) => void;
}

function SettingsAccount({ navigate }: SettingsAccountProps): React.ReactElement {
  const { session, profile, isGuest, guestName, signOut } = useUserStore();

  const handleSignOut = () => {
    void signOut();
    navigate('login');
  };

  if (isGuest) {
    const name = guestName ?? 'Invitado';
    return (
      <div>
        <div className="t-h1" style={{ marginBottom: 18 }}>Cuenta</div>
        <SettingsGroup title="Sesión actual">
          <SettingsRow
            label="Modo invitado"
            desc={`Jugando como ${name}`}
            last
            control={
              <button className="btn sm primary" onClick={() => navigate('login')}>
                Iniciar sesión
              </button>
            }
          />
        </SettingsGroup>
      </div>
    );
  }

  const email = session?.email ?? '—';
  const displayName = profile?.displayName ?? '—';
  const rating = profile?.rating ?? '—';

  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Cuenta</div>
      <SettingsGroup title="Perfil">
        <SettingsRow
          label="Email"
          desc={`${email} · verificado`}
          control={<span className="t-mono" style={{ color: 'var(--fg-muted)' }}>{email}</span>}
        />
        <SettingsRow
          label="Nombre visible"
          control={<span className="t-mono">{displayName}</span>}
        />
        <SettingsRow
          label="ELO"
          last
          control={<span className="t-mono">{rating}</span>}
        />
      </SettingsGroup>
      <SettingsGroup title="Sesión">
        <SettingsRow
          label="Cerrar sesión"
          desc="Saldrás de tu cuenta en este dispositivo"
          last
          control={
            <button className="btn sm" onClick={handleSignOut}>
              Cerrar sesión
            </button>
          }
        />
      </SettingsGroup>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function ViewSettings({ navigate }: ViewSettingsProps): React.ReactElement {
  const [section, setSection] = React.useState<SectionKey>('apariencia');

  return (
    <div
      className="fade-in"
      style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100%', overflow: 'hidden' }}
    >
      {/* Sidebar */}
      <div
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          padding: 16,
          overflow: 'auto',
        }}
      >
        <div className="t-tag" style={{ padding: '4px 10px', marginBottom: 8 }}>
          Configuración
        </div>
        {SECTIONS.map((s) => (
          <div
            key={s.k}
            onClick={() => setSection(s.k)}
            className={`nav-item ${section === s.k ? 'active' : ''}`}
          >
            <Icon name={s.icon} size={15} className="nav-icon" />
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 28, overflow: 'auto' }}>
        {section === 'apariencia' && <SettingsApariencia />}
        {section === 'audio'      && <SettingsAudio />}
        {section === 'juego'      && <SettingsJuego />}
        {section === 'a11y'       && <SettingsA11y />}
        {section === 'account'    && <SettingsAccount navigate={navigate} />}
      </div>
    </div>
  );
}
