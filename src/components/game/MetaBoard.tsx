import { type FC } from 'react';
import type { GameState } from '../../types/game';
import { Mark } from '../ui/Mark';

interface MetaBoardProps {
  game: GameState;
  size?: number;
  blueColor: string;
  redColor: string;
}

export const MetaBoard: FC<MetaBoardProps> = ({
  game,
  size = 96,
  blueColor,
  redColor,
}) => {
  const cellSz = (size - 4) / 3;

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 2,
    background: 'var(--border)',
    padding: 1,
    borderRadius: 6,
  };

  return (
    <div style={containerStyle}>
      {game.sb.map((sb, i) => {
        const isActive =
          game.activeSb === null ? false : game.activeSb === i;

        let cellBg: string;
        if (sb.winner === 'X') {
          cellBg = 'rgba(59,130,246,.18)';
        } else if (sb.winner === 'O') {
          cellBg = 'rgba(239,68,68,.18)';
        } else if (sb.winner === 'draw') {
          cellBg = 'var(--card-hi)';
        } else if (isActive) {
          cellBg = 'rgba(59,130,246,.08)';
        } else {
          cellBg = 'var(--surface-2)';
        }

        const cellStyle: React.CSSProperties = {
          width: cellSz,
          height: cellSz,
          background: cellBg,
          border: isActive ? '1px solid var(--blue)' : '1px solid transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
        };

        return (
          <div key={i} style={cellStyle}>
            {sb.winner && sb.winner !== 'draw' && (
              <Mark
                player={sb.winner}
                size={cellSz * 0.7}
                blue={blueColor}
                red={redColor}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
