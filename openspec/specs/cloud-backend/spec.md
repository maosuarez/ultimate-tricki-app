# Cloud Backend (Supabase) Specification

## Purpose
Defines the cloud persistence, user identity, social graph, match telemetry, achievements system, and security policies hosted on Supabase.

## Requirements

### Requirement: Encapsulated Supabase Service Access
All Supabase client interactions in the frontend SHALL pass through `src/services/supabase.service.ts`. Direct imports of `@supabase/supabase-js` from components, hooks, or stores are strictly prohibited.

#### Scenario: Authentication and Session State
- **GIVEN** a user logging in or registering
- **WHEN** `supabaseService.auth.signIn` or `signUp` is executed
- **THEN** an `AuthSession` is returned and mapped to `userStore`, triggering automatic profile and statistics retrieval.

### Requirement: Database Schema & Relational Integrity
The PostgreSQL database SHALL maintain structured tables with Row Level Security (RLS) enabled (`profiles`, `user_stats`, `matches`, `match_moves`, `rooms`, `achievements`, `user_achievements`, `friendships`).

#### Scenario: RLS Enforced Query
- **GIVEN** an authenticated user
- **WHEN** querying private match data or social friendships
- **THEN** Supabase RLS policies restrict row access strictly to the authenticated user's relations.

### Requirement: Event-Driven Achievements Bus
The achievements engine SHALL listen to game completion and stat update events via a typed event bus (`achievementEventBus`), evaluating condition rules against `userStats` and persisting unlocked achievements via `user_achievements`.

#### Scenario: Unlocking 'first_blood' or streak milestones
- **GIVEN** a user with 0 wins who completes their first win
- **WHEN** `processEvent` is evaluated
- **THEN** `first_blood` is unlocked in Supabase and pushed to `achievementStore.lastUnlocked` to render a congratulatory toast.
