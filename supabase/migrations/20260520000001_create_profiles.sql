-- Migration: create_profiles
-- Creates the public profiles table linked 1:1 to auth.users

CREATE TABLE public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text        UNIQUE NOT NULL,
  display_name  text        NOT NULL,
  avatar_url    text,
  country_code  char(2),
  bio           text,
  rating        integer     NOT NULL DEFAULT 1000,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_profiles_username ON public.profiles (username);
CREATE INDEX idx_profiles_rating   ON public.profiles (rating DESC);
