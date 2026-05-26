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

  /**
   * Copies the bundled agent template to `~/.tricki/agents/agent-template.py`.
   * Returns the absolute path to the written file.
   */
  copyTemplate(): Promise<string> {
    return invoke('copy_agent_template');
  },

  /** Returns the absolute resolved path to `~/.tricki/agents/`. */
  getAgentsDir(): Promise<string> {
    return invoke('get_agents_dir_path');
  },

  /** Opens `~/.tricki/agents/` in the OS file manager. */
  openAgentsFolder(): Promise<void> {
    return invoke('open_agents_folder');
  },

  /** Copies a `.py` file from `sourcePath` into `~/.tricki/agents/`. */
  importAgent(sourcePath: string): Promise<PythonAgentInfo> {
    return invoke('import_python_agent', { sourcePath });
  },

  /** Writes the bundled agent template to `destPath`. */
  saveTemplate(destPath: string): Promise<string> {
    return invoke('save_agent_template', { destPath });
  },
};
