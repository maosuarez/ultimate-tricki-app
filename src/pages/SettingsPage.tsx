import React from 'react';
import { Icon } from '../components/ui';
import type { ScreenName } from '../types/game';

interface ViewSettingsProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
}

type SectionKey = 'general' | 'audio' | 'theme' | 'lang' | 'notif' | 'account' | 'net' | 'a11y';

interface SectionDef {
  k: SectionKey;
  icon: string;
  label: string;
}

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}

interface SettingsRowProps {
  label: string;
  desc?: string;
  control: React.ReactNode;
}

interface ToggleProps {
  on: boolean;
  onChange?: (v: boolean) => void;
}

const SECTIONS: SectionDef[] = [
  { k: 'general', icon: 'settings',      label: 'General' },
  { k: 'audio',   icon: 'volume',        label: 'Audio' },
  { k: 'theme',   icon: 'palette',       label: 'Tema' },
  { k: 'lang',    icon: 'language',      label: 'Idioma' },
  { k: 'notif',   icon: 'bell',          label: 'Notificaciones' },
  { k: 'account', icon: 'user',          label: 'Cuenta' },
  { k: 'net',     icon: 'wifi',          label: 'Red' },
  { k: 'a11y',    icon: 'accessibility', label: 'Accesibilidad' },
];

function SettingsGroup({ title, children }: SettingsGroupProps): React.ReactElement {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="t-h3" style={{ marginBottom: 12 }}>{title}</div>
      <div className="card" style={{ overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function SettingsRow({ label, desc, control }: SettingsRowProps): React.ReactElement {
  return (
    <div className="row" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
        {desc && <div className="t-cap" style={{ marginTop: 2 }}>{desc}</div>}
      </div>
      {control}
    </div>
  );
}

function Toggle({ on, onChange }: ToggleProps): React.ReactElement {
  return (
    <div
      className={'switch ' + (on ? 'on' : '')}
      onClick={() => onChange?.(!on)}
    />
  );
}

function SettingsGeneral(): React.ReactElement {
  const [autoSt, setAutoSt] = React.useState(true);
  const [hd, setHd] = React.useState(false);
  const [conf, setConf] = React.useState(true);
  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>General</div>
      <SettingsGroup title="Comportamiento">
        <SettingsRow
          label="Iniciar Ultimate al arrancar el sistema"
          desc="La app se abrirá automáticamente al iniciar sesión en el SO."
          control={<Toggle on={autoSt} onChange={setAutoSt}/>}
        />
        <SettingsRow
          label="Modo escritorio HD"
          desc="Mejora calidad visual en monitores 2K/4K"
          control={<Toggle on={hd} onChange={setHd}/>}
        />
        <SettingsRow
          label="Confirmar al abandonar partida ranked"
          desc="Muestra diálogo antes de rendirte"
          control={<Toggle on={conf} onChange={setConf}/>}
        />
      </SettingsGroup>
      <SettingsGroup title="Hardware">
        <SettingsRow
          label="Aceleración GPU"
          desc="Renderizado WebGPU (recomendado)"
          control={<Toggle on={true}/>}
        />
        <SettingsRow
          label="Límite de FPS"
          desc="Reduce consumo en portátiles"
          control={<span className="t-mono" style={{ color: 'var(--text-2)' }}>120 fps ▾</span>}
        />
        <SettingsRow
          label="Caché local"
          desc="14.2 MB usados · partidas, replays, miniaturas"
          control={<button className="btn sm">Limpiar</button>}
        />
      </SettingsGroup>
    </div>
  );
}

function SettingsAudio({ blueColor }: { blueColor: string }): React.ReactElement {
  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Audio</div>
      <SettingsGroup title="Mezcla">
        <SettingsRow label="Volumen general" desc="Maestro"
                     control={<input type="range" defaultValue="70" style={{ width: 180, accentColor: blueColor }} />} />
        <SettingsRow label="Efectos de juego" desc="Click, victoria, contador"
                     control={<input type="range" defaultValue="80" style={{ width: 180, accentColor: blueColor }} />} />
        <SettingsRow label="Música ambiente" desc="Lobby y menús"
                     control={<input type="range" defaultValue="35" style={{ width: 180, accentColor: blueColor }} />} />
        <SettingsRow label="Voces del oponente" desc="Reacciones (emotes de chat)"
                     control={<Toggle on={false}/>} />
      </SettingsGroup>
    </div>
  );
}

function SettingsTheme({ blueColor }: { blueColor: string }): React.ReactElement {
  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Tema</div>
      <SettingsGroup title="Apariencia">
        <SettingsRow
          label="Modo"
          desc="Recomendado: oscuro"
          control={(
            <div className="row" style={{ gap: 4 }}>
              <button className="btn sm" style={{ background: 'var(--card-hi)' }}>Oscuro</button>
              <button className="btn sm">Claro</button>
              <button className="btn sm">Sistema</button>
            </div>
          )}
        />
        <SettingsRow
          label="Densidad"
          desc="Espaciado entre elementos"
          control={(
            <div className="row" style={{ gap: 4 }}>
              <button className="btn sm">Compacta</button>
              <button className="btn sm" style={{ background: 'var(--card-hi)' }}>Cómoda</button>
              <button className="btn sm">Amplia</button>
            </div>
          )}
        />
        <SettingsRow
          label="Color de X"
          desc="Tu lado en partidas"
          control={(
            <div className="row" style={{ gap: 6 }}>
              {['#3B82F6','#06B6D4','#8B5CF6','#22C55E'].map((c) => (
                <div key={c} style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: c, border: c === blueColor ? '2px solid #fff' : '2px solid transparent',
                }}/>
              ))}
            </div>
          )}
        />
        <SettingsRow
          label="Color de O"
          desc="Oponente"
          control={(
            <div className="row" style={{ gap: 6 }}>
              {['#EF4444','#F59E0B','#EC4899','#71717A'].map((c) => (
                <div key={c} style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: c, border: c === '#EF4444' ? '2px solid #fff' : '2px solid transparent',
                }}/>
              ))}
            </div>
          )}
        />
      </SettingsGroup>
    </div>
  );
}

