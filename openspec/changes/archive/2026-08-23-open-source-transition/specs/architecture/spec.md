## MODIFIED Requirements

### Requirement: Strict Unidirectional Data Flow
All runtime data and user interactions SHALL flow strictly in one direction:
$$\text{UI Component} \longrightarrow \text{Custom Hook} \longrightarrow \text{Zustand Store} \longrightarrow \text{Service Layer} \longrightarrow \text{Environment Abstraction (IPC / Web)} \longrightarrow \text{Native / Browser / Cloud}$$

#### Scenario: User performs an action
- **GIVEN** a user click on a cell
- **WHEN** the event is triggered
- **THEN** the component invokes a hook callback, the hook calls a store action, the store executes business logic via a service, and persistence is dispatched via an environment abstraction adapter (Tauri IPC or Web alternatives) to the appropriate backend/cloud.
- **AND** the component NEVER invokes services, IPC commands, or cloud endpoints directly.
