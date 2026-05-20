import { type FC, useState } from 'react';
import type { GameState, Player } from '../../types/game';
import { checkWin } from '../../utils/boardUtils';
import { SubBoard } from './SubBoard';

interface UltimateBoardProps {
  game: GameState;
  setGame: (game: GameState) => void;
  blueColor: string;
  redColor: string;
  viewerTurn?: boolean;
}

export const UltimateBoard: FC<UltimateBoardProps> = ({
  game,
  setGame,
  blueColor,
  redColor,
  viewerTurn = false,
}) => {
  const [hover, setHover] = useState<{ sb: number; cell: number } | null>(null);

  const playCell = (sbIdx: number, cellIdx: number) => {
    if (!viewerTurn) return;
    const next: GameState = JSON.parse(JSON.stringify(game)) as GameState;
    next.sb[sbIdx].cells[cellIdx] = next.turn;
    const w = checkWin(next.sb[sbIdx].cells);
    if (w.winner) {
      next.sb[sbIdx].winner = w.winner;
      next.sb[sbIdx].winLine = w.line;
    }
    next.lastMove = { sb: sbIdx, cell: cellIdx };
    const targetSb = next.sb[cellIdx];
    next.activeSb = targetSb.winner ? null : cellIdx;
    next.turn = next.turn === 'X' ? 'O' : 'X';
    next.history = [
      ...next.history,
      {
        n: (next.history[next.history.length - 1]?.n ?? 0) + 1,
        by: game.turn,
        sb: sbIdx,
        cell: cellIdx,
      },
    ];
    setGame(next);
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