function SettingsLang(): React.ReactElement {
  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Idioma</div>
      <SettingsGroup title="Preferencias">
        <SettingsRow
          label="Idioma de la interfaz"
          control={<span className="t-mono" style={{ color: 'var(--text-2)' }}>Español (MX) ▾</span>}
        />
        <SettingsRow
          label="Formato de hora"
          control={(
            <div className="row" style={{ gap: 4 }}>
              <button className="btn sm" style={{ background: 'var(--card-hi)' }}>24h</button>
              <button className="btn sm">12h</button>
            </div>
          )}
        />
        <SettingsRow
          label="Zona horaria"
          control={<span className="t-mono" style={{ color: 'var(--text-2)' }}>GMT−06 · CDT ▾</span>}
        />
      </SettingsGroup>
    </div>
  );
}

function SettingsNotif(): React.ReactElement {
  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Notificaciones</div>
      <SettingsGroup title="Eventos">
        <SettingsRow label="Invitaciones de partida" control={<Toggle on={true}/>} />
        <SettingsRow label="Tu turno (cuando vuelve la ventana)" control={<Toggle on={true}/>} />
        <SettingsRow label="Amigo en línea" control={<Toggle on={false}/>} />
        <SettingsRow label="Mensajes de chat" control={<Toggle on={true}/>} />
        <SettingsRow label="Sonido en notificaciones" control={<Toggle on={true}/>} />
      </SettingsGroup>
    </div>
  );
}

