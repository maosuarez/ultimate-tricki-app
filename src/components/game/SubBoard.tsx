import { type FC } from 'react';
import type { SubBoardState, Player } from '../../types/game';
import { Mark } from '../ui/Mark';

interface SubBoardProps {
  sbIdx: number;
  sb: SubBoardState;
  isActive: boolean;
  isLocked: boolean;
  lastMove: { sb: number; cell: number } | null;
  onCellClick: (sbIdx: number, cellIdx: number) => void;
  hover: { sb: number; cell: number; turn: Player } | null;
  setHover: (h: { sb: number; cell: number } | null) => void;
  blueColor: string;
  redColor: string;
}

export const SubBoard: FC<SubBoardProps> = ({
  sbIdx,
  sb,
  isActive,
  isLocked,
  lastMove,
  onCellClick,
  hover,
  setHover,
  blueColor,
  redColor,
}) => {
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    background: isActive ? 'rgba(59,130,246,.08)' : 'var(--bg)',
    border: `1px solid ${isActive ? 'var(--blue)' : 'var(--border)'}`,
    borderRadius: 8,
    padding: '5%',
    aspectRatio: '1 / 1',
    boxShadow: isActive
      ? '0 0 0 1px var(--blue), 0 0 24px rgba(59,130,246,.18)'
      : 'none',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 3,
    width: '100%',
    height: '100%',
  };

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        {sb.cells.map((cell, cellIdx) => {
          const isLast =
            lastMove !== null &&
            lastMove.sb === sbIdx &&
            lastMove.cell === cellIdx;
          const isHovered =
            hover !== null &&
            hover.sb === sbIdx &&
            hover.cell === cellIdx &&
            !cell;
          const inWin =
            sb.winLine !== null && sb.winLine.includes(cellIdx);

          const cellBg = isLast
            ? 'rgba(245,158,11,.15)'
            : isHovered
            ? 'rgba(59,130,246,.18)'
            : inWin
            ? 'rgba(255,255,255,.04)'
            : 'var(--surface-2)';

          const cellStyle: React.CSSProperties = {
            position: 'relative',
            background: cellBg,
            border: isLast
              ? '1px solid rgba(245,158,11,.5)'
              : '1px solid transparent',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isActive && !cell ? 'pointer' : 'default',
            aspectRatio: '1 / 1',
          };

          return (
            <div
              key={cellIdx}
              style={cellStyle}
              onClick={() => {
                if (isActive && !cell) onCellClick(sbIdx, cellIdx);
              }}
              onMouseEnter={() => {
                if (isActive && !cell) setHover({ sb: sbIdx, cell: cellIdx });
              }}
              onMouseLeave={() => setHover(null)}
            >
              {cell && (
                <Mark
                  player={cell}
                  size="72%"
                  blue={blueColor}
                  red={redColor}
                />
              )}
              {isHovered && hover && (
                <div style={{ opacity: 0.35, position: 'absolute' }}>
                  <Mark
                    player={hover.turn}
                    size="72%"
                    blue={blueColor}
                    red={redColor}
                  />
                </div>
              )}
              {isLast && (
                <div
                  style={{
                    position: 'absolute',
                    top: 3,
                    right: 3,
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'rgba(245,158,11,1)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {sb.winner && sb.winner !== 'draw' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
          }}
        >
          <Mark
            player={sb.winner}
            size="90%"
            dim
            animate
            blue={blueColor}
            red={redColor}
          />
        </div>
      )}

      {isLocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(8,8,10,.5)',
            borderRadius: 8,
          }}
        />
      )}
    </div>
  );
};
