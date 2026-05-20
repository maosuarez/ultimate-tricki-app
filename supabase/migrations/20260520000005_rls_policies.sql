-- Migration: rls_policies
-- Enables Row Level Security and defines access policies for all tables

-- ─── profiles ────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read any profile (public leaderboard, search)
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert is handled exclusively by the auth trigger (no direct client inserts)
CREATE POLICY "profiles_insert_trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── user_stats ──────────────────────────────────────────────────────────────
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can read stats (public leaderboard)
CREATE POLICY "user_stats_select_public"
  ON public.user_stats FOR SELECT
  USING (true);

-- Stats are written only by server-side functions (Postgres triggers), not clients.
-- No INSERT/UPDATE/DELETE policies for authenticated users.

-- ─── matches ─────────────────────────────────────────────────────────────────
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Anyone can read completed matches
CREATE POLICY "matches_select_public"
  ON public.matches FOR SELECT
  USING (true);

-- Only authenticated users can insert matches
CREATE POLICY "matches_insert_authenticated"
  ON public.matches FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ─── match_moves ─────────────────────────────────────────────────────────────
ALTER TABLE public.match_moves ENABLE ROW LEVEL SECURITY;

-- Anyone can read move history (for replay)
CREATE POLICY "match_moves_select_public"
  ON public.match_moves FOR SELECT
  USING (true);

-- Only authenticated users can insert moves
CREATE POLICY "match_moves_insert_authenticated"
  ON public.match_moves FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
