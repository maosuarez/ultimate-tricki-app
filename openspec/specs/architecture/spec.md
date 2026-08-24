# System Architecture Specification

## Purpose
Defines the architectural tiers, data flow constraints, module boundaries, state management model, and error handling policies for Ultimate Tic Tac Toe.

## Requirements

### Requirement: Strict Unidirectional Data Flow
All runtime data and user interactions SHALL flow strictly in one direction:
$$\text{UI Component} \longrightarrow \text{Custom Hook} \longrightarrow \text{Zustand Store} \longrightarrow \text{Service Layer} \longrightarrow \text{Environment Abstraction (IPC / Web)} \longrightarrow \text{Native / Browser / Cloud}$$

#### Scenario: User performs an action
- **GIVEN** a user click on a cell
- **WHEN** the event is triggered
- **THEN** the component invokes a hook callback, the hook calls a store action, the store executes business logic via a service, and persistence is dispatched via an environment abstraction adapter (Tauri IPC or Web alternatives) to the appropriate backend/cloud.
- **AND** the component NEVER invokes services, IPC commands, or cloud endpoints directly.

### Requirement: Presentational and Domain Separation
Components located in `src/components/game/` SHALL remain purely presentational, stateless with respect to global state, and driven strictly by props and event callbacks.

#### Scenario: Rendering game board
- **GIVEN** `GameBoard` receives `GameState` via props
- **WHEN** state updates occur
- **THEN** only altered sub-boards and cells re-render.

### Requirement: Modular Zustand Stores
Global state SHALL be partitioned across isolated domain stores (`gameStore`, `matchStore`, `userStore`, `networkStore`, `settingsStore`, `achievementStore`, `friendsStore`, `replayStore`).

#### Scenario: Cross-store Coordination
- **GIVEN** an event requires coordinating between `matchStore` and `gameStore`
- **WHEN** the action executes
- **THEN** coordination is performed through the calling hook or service layer, NOT via direct store-to-store imports.

### Requirement: Layered Persistence Hierarchy
Data SHALL be persisted using appropriate storage mechanisms according to data lifecycle and privacy (Preferences to local JSON, History to SQLite, Global accounts to Supabase).

#### Scenario: Data Routing to Storage
- **GIVEN** user changes theme preference
- **WHEN** the change is saved
- **THEN** it persists to local store (`tricki-settings`) without creating network requests.
