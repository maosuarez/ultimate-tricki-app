-- =============================================================================
-- SEED DATA — development only. DO NOT apply to production.
-- =============================================================================
-- Fixed UUIDs for reproducibility across resets.

-- ─── auth.users stubs ────────────────────────────────────────────────────────
-- In local dev, Supabase Auth handles the auth.users table.
-- Passwords use regexp_replace to produce $2b$ prefix required by GoTrue cloud.
-- pgcrypto's crypt() generates $2a$; GoTrue expects $2b$. For ASCII passwords the
-- hash body is identical — only the version marker differs.
-- Plain-text password for all test users: Password123!

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  aud, role,
  confirmation_token, recovery_token, email_change_token_new,
  email_change, email_change_token_current, phone_change,
  phone_change_token, reauthentication_token
)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'alice@example.com',
    regexp_replace(crypt('Password123!', gen_salt('bf', 10)), '^\$2a\$', '$2b$'),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', '', '', '', ''
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'bob@example.com',
    regexp_replace(crypt('Password123!', gen_salt('bf', 10)), '^\$2a\$', '$2b$'),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', '', '', '', ''
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'charlie@example.com',
    regexp_replace(crypt('Password123!', gen_salt('bf', 10)), '^\$2a\$', '$2b$'),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    '', '', '', '', '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- ─── auth.identities stubs ────────────────────────────────────────────────────
-- Required by GoTrue to validate email/password login. provider_id = email for
-- the "email" provider. The `email` column is generated — never include it.

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'alice@example.com',
    'email',
    '{"sub":"a0000000-0000-0000-0000-000000000001","email":"alice@example.com","email_verified":true,"provider":"email"}',
    now(), now(), now()
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'bob@example.com',
    'email',
    '{"sub":"a0000000-0000-0000-0000-000000000002","email":"bob@example.com","email_verified":true,"provider":"email"}',
    now(), now(), now()
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'charlie@example.com',
    'email',
    '{"sub":"a0000000-0000-0000-0000-000000000003","email":"charlie@example.com","email_verified":true,"provider":"email"}',
    now(), now(), now()
  )
ON CONFLICT (id) DO NOTHING;

-- ─── profiles ────────────────────────────────────────────────────────────────
-- The handle_new_user trigger creates default profiles, but we override them
-- here to get meaningful display names and ratings for testing.

INSERT INTO public.profiles (id, username, display_name, country_code, rating)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'alice',   'Alice',   'US', 1200),
  ('a0000000-0000-0000-0000-000000000002', 'bob',     'Bob',     'ES', 1050),
  ('a0000000-0000-0000-0000-000000000003', 'charlie', 'Charlie', 'MX',  980)
ON CONFLICT (id) DO UPDATE SET
  username     = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  country_code = EXCLUDED.country_code,
  rating       = EXCLUDED.rating;

-- ─── user_stats ──────────────────────────────────────────────────────────────
INSERT INTO public.user_stats (
  user_id, total_matches, wins, losses, draws, win_streak, best_win_streak, total_moves
)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 10, 6, 3, 1, 2, 4, 210),
  ('a0000000-0000-0000-0000-000000000002',  8, 4, 3, 1, 1, 3, 175),
  ('a0000000-0000-0000-0000-000000000003',  5, 2, 3, 0, 0, 1,  98)
ON CONFLICT (user_id) DO UPDATE SET
  total_matches   = EXCLUDED.total_matches,
  wins            = EXCLUDED.wins,
  losses          = EXCLUDED.losses,
  draws           = EXCLUDED.draws,
  win_streak      = EXCLUDED.win_streak,
  best_win_streak = EXCLUDED.best_win_streak,
  total_moves     = EXCLUDED.total_moves;

-- ─── matches ─────────────────────────────────────────────────────────────────
INSERT INTO public.matches (
  id, mode, player_x_id, player_o_id, player_x_name, player_o_name,
  result, total_moves, duration_seconds, rating_change_x, rating_change_o,
  started_at, ended_at
)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'online',
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'Alice', 'Bob',
    'x_wins', 32, 480, 15, -15,
    now() - interval '2 days', now() - interval '2 days' + interval '8 minutes'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'online',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'Bob', 'Charlie',
    'o_wins', 28, 360, -12, 12,
    now() - interval '1 day', now() - interval '1 day' + interval '6 minutes'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'online',
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000003',
    'Alice', 'Charlie',
    'draw', 45, 620, 0, 0,
    now() - interval '12 hours', now() - interval '12 hours' + interval '10 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- ─── match_moves (sample replay for first match) ──────────────────────────────
INSERT INTO public.match_moves (match_id, move_number, player, macro_row, macro_col, micro_row, micro_col, timestamp_ms)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 1, 'x', 1, 1, 1, 1, 1200),
  ('b0000000-0000-0000-0000-000000000001', 2, 'o', 1, 1, 0, 2, 3400),
  ('b0000000-0000-0000-0000-000000000001', 3, 'x', 0, 2, 2, 0, 5800),
  ('b0000000-0000-0000-0000-000000000001', 4, 'o', 2, 0, 1, 1, 8100)
ON CONFLICT (match_id, move_number) DO NOTHING;
