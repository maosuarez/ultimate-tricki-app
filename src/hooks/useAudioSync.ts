// src/hooks/useAudioSync.ts
import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import * as audioService from '@/services/audioService';

export function useAudioSync(): void {
  const { volumeMaster, volumeSfx, volumeMusic, mutedAll } = useSettingsStore();

  useEffect(() => {
    audioService.setVolumeMaster(mutedAll ? 0 : volumeMaster);
  }, [volumeMaster, mutedAll]);

  useEffect(() => { audioService.setVolumeSfx(volumeSfx); }, [volumeSfx]);
  useEffect(() => { audioService.setVolumeMusic(volumeMusic); }, [volumeMusic]);
}
