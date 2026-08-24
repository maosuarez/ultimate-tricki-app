import type { GameMsg } from '@/types/network.types';

const HUB = 'tricki';

// ── Connection string helpers ─────────────────────────────────────────────────

function parseConnectionString(cs: string): { endpoint: string; accessKey: string } {
  const parts: Record<string, string> = {};
  for (const segment of cs.split(';')) {
    const eq = segment.indexOf('=');
    if (eq < 0) continue;
    parts[segment.slice(0, eq).trim()] = segment.slice(eq + 1).trim();
  }
  return {
    endpoint: (parts['Endpoint'] ?? '').replace(/\/$/, ''),
    accessKey: parts['AccessKey'] ?? '',
  };
}

function b64url(input: string): string {
  return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function buildClientAccessUrl(endpoint: string, accessKey: string, userId: string): Promise<string> {
  const audience = `${endpoint}/client/hubs/${HUB}`;
  const now = Math.floor(Date.now() / 1000);

  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    aud: audience,
    iat: now,
    exp: now + 3600,
    sub: userId,
    role: ['webpubsub.joinLeaveGroup', 'webpubsub.sendToGroup'],
  }));

  const sigInput = new TextEncoder().encode(`${header}.${payload}`);
  const keyData = new TextEncoder().encode(accessKey);
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBytes = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, sigInput));
  const signature = b64url(String.fromCharCode(...sigBytes));

  const token = `${header}.${payload}.${signature}`;
  return `${audience.replace('https://', 'wss://')}?access_token=${token}`;
}

// ── Web PubSub envelope types ─────────────────────────────────────────────────

interface WpsGroupMessage {
  type: 'message';
  from: 'group';
  group: string;
  fromUserId: string;
  dataType: 'json';
  data: GameMsg;
}

// ── Service class ─────────────────────────────────────────────────────────────

type MsgHandler = (msg: GameMsg) => void;
type StatusHandler = (s: 'connected' | 'disconnected' | 'error') => void;

class WsService {
  private ws: WebSocket | null = null;
  private currentGroup: string | null = null;
  private myUserId = '';
  private ackId = 0;
  private msgHandlers = new Set<MsgHandler>();
  private statusHandlers = new Set<StatusHandler>();

  async connect(userId: string): Promise<void> {
    this.disconnect();

    const cs = (import.meta.env.VITE_WS_HOST as string) ?? '';
    const { endpoint, accessKey } = parseConnectionString(cs);
    if (!endpoint || !accessKey) throw new Error('VITE_WS_HOST connection string is missing or invalid');

    const url = await buildClientAccessUrl(endpoint, accessKey, userId);
    this.myUserId = userId;

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url, 'json.webpubsub.azure.v1');
      this.ws = ws;

      ws.onopen = () => {
        this.statusHandlers.forEach(h => h('connected'));
        resolve();
      };

      ws.onmessage = (ev) => {
        try {
          const envelope = JSON.parse(ev.data as string) as Record<string, unknown>;
          if (envelope['type'] === 'message' && envelope['from'] === 'group') {
            const msg = envelope as unknown as WpsGroupMessage;
            if (msg.fromUserId === this.myUserId) return; // filter own echo
            this.msgHandlers.forEach(h => h(msg.data));
          }
        } catch {
          // malformed message — ignore
        }
      };

      ws.onerror = () => {
        this.statusHandlers.forEach(h => h('error'));
        reject(new Error('WebSocket connection error'));
      };

      ws.onclose = () => this.statusHandlers.forEach(h => h('disconnected'));
    });
  }

  joinGroup(group: string): void {
    this.currentGroup = group;
    this.ws?.send(JSON.stringify({ type: 'joinGroup', group, ackId: ++this.ackId }));
  }

  send(msg: GameMsg): void {
    if (!this.currentGroup || this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      type: 'sendToGroup',
      group: this.currentGroup,
      ackId: ++this.ackId,
      dataType: 'json',
      data: msg,
    }));
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.currentGroup = null;
  }

  onMessage(h: MsgHandler): () => void {
    this.msgHandlers.add(h);
    return () => this.msgHandlers.delete(h);
  }

  onStatus(h: StatusHandler): () => void {
    this.statusHandlers.add(h);
    return () => this.statusHandlers.delete(h);
  }
}

export const wsService = new WsService();
