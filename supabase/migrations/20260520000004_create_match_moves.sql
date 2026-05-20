-- Migration: create_match_moves
-- Stores the full move history for online matches (enables replay)

CREATE TABLE public.match_moves (
  id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id    uuid        NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  move_number integer     NOT NULL,
  player      text        NOT NULL CHECK (player IN ('x', 'o')),
  macro_row   integer     NOT NULL CHECK (macro_row BETWEEN 0 AND 2),
  macro_col   integer     NOT NULL CHECK (macro_col BETWEEN 0 AND 2),
  micro_row   integer     NOT NULL CHECK (micro_row BETWEEN 0 AND 2),
  micro_col   integer     NOT NULL CHECK (micro_col BETWEEN 0 AND 2),
  timestamp_ms integer    NOT NULL,
  UNIQUE (match_id, move_number)
);

-- Index for sequential replay queries
CREATE INDEX idx_match_moves_match_id_move_number ON public.match_moves (match_id, move_number);
