import { useEffect, type FC } from 'react';
import { Icon } from '@/components/ui';
import type { ScreenName } from '@/types/game';

interface ActiveMatchBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (screen: ScreenName) => void;
}

/**
 * Shown when a user attempts to access /create or /join while a match
 * is already in progress. Prevents simultaneous active matches.
 */
export const ActiveMatchBlockedModal: FC<ActiveMatchBlockedModalProps> = ({
  isOpen,
  onClose,
  navigate,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleGoToActiveMatch(): void {
    navigate('game');
    onClose();
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(90vw, 380px)',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(59,130,246,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--blue)',
          }}
        >
          <Icon name="play" size={24} />
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Partida en progreso</div>
          <div
            className="t-cap"
            style={{ marginTop: 6, maxWidth: 280, lineHeight: 1.4 }}
          >
            Debes terminar o abandonar la partida actual para jugar otra
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button
            className="btn ghost"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="btn primary"
            style={{ flex: 1 }}
            onClick={handleGoToActiveMatch}
          >
            Volver a partida activa
          </button>
        </div>
      </div>
    </div>
  );
};
