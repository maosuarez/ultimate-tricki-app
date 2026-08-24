import type { Player } from '../../types/game';
import type { GameEvent, IGameTransport } from './IGameTransport';

export class LocalTransport implements IGameTransport {
  private handlers: Set<(event: GameEvent) => void> = new Set();
  private currentPlayer: Player = 'X';

  readonly isConnected = true;

  async connect(_roomId: string): Promise<void> {
    // Local mode: resolves immediately, no network needed
  }

  disconnect(): void {
    this.handlers.clear();
  }

  sendMove(sb: number, cell: number): void {
    const player = this.currentPlayer;
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    const event: GameEvent = { type: 'move', payload: { sb, cell, player } };
    this.emit(event);
  }

  sendChat(text: string): void {
    const event: GameEvent = {
      type: 'chat',
      payload: { who: 'Tú', text, timestamp: new Date().toLocaleTimeString() },
    };
    this.emit(event);
  }

  onEvent(handler: (event: GameEvent) => void): void {
    this.handlers.add(handler);
  }

  offEvent(handler: (event: GameEvent) => void): void {
    this.handlers.delete(handler);
  }

  private emit(event: GameEvent): void {
    this.handlers.forEach((h) => h(event));
  }
}
