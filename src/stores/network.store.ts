import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ConnectionStatus, GamePhase, RoomPlayer } from '@/types/network.types';
import type { Player } from '@/types/game';
import { wsService } from '@/services/wsService';
import { supabaseService } from '@/services/supabase.service';

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

      createRoom: (playerName, isPublic = false, hostElo = 0, timeControl = 'blitz') => {
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

        void (async () => {
          try {
            await wsService.connect(playerName);
            wsService.joinGroup(code);
            wsService.send({ type: 'host_joined', name: playerName, side: 'X' });
            if (isPublic) {
              await supabaseService.rooms.create({
                code,
                hostName: playerName,
                hostElo,
                timeControl,
              });
            }
          } catch (err) {
            console.error('[WS] createRoom failed:', err);
            set({ status: 'error' });
          }
        })();

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

        void (async () => {
          try {
            await wsService.connect(playerName);
            wsService.joinGroup(code);
            wsService.send({ type: 'player_joined', name: playerName });
          } catch (err) {
            console.error('[WS] joinRoom failed:', err);
            set({ status: 'error' });
          }
        })();
      },

      sendReady: (ready) => {
        const { myName } = get();
        wsService.send({ type: 'ready', name: myName, ready });
        set((s) => ({
          players: s.players.map(p => p.name === myName ? { ...p, ready } : p),
        }));
      },

      sendStartGame: () => wsService.send({ type: 'game_started' }),

      cleanupRoom: () => {
        const { roomCode, isHost } = get();
        if (isHost && roomCode) {
          void supabaseService.rooms.delete(roomCode).catch((err) => {
            console.warn('[Supabase] cleanupRoom failed:', err);
          });
        }
      },

      sendMove: (sb, cell) => wsService.send({ type: 'move', sb, cell }),

      sendChat: (text) => {
        const { myName } = get();
        const t = nowTime();
        wsService.send({ type: 'chat', from: myName, text, t });
        set((s) => ({
          chatItems: [...s.chatItems, { from: myName, text, t, kind: 'msg' }],
        }));
      },

      reset: () => {
        wsService.disconnect();
        set(INITIAL);
      },
    }),
    { name: 'NetworkStore' }
  )
);
