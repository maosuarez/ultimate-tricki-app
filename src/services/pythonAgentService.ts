import { invoke } from '@tauri-apps/api/core';

import type {
  PythonAgentInfo,
  PythonAgentMove,
  PythonGameStatePayload,
} from '../types/agent.types';

/**
 * Wraps the four Tauri IPC commands for Python agent subprocess management.
 * Components and stores must never call `invoke` directly — go through here.
 */
export const pythonAgentService = {
  /** Returns all `.py` agents discovered in `~/.tricki/agents/`. */
  listAgents(): Promise<PythonAgentInfo[]> {
    return invoke('list_python_agents');
  },

  /**
   * Spawns a Python agent subprocess for the file at `agentPath`.
   * Returns an opaque session ID used in subsequent calls.
   */
  startSession(agentPath: string): Promise<string> {
    return invoke('start_python_agent_session', { agentPath });
  },

  /**
   * Sends `gameState` to the Python agent identified by `sessionId`.
   * The Rust side enforces a hard 5-second timeout.
   */
  makeMove(
    sessionId: string,
    gameState: PythonGameStatePayload,
  ): Promise<PythonAgentMove> {
    return invoke('python_agent_make_move', { sessionId, gameState });
  },

  /**
   * Terminates the Python agent subprocess and removes the session.
   * Call this when the game ends or the user leaves the page.
   */
  endSession(sessionId: string): Promise<void> {
    return invoke('end_python_agent_session', { sessionId });
  },
};
