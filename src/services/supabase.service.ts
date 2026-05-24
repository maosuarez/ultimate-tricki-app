// supabase.service.ts
// Single entry-point for all Supabase access. No other file may import from
// @supabase/supabase-js directly.

import { createClient, type SupabaseClient, type AuthChangeEvent, type Session } from '@supabase/supabase-js';
import type { AuthSession, UserProfile, UserStats } from '@/types/user.types';
import type { RemoteMatch, RemoteMatchMove, MatchFilter } from '@/types/match.types';
import type { RankingEntry, SupabaseError } from '@/types/api.types';

// ─── Client initialisation (singleton) ───────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

const client: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ─── Error normalisation ──────────────────────────────────────────────────────

function toSupabaseError(raw: unknown): SupabaseError {
  if (raw !== null && typeof raw === 'object' && 'message' in raw) {
    const err = raw as Record<string, unknown>;
    return {
      code:    typeof err.code    === 'string' ? err.code    : 'UNKNOWN',
      message: typeof err.message === 'string' ? err.message : 'Unknown error',
      details: typeof err.details === 'string' ? err.details : null,
      hint:    typeof err.hint    === 'string' ? err.hint    : null,
    };
  }
  return { code: 'UNKNOWN', message: String(raw), details: null, hint: null };
}

function throwAs(raw: unknown): never {
  throw toSupabaseError(raw);
}

// ─── Row-to-domain mappers ────────────────────────────────────────────────────

function rowToProfile(row: Record<string, unknown>): UserProfile {
  return {
    id:          row.id          as string,
    username:    row.username    as string,
    displayName: row.display_name as string,
    avatarUrl:   (row.avatar_url  as string | null) ?? null,
    countryCode: (row.country_code as string | null) ?? null,
    bio:         (row.bio         as string | null) ?? null,
    rating:      row.rating      as number,
    createdAt:   row.created_at  as string,
    updatedAt:   row.updated_at  as string,
  };
}

function rowToStats(row: Record<string, unknown>): UserStats {
  return {
    userId:             row.user_id              as string,
    totalMatches:       row.total_matches        as number,
    wins:               row.wins                 as number,
    losses:             row.losses               as number,
    draws:              row.draws                as number,
    winStreak:          row.win_streak           as number,
    bestWinStreak:      row.best_win_streak      as number,
    totalMoves:         row.total_moves          as number,
    averageMoveTimeMs:  row.average_move_time_ms as number,
    lastMatchAt:        (row.last_match_at       as string | null) ?? null,
    updatedAt:          row.updated_at           as string,
  };
}

function rowToRemoteMatch(row: Record<string, unknown>): RemoteMatch {
  return {
    id:              row.id               as string,
    mode:            row.mode             as RemoteMatch['mode'],
    playerXId:       (row.player_x_id    as string | null) ?? null,
    playerOId:       (row.player_o_id    as string | null) ?? null,
    playerXName:     row.player_x_name   as string,
    playerOName:     row.player_o_name   as string,
    result:          row.result          as RemoteMatch['result'],
    totalMoves:      row.total_moves     as number,
    durationSeconds: row.duration_seconds as number,
    ratingChangeX:   row.rating_change_x  as number,
    ratingChangeO:   row.rating_change_o  as number,
    startedAt:       row.started_at      as string,
    endedAt:         row.ended_at        as string,
    createdAt:       row.created_at      as string,
  };
}

function rowToRemoteMatchMove(row: Record<string, unknown>): RemoteMatchMove {
  return {
    id:          row.id           as number,
    matchId:     row.match_id     as string,
    moveNumber:  row.move_number  as number,
    player:      row.player       as RemoteMatchMove['player'],
    macroRow:    row.macro_row    as number,
    macroCol:    row.macro_col    as number,
    microRow:    row.micro_row    as number,
    microCol:    row.micro_col    as number,
    timestampMs: row.timestamp_ms as number,
  };
}

function sessionToAuthSession(session: Session): AuthSession {
  return {
    userId:       session.user.id,
    email:        session.user.email ?? '',
    accessToken:  session.access_token,
    refreshToken: session.refresh_token,
    expiresAt:    session.expires_at ?? 0,
  };
}

// ─── Service object ───────────────────────────────────────────────────────────

