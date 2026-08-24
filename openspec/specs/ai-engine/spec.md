# AI Engine Specification

## Purpose
Defines the algorithms, difficulty tiers, heuristic evaluation functions, and execution parameters for computer opponents in Ultimate Tic Tac Toe.

## Requirements

### Requirement: Multi-Tiered AI Difficulties
The AI engine SHALL offer four distinct difficulty tiers tailored to varying player proficiencies:
1. `easy`: Random legal move with 30% heuristic bias towards immediate wins.
2. `medium`: Minimax algorithm with depth 3, guaranteeing immediate win capture and single-turn threat blocking.
3. `hard`: Minimax algorithm with Alpha-Beta pruning (depth 5) and tactical position evaluation.
4. `expert`: Monte Carlo Tree Search (MCTS) executing 1,000–5,000 simulations using UCB1 selection ($C = \sqrt{2}$).

#### Scenario: Tactical Evaluation Scoring
- **GIVEN** evaluating a non-terminal board state in Minimax
- **WHEN** computing heuristic scores
- **THEN** scores are awarded for won sub-boards (+100/-100), two-in-a-row alignment (+10/-10), center control (+5/-5), and terminal victory (+10000/-10000).

### Requirement: Asynchronous Non-Blocking Execution
All AI calculations in the desktop app SHALL run within Rust worker threads (`tokio::task::spawn_blocking`) to ensure the frontend main thread maintains a constant 60 FPS without input stutter.

#### Scenario: AI Response Timing
- **GIVEN** an AI turn begins
- **WHEN** calculation completes in less than 200ms
- **THEN** an artificial delay of 200ms is applied to provide natural pacing before returning the move.
