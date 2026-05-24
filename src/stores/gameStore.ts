import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GameState, Player } from '../types/game';
import { checkWin, checkMetaWin, initGame } from '../utils/boardUtils';

interface ChatMessage {
  who: string;
  text: string;
  timestamp: string;
}

interface GameStore {
  game: GameState;
  playerX: string;
  playerO: string;
  chatMessages: ChatMessage[];
  gameWinner: Player | 'draw' | null;
  isActive: boolean;
  setGame: (game: GameState) => void;
  resetGame: () => void;
  makeMove: (sb: number, cell: number) => void;
  addChatMessage: (msg: ChatMessage) => void;
  startLocalGame: (nameX: string, nameO: string) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      game: initGame(),
      playerX: 'Jugador X',
      playerO: 'Jugador O',
      chatMessages: [],
      gameWinner: null,
      isActive: false,

      setGame: (game) => set({ game }),

      resetGame: () => set({ game: initGame(), gameWinner: null, chatMessages: [], isActive: false }),

      makeMove: (sb, cell) => {
        const { game } = get();

        // Validate: cell must be empty
        if (game.sb[sb].cells[cell] !== null) return;

        // Validate: correct sub-board must be targeted
        if (game.activeSb !== null && game.activeSb !== sb) return;

        // Validate: sub-board must not already be won
        if (game.sb[sb].winner !== null) return;

        const next: GameState = JSON.parse(JSON.stringify(game)) as GameState;

        // Apply the move
        next.sb[sb].cells[cell] = next.turn;

        // Check sub-board win
        const subResult = checkWin(next.sb[sb].cells);
        if (subResult.winner) {
          next.sb[sb].winner = subResult.winner;
          next.sb[sb].winLine = subResult.line;
        }

        // Check global (meta) win
        const metaResult = checkMetaWin(next.sb.map((s) => s.winner));
        let gameWinner: Player | 'draw' | null = null;
        if (metaResult.winner === 'X' || metaResult.winner === 'O') {
          gameWinner = metaResult.winner;
        } else if (metaResult.winner === 'draw') {
          gameWinner = 'draw';
        }

        // Determine next active sub-board
        const targetSb = next.sb[cell];
        next.activeSb = targetSb.winner ? null : cell;

        // Record move in history
        next.history = [
          ...next.history,
          {
            n: (next.history[next.history.length - 1]?.n ?? 0) + 1,
            by: game.turn,
            sb,
            cell,
          },
        ];

        next.lastMove = { sb, cell };

        // Alternate turn
        next.turn = next.turn === 'X' ? 'O' : 'X';

        set({ game: next, gameWinner });
      },

      addChatMessage: (msg) =>
        set((state) => ({ chatMessages: [...state.chatMessages, msg] })),

      startLocalGame: (nameX, nameO) =>
        set({
          game: initGame(),
          playerX: nameX,
          playerO: nameO,
          chatMessages: [],
          gameWinner: null,
          isActive: true,
        }),
    }),
    { name: 'GameStore' }
  )
);
