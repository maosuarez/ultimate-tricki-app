import React from 'react';
import { Icon } from '../components/ui';
import { UltimateBoard } from '../components/game';
import type { ScreenName, MoveHistory } from '../types/game';
import type { RemoteMatch } from '../types/match.types';
import { useReplay } from '@/hooks/useReplay';

interface ViewReplayProps {
  navigate: (screen: ScreenName) => void;
  blueColor: string;
  redColor: string;
  matchId: string | null;
  matchMeta: RemoteMatch | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUB_BOARD_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as const;

function moveLabel(move: MoveHistory): string {
  return `${SUB_BOARD_LABELS[move.sb]}${move.cell + 1}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Speed selector ───────────────────────────────────────────────────────────

interface SpeedOption {
  label: string;
  ms: number;
}

const SPEED_OPTIONS: SpeedOption[] = [
  { label: '0.5×', ms: 1600 },
  { label: '1×',   ms: 800  },
  { label: '2×',   ms: 400  },
];

// ─── Move list ────────────────────────────────────────────────────────────────

interface MovePair {
  n: number;
  xMove: MoveHistory | null;
  oMove: MoveHistory | null;
}

function buildMovePairs(moves: MoveHistory[]): MovePair[] {
  const pairs: MovePair[] = [];
  let i = 0;
  let pairN = 1;

  while (i < moves.length) {
    const current = moves[i];
    if (current.by === 'X') {
      const next = moves[i + 1];
      pairs.push({
        n: pairN++,
        xMove: current,
        oMove: next?.by === 'O' ? next : null,
      });
      i += next?.by === 'O' ? 2 : 1;
    } else {
      pairs.push({ n: pairN++, xMove: null, oMove: current });
      i += 1;
    }
  }

  return pairs;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ViewReplay({
  navigate,
  blueColor,
  redColor,
  matchId,
  matchMeta,
}: ViewReplayProps): React.ReactElement {
  const {
    moves,
    currentMoveIndex,
    isPlaying,
    isLoading,
    error,
    currentBoardState,
    playbackSpeed,
    goToMove,
    goToNext,
    goToPrevious,
    goToStart,
    goToEnd,
    play,
    pause,
    setPlaybackSpeed,
  } = useReplay(matchId, matchMeta);

  const moveListRef = React.useRef<HTMLDivElement>(null);
  const activeMoveRef = React.useRef<HTMLDivElement>(null);

  // Scroll active move into view
  React.useEffect(() => {
    activeMoveRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentMoveIndex]);

  const currentMove = currentMoveIndex >= 0 ? moves[currentMoveIndex] : null;
  const movePairs   = buildMovePairs(moves);

  // ── Loading / error states ────────────────────────────────────────────────

  if (!matchId || !matchMeta) {
    return (
      <div className="fade-in" style={{ padding: 28, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div className="t-cap" style={{ color: 'var(--text-3)' }}>
          Selecciona una partida desde la lista de replays para verla aquí.
        </div>
        <button className="btn ghost sm" onClick={() => navigate('replays')}>
          <Icon name="arrow-l" size={13} /> Ver replays
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fade-in" style={{ padding: 28, height: '100%', display: 'grid', placeItems: 'center' }}>
        <div className="t-cap">Cargando replay…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in" style={{ padding: 28, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div className="t-cap" style={{ color: 'var(--red)' }}>Error al cargar replay: {error}</div>
        <button className="btn ghost sm" onClick={() => navigate('replays')}>
          <Icon name="arrow-l" size={13} /> Volver
        </button>
      </div>
    );
  }

  if (!currentBoardState) return <></>;

  // ── Derived display values ────────────────────────────────────────────────

  const totalMoves   = moves.length;
  const sliderValue  = currentMoveIndex + 1; // 0 = before first move, 1..N = move applied
  const title        = `${matchMeta.playerXName} vs ${matchMeta.playerOName}`;
  const dateLabel    = formatDate(matchMeta.endedAt);
  const durationLabel = formatDuration(matchMeta.durationSeconds);

  return (
    <div
      className="fade-in game-grid"
      style={{ gap: 14, padding: 14, height: '100%', overflow: 'hidden' }}
    >
      {/* LEFT PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        {/* Match info */}
        <div className="card" style={{ padding: 14 }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <button className="btn sm ghost" onClick={() => navigate('replays')}>
              <Icon name="arrow-l" size={13} />
            </button>
            <span className="chip blue">REPLAY</span>
          </div>
          <div className="t-h3">{title}</div>
          <div className="t-cap" style={{ marginTop: 2 }}>
            {matchMeta.mode.toUpperCase()} · {dateLabel} · {durationLabel}
          </div>
        </div>

        {/* Current move metadata */}
        <div className="card" style={{ padding: 14 }}>
          <div className="t-tag" style={{ marginBottom: 10 }}>Movimiento actual</div>
          {currentMove ? (
            <>
              <div className="row" style={{ marginBottom: 8, gap: 8, fontSize: 12 }}>
                <span className="muted">Turno</span>
                <div className="spacer" />
                <b>{currentMove.n}</b>
              </div>
              <div className="row" style={{ marginBottom: 8, gap: 8, fontSize: 12 }}>
                <span className="muted">Jugador</span>
                <div className="spacer" />
                <span
                  className="chip"
                  style={{ background: currentMove.by === 'X' ? blueColor : redColor, color: '#fff' }}
                >
                  {currentMove.by === 'X' ? matchMeta.playerXName : matchMeta.playerOName}
                </span>
              </div>
              <div className="row" style={{ gap: 8, fontSize: 12 }}>
                <span className="muted">Posición</span>
                <div className="spacer" />
                <code
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                  }}
                >
                  {moveLabel(currentMove)}
                </code>
              </div>
            </>
          ) : (
            <div className="t-cap" style={{ color: 'var(--text-3)' }}>
              Tablero en estado inicial
            </div>
          )}
        </div>
      </div>

      {/* CENTER — Board + transport controls */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Board */}
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 0 }}>
          <div
            style={{
              width: 'min(100%, calc(100vh - 280px))',
              aspectRatio: '1/1',
              maxWidth: 680,
            }}
          >
            <UltimateBoard
              game={currentBoardState}
              blueColor={blueColor}
              redColor={redColor}
              canInteract={false}
              onMove={() => {}}
              showCoordinates={false}
              highlightLastMove={true}
            />
          </div>
        </div>

        {/* Transport controls */}
        <div className="card" style={{ padding: 14, marginTop: 14 }}>
          {/* Buttons row */}
          <div className="row" style={{ marginBottom: 10 }}>
            {/* Go to start */}
            <button
              className="btn icon"
              title="Inicio"
              onClick={goToStart}
              disabled={currentMoveIndex === -1}
            >
              <Icon name="skip-b" size={14} />
            </button>

            {/* Previous move */}
            <button
              className="btn icon"
              title="Movimiento anterior"
              onClick={() => { pause(); goToPrevious(); }}
              disabled={currentMoveIndex === -1}
            >
              <Icon name="chev-r" size={14} style={{ transform: 'rotate(180deg)' }} />
            </button>

            {/* Play / Pause */}
            {isPlaying ? (
              <button className="btn icon primary" title="Pausar" onClick={pause}>
                <Icon name="pause" size={14} />
              </button>
            ) : (
              <button
                className="btn icon primary"
                title="Reproducir"
                onClick={play}
                disabled={currentMoveIndex >= totalMoves - 1}
              >
                <Icon name="play" size={14} />
              </button>
            )}

            {/* Next move */}
            <button
              className="btn icon"
              title="Siguiente movimiento"
              onClick={() => { pause(); goToNext(); }}
              disabled={currentMoveIndex >= totalMoves - 1}
            >
              <Icon name="chev-r" size={14} />
            </button>

            {/* Go to end */}
            <button
              className="btn icon"
              title="Final"
              onClick={goToEnd}
              disabled={currentMoveIndex >= totalMoves - 1}
            >
              <Icon name="skip-f" size={14} />
            </button>

            <div className="spacer" />

            {/* Move counter */}
            <span
              className="t-mono"
              style={{ fontSize: 12, color: 'var(--text-2)', userSelect: 'none' }}
            >
              Mov. <b style={{ color: 'var(--text)' }}>{Math.max(0, sliderValue)}</b> / {totalMoves}
            </span>

            <div className="spacer" />

            {/* Speed selector */}
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                className="btn sm"
                style={
                  playbackSpeed === opt.ms
                    ? { background: 'var(--card-hi)' }
                    : undefined
                }
                onClick={() => setPlaybackSpeed(opt.ms)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Timeline slider */}
          <input
            type="range"
            min={0}
            max={totalMoves}
            value={sliderValue}
            onChange={(e) => {
              pause();
              // slider value 0 = empty board (-1 index), 1 = first move (index 0), etc.
              goToMove(Number(e.target.value) - 1);
            }}
            style={{ width: '100%', accentColor: blueColor }}
          />
        </div>
      </div>

      {/* RIGHT — Move list */}
      <div
        className="card"
        style={{ padding: 14, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <div className="t-tag" style={{ marginBottom: 10 }}>Movimientos</div>
        <div
          ref={moveListRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr 1fr',
            rowGap: 3,
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            overflow: 'auto',
            minHeight: 0,
          }}
        >
          {movePairs.map((pair, pairIdx) => {
            // Compute move indices for X and O moves in this pair
            const xMoveIdx = pair.xMove ? moves.findIndex((m) => m === pair.xMove) : -1;
            const oMoveIdx = pair.oMove ? moves.findIndex((m) => m === pair.oMove) : -1;
            const xActive  = xMoveIdx === currentMoveIndex;
            const oActive  = oMoveIdx === currentMoveIndex;

            return (
              <React.Fragment key={pairIdx}>
                {/* Pair number */}
                <div style={{ color: 'var(--text-3)', padding: '4px 8px 4px 0' }}>
                  {pair.n}.
                </div>

                {/* X move cell */}
                <div
                  ref={xActive ? activeMoveRef : undefined}
                  style={{
                    color: blueColor,
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: xActive ? 'var(--card-hi)' : 'transparent',
                    cursor: pair.xMove ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (xMoveIdx !== -1) { pause(); goToMove(xMoveIdx); }
                  }}
                >
                  {pair.xMove ? moveLabel(pair.xMove) : '—'}
                </div>

                {/* O move cell */}
                <div
                  ref={oActive ? activeMoveRef : undefined}
                  style={{
                    color: redColor,
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: oActive ? 'var(--card-hi)' : 'transparent',
                    cursor: pair.oMove ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (oMoveIdx !== -1) { pause(); goToMove(oMoveIdx); }
                  }}
                >
                  {pair.oMove ? moveLabel(pair.oMove) : '—'}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
