# Multiplayer & Network Transport Specification

## Purpose
Defines the real-time multiplayer architecture, room coordination, WebSocket transport protocol, and state synchronization mechanisms.

## Requirements

### Requirement: Pluggable Transport Abstraction
Multiplayer networking SHALL adhere to the `IGameTransport` interface, allowing interchangeable implementations (`LocalTransport` for local play, `WebSocketTransport` for online play).

#### Scenario: Connecting to a match room
- **GIVEN** a room code
- **WHEN** `transport.connect(roomId)` is invoked
- **THEN** a WebSocket connection to the relay service (e.g. Azure WebPubSub) is established, emitting lifecycle events (`game_start`, `move`, `chat`, `game_end`).

### Requirement: State Synchronization & Integrity Verification
Every remote move payload SHALL include the move coordinates along with a SHA-256 state hash of the resulting board. If state hashes diverge between peers, the match initiates a state resynchronization request.

#### Scenario: Opponent disconnection and grace window
- **GIVEN** a player disconnects during an active online match
- **WHEN** connection drops
- **THEN** a 60-second reconnection timer is started.
- **AND** the active game clock is paused until reconnection or timeout forfeit occurs.
