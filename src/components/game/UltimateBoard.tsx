import { type FC, useState } from 'react';
import type { GameState, Player } from '../../types/game';
import { SubBoard } from './SubBoard';

interface UltimateBoardProps {
  game: GameState;
  blueColor: string;
  redColor: string;
  canInteract: boolean;
  onMove: (sb: number, cell: number) => void;
}

export const UltimateBoard: FC<UltimateBoardProps> = ({
  game,
  blueColor,
  redColor,
  canInteract,
  onMove,
}) => {
  const [hover, setHover] = useState<{ sb: number; cell: number } | null>(null);

  const playCell = (sbIdx: number, cellIdx: number) => {
    if (!canInteract) return;
    onMove(sbIdx, cellIdx);
    setHover(null);
  };

  const hoverWithTurn: { sb: number; cell: number; turn: Player } | null =
    hover ? { ...hover, turn: game.turn } : null;

  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    padding: 10,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
    aspectRatio: '1/1',
    boxShadow: 'var(--shadow-md)',
  };

  return (
    <div style={containerStyle}>
      {game.sb.map((sb, i) => {
        const isActive =
          game.activeSb === null ? !sb.winner : game.activeSb === i;
        const isLocked = !isActive && !sb.winner;

        return (
          <SubBoard
            key={i}
            sbIdx={i}
            sb={sb}
            isActive={isActive}
            isLocked={isLocked}
            lastMove={game.lastMove}
            onCellClick={playCell}
            hover={hoverWithTurn}
            setHover={setHover}
            blueColor={blueColor}
            redColor={redColor}
          />
        );
      })}
    </div>
  );
};
