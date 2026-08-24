## Purpose

Defines how the application degrades gracefully to function without Tauri as a pure web distribution for broader accessibility.

## ADDED Requirements

### Requirement: Web Environment Detection and Degradation
The system SHALL detect its execution environment (Tauri vs Web Browser) at runtime and dynamically load the appropriate storage and IPC adapters.

#### Scenario: Running in standard web browser
- **GIVEN** the application is loaded in a non-Tauri environment (no `window.__TAURI__`)
- **WHEN** the application initializes
- **THEN** it falls back to browser-native alternatives (like LocalStorage or IndexedDB) for local data persistence and disables desktop-specific UI elements (like native window controls).

### Requirement: Cloud-first Web Fallback
When running in a pure web environment, the system SHALL prefer cloud synchronization (Supabase) over local persistence to ensure a consistent experience across browsers.

#### Scenario: Saving a local replay in web mode
- **GIVEN** the user saves a replay in web mode
- **WHEN** the save command is issued
- **THEN** the system bypasses the local SQLite abstraction and attempts to store the replay via the Supabase cloud backend or browser storage.
