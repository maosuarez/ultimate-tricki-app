import { useSettingsStore } from '../stores/settingsStore';

export const FEATURES = {
  MULTIPLAYER: import.meta.env.VITE_FEATURE_MULTIPLAYER === 'true',
  ONLINE_RANKING: import.meta.env.VITE_FEATURE_RANKING === 'true',
  AI_ADVANCED: import.meta.env.VITE_FEATURE_AI_ADVANCED === 'true',
  DEVELOPER_MODE: import.meta.env.VITE_FEATURE_DEVELOPER_MODE === 'true',
} as const;

/**
 * Returns true when developer mode is active — either via the build-time env
 * flag (VITE_FEATURE_DEVELOPER_MODE=true) or the runtime store toggle.
 * Use this hook instead of FEATURES.DEVELOPER_MODE in React components.
 */
export function useDeveloperMode(): boolean {
  const storeEnabled = useSettingsStore((s) => s.developerMode);
  return FEATURES.DEVELOPER_MODE || storeEnabled;
}
