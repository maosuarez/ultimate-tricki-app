# Game Engine Specification

## Purpose
Defines the mathematical domain model, validation rules, state transitions, and deterministic evaluation logic for Ultimate Tic Tac Toe in both TypeScript and Rust implementations.

## Requirements

### Requirement: Macroboard & Subboard Representation
The game state SHALL be represented using a flat array of 9 sub-boards (`sb[0..8]`), where each sub-board contains an array of 9 cells (`cells[0..8]`).

#### Scenario: Cell and Sub-board Coordinate Mapping
- **GIVEN** a flat index $i \in [0, 8]$
- **WHEN** converting to 2D coordinates
- **THEN** row index is $\lfloor i / 3 \rfloor$ and column index is $i \bmod 3$.

### Requirement: Turn Alternation & Move Validation
Moves SHALL alternate strictly between Player 'X' and Player 'O', starting with Player 'X'. A move $(sb, cell)$ is valid IF AND ONLY IF:
1. The game is currently in progress (`gameWinner === null`).
2. The targeted cell is empty (`sb[sb].cells[cell] === null`).
3. The targeted sub-board is not already decided (`sb[sb].winner === null`).
4. If a specific active sub-board is enforced (`activeSb !== null`), the move must be played within $sb = activeSb$.

#### Scenario: Valid move execution
- **GIVEN** a game in progress with $activeSb = 4$ and cell 0 empty in sub-board 4
- **WHEN** the active player moves at $(sb=4, cell=0)$
- **THEN** the cell is marked with the active player's symbol, victory conditions are checked, and turn passes to the opponent.

### Requirement: Active Sub-board Determination
The cell index of the current move directly determines the target sub-board index for the opponent's next move. If the target sub-board is already won or drawn, the opponent receives free choice (`activeSb = null`).

#### Scenario: Sub-board redirection to completed board
- **GIVEN** sub-board 2 is already won by Player 'X'
- **WHEN** Player 'O' plays in cell index 2 of any active sub-board
- **THEN** the resulting state SHALL set $activeSb = \text{null}$, allowing Player 'X' to play in any available sub-board.

### Requirement: Sub-board and Meta-board Victory Detection
Victory across any $3\times 3$ grid (sub-board or macroboard) SHALL be evaluated across the 8 standard winning lines:
- Rows: $[0,1,2], [3,4,5], [6,7,8]$
- Columns: $[0,3,6], [1,4,7], [2,5,8]$
- Diagonals: $[0,4,8], [2,4,6]$

#### Scenario: Macroboard Win
- **GIVEN** Player 'X' has won sub-boards 0, 4, and 8
- **WHEN** victory evaluation runs
- **THEN** the game outcome SHALL resolve to `gameWinner = 'X'`.

#### Scenario: Sub-board / Game Draw
- **GIVEN** all cells in a sub-board are occupied with no 3-in-a-row
- **WHEN** evaluation runs
- **THEN** the sub-board outcome SHALL resolve to `winner = 'draw'`. Drawn sub-boards do not grant ownership to either player on the meta-board.

### Requirement: Deterministic Replay Reconstruction
The replay system SHALL reconstruct identical board states by applying the sequence of `MoveHistory` deterministically from state 0 to $N$.

#### Scenario: Time travel in replay
- **GIVEN** a recorded match with 30 moves
- **WHEN** navigating to move index 15
- **THEN** the reconstructed `GameState` matches exactly the state after the 15th move.
