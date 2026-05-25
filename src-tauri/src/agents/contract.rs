use std::time::Duration;
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::game::types::{GameState, Move};

// ─── Difficulty ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Difficulty {
    Easy,
    Medium,
    Hard,
    Expert,
}

// ─── AgentMeta ────────────────────────────────────────────────────────────────

/// Static descriptor for an agent. Stable across the agent's lifetime.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMeta {
    /// Unique identifier. Format: `<scope>.<name>.<difficulty>`.
    /// Examples: `builtin.flat_mc.easy`, `community.deepbot.expert`.
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub difficulty: Difficulty,
    pub description: String,
}

// ─── AgentError ───────────────────────────────────────────────────────────────

#[allow(dead_code)]
#[derive(Debug, Error)]
pub enum AgentError {
    #[error("agent exceeded the time budget for this turn")]
    Timeout,
    #[error("no legal moves available in the given state")]
    NoLegalMoves,
    #[error("agent initialization failed: {0}")]
    InitFailed(String),
    #[error("internal agent error: {0}")]
    Internal(String),
}

// ─── Agent trait ──────────────────────────────────────────────────────────────

/// The contract every Tricki agent must satisfy.
///
/// # Implementors
///
/// - Built-in Rust agents implement this trait directly.
/// - External subprocess agents are wrapped by a `SubprocessAgent` adapter
///   that speaks JSON-RPC over stdin/stdout (Phase 2).
/// - WASM agents are wrapped by a `WasmAgent` adapter (Phase 3).
///
/// # Thread safety
///
/// `Send` is required so the agent can be stored behind a `Mutex` and
/// called from a tokio thread pool without `unsafe`.
pub trait Agent: Send {
    /// Static metadata. Never changes after construction.
    fn meta(&self) -> &AgentMeta;

    /// One-time, potentially expensive initialization (load a model, warm up
    /// tables). Called once per session, before the first `next_move`.
    /// Default: no-op.
    fn init(&mut self) -> Result<(), AgentError> {
        Ok(())
    }

    /// Select the next move given `state`.
    ///
    /// - `deadline` is a soft budget: the agent *should* return within this
    ///   window. Rust enforces a hard timeout on top; if the agent is still
    ///   running when it expires, the call returns `AgentError::Timeout`.
    /// - The returned `Move` is always re-validated by the engine against the
    ///   actual game rules before it is accepted.
    fn next_move(&mut self, state: &GameState, deadline: Duration) -> Result<Move, AgentError>;

    /// Called when the game session ends (win, loss, draw, or abandon).
    /// Default: no-op.
    fn on_game_end(&mut self) {}
}
