-- Migration: triggers_and_functions
-- Reusable updated_at trigger and auto-create profile/stats on user signup

-- ─── Generic updated_at trigger function ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach updated_at trigger to profiles
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Attach updated_at trigger to user_stats
CREATE TRIGGER trg_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Auto-create profile and stats on new auth.users row ─────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
-- SECURITY DEFINER so the trigger can write to public.profiles
-- even when the inserting context is the auth schema
SET search_path = public
AS $$
DECLARE
  initial_username text;
BEGIN
  -- Derive a default username from the email prefix (before the @)
  initial_username := split_part(NEW.email, '@', 1);

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    initial_username,
    initial_username
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Fire after every new row in auth.users
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
