export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type SubBoardWinner = Player | 'draw' | null;

export interface SubBoardState {
  cells: CellValue[];
  winner: SubBoardWinner;
  winLine: number[] | null;
}

export interface MoveHistory {
  n: number;
  by: Player;
  sb: number;
  cell: number;
}

export interface GameState {
  sb: SubBoardState[];
  turn: Player;
  activeSb: number | null;
  lastMove: { sb: number; cell: number } | null;
  history: MoveHistory[];
}

export type ScreenName = 'home' | 'game' | 'lobby' | 'create' | 'join' | 'profile' | 'history' | 'replay' | 'settings' | 'login' | 'achievements' | 'ranking' | 'friends' | 'replays';
export type ModalName = 'victory' | 'defeat' | 'draw' | 'reconnect' | 'flag' | 'settings' | 'disconnected' | null;
