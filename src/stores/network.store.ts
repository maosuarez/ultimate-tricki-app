import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ConnectionStatus, GamePhase, RoomPlayer } from '@/types/network.types';
import type { Player } from '@/types/game';

function generateCode(): string {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = () => c[Math.floor(Math.random() * c.length)];
  return `${r()}${r()}${r()}-${r()}${r()}${r()}`;
}

function nowTime(): string {
  return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export interface ChatItem {
  from: string;
  text: string;
  t: string;
  kind: 'msg' | 'sys';
}

interface NetworkStore {
  status: ConnectionStatus;
  roomCode: string | null;
  mySide: Player | null;
  myName: string;
  isHost: boolean;
  players: RoomPlayer[];
  phase: GamePhase;
  chatItems: ChatItem[];
  pendingRemoteMove: { sb: number; cell: number } | null;

  // Internal setters (used by useOnlineGame hook)
  setStatus: (status: ConnectionStatus) => void;
  setPlayers: (players: RoomPlayer[]) => void;
  addPlayer: (player: RoomPlayer) => void;
  setPlayerReady: (name: string, ready: boolean) => void;
  setPhase: (phase: GamePhase) => void;
  addChatItem: (from: string, text: string, t: string, kind?: 'msg' | 'sys') => void;
  setPendingRemoteMove: (move: { sb: number; cell: number } | null) => void;

  // Outgoing actions
  createRoom: (playerName: string, isPublic?: boolean, hostElo?: number, timeControl?: string) => string;
  joinRoom: (code: string, playerName: string) => void;
  sendReady: (ready: boolean) => void;
  sendStartGame: () => void;
  sendMove: (sb: number, cell: number) => void;
  sendChat: (text: string) => void;
  cleanupRoom: () => void;
  reset: () => void;
}

const INITIAL = {
  status: 'idle' as ConnectionStatus,
  roomCode: null as string | null,
  mySide: null as Player | null,
  myName: '',
  isHost: false,
  players: [] as RoomPlayer[],
  phase: 'lobby' as GamePhase,
  chatItems: [] as ChatItem[],
  pendingRemoteMove: null as { sb: number; cell: number } | null,
};

export const useNetworkStore = create<NetworkStore>()(
  devtools(
    (set, get) => ({
      ...INITIAL,

      setStatus: (status) => set({ status }),
      setPlayers: (players) => set({ players }),
      addPlayer: (player) => set((s) => ({ players: [...s.players, player] })),
      setPlayerReady: (name, ready) => set((s) => ({
        players: s.players.map(p => p.name === name ? { ...p, ready } : p),
      })),
      setPhase: (phase) => set({ phase }),
      addChatItem: (from, text, t, kind = 'msg') => set((s) => ({
        chatItems: [...s.chatItems, { from, text, t, kind }],
      })),
      setPendingRemoteMove: (move) => set({ pendingRemoteMove: move }),

      createRoom: (playerName, _isPublic = false, hostElo = 0, _timeControl = 'blitz') => {
        const code = generateCode();
        const hostPlayer: import('@/types/network.types').RoomPlayer = {
          name: playerName, side: 'X', isHost: true, ready: false, elo: hostElo, ping: 0,
        };
        set({
          ...INITIAL,
          myName: playerName,
          mySide: 'X',
          isHost: true,
          status: 'connecting',
          roomCode: code,
          players: [hostPlayer],
        });
        return code;
      },

      joinRoom: (code, playerName) => {
        set({
          ...INITIAL,
          myName: playerName,
          mySide: 'O',
          isHost: false,
          status: 'connecting',
          roomCode: code,
        });
      },

      sendReady: (ready) => {
        const { myName } = get();
        set((s) => ({
          players: s.players.map(p => p.name === myName ? { ...p, ready } : p),
        }));
      },

      sendStartGame: () => {},

      cleanupRoom: () => {},

      sendMove: (_sb, _cell) => {},

      sendChat: (text) => {
        const { myName } = get();
        const t = nowTime();
        set((s) => ({
          chatItems: [...s.chatItems, { from: myName, text, t, kind: 'msg' }],
        }));
      },

      reset: () => {
        set(INITIAL);
      },
    }),
    { name: 'NetworkStore' }
  )
);
