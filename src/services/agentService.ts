import { invoke } from '@tauri-apps/api/core';

import type { AgentMeta, AgentMove } from '../types/agent';
import type { GameState } from '../types/game';

/**
 * Wraps the four Tauri IPC commands that form the agent contract.
 * Components and stores must never call `invoke` directly — go through here.
 */
export const agentService = {
  /** Returns all agents available to start a session with. */
  listAgents(): Promise<AgentMeta[]> {
    return invoke('list_agents');
  },

  /**
   * Opens a session for the given agent. Returns an opaque session ID that
   * must be passed to every subsequent call for this game.
   */
  startSession(agentId: string): Promise<string> {
    return invoke('start_agent_session', { agentId });
  },

  /**
   * Asks the agent to choose a move for `gameState`.
   * `deadlineMs` is a soft budget in milliseconds (default: 2000).
   * The Rust engine enforces a hard timeout above this value.
   */
  requestMove(
    sessionId: string,
    gameState: GameState,
    deadlineMs = 2_000,
  ): Promise<AgentMove> {
    return invoke('request_move', { sessionId, gameState, deadlineMs });
  },

  /**
   * Closes the session. Call this when the game ends or the player leaves,
   * regardless of outcome — it frees the agent's resources on the Rust side.
   */
  stopSession(sessionId: string): Promise<void> {
    return invoke('stop_agent_session', { sessionId });
  },
};
