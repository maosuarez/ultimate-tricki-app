-- Sprint 4: Public profile & friend requests
--
-- The friendships table (created in 20260525000003_friendships.sql) already
-- covers the friend_requests use case via the status column:
--   status = 'pending'  → solicitud enviada, no aceptada aún
--   status = 'accepted' → amistad activa
--   status = 'blocked'  → bloqueado
--
-- The existing RLS policy "friendships_insert_own" already enforces
-- auth.uid() = requester_id, so direct insert by id is safe from the
-- JS client using the anon key.
--
-- This migration is a no-op guard to document the design decision and
-- ensure the schema is complete for the sendRequestById service method.

-- Verify the constraint exists (safe if already present)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name   = 'friendships'
      AND constraint_name = 'no_self_friendship'
  ) THEN
    ALTER TABLE public.friendships
      ADD CONSTRAINT no_self_friendship CHECK (requester_id <> addressee_id);
  END IF;
END $$;
