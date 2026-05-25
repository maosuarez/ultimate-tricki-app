// ─── Agent contract types (mirrors src-tauri/src/agents/contract.rs) ──────────
//
// These types define the stable interface between React and the Rust agent
// engine. They are the TypeScript side of the IPC boundary — do not rename
// fields without updating the Rust serde definitions in parallel.

export type AgentDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Static descriptor for an agent. Returned by `list_agents`.
 * An agent's id uniquely identifies it across sessions.
 *
 * Built-in id format: `builtin.<algorithm>.<difficulty>`
 * External id format: `<scope>.<name>.<difficulty>`
 */
export interface AgentMeta {
  id: string;
  name: string;
  version: string;
  author: string;
  difficulty: AgentDifficulty;
  description: string;
}

/**
 * A move chosen by an agent. Same shape as a player move — the game
 * engine treats them identically after legality validation.
 */
export interface AgentMove {
  sb: number;
  cell: number;
}
