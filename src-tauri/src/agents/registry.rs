use std::collections::HashMap;
use std::sync::Mutex;

use rand::Rng;

use super::contract::{Agent, AgentError, AgentMeta};
use super::flat_mc::FlatMcAgent;

// ─── Session ID ───────────────────────────────────────────────────────────────

fn new_session_id() -> String {
    format!("s_{:016x}", rand::thread_rng().gen::<u64>())
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

/// All built-in agents available to the frontend.
/// Phase 2 will extend this list with discovered subprocess agents.
fn builtin_catalog() -> Vec<AgentMeta> {
    vec![FlatMcAgent::easy().meta().clone()]
}

fn build_agent(id: &str) -> Result<Box<dyn Agent>, AgentError> {
    match id {
        "builtin.flat_mc.easy" => Ok(Box::new(FlatMcAgent::easy())),
        _ => Err(AgentError::Internal(format!("unknown agent id: {id}"))),
    }
}

// ─── Registry ────────────────────────────────────────────────────────────────

/// Application-wide state for agent sessions.
/// Stored in Tauri's managed state; lives for the duration of the process.
pub struct AgentRegistry {
    sessions: Mutex<HashMap<String, Box<dyn Agent>>>,
}

impl AgentRegistry {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
        }
    }

    pub fn list_agents(&self) -> Vec<AgentMeta> {
        builtin_catalog()
    }

    /// Creates a new agent session. Returns the session ID.
    pub fn start_session(&self, agent_id: &str) -> Result<String, AgentError> {
        let mut agent = build_agent(agent_id)?;
        agent.init()?;

        let id = new_session_id();
        self.sessions.lock().unwrap().insert(id.clone(), agent);
        Ok(id)
    }

    /// Calls the agent for this session and returns its chosen move.
    pub fn request_move(
        &self,
        session_id: &str,
        state: &crate::game::types::GameState,
        deadline: std::time::Duration,
    ) -> Result<crate::game::types::Move, AgentError> {
        let mut sessions = self.sessions.lock().unwrap();
        let agent = sessions
            .get_mut(session_id)
            .ok_or_else(|| AgentError::Internal(format!("session not found: {session_id}")))?;

        let mv = agent.next_move(state, deadline)?;

        // Re-validate: the agent's move must be legal in the given state.
        let legal = crate::game::rules::legal_moves(state);
        if !legal.iter().any(|m| m.sb == mv.sb && m.cell == mv.cell) {
            return Err(AgentError::Internal(format!(
                "agent returned illegal move: sb={} cell={}",
                mv.sb, mv.cell
            )));
        }

        Ok(mv)
    }

    /// Removes the session, calling `on_game_end` on the agent.
    pub fn stop_session(&self, session_id: &str) {
        if let Some(mut agent) = self.sessions.lock().unwrap().remove(session_id) {
            agent.on_game_end();
        }
    }
}
