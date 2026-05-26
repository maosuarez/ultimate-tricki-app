export const FEATURES = {
  MULTIPLAYER: import.meta.env.VITE_FEATURE_MULTIPLAYER === 'true',
  ONLINE_RANKING: import.meta.env.VITE_FEATURE_RANKING === 'true',
  AI_ADVANCED: import.meta.env.VITE_FEATURE_AI_ADVANCED === 'true',
} as const;
