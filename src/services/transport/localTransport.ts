import { invoke as tauriInvoke } from '@tauri-apps/api/core';
import type { AgentMeta, AgentMove } from '@/types/agent';
import type { GameState } from '@/types/game';
import { gameEngineService } from '@/services/game-engine.service';

/**
 * Interface defining the environment-agnostic local transport (IPC vs Web).
 */
export interface ILocalTransport {
  readonly isNative: boolean;
  invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
}

/**
 * Checks whether the current runtime is inside Tauri v2 desktop environment.
 */
export function isTauri(): boolean {
  const globalObj = typeof window !== 'undefined' ? window : (globalThis as unknown as { window?: unknown })?.window;
  if (!globalObj) return false;

  const win = globalObj as unknown as {
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
  };
  return Boolean(win.__TAURI_INTERNALS__ || win.__TAURI__);
}

/**
 * Desktop Tauri IPC transport implementation.
 */
export class TauriTransport implements ILocalTransport {
  readonly isNative = true;

  async invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
    return tauriInvoke<T>(cmd, args);
  }
}

/**
 * Web browser fallback transport implementation.
 */
export class WebTransport implements ILocalTransport {
  readonly isNative = false;

  private static readonly WEB_BUILTIN_AGENTS: AgentMeta[] = [
    {
      id: 'builtin.random.easy',
      name: 'Novice (Web)',
      version: '1.0.0',
      author: 'Tricki Web Engine',
      difficulty: 'easy',
      description: 'Fast agent with random legal moves.',
    },
    {
      id: 'builtin.heuristic.medium',
      name: 'Strategist (Web)',
      version: '1.0.0',
      author: 'Tricki Web Engine',
      difficulty: 'medium',
      description: 'Tactical agent prioritizing sub-board captures and blocks.',
    },
  ];

  async invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
    switch (cmd) {
      case 'list_agents':
        return WebTransport.WEB_BUILTIN_AGENTS as T;

      case 'start_agent_session': {
        const id = `web-session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        return id as T;
      }

      case 'request_move': {
        const gameState = args?.gameState as GameState | undefined;
        if (!gameState) {
          throw new Error('WebTransport: request_move missing gameState argument');
        }
        const move = this.computeWebAgentMove(gameState);
        // Small artificial thinking time for realistic UX
        await new Promise((r) => setTimeout(r, 100));
        return move as T;
      }

      case 'stop_agent_session':
        return undefined as T;

      case 'list_python_agents':
        return [] as T;

      case 'start_python_agent_session':
        throw new Error('Python developer agents require the desktop application.');

      case 'python_agent_make_move':
        throw new Error('Python agents cannot be run in the browser.');

      case 'end_python_agent_session':
        return undefined as T;

      case 'copy_agent_template':
        return 'agent-template.py' as T;

      case 'get_agents_dir_path':
        return 'browser://local-storage/agents' as T;

      case 'open_agents_folder':
        return undefined as T;

      case 'import_python_agent':
        throw new Error('Importing agent files requires the desktop application.');

      case 'save_agent_template':
        return ((args?.destPath as string) || 'agent-template.py') as T;

      default:
        console.warn(`[WebTransport] Unhandled command "${cmd}" in web mode`);
        return undefined as T;
    }
  }

  private computeWebAgentMove(game: GameState): AgentMove {
    const legalMoves = gameEngineService.getLegalMoves(game);
    if (legalMoves.length === 0) {
      return { sb: 0, cell: 0 };
    }

    // Check if any move immediately wins a sub-board
    for (const move of legalMoves) {
      const res = gameEngineService.applyMove(game, move.sb, move.cell);
      if (res.isValid && res.nextState.sb[move.sb].winner === game.turn) {
        return move;
      }
    }

    // Default: select randomly among legal moves
    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    return legalMoves[randomIndex];
  }
}

let transportSingleton: ILocalTransport | null = null;

/**
 * Returns the active local transport instance depending on the execution environment.
 */
export function getLocalTransport(): ILocalTransport {
  if (!transportSingleton) {
    transportSingleton = isTauri() ? new TauriTransport() : new WebTransport();
  }
  return transportSingleton;
}

/**
 * Allows overriding or resetting the transport singleton (primarily for testing).
 */
export function setLocalTransport(transport: ILocalTransport | null): void {
  transportSingleton = transport;
}
