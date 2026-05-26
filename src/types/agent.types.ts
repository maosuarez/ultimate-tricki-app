// Python agent types — mirrors src-tauri/src/agents/loader.rs + executor.rs.
// Kept separate from agent.ts which covers the built-in Rust agent contract.

export interface PythonAgentInfo {
  /** Agent name: filename without the `.py` extension. */
  name: string;
  /** Absolute path to the `.py` file. */
  path: string;
  /** Filename with extension, e.g. `my_agent.py`. */
  filename: string;
}

/** Game state sent to the Python agent subprocess. */
export interface PythonGameStatePayload {
  board: number[][];
  activeSubboard: [number, number] | null;
  /** 1 = X, -1 = O */
  player: 1 | -1;
  validMoves: [number, number][];
}

/** Move returned by the Python agent subprocess. */
export interface PythonAgentMove {
  macroRow: number;
  macroCol: number;
}

/** Client-side record of an active Python agent session. */
export interface PythonAgentSession {
  sessionId: string;
  agentName: string;
  startedAt: string;
}
