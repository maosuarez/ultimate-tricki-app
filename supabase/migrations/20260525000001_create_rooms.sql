-- Migration: create public rooms table for online matchmaking

CREATE TABLE IF NOT EXISTS public.rooms (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text        NOT NULL UNIQUE,
  host_name     text        NOT NULL,
  host_elo      integer     NOT NULL DEFAULT 1500,
  time_control  text        NOT NULL DEFAULT 'blitz',
  status        text        NOT NULL DEFAULT 'waiting',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Index for the primary listing query (status = 'waiting')
CREATE INDEX IF NOT EXISTS rooms_status_idx ON public.rooms (status);

-- Constraint: only valid values
ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_time_control_check
  CHECK (time_control IN ('none', 'blitz', 'rapid', 'custom'));

ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_status_check
  CHECK (status IN ('waiting', 'playing', 'finished'));

-- Keep updated_at current automatically
CREATE OR REPLACE FUNCTION public.set_rooms_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.set_rooms_updated_at();

-- RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Readers only see rooms that are waiting for a second player
CREATE POLICY "rooms_select_waiting"
  ON public.rooms FOR SELECT
  USING (status = 'waiting');

-- Anyone can insert, update, delete (desktop app — implicit trust)
CREATE POLICY "rooms_insert"
  ON public.rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "rooms_update"
  ON public.rooms FOR UPDATE
  USING (true);

CREATE POLICY "rooms_delete"
  ON public.rooms FOR DELETE
  USING (true);
