// match.types.ts — types for remote/online match records stored in Supabase

export type MatchMode = 'online' | 'ai' | 'local';
export type MatchResult = 'x_wins' | 'o_wins' | 'draw' | 'abandoned';
export type MatchPlayer = 'x' | 'o';

export interface RemoteMatch {
  id: string;
  mode: MatchMode;
  playerXId: string | null;
  playerOId: string | null;
  playerXName: string;
  playerOName: string;
  result: MatchResult;
  totalMoves: number;
  durationSeconds: number;
  ratingChangeX: number;
  ratingChangeO: number;
  startedAt: string;
  endedAt: string;
  createdAt: string;
}

export interface RemoteMatchMove {
  id: number;
  matchId: string;
  moveNumber: number;
  player: MatchPlayer;
  macroRow: number;
  macroCol: number;
  microRow: number;
  microCol: number;
  timestampMs: number;
}

export interface MatchFilter {
  mode?: MatchMode;
  result?: MatchResult;
  fromDate?: string; // ISO 8601
  toDate?: string;   // ISO 8601
  limit?: number;
  offset?: number;
}
