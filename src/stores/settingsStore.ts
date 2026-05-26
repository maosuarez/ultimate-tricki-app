// settingsStore.ts — Zustand store for persistent user settings.
// Persisted to localStorage under 'tricki-settings'.
// All side effects (CSS vars, theme class) are applied in App.tsx via useEffect.

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SettingsState {
  // Apariencia
  theme: 'dark' | 'light' | 'system';
  density: 'compact' | 'comfortable' | 'spacious';
  colorX: string;
  colorO: string;

  // Audio
  volumeMaster: number;
  volumeSfx: number;
  volumeMusic: number;
  mutedAll: boolean;

  // Juego
  showCoordinates: boolean;
  highlightLastMove: boolean;
  confirmResign: boolean;

  // Accesibilidad
  reduceMotion: boolean;

  // Acciones
  setTheme: (v: SettingsState['theme']) => void;
  setDensity: (v: SettingsState['density']) => void;
  setColorX: (v: string) => void;
  setColorO: (v: string) => void;
  setVolumeMaster: (v: number) => void;
  setVolumeSfx: (v: number) => void;
  setVolumeMusic: (v: number) => void;
  setMutedAll: (v: boolean) => void;
  setShowCoordinates: (v: boolean) => void;
  setHighlightLastMove: (v: boolean) => void;
  setConfirmResign: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        // Defaults
        theme: 'dark',
        density: 'comfortable',
        colorX: '#3B82F6',
        colorO: '#EF4444',

        volumeMaster: 70,
        volumeSfx: 80,
        volumeMusic: 35,
        mutedAll: false,

        showCoordinates: true,
        highlightLastMove: true,
        confirmResign: true,

        reduceMotion: false,

        // Setters
        setTheme: (theme) => set({ theme }),
        setDensity: (density) => set({ density }),
        setColorX: (colorX) => set({ colorX }),
        setColorO: (colorO) => set({ colorO }),
        setVolumeMaster: (volumeMaster) => set({ volumeMaster }),
        setVolumeSfx: (volumeSfx) => set({ volumeSfx }),
        setVolumeMusic: (volumeMusic) => set({ volumeMusic }),
        setMutedAll: (mutedAll) => set({ mutedAll }),
        setShowCoordinates: (showCoordinates) => set({ showCoordinates }),
        setHighlightLastMove: (highlightLastMove) => set({ highlightLastMove }),
        setConfirmResign: (confirmResign) => set({ confirmResign }),
        setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      }),
      { name: 'tricki-settings' }
    ),
    { name: 'SettingsStore' }
  )
);
