use std::time::Duration;

use tauri::State;

use crate::game::types::{GameState, Move};

use super::contract::AgentMeta;
use super::registry::AgentRegistry;

// ─── Tauri IPC commands ───────────────────────────────────────────────────────
//
// These four functions are the stable public contract between React and the
// agent engine. Their signatures MUST NOT change — only implementations evolve.

/// Returns the metadata of all available agents.
#[tauri::command]
pub fn list_agents(registry: State<'_, AgentRegistry>) -> Vec<AgentMeta> {
    registry.list_agents()
}

/// Creates an agent session for `agent_id`. Returns an opaque session ID.
#[tauri::command]
pub fn start_agent_session(
    agent_id: String,
    registry: State<'_, AgentRegistry>,
) -> Result<String, String> {
    registry
        .start_session(&agent_id)
        .map_err(|e| e.to_string())
}

/// Asks the agent for `session_id` to pick a move for `game_state`.
/// `deadline_ms` is a soft budget — the engine enforces a hard timeout on top.
#[tauri::command]
pub fn request_move(
    session_id: String,
    game_state: GameState,
    deadline_ms: Option<u64>,
    registry: State<'_, AgentRegistry>,
) -> Result<Move, String> {
    let deadline = Duration::from_millis(deadline_ms.unwrap_or(2_000));
    registry
        .request_move(&session_id, &game_state, deadline)
        .map_err(|e| e.to_string())
}

/// Ends the session and frees the agent's resources.
#[tauri::command]
pub fn stop_agent_session(session_id: String, registry: State<'_, AgentRegistry>) {
    registry.stop_session(&session_id);
}
