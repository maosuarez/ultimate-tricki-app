import type { CellValue, SubBoardWinner, GameState, MoveHistory } from '../types/game';

const WIN_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWin(cells: CellValue[]): { winner: SubBoardWinner; line: number[] | null } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a] as SubBoardWinner, line };
    }
  }
  if (cells.every(Boolean)) return { winner: 'draw', line: null };
  return { winner: null, line: null };
}

export function checkMetaWin(winners: SubBoardWinner[]): { winner: SubBoardWinner; line: number[] | null } {
  const cells: CellValue[] = winners.map((w) => (w === 'X' || w === 'O' ? w : null));
  return checkWin(cells);
}

export function initGame(): GameState {
  return {
    sb: Array.from({ length: 9 }, () => ({
      cells: Array(9).fill(null) as CellValue[],
      winner: null,
      winLine: null,
    })),
    turn: 'X',
    activeSb: null,
    lastMove: null,
    history: [],
  };
}

/**
 * Reconstructs the GameState by replaying all moves from index 0 up to and
 * including `upToIndex`. Pass -1 to get an empty board.
 * Pure function — no side effects.
 */
export function reconstructBoardState(moves: MoveHistory[], upToIndex: number): GameState {
  let state = initGame();
  const limit = Math.min(upToIndex, moves.length - 1);
  for (let i = 0; i <= limit; i++) {
    const move = moves[i];
    const { sb: sbIdx, cell } = move;

    // Skip invalid moves silently to avoid crashing the replay
    if (state.sb[sbIdx].cells[cell] !== null) continue;
    if (state.sb[sbIdx].winner !== null) continue;
    if (state.activeSb !== null && state.activeSb !== sbIdx) continue;

    const next: GameState = JSON.parse(JSON.stringify(state)) as GameState;
    next.sb[sbIdx].cells[cell] = next.turn;

    const subResult = checkWin(next.sb[sbIdx].cells);
    if (subResult.winner) {
      next.sb[sbIdx].winner = subResult.winner;
      next.sb[sbIdx].winLine = subResult.line;
    }

    const targetSb = next.sb[cell];
    next.activeSb = targetSb.winner ? null : cell;

    next.history = [...next.history, move];
    next.lastMove = { sb: sbIdx, cell };
    next.turn = next.turn === 'X' ? 'O' : 'X';

    state = next;
  }
  return state;
}

export function buildSampleGame() {
  const sb = Array.from({ length: 9 }, () => ({
    cells: Array(9).fill(null) as CellValue[],
    winner: null as SubBoardWinner,
    winLine: null as number[] | null,
  }));

  sb[0].cells = ['O', 'X', 'X', 'X', 'X', 'O', 'X', 'X', 'X'];
  sb[0].winner = 'X'; sb[0].winLine = [2, 4, 6];

  sb[1].cells = ['X', 'X', 'X', 'O', null, 'O', 'O', 'O', 'O'];
  sb[1].winner = 'X'; sb[1].winLine = [0, 1, 2];

  sb[2].cells = ['O', 'O', null, 'O', 'O', null, null, null, 'X'];
  sb[2].winner = 'O'; sb[2].winLine = [0, 3, 6];

  sb[3].cells = ['O', null, null, null, null, null, null, null, null];

  sb[4].cells = ['X', 'X', 'X', null, 'X', 'O', null, null, 'O'];
  sb[4].winner = 'X'; sb[4].winLine = [0, 4, 8];

  sb[5].cells = ['O', 'X', null, null, null, null, null, null, null];

  sb[6].cells = Array(9).fill(null) as CellValue[];

  sb[7].cells = [null, 'X', null, null, 'O', null, null, 'X', null];

  sb[8].cells = ['O', null, null, null, 'O', null, 'X', 'X', 'O'];
  sb[8].winner = 'O'; sb[8].winLine = [0, 4, 8];

  return {
    sb,
    turn: 'X' as const,
    activeSb: 3,
    lastMove: { sb: 8, cell: 8 },
    history: [
      { n: 14, by: 'X' as const, sb: 4, cell: 4 },
      { n: 15, by: 'O' as const, sb: 4, cell: 5 },
      { n: 16, by: 'X' as const, sb: 5, cell: 1 },
      { n: 17, by: 'O' as const, sb: 1, cell: 6 },
      { n: 18, by: 'X' as const, sb: 6, cell: 0 },
      { n: 19, by: 'O' as const, sb: 0, cell: 0 },
      { n: 20, by: 'X' as const, sb: 0, cell: 4 },
      { n: 21, by: 'O' as const, sb: 4, cell: 6 },
      { n: 22, by: 'X' as const, sb: 6, cell: 4 },
      { n: 23, by: 'O' as const, sb: 4, cell: 8 },
      { n: 24, by: 'X' as const, sb: 8, cell: 6 },
      { n: 25, by: 'O' as const, sb: 6, cell: 8 },
      { n: 26, by: 'X' as const, sb: 8, cell: 7 },
      { n: 27, by: 'O' as const, sb: 7, cell: 4 },
      { n: 28, by: 'X' as const, sb: 4, cell: 0 },
      { n: 29, by: 'O' as const, sb: 0, cell: 5 },
      { n: 30, by: 'X' as const, sb: 5, cell: 0 },
      { n: 31, by: 'O' as const, sb: 8, cell: 8 },
    ],
  };
}
