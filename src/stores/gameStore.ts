import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GameState } from '../types/game';
import { buildSampleGame } from '../utils/boardUtils';

interface GameStore {
  game: GameState;
  setGame: (game: GameState) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set) => ({
      game: buildSampleGame(),
      setGame: (game) => set({ game }),
      resetGame: () => set({ game: buildSampleGame() }),
    }),
    { name: 'GameStore' }
  )
);
