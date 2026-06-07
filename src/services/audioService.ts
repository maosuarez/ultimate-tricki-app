// src/services/audioService.ts
// Web Audio API service — generates all sounds procedurally (no audio files required).

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicOscillators: OscillatorNode[] = [];
let musicRunning = false;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    sfxGain = ctx.createGain();
    musicGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    sfxGain.connect(masterGain);
    musicGain.connect(masterGain);
    masterGain.gain.value = 0.7;
    sfxGain.gain.value = 0.8;
    musicGain.gain.value = 0.35;
  }
  return ctx;
}

export function setVolumeMaster(v: number): void {
  getCtx();
  if (masterGain) masterGain.gain.setTargetAtTime(v / 100, ctx!.currentTime, 0.05);
}

export function setVolumeSfx(v: number): void {
  getCtx();
  if (sfxGain) sfxGain.gain.setTargetAtTime(v / 100, ctx!.currentTime, 0.05);
}

export function setVolumeMusic(v: number): void {
  getCtx();
  if (musicGain) musicGain.gain.setTargetAtTime(v / 100, ctx!.currentTime, 0.05);
}

// Short click for placing a piece
export function playMove(): void {
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g); g.connect(sfxGain!);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(320, c.currentTime + 0.08);
  g.gain.setValueAtTime(0.3, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.12);
}

// Chime for capturing a sub-board
export function playSubBoardCapture(): void {
  const c = getCtx();
  const freqs = [523.25, 659.25, 783.99]; // C5 E5 G5
  freqs.forEach((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.connect(g); g.connect(sfxGain!);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.08;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}

// Victory fanfare
export function playWin(): void {
  const c = getCtx();
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.connect(g); g.connect(sfxGain!);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.14;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.start(t);
    osc.stop(t + 0.6);
  });
}

// Ambient music — slow evolving pads using detuned oscillators
export function startMusic(): void {
  if (musicRunning) return;
  musicRunning = true;
  const c = getCtx();
  // Two layers of slightly detuned oscillators for warmth
  const configs = [
    { freq: 130.81, detune: 0, type: 'sine' as OscillatorType },
    { freq: 130.81, detune: 7, type: 'sine' as OscillatorType },
    { freq: 196.00, detune: -5, type: 'sine' as OscillatorType },
    { freq: 261.63, detune: 3, type: 'sine' as OscillatorType },
  ];
  musicOscillators = configs.map(({ freq, detune, type }) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    g.gain.value = 0.08;
    osc.connect(g);
    g.connect(musicGain!);
    osc.start();
    return osc;
  });
}

export function stopMusic(): void {
  musicRunning = false;
  musicOscillators.forEach((osc) => {
    try { osc.stop(); } catch { /* already stopped */ }
  });
  musicOscillators = [];
}

// Ascending alert chime for online match start / match found
export function playMatchFound(): void {
  const c = getCtx();
  const notes = [392.00, 523.25, 659.25, 783.99]; // G4 C5 E5 G5
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.connect(g); g.connect(sfxGain!);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.10;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.start(t);
    osc.stop(t + 0.55);
  });
}