function SettingsAccount(): React.ReactElement {
  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Cuenta</div>
      <SettingsGroup title="Perfil">
        <SettingsRow
          label="Email"
          desc="lucas@example.com · verificado"
          control={<button className="btn sm">Cambiar</button>}
        />
        <SettingsRow label="Nombre visible" control={<span className="t-mono">Lucas H.</span>} />
        <SettingsRow
          label="Conectado con"
          control={(
            <div className="row" style={{ gap: 6 }}>
              <span className="chip"><Icon name="google" size={11}/> Google</span>
              <span className="chip"><Icon name="github" size={11}/> GitHub</span>
            </div>
          )}
        />
      </SettingsGroup>
      <SettingsGroup title="Seguridad">
        <SettingsRow label="Autenticación en dos pasos" desc="App TOTP" control={<Toggle on={true}/>} />
        <SettingsRow label="Sesiones activas" desc="3 dispositivos" control={<button className="btn sm">Ver</button>} />
        <SettingsRow
          label="Eliminar cuenta"
          desc="Acción irreversible. Tu historial será anonimizado."
          control={<button className="btn sm danger">Eliminar</button>}
        />
      </SettingsGroup>
    </div>
  );
}

function SettingsNet(): React.ReactElement {
  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Red</div>
      <SettingsGroup title="Servidores">
        <SettingsRow
          label="Región preferida"
          control={<span className="t-mono" style={{ color: 'var(--text-2)' }}>EU-West (24 ms) ▾</span>}
        />
        <SettingsRow
          label="Servidores alternativos"
          desc="EU-East 38 ms · NA-East 88 ms · SA 142 ms"
          control={null}
        />
        <SettingsRow label="Reconexión automática" control={<Toggle on={true}/>} />
        <SettingsRow label="Permitir conexiones P2P (lobby local)" control={<Toggle on={false}/>} />
      </SettingsGroup>
    </div>
  );
}

function SettingsA11y(): React.ReactElement {
  return (
    <div>
      <div className="t-h1" style={{ marginBottom: 18 }}>Accesibilidad</div>
      <SettingsGroup title="Visual">
        <SettingsRow
          label="Daltonismo: usar símbolos en marcas"
          desc="Añade indicadores no basados en color"
          control={<Toggle on={false}/>}
        />
        <SettingsRow label="Alto contraste" control={<Toggle on={false}/>} />
        <SettingsRow label="Reducir movimiento" desc="Desactiva animaciones largas" control={<Toggle on={false}/>} />
        <SettingsRow
          label="Tamaño de texto"
          control={(
            <div className="row" style={{ gap: 4 }}>
              <button className="btn sm">A−</button>
              <button className="btn sm" style={{ background: 'var(--card-hi)' }}>100%</button>
              <button className="btn sm">A+</button>
            </div>
          )}
        />
      </SettingsGroup>
      <SettingsGroup title="Entrada">
        <SettingsRow
          label="Navegación por teclado"
          desc="Mueve con WASD/flechas, Enter para colocar"
          control={<Toggle on={true}/>}
        />
        <SettingsRow label="Tooltips persistentes" control={<Toggle on={true}/>} />
      </SettingsGroup>
    </div>
  );
}

export function ViewSettings({ navigate: _navigate, blueColor }: ViewSettingsProps): React.ReactElement {
  const [section, setSection] = React.useState<SectionKey>('general');

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100%', overflow: 'hidden' }}>
      <div style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: 16, overflow: 'auto' }}>
        <div className="t-tag" style={{ padding: '4px 10px', marginBottom: 8 }}>Configuración</div>
        {SECTIONS.map((s) => (
          <div
            key={s.k}
            onClick={() => setSection(s.k)}
            className="sb-item"
            style={{
              background: section === s.k ? 'var(--card-hi)' : 'transparent',
              color: section === s.k ? 'var(--text)' : 'var(--text-2)',
            }}
          >
            <Icon name={s.icon} size={15} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: 28, overflow: 'auto' }}>
        {section === 'general' && <SettingsGeneral />}
        {section === 'audio'   && <SettingsAudio blueColor={blueColor} />}
        {section === 'theme'   && <SettingsTheme blueColor={blueColor} />}
        {section === 'lang'    && <SettingsLang />}
        {section === 'notif'   && <SettingsNotif />}
        {section === 'account' && <SettingsAccount />}
        {section === 'net'     && <SettingsNet />}
        {section === 'a11y'    && <SettingsA11y />}
      </div>
    </div>
  );
}
