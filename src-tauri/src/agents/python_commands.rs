use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Duration;

use tauri::State;
use uuid::Uuid;

use super::executor::{AgentMove, AgentProcess, GameStatePayload};
use super::loader::PythonAgentInfo;

// ─── Registry ─────────────────────────────────────────────────────────────────

/// Application-wide registry of active Python agent subprocesses.
/// Stored in Tauri's managed state.
pub struct PythonAgentRegistry {
    sessions: Mutex<HashMap<String, AgentProcess>>,
}

impl PythonAgentRegistry {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
        }
    }
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/// Returns all `.py` files found in `~/.tricki/agents/`.
/// Creates the directory if it does not exist.
#[tauri::command]
pub fn list_python_agents() -> Result<Vec<PythonAgentInfo>, String> {
    super::loader::list_agents()
}

/// Spawns a Python agent subprocess for the file at `agent_path`.
/// Returns an opaque session ID to be used in subsequent calls.
#[tauri::command]
pub fn start_python_agent_session(
    agent_path: String,
    registry: State<'_, PythonAgentRegistry>,
) -> Result<String, String> {
    let process =
        AgentProcess::spawn(&agent_path).map_err(|e| e.to_string())?;

    let session_id = Uuid::new_v4().to_string();
    registry
        .sessions
        .lock()
        .unwrap()
        .insert(session_id.clone(), process);

    Ok(session_id)
}

/// Sends `game_state` to the Python agent identified by `session_id`.
/// Enforces a hard 5-second timeout; returns an error on timeout or bad response.
#[tauri::command]
pub fn python_agent_make_move(
    session_id: String,
    game_state: GameStatePayload,
    registry: State<'_, PythonAgentRegistry>,
) -> Result<AgentMove, String> {
    let mut sessions = registry.sessions.lock().unwrap();
    let process = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("session not found: {session_id}"))?;

    process
        .request_move(&game_state, Duration::from_secs(5))
        .map_err(|e| e.to_string())
}

/// Terminates the Python agent subprocess and removes the session.
#[tauri::command]
pub fn end_python_agent_session(
    session_id: String,
    registry: State<'_, PythonAgentRegistry>,
) -> Result<(), String> {
    let mut sessions = registry.sessions.lock().unwrap();
    if let Some(mut process) = sessions.remove(&session_id) {
        process.terminate();
    }
    Ok(())
}
