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

/// Copies the bundled agent template to `~/.tricki/agents/agent-template.py`.
/// Returns the absolute path to the written file.
#[tauri::command]
pub fn copy_agent_template() -> Result<String, String> {
    super::loader::copy_template()
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

/// Returns the absolute path to `~/.tricki/agents/` as a string.
#[tauri::command]
pub fn get_agents_dir_path() -> Result<String, String> {
    super::loader::get_agents_dir_path()
}

/// Opens `~/.tricki/agents/` in the OS file manager.
#[tauri::command]
pub fn open_agents_folder() -> Result<(), String> {
    let dir = super::loader::get_agents_dir_path()?;

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&dir)
            .spawn()
            .map_err(|e| format!("failed to open folder: {e}"))?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&dir)
            .spawn()
            .map_err(|e| format!("failed to open folder: {e}"))?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&dir)
            .spawn()
            .map_err(|e| format!("failed to open folder: {e}"))?;
    }

    Ok(())
}

/// Copies a `.py` file from `source_path` into `~/.tricki/agents/`.
/// Returns the metadata of the imported agent.
#[tauri::command]
pub fn import_python_agent(source_path: String) -> Result<PythonAgentInfo, String> {
    super::loader::import_agent(&source_path)
}

/// Writes the bundled agent template to `dest_path` chosen by the user.
/// Returns the absolute path written.
#[tauri::command]
pub fn save_agent_template(dest_path: String) -> Result<String, String> {
    super::loader::save_template_to(&dest_path)
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
