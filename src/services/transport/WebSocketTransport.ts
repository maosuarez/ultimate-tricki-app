import type { GameEvent, IGameTransport } from './IGameTransport';

const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];

export class WebSocketTransport implements IGameTransport {
  private ws: WebSocket | null = null;
  private handlers: Set<(event: GameEvent) => void> = new Set();
  private roomId = '';
  private retryCount = 0;

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async connect(roomId: string): Promise<void> {
    this.roomId = roomId;
    this.retryCount = 0;
    return this.openSocket();
  }

  disconnect(): void {
    this.retryCount = MAX_RETRIES; // Prevent auto-reconnect
    this.ws?.close();
    this.ws = null;
  }

  sendMove(sb: number, cell: number): void {
    this.send(JSON.stringify({ type: 'move', sb, cell }));
  }

  sendChat(text: string): void {
    this.send(JSON.stringify({ type: 'chat', text }));
  }

  onEvent(handler: (event: GameEvent) => void): void {
    this.handlers.add(handler);
  }

  offEvent(handler: (event: GameEvent) => void): void {
    this.handlers.delete(handler);
  }

  private send(data: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  private openSocket(): Promise<void> {
    const host = import.meta.env.VITE_WS_HOST as string;
    const url = `wss://${host}/ws/room/${this.roomId}`;

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      this.ws = socket;

      socket.onopen = () => {
        this.retryCount = 0;
        resolve();
      };

      socket.onerror = () => {
        reject(new Error(`WebSocket connection failed for room ${this.roomId}`));
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data as string) as GameEvent;
          this.handlers.forEach((h) => h(parsed));
        } catch {
          // Ignore malformed messages
        }
      };

      socket.onclose = () => {
        if (this.retryCount < MAX_RETRIES) {
          const delay = BACKOFF_MS[this.retryCount] ?? 4000;
          this.retryCount++;
          setTimeout(() => {
            this.openSocket().catch(() => {
              // Reconnect attempt failed silently after max retries
            });
          }, delay);
        }
      };
    });
  }
}
