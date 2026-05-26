import React from 'react';
import { Icon, ProgressBar } from '../components/ui';
import type { ScreenName } from '../types/game';
import { useAchievements } from '@/hooks/useAchievements';
import type { AchievementWithStatus } from '@/types/achievement.types';

interface ViewAchievementsProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
}

function formatUnlockedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffDays < 14) return 'hace 1 semana';
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
  return date.toLocaleDateString('es-ES');
}

interface AchievementCardProps {
  achievement: AchievementWithStatus;
}

function AchievementCard({ achievement: a }: AchievementCardProps): React.ReactElement {
  return (
    <div className="card" style={{
      padding: 18,
      opacity: a.unlocked ? 1 : 0.5,
      border: a.unlocked ? '1px solid var(--border-hi)' : '1px solid var(--border)',
      background: a.unlocked
        ? 'linear-gradient(135deg, rgba(34,197,94,.06), var(--surface))'
        : 'var(--surface)',
    }}>
      <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
        <div style={{ fontSize: 40, lineHeight: 1 }}>{a.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{a.name}</div>
          <div className="t-cap" style={{ marginBottom: 8, color: 'var(--text-3)' }}>{a.description}</div>
          {a.unlocked
            ? <span className="chip green" style={{ fontSize: 11 }}><Icon name="check" size={10}/> Desbloqueado</span>
            : <span className="chip" style={{ fontSize: 11, color: 'var(--fg-muted)' }}><Icon name="lock" size={10}/> Bloqueado</span>
          }
          {a.unlocked && a.unlockedAt && (
            <div className="t-cap" style={{ marginTop: 5, color: 'var(--text-3)', fontSize: 10 }}>
              {formatUnlockedAt(a.unlockedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ViewAchievements({ navigate, blueColor: _blueColor, redColor: _redColor }: ViewAchievementsProps): React.ReactElement {
  const { achievements, unlocked, total, progress, loading, error } = useAchievements();

  return (
    <div className="fade-in" style={{ padding: 28, overflow: 'auto', height: '100%' }}>
      {/* Header */}
      <div className="row" style={{ marginBottom: 20, alignItems: 'flex-start' }}>
        <div>
          <button className="btn ghost sm" onClick={() => navigate('home')} style={{ marginBottom: 10 }}>
            <Icon name="arrow-l" size={14}/> Inicio
          </button>
          <div className="t-h1" style={{ marginBottom: 6 }}>Logros</div>
          <div className="row" style={{ gap: 8 }}>
            <span className="chip green"><Icon name="trophy" size={11}/> {unlocked} / {total} desbloqueados</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div className="row" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Progreso total</span>
          <div className="spacer"/>
          <span className="t-mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {progress}%
          </span>
        </div>
        <ProgressBar value={progress} color="var(--green)" />
      </div>

      {/* Loading / error states */}
      {loading && (
        <div className="t-cap" style={{ textAlign: 'center', padding: 32 }}>Cargando…</div>
      )}
      {error && !loading && (
        <div className="t-cap" style={{ textAlign: 'center', padding: 32, color: 'var(--red)' }}>
          Error al cargar logros: {error}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {achievements.map((a) => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
        </div>
      )}
    </div>
  );
}
