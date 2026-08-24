import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GameState, Player } from '../types/game';
import { initGame } from '../utils/boardUtils';
import { gameEngineService } from '@/services/game-engine.service';

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
  timeX: number;
  timeO: number;
  initialTime: number;
  aiAgentId: string | null;
  botSide: 'X' | 'O' | null;
  mode: 'local' | 'ai' | 'online' | 'custom_agent';
  setGame: (game: GameState) => void;
  resetGame: () => void;
  makeMove: (sb: number, cell: number) => void;
  addChatMessage: (msg: ChatMessage) => void;
  startLocalGame: (nameX: string, nameO: string, timeSecs?: number) => void;
  startAiGame: (nameX: string, agentId: string, timeSecs: number) => void;
  startOnlineGame: (nameX: string, nameO: string, timeSecs?: number) => void;
  startAgentGame: (nameX: string, agentName: string, timeSecs?: number) => void;
  tickTimer: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      game: initGame(),
      playerX: 'Player X',
      playerO: 'Player O',
      chatMessages: [],
      gameWinner: null,
      isActive: false,
      timeX: 300,
      timeO: 300,
      initialTime: 300,
      aiAgentId: null,
      botSide: null,
      mode: 'local' as 'local' | 'ai' | 'online' | 'custom_agent',

      setGame: (game) => set({ game }),

      resetGame: () => set({ game: initGame(), gameWinner: null, chatMessages: [], isActive: false, timeX: 300, timeO: 300, initialTime: 300, aiAgentId: null, botSide: null, mode: 'local' as 'local' | 'ai' | 'online' | 'custom_agent' }),

      makeMove: (sb, cell) => {
        const { game, gameWinner } = get();
        if (gameWinner !== null) return;

        const result = gameEngineService.applyMove(game, sb, cell);
        if (result.isValid) {
          set({ game: result.nextState, gameWinner: result.gameWinner });
        }
      },

      addChatMessage: (msg) =>
        set((state) => ({ chatMessages: [...state.chatMessages, msg] })),

      startLocalGame: (nameX, nameO, timeSecs) =>
        set({
          game: initGame(),
          playerX: nameX,
          playerO: nameO,
          chatMessages: [],
          gameWinner: null,
          isActive: true,
          timeX: timeSecs ?? 300,
          timeO: timeSecs ?? 300,
          initialTime: timeSecs ?? 300,
          aiAgentId: null,
          botSide: null,
          mode: 'local',
        }),

      startAiGame: (nameX, agentId, timeSecs) =>
        set({
          game: initGame(),
          playerX: nameX,
          playerO: 'Flattie',
          chatMessages: [],
          gameWinner: null,
          isActive: true,
          timeX: timeSecs,
          timeO: timeSecs,
          initialTime: timeSecs,
          aiAgentId: agentId,
          botSide: 'O',
          mode: 'ai',
        }),

      startOnlineGame: (nameX, nameO, timeSecs) =>
        set({
          game: initGame(),
          playerX: nameX,
          playerO: nameO,
          chatMessages: [],
          gameWinner: null,
          isActive: true,
          timeX: timeSecs ?? 300,
          timeO: timeSecs ?? 300,
          initialTime: timeSecs ?? 300,
          aiAgentId: null,
          botSide: null,
          mode: 'online',
        }),

      startAgentGame: (nameX, agentName, timeSecs) =>
        set({
          game: initGame(),
          playerX: nameX,
          playerO: agentName,
          chatMessages: [],
          gameWinner: null,
          isActive: true,
          timeX: timeSecs ?? 300,
          timeO: timeSecs ?? 300,
          initialTime: timeSecs ?? 300,
          aiAgentId: null,
          botSide: 'O',
          mode: 'custom_agent',
        }),

      tickTimer: () => {
        const { game, initialTime, gameWinner } = get();
        if (gameWinner !== null) return;
        if (initialTime === 9999) return;
        if (game.turn === 'X') {
          const newTime = Math.max(0, get().timeX - 1);
          set({ timeX: newTime });
          if (newTime === 0) set({ gameWinner: 'O', isActive: false });
        } else {
          const newTime = Math.max(0, get().timeO - 1);
          set({ timeO: newTime });
          if (newTime === 0) set({ gameWinner: 'X', isActive: false });
        }
      },
    }),
    { name: 'GameStore' }
  )
);
