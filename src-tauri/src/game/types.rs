use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Player {
    X,
    O,
}

impl Player {
    pub fn opponent(self) -> Self {
        match self {
            Player::X => Player::O,
            Player::O => Player::X,
        }
    }
}

/// Winner of a single sub-board: X, O, draw, or still in play (None).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SubBoardResult {
    X,
    O,
    #[serde(rename = "draw")]
    Draw,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubBoardState {
    pub cells: Vec<Option<Player>>,
    pub winner: Option<SubBoardResult>,
    pub win_line: Option<Vec<usize>>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Move {
    pub sb: usize,
    pub cell: usize,
}

/// Minimal game state used by agents. Mirrors the TypeScript GameState.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameState {
    pub sb: Vec<SubBoardState>,
    pub turn: Player,
    pub active_sb: Option<usize>,
    pub last_move: Option<Move>,
    /// Not used by agents — kept for JSON round-trip compatibility.
    #[serde(default)]
    pub history: Vec<serde_json::Value>,
}
