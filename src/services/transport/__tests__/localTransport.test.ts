import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getLocalTransport,
  setLocalTransport,
  isTauri,
  TauriTransport,
  WebTransport,
} from '../localTransport';
import type { GameState } from '@/types/game';
import { gameEngineService } from '@/services/game-engine.service';

type TauriMockWindow = {
  __TAURI_INTERNALS__?: unknown;
  __TAURI__?: unknown;
};

const getMockWindow = (): TauriMockWindow => {
  const g = globalThis as unknown as { window?: TauriMockWindow };
  if (!g.window) {
    g.window = {};
  }
  return g.window;
};

describe('localTransport (IPC / Web Environment Abstraction)', () => {
  beforeEach(() => {
    setLocalTransport(null);
    const win = getMockWindow();
    delete win.__TAURI_INTERNALS__;
    delete win.__TAURI__;
  });

  afterEach(() => {
    setLocalTransport(null);
    const win = getMockWindow();
    delete win.__TAURI_INTERNALS__;
    delete win.__TAURI__;
    vi.restoreAllMocks();
  });

  describe('isTauri()', () => {
    it('should return false in standard browser environment', () => {
      expect(isTauri()).toBe(false);
    });

    it('should return true when window.__TAURI_INTERNALS__ is present', () => {
      const win = getMockWindow();
      win.__TAURI_INTERNALS__ = {};
      expect(isTauri()).toBe(true);
    });

    it('should return true when window.__TAURI__ is present', () => {
      const win = getMockWindow();
      win.__TAURI__ = {};
      expect(isTauri()).toBe(true);
    });
  });

  describe('getLocalTransport() factory', () => {
    it('should instantiate WebTransport when not in Tauri environment', () => {
      const transport = getLocalTransport();
      expect(transport).toBeInstanceOf(WebTransport);
      expect(transport.isNative).toBe(false);
    });

    it('should instantiate TauriTransport when in Tauri environment', () => {
      const win = getMockWindow();
      win.__TAURI_INTERNALS__ = {};

      const transport = getLocalTransport();
      expect(transport).toBeInstanceOf(TauriTransport);
      expect(transport.isNative).toBe(true);
    });

    it('should return the same singleton instance on consecutive calls', () => {
      const t1 = getLocalTransport();
      const t2 = getLocalTransport();
      expect(t1).toBe(t2);
    });
  });

  describe('WebTransport', () => {
    const webTransport = new WebTransport();

    it('should list available web AI agents on list_agents', async () => {
      const agents = await webTransport.invoke<unknown[]>('list_agents');
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThan(0);
    });

    it('should generate a valid session ID on start_agent_session', async () => {
      const sessionId = await webTransport.invoke<string>('start_agent_session', {
        agentId: 'builtin.random.easy',
      });
      expect(typeof sessionId).toBe('string');
      expect(sessionId.startsWith('web-session-')).toBe(true);
    });

    it('should calculate a valid legal move on request_move', async () => {
      const initialGame: GameState = gameEngineService.initGame();
      const move = await webTransport.invoke<{ sb: number; cell: number }>('request_move', {
        sessionId: 'test-session',
        gameState: initialGame,
      });

      expect(move).toBeDefined();
      expect(move.sb).toBeGreaterThanOrEqual(0);
      expect(move.sb).toBeLessThanOrEqual(8);
      expect(move.cell).toBeGreaterThanOrEqual(0);
      expect(move.cell).toBeLessThanOrEqual(8);
    });

    it('should return an empty array for list_python_agents in web mode', async () => {
      const pythonAgents = await webTransport.invoke<unknown[]>('list_python_agents');
      expect(pythonAgents).toEqual([]);
    });

    it('should throw a descriptive error when trying to start Python agents on web', async () => {
      await expect(
        webTransport.invoke('start_python_agent_session', { agentPath: '/test/agent.py' }),
      ).rejects.toThrow(/desktop/i);
    });
  });
});
