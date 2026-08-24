import type {
  PythonAgentInfo,
  PythonAgentMove,
  PythonGameStatePayload,
} from '@/types/agent.types';
import { getLocalTransport } from '@/services/transport/localTransport';

/**
 * Wraps the IPC commands for Python agent subprocess management.
 * Components and stores must never call IPC directly — go through here.
 */
export const pythonAgentService = {
  /** Returns all `.py` agents discovered in `~/.tricki/agents/`. */
  listAgents(): Promise<PythonAgentInfo[]> {
    return getLocalTransport().invoke<PythonAgentInfo[]>('list_python_agents');
  },

  /**
   * Spawns a Python agent subprocess for the file at `agentPath`.
   * Returns an opaque session ID used in subsequent calls.
   */
  startSession(agentPath: string): Promise<string> {
    return getLocalTransport().invoke<string>('start_python_agent_session', { agentPath });
  },

  /**
   * Sends `gameState` to the Python agent identified by `sessionId`.
   * The backend enforces a hard timeout.
   */
  makeMove(
    sessionId: string,
    gameState: PythonGameStatePayload,
  ): Promise<PythonAgentMove> {
    return getLocalTransport().invoke<PythonAgentMove>('python_agent_make_move', { sessionId, gameState });
  },

  /**
   * Terminates the Python agent subprocess and removes the session.
   * Call this when the game ends or the user leaves the page.
   */
  endSession(sessionId: string): Promise<void> {
    return getLocalTransport().invoke<void>('end_python_agent_session', { sessionId });
  },

  /**
   * Copies the bundled agent template to `~/.tricki/agents/agent-template.py`.
   * Returns the absolute path to the written file.
   */
  copyTemplate(): Promise<string> {
    return getLocalTransport().invoke<string>('copy_agent_template');
  },

  /** Returns the absolute resolved path to `~/.tricki/agents/`. */
  getAgentsDir(): Promise<string> {
    return getLocalTransport().invoke<string>('get_agents_dir_path');
  },

  /** Opens `~/.tricki/agents/` in the OS file manager. */
  openAgentsFolder(): Promise<void> {
    return getLocalTransport().invoke<void>('open_agents_folder');
  },

  /** Copies a `.py` file from `sourcePath` into `~/.tricki/agents/`. */
  importAgent(sourcePath: string): Promise<PythonAgentInfo> {
    return getLocalTransport().invoke<PythonAgentInfo>('import_python_agent', { sourcePath });
  },

  /** Writes the bundled agent template to `destPath`. */
  saveTemplate(destPath: string): Promise<string> {
    return getLocalTransport().invoke<string>('save_agent_template', { destPath });
  },
};
