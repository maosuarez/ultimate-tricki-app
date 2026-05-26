-- achievements catalog (seeded, not user-created)
CREATE TABLE IF NOT EXISTS public.achievements (
  id         text PRIMARY KEY,
  emoji      text NOT NULL,
  name       text NOT NULL,
  description text NOT NULL,
  category   text NOT NULL DEFAULT 'general',
  is_hidden  boolean NOT NULL DEFAULT false
);

-- user achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES public.achievements(id),
  unlocked_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON public.user_achievements (user_id);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_select_all" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "user_achievements_select_own" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_achievements_insert_own" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed achievements catalog
INSERT INTO public.achievements (id, emoji, name, description, category) VALUES
  ('first_blood',   '🎯', 'Primera sangre',   'Gana tu primera partida',                 'progression'),
  ('speedster',     '⚡', 'Velocista',         'Gana en menos de 30 movimientos',          'skill'),
  ('good_loser',    '🤝', 'Buen perdedor',     'Pierde 5 partidas sin rendirse',           'sportsmanship'),
  ('on_fire',       '🔥', 'En racha',          '5 victorias seguidas',                     'streak'),
  ('centurion',     '🎮', 'Centurión',         'Juega 100 partidas',                       'progression'),
  ('early_bird',    '🕐', 'Madrugador',        'Juega antes de las 7am',                   'lifestyle'),
  ('showtime',      '🎪', 'Espectáculo',       'Gana un subtablero en 3 movimientos',      'skill'),
  ('defender',      '🧱', 'Defensor',          'Bloquea 20 subtableros al oponente',       'skill'),
  ('undefeated',    '👑', 'Sin derrota',       '10 victorias consecutivas',                'streak'),
  ('grandmaster',   '🧠', 'Gran maestro',      'Alcanza ELO 2000',                         'rating'),
  ('traveler',      '🌍', 'Viajero',           'Juega contra 10 países distintos',         'social'),
  ('diamond',       '💎', 'Diamante',          'Llega al Top 100 en ranking',              'rating'),
  ('terminator',    '🤖', 'Terminator',        'Vence a la IA en modo Experto',            'ai'),
  ('precision',     '🏹', 'Precisión',         'Gana sin perder ningún subtablero',        'skill')
ON CONFLICT (id) DO NOTHING;
