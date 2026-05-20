-- Migration: create_matches
-- Stores completed online, AI, and local matches

CREATE TABLE public.matches (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  mode             text        NOT NULL CHECK (mode IN ('online', 'ai', 'local')),
  player_x_id      uuid        REFERENCES public.profiles(id),
  player_o_id      uuid        REFERENCES public.profiles(id),
  player_x_name    text        NOT NULL,
  player_o_name    text        NOT NULL,
  result           text        NOT NULL CHECK (result IN ('x_wins', 'o_wins', 'draw', 'abandoned')),
  total_moves      integer     NOT NULL,
  duration_seconds integer     NOT NULL,
  rating_change_x  integer     NOT NULL DEFAULT 0,
  rating_change_o  integer     NOT NULL DEFAULT 0,
  started_at       timestamptz NOT NULL,
  ended_at         timestamptz NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Indexes for per-player history and recent matches
CREATE INDEX idx_matches_player_x_id  ON public.matches (player_x_id);
CREATE INDEX idx_matches_player_o_id  ON public.matches (player_o_id);
CREATE INDEX idx_matches_created_at   ON public.matches (created_at DESC);
