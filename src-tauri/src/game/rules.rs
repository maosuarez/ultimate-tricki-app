use super::types::{GameState, Move, Player, SubBoardResult};

const WIN_LINES: [[usize; 3]; 8] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

/// Returns the winner of a 3×3 board (cells indexed 0–8), or None if undecided.
pub fn check_board(cells: &[Option<Player>]) -> Option<SubBoardResult> {
    for &[a, b, c] in &WIN_LINES {
        if let (Some(pa), Some(pb), Some(pc)) = (cells[a], cells[b], cells[c]) {
            if pa == pb && pb == pc {
                return Some(match pa {
                    Player::X => SubBoardResult::X,
                    Player::O => SubBoardResult::O,
                });
            }
        }
    }
    if cells.iter().all(|c| c.is_some()) {
        return Some(SubBoardResult::Draw);
    }
    None
}

/// Returns the meta-board result given the 9 sub-board outcomes.
/// A drawn sub-board does not count as owned by either player.
pub fn check_meta(winners: &[Option<SubBoardResult>]) -> Option<SubBoardResult> {
    let as_cells: Vec<Option<Player>> = winners
        .iter()
        .map(|w| match w {
            Some(SubBoardResult::X) => Some(Player::X),
            Some(SubBoardResult::O) => Some(Player::O),
            _ => None,
        })
        .collect();

    for &[a, b, c] in &WIN_LINES {
        if let (Some(pa), Some(pb), Some(pc)) = (as_cells[a], as_cells[b], as_cells[c]) {
            if pa == pb && pb == pc {
                return Some(match pa {
                    Player::X => SubBoardResult::X,
                    Player::O => SubBoardResult::O,
                });
            }
        }
    }

    if winners.iter().all(|w| w.is_some()) {
        return Some(SubBoardResult::Draw);
    }

    None
}

/// Returns the current game outcome, or None if the game is still in progress.
pub fn game_result(state: &GameState) -> Option<SubBoardResult> {
    let meta: Vec<Option<SubBoardResult>> = state.sb.iter().map(|sb| sb.winner).collect();
    check_meta(&meta)
}

/// All legal moves available in the current state.
pub fn legal_moves(state: &GameState) -> Vec<Move> {
    let target_boards: Vec<usize> = match state.active_sb {
        Some(idx) if state.sb[idx].winner.is_none() => vec![idx],
        _ => (0..9).filter(|&i| state.sb[i].winner.is_none()).collect(),
    };

    target_boards
        .into_iter()
        .flat_map(|sb_idx| {
            state.sb[sb_idx]
                .cells
                .iter()
                .enumerate()
                .filter(|(_, cell)| cell.is_none())
                .map(move |(cell_idx, _)| Move { sb: sb_idx, cell: cell_idx })
        })
        .collect()
}

/// Applies a move and returns the resulting state. Does not validate legality.
pub fn apply_move(state: &GameState, mv: Move) -> GameState {
    let mut next = state.clone();

    next.sb[mv.sb].cells[mv.cell] = Some(state.turn);
    next.sb[mv.sb].winner = check_board(&next.sb[mv.sb].cells);

    // The cell index within the sub-board determines the next active sub-board.
    // If that sub-board is already decided, the player has free choice (None).
    next.active_sb = if next.sb[mv.cell].winner.is_some() {
        None
    } else {
        Some(mv.cell)
    };

    next.turn = state.turn.opponent();
    next.last_move = Some(mv);

    next
}

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
    fn check_board_detects_row_win() {
        let mut cells = vec![None; 9];
        cells[0] = Some(Player::X);
        cells[1] = Some(Player::X);
        cells[2] = Some(Player::X);
        assert_eq!(check_board(&cells), Some(SubBoardResult::X));
    }

    #[test]
    fn check_board_detects_draw() {
        let cells: Vec<Option<Player>> = vec![
            Some(Player::X), Some(Player::O), Some(Player::X),
            Some(Player::X), Some(Player::O), Some(Player::X),
            Some(Player::O), Some(Player::X), Some(Player::O),
        ];
        assert_eq!(check_board(&cells), Some(SubBoardResult::Draw));
    }

    #[test]
    fn legal_moves_free_choice_from_start() {
        let state = empty_state();
        assert_eq!(legal_moves(&state).len(), 81);
    }

    #[test]
    fn apply_move_switches_turn() {
        let state = empty_state();
        let mv = Move { sb: 0, cell: 4 };
        let next = apply_move(&state, mv);
        assert_eq!(next.turn, Player::O);
        assert_eq!(next.active_sb, Some(4));
        assert_eq!(next.sb[0].cells[4], Some(Player::X));
    }

    #[test]
    fn sent_to_won_board_gives_free_choice() {
        let mut state = empty_state();
        // Mark sub-board 4 as won so sending there gives free choice
        state.sb[4].winner = Some(SubBoardResult::X);
        // Playing in cell 4 of any sub-board sends to board 4 (won) → free choice
        let next = apply_move(&state, Move { sb: 0, cell: 4 });
        assert_eq!(next.active_sb, None);
    }
}
