# UI & Design System Specification

## Purpose
Defines visual aesthetics, color palettes, responsive layouts, procedural audio feedback, and accessibility requirements for Ultimate Tic Tac Toe.

## Requirements

### Requirement: Dark-First Precision Design
The interface SHALL default to a dark theme designed for focus and low visual fatigue, using standardized color tokens:
- Primary Background: `#0f0f10` (`--color-bg-base`)
- Surface / Cards: `#18181b` (`--color-bg-surface`)
- Board Background: `#1c1c1f` (`--color-board-bg`)
- Player X Accent: `#ef4444` / `#3B82F6` (configurable)
- Player O Accent: `#3b82f6` / `#EF4444` (configurable)

#### Scenario: Sub-board and Cell States
- **GIVEN** an active sub-board during Player X's turn
- **WHEN** hovering over an empty cell
- **THEN** the cell highlights with Player X's accent color.
- **AND** inactive/locked sub-boards display dim muted borders without hover feedback.

### Requirement: Split Screen Responsive Layout
The match view SHALL maintain a split layout (60% Board area / 40% Control & Scoreboard panel) optimized for resolutions $\ge 1280\times 720$.

#### Scenario: Viewport Resize
- **GIVEN** desktop viewports varying from 1280x720 up to 4K
- **WHEN** the window is resized
- **THEN** the board scales proportionally without vertical clipping or horizontal scrollbars.

### Requirement: Procedural Web Audio Synthesis
Sound effects (piece placement, sub-board captures, victory fanfare, match alerts) SHALL be generated procedurally via the Web Audio API without requiring external audio asset files.

#### Scenario: Audio Volume Control
- **GIVEN** user changes volume in settings
- **WHEN** sliders for master, SFX, or ambient music are adjusted
- **THEN** audio gain nodes update instantly via `audioService`.
