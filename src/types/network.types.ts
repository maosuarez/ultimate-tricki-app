import type { Player } from './game';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';
export type GamePhase = 'lobby' | 'playing' | 'ended';

export interface RoomPlayer {
  name: string;
  side: Player | null;
  ready: boolean;
  elo: number;
  ping: number;
  isHost: boolean;
}

// Messages sent between clients via Web PubSub group
export type GameMsg =
  | { type: 'host_joined'; name: string; side: Player }
  | { type: 'player_joined'; name: string }
  | { type: 'room_state'; players: RoomPlayer[] }
  | { type: 'ready'; name: string; ready: boolean }
  | { type: 'game_started' }
  | { type: 'move'; sb: number; cell: number }
  | { type: 'chat'; from: string; text: string; t: string };
