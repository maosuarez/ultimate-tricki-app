import React from 'react';
import { Icon, Kbd } from '../components/ui';
import type { ScreenName } from '../types/game';

interface ViewCreateProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
}

type GameMode = 'local' | 'ai' | 'online' | 'private';
type AIDiff = 'easy' | 'med' | 'hard' | 'expert';
type TimeControl = 'none' | 'blitz' | 'rapid' | 'custom';
type Privacy = 'public' | 'private';

interface SectionProps {
  title: string;
  step: number;
  children: React.ReactNode;
}

interface Card2Props {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  desc: string;
  badge?: string;
}

interface SummaryRowProps {
  k: string;
  v: string;
}

function Section({ title, step, children }: SectionProps): React.ReactElement {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row" style={{ marginBottom: 14 }}>
        <span style={{
          width: 22, height: 22, borderRadius: 999,
          background: 'var(--surface-2)', border: '1px solid var(--border-hi)',
          display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 700, color: 'var(--text-2)',
          fontFamily: 'var(--font-mono)',
        }}>{step}</span>
        <span className="t-h3">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Grid4({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>{children}</div>
  );
}

function Card2({ active, onClick, icon, title, desc, badge }: Card2Props): React.ReactElement {
  return (
    <div onClick={onClick} style={{
      padding: 14, borderRadius: 10,
      background: active ? 'rgba(59,130,246,.10)' : 'var(--surface-2)',
      border: active ? '1px solid var(--blue)' : '1px solid var(--border)',
      cursor: 'default',
      transition: 'all var(--t-fast) var(--ease)',
      position: 'relative',
    }}>
      <Icon name={icon} size={18} style={{ color: active ? 'var(--blue)' : 'var(--text-2)', marginBottom: 10 }} />
      <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
      <div className="t-cap" style={{ marginTop: 2 }}>{desc}</div>
      {badge && (
        <span className="chip blue" style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, padding: '1px 6px' }}>{badge}</span>
      )}
      {active && (
        <div style={{ position: 'absolute', top: 10, right: 10, width: 16, height: 16, borderRadius: '50%', background: 'var(--blue)', display: 'grid', placeItems: 'center' }}>
          <Icon name="check" size={11} style={{ color: '#fff' }} />
        </div>
      )}
    </div>
  );
}

