/// Flat Value Monte Carlo agent (FVMC).
///
/// Policy: for each legal move, run N independent random rollouts from the
/// resulting position and score the move by its simulated win rate.
/// Select the highest-scoring move.
///
/// This gives the agent genuine strategic awareness (it evaluates outcomes)
/// while keeping it beatable — the low simulation budget means it misses
/// multi-step combinations. Appropriate for "easy" difficulty.
use std::time::Duration;

use rand::Rng;

use crate::game::{
    rules::{apply_move, game_result, legal_moves},
    types::{GameState, Move, Player, SubBoardResult},
};

use super::contract::{Agent, AgentError, AgentMeta, Difficulty};

// ─── Constants ────────────────────────────────────────────────────────────────

/// Simulations per candidate move for the easy level.
/// Low budget → readable mistakes; non-zero → tactical awareness.
const SIMS_PER_MOVE_EASY: u32 = 50;

/// Safety cap on rollout depth (81 = max moves in a full UTTT game).
const MAX_ROLLOUT_DEPTH: u32 = 81;

// ─── Agent ───────────────────────────────────────────────────────────────────

pub struct FlatMcAgent {
    meta: AgentMeta,
    sims_per_move: u32,
}

impl FlatMcAgent {
    pub fn easy() -> Self {
        Self {
            meta: AgentMeta {
                id: "builtin.flat_mc.easy".into(),
                name: "Flattie".into(),
                version: env!("CARGO_PKG_VERSION").into(),
                author: "Tricki Core".into(),
                difficulty: Difficulty::Easy,
                description:
                    "Uses Flat Monte Carlo to evaluate moves. Thinks a little, plays imperfectly."
                        .into(),
            },
            sims_per_move: SIMS_PER_MOVE_EASY,
        }
    }
}

impl Agent for FlatMcAgent {
    fn meta(&self) -> &AgentMeta {
        &self.meta
    }

    fn next_move(&mut self, state: &GameState, _deadline: Duration) -> Result<Move, AgentError> {
        let moves = legal_moves(state);
        if moves.is_empty() {
            return Err(AgentError::NoLegalMoves);
        }

        let bot = state.turn;
        let mut rng = rand::thread_rng();
        let mut best_move = moves[0];
        let mut best_score = f32::NEG_INFINITY;

        for &mv in &moves {
            let after = apply_move(state, mv);
            let score = evaluate(&after, bot, self.sims_per_move, &mut rng);
            if score > best_score {
                best_score = score;
                best_move = mv;
            }
        }

        Ok(best_move)
    }
}

// ─── Core FVMC logic ─────────────────────────────────────────────────────────

/// Estimates the value of `state` for `player` by running `n` random rollouts.
/// Returns a score in [0.0, 1.0]: 1.0 = all wins, 0.5 = all draws, 0.0 = all losses.
fn evaluate(state: &GameState, player: Player, n: u32, rng: &mut impl Rng) -> f32 {
    let mut total_score = 0.0_f32;

    for _ in 0..n {
        total_score += rollout(state, player, rng);
    }

    total_score / n as f32
}

/// Plays a single random game from `state` to a terminal and returns the score
/// from `player`'s perspective: 1.0 = win, 0.5 = draw, 0.0 = loss.
fn rollout(state: &GameState, player: Player, rng: &mut impl Rng) -> f32 {
    let mut state = state.clone();

    for _ in 0..MAX_ROLLOUT_DEPTH {
        match game_result(&state) {
            Some(result) => return score_result(result, player),
            None => {
                let moves = legal_moves(&state);
                if moves.is_empty() {
                    return 0.5; // unexpected draw
                }
                let idx = rng.gen_range(0..moves.len());
                state = apply_move(&state, moves[idx]);
            }
        }
    }

    // Reached depth cap without terminal — treat as draw
    0.5
}

fn score_result(result: SubBoardResult, player: Player) -> f32 {
    match result {
        SubBoardResult::X if player == Player::X => 1.0,
        SubBoardResult::O if player == Player::O => 1.0,
        SubBoardResult::Draw => 0.5,
        _ => 0.0,
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::types::SubBoardState;

    fn empty_state() -> GameState {
        GameState {
            sb: (0..9)
                .map(|_| SubBoardState {
                    cells: vec![None; 9],
                    winner: None,
                    win_line: None,
                })
                .collect(),
            turn: Player::X,
            active_sb: None,
            last_move: None,
            history: vec![],
        }
    }

    #[test]
    fn returns_a_legal_move_from_start() {
        let mut agent = FlatMcAgent::easy();
        let state = empty_state();
        let mv = agent.next_move(&state, Duration::from_secs(2)).unwrap();
        assert!(mv.sb < 9 && mv.cell < 9);
    }

    #[test]
    fn plays_in_active_sub_board() {
        let mut state = empty_state();
        state.sb[0].cells[0] = Some(Player::X);
        state.sb[0].cells[1] = Some(Player::X);
        state.active_sb = Some(0);

        let mut agent = FlatMcAgent::easy();
        let mv = agent.next_move(&state, Duration::from_secs(2)).unwrap();

        // Must respect the active sub-board constraint.
        assert_eq!(mv.sb, 0);
        assert!(state.sb[0].cells[mv.cell].is_none(), "must pick an empty cell");
    }

    #[test]
    fn wins_sub_board_when_only_one_move_left() {
        // Only cell 2 remains in sub-board 0; the agent must play it.
        let mut state = empty_state();
        for i in 0..9 {
            if i != 2 {
                state.sb[0].cells[i] = Some(if i % 2 == 0 { Player::O } else { Player::X });
            }
        }
        state.active_sb = Some(0);

        let mut agent = FlatMcAgent::easy();
        let mv = agent.next_move(&state, Duration::from_secs(2)).unwrap();

        assert_eq!(mv.sb, 0);
        assert_eq!(mv.cell, 2);
    }
}