export const supabaseService = {

  // ── Auth ───────────────────────────────────────────────────────────────────

  auth: {
    async signUp(email: string, password: string, username: string): Promise<AuthSession> {
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) throwAs(error);
        if (!data.session) throwAs({ code: 'NO_SESSION', message: 'No session returned after sign-up' });

        // The handle_new_user trigger creates the profile using the email prefix as username.
        // We overwrite it here with the username chosen in the form.
        await client
          .from('profiles')
          .update({ username })
          .eq('id', data.session.user.id);

        return sessionToAuthSession(data.session);
      } catch (err) {
        throwAs(err);
      }
    },

    async signIn(email: string, password: string, rememberMe: boolean = true): Promise<AuthSession> {
      try {
        if (rememberMe) {
          localStorage.removeItem('tricki_no_remember');
        } else {
          localStorage.setItem('tricki_no_remember', '1');
        }
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throwAs(error);
        if (!data.session) throwAs({ code: 'NO_SESSION', message: 'No session returned after sign-in' });
        return sessionToAuthSession(data.session);
      } catch (err) {
        throwAs(err);
      }
    },

    async signOut(): Promise<void> {
      try {
        const { error } = await client.auth.signOut();
        if (error) throwAs(error);
      } catch (err) {
        throwAs(err);
      }
    },

    async getCurrentSession(): Promise<AuthSession | null> {
      try {
        const { data, error } = await client.auth.getSession();
        if (error) throwAs(error);
        return data.session ? sessionToAuthSession(data.session) : null;
      } catch (err) {
        throwAs(err);
      }
    },

    // Returns an unsubscribe function
    onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
      const { data: { subscription } } = client.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          callback(session ? sessionToAuthSession(session) : null);
        }
      );
      return () => subscription.unsubscribe();
    },
  },

  // ── Profile ────────────────────────────────────────────────────────────────

  profile: {
    async getProfile(userId: string): Promise<UserProfile> {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throwAs(error);
        return rowToProfile(data as Record<string, unknown>);
      } catch (err) {
        throwAs(err);
      }
    },

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
      try {
        // Map camelCase domain fields back to snake_case DB columns
        const dbUpdates: Record<string, unknown> = {};
        if (updates.username    !== undefined) dbUpdates.username     = updates.username;
        if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
        if (updates.avatarUrl   !== undefined) dbUpdates.avatar_url   = updates.avatarUrl;
        if (updates.countryCode !== undefined) dbUpdates.country_code = updates.countryCode;
        if (updates.bio         !== undefined) dbUpdates.bio          = updates.bio;

        const { data, error } = await client
          .from('profiles')
          .update(dbUpdates)
          .eq('id', userId)
          .select()
          .single();
        if (error) throwAs(error);
        return rowToProfile(data as Record<string, unknown>);
      } catch (err) {
        throwAs(err);
      }
    },

    async searchProfiles(query: string, limit = 10): Promise<UserProfile[]> {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(limit);
        if (error) throwAs(error);
        return (data as Record<string, unknown>[]).map(rowToProfile);
      } catch (err) {
        throwAs(err);
      }
    },

    async checkUsernameAvailable(username: string): Promise<boolean> {
      const { data } = await client
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      return data === null;
    },
  },

  // ── Stats ──────────────────────────────────────────────────────────────────

  stats: {
    async getUserStats(userId: string): Promise<UserStats> {
      try {
        const { data, error } = await client
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (error) throwAs(error);
        return rowToStats(data as Record<string, unknown>);
      } catch (err) {
        throwAs(err);
      }
    },

    async getGlobalRanking(limit = 50, offset = 0): Promise<RankingEntry[]> {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*, user_stats(*)')
          .order('rating', { ascending: false })
          .range(offset, offset + limit - 1);
        if (error) throwAs(error);

        return (data as Record<string, unknown>[]).map((row, index) => ({
          profile: rowToProfile(row),
          stats:   rowToStats(row.user_stats as Record<string, unknown>),
          rank:    offset + index + 1,
        }));
      } catch (err) {
        throwAs(err);
      }
    },
  },

  // ── Matches ────────────────────────────────────────────────────────────────

  matches: {
    async saveMatch(matchData: RemoteMatch): Promise<RemoteMatch> {
      try {
        const dbRow = {
          id:               matchData.id,
          mode:             matchData.mode,
          player_x_id:      matchData.playerXId,
          player_o_id:      matchData.playerOId,
          player_x_name:    matchData.playerXName,
          player_o_name:    matchData.playerOName,
          result:           matchData.result,
          total_moves:      matchData.totalMoves,
          duration_seconds: matchData.durationSeconds,
          rating_change_x:  matchData.ratingChangeX,
          rating_change_o:  matchData.ratingChangeO,
          started_at:       matchData.startedAt,
          ended_at:         matchData.endedAt,
        };

        const { data, error } = await client
          .from('matches')
          .insert(dbRow)
          .select()
          .single();
        if (error) throwAs(error);
        return rowToRemoteMatch(data as Record<string, unknown>);
      } catch (err) {
        throwAs(err);
      }
    },

    async getMatch(matchId: string): Promise<RemoteMatch> {
      try {
        const { data, error } = await client
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();
        if (error) throwAs(error);
        return rowToRemoteMatch(data as Record<string, unknown>);
      } catch (err) {
        throwAs(err);
      }
    },

    async getUserMatches(userId: string, filters?: MatchFilter): Promise<RemoteMatch[]> {
      try {
        let query = client
          .from('matches')
          .select('*')
          .or(`player_x_id.eq.${userId},player_o_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (filters?.mode)     query = query.eq('mode', filters.mode);
        if (filters?.result)   query = query.eq('result', filters.result);
        if (filters?.fromDate) query = query.gte('created_at', filters.fromDate);
        if (filters?.toDate)   query = query.lte('created_at', filters.toDate);
        if (filters?.limit)    query = query.limit(filters.limit);
        if (filters?.offset !== undefined && filters?.limit !== undefined) {
          query = query.range(filters.offset, filters.offset + filters.limit - 1);
        }

        const { data, error } = await query;
        if (error) throwAs(error);
        return (data as Record<string, unknown>[]).map(rowToRemoteMatch);
      } catch (err) {
        throwAs(err);
      }
    },

    async getMatchMoves(matchId: string): Promise<RemoteMatchMove[]> {
      try {
        const { data, error } = await client
          .from('match_moves')
          .select('*')
          .eq('match_id', matchId)
          .order('move_number', { ascending: true });
        if (error) throwAs(error);
        return (data as Record<string, unknown>[]).map(rowToRemoteMatchMove);
      } catch (err) {
        throwAs(err);
      }
    },
  },
};