function SummaryRow({ k, v }: SummaryRowProps): React.ReactElement {
  return (
    <div className="row" style={{ fontSize: 13 }}>
      <span className="muted">{k}</span><div className="spacer"/>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}

export function ViewCreate({ navigate, blueColor: _blueColor }: ViewCreateProps): React.ReactElement {
  const [mode, setMode] = React.useState<GameMode>('online');
  const [diff, setDiff] = React.useState<AIDiff>('hard');
  const [time, setTime] = React.useState<TimeControl>('blitz');
  const [privacy, setPrivacy] = React.useState<Privacy>('public');

  const modeLabel = mode === 'online' ? 'Online · Ranked' : mode === 'ai' ? 'vs IA' : mode === 'local' ? 'Local' : 'Privada';
  const diffLabel = diff === 'easy' ? 'Fácil' : diff === 'med' ? 'Medio' : diff === 'hard' ? 'Difícil' : 'Experto';
  const timeLabel = time === 'blitz' ? '5+3' : time === 'rapid' ? '10+5' : time === 'none' ? 'sin límite' : '7+4';

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <button className="btn ghost sm" onClick={() => navigate('home')}><Icon name="arrow-l" size={14}/> Inicio</button>
        <div className="t-h1" style={{ marginTop: 12 }}>Crear partida</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Configura tu partida en 4 pasos.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, maxWidth: 1080 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* MODO */}
          <Section title="Modo de juego" step={1}>
            <Grid4>
              <Card2 active={mode === 'local'} onClick={() => setMode('local')} icon="users" title="Local" desc="2 jugadores en el mismo equipo" />
              <Card2 active={mode === 'ai'} onClick={() => setMode('ai')} icon="cpu" title="Contra IA" desc="Desafía al motor" />
              <Card2 active={mode === 'online'} onClick={() => setMode('online')} icon="globe" title="Online" desc="Multijugador en línea" badge="Ranked" />
              <Card2 active={mode === 'private'} onClick={() => setMode('private')} icon="lock" title="Sala privada" desc="Con código de invitación" />
            </Grid4>
          </Section>

          {/* DIFICULTAD (solo si AI) */}
          {mode === 'ai' && (
            <Section title="Dificultad de la IA" step={2}>
              <Grid4>
                <Card2 active={diff === 'easy'} onClick={() => setDiff('easy')} icon="star" title="Fácil" desc="ELO ~1100 · ideal para aprender" />
                <Card2 active={diff === 'med'} onClick={() => setDiff('med')} icon="star" title="Medio" desc="ELO ~1500 · juego sólido" />
                <Card2 active={diff === 'hard'} onClick={() => setDiff('hard')} icon="star" title="Difícil" desc="ELO ~1850 · evalúa 5 jugadas" />
                <Card2 active={diff === 'expert'} onClick={() => setDiff('expert')} icon="sparkle" title="Experto" desc="ELO 2100+ · MCTS profundo" badge="Reto" />
              </Grid4>
            </Section>
          )}

          {/* TIEMPO */}
          <Section title="Control de tiempo" step={mode === 'ai' ? 3 : 2}>
            <Grid4>
              <Card2 active={time === 'none'} onClick={() => setTime('none')} icon="clock" title="Sin límite" desc="Casual / análisis" />
              <Card2 active={time === 'blitz'} onClick={() => setTime('blitz')} icon="bolt" title="Blitz" desc="5 min + 3 s/jugada" />
              <Card2 active={time === 'rapid'} onClick={() => setTime('rapid')} icon="clock" title="Rápida" desc="10 min + 5 s/jugada" />
              <Card2 active={time === 'custom'} onClick={() => setTime('custom')} icon="settings" title="Personalizada" desc="Define los parámetros" />
            </Grid4>
            {time === 'custom' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <div className="t-cap" style={{ marginBottom: 4 }}>Minutos base</div>
                  <input className="input mono" defaultValue="7" />
                </div>
                <div>
                  <div className="t-cap" style={{ marginBottom: 4 }}>Incremento por jugada (s)</div>
                  <input className="input mono" defaultValue="4" />
                </div>
              </div>
            )}
          </Section>

          {/* PRIVACIDAD */}
          <Section title="Visibilidad" step={mode === 'ai' ? 4 : 3}>
            <Grid4>
              <Card2 active={privacy === 'public'} onClick={() => setPrivacy('public')} icon="globe" title="Pública" desc="Cualquiera puede unirse" />
              <Card2 active={privacy === 'private'} onClick={() => setPrivacy('private')} icon="lock" title="Privada" desc="Solo con código de sala" />
            </Grid4>
          </Section>
        </div>

        {/* Summary */}
        <div style={{ position: 'sticky', top: 0 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="t-tag" style={{ marginBottom: 10 }}>Resumen</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <SummaryRow k="Modo" v={modeLabel} />
              {mode === 'ai' && <SummaryRow k="Dificultad" v={diffLabel} />}
              <SummaryRow k="Tiempo" v={timeLabel} />
              <SummaryRow k="Visibilidad" v={privacy === 'public' ? 'Pública' : 'Privada'} />
              <SummaryRow k="ELO impactado" v={mode === 'online' ? 'Sí, ±18' : 'No'} />
              <SummaryRow k="Espectadores" v="Permitidos" />
            </div>
            <button className="btn primary lg" style={{ width: '100%', marginBottom: 8 }} onClick={() => navigate('lobby')}>
              <Icon name="play" size={14}/> Crear y abrir lobby
            </button>
            <button className="btn ghost" style={{ width: '100%' }}>Guardar como plantilla</button>
          </div>
          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div className="t-tag" style={{ marginBottom: 6 }}>Atajos de teclado</div>
            <div className="row" style={{ marginBottom: 4, fontSize: 12 }}>
              <span className="muted">Crear sala</span><div className="spacer"/><Kbd>⌘</Kbd><Kbd>Enter</Kbd>
            </div>
            <div className="row" style={{ fontSize: 12 }}>
              <span className="muted">Cancelar</span><div className="spacer"/><Kbd>Esc</Kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
