import type { Player } from '../../types/game';

export type GameEvent =
  | { type: 'move'; payload: { sb: number; cell: number; player: Player } }
  | { type: 'chat'; payload: { who: string; text: string; timestamp: string } }
  | { type: 'game_start'; payload: { playerX: string; playerO: string } }
  | { type: 'game_end'; payload: { winner: Player | 'draw' } }
  | { type: 'ping'; payload: { ms: number } };

export interface IGameTransport {
  connect(roomId: string): Promise<void>;
  disconnect(): void;
  sendMove(sb: number, cell: number): void;
  sendChat(text: string): void;
  onEvent(handler: (event: GameEvent) => void): void;
  offEvent(handler: (event: GameEvent) => void): void;
  readonly isConnected: boolean;
}
