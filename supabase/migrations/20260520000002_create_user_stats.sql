-- Migration: create_user_stats
-- Creates the user_stats table linked 1:1 to profiles

CREATE TABLE public.user_stats (
  user_id               uuid        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_matches         integer     NOT NULL DEFAULT 0,
  wins                  integer     NOT NULL DEFAULT 0,
  losses                integer     NOT NULL DEFAULT 0,
  draws                 integer     NOT NULL DEFAULT 0,
  win_streak            integer     NOT NULL DEFAULT 0,
  best_win_streak       integer     NOT NULL DEFAULT 0,
  total_moves           integer     NOT NULL DEFAULT 0,
  average_move_time_ms  integer     NOT NULL DEFAULT 0,
  last_match_at         timestamptz,
  updated_at            timestamptz NOT NULL DEFAULT now()
);
