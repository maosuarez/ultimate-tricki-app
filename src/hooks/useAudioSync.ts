// src/hooks/useAudioSync.ts
import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import * as audioService from '@/services/audioService';

export function useAudioSync(): void {
  const { volumeMaster, volumeSfx, volumeMusic } = useSettingsStore();

  useEffect(() => { audioService.setVolumeMaster(volumeMaster); }, [volumeMaster]);
  useEffect(() => { audioService.setVolumeSfx(volumeSfx); }, [volumeSfx]);
  useEffect(() => { audioService.setVolumeMusic(volumeMusic); }, [volumeMusic]);
}
