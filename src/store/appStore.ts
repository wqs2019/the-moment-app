import { create } from 'zustand';

import { STORAGE_KEYS } from '../config/constant';
import { ThemeMode } from '../config/theme';
import CloudService from '../services/tcb';
import StorageUtil from '../utils/storage';

type AppState = {
  theme: ThemeMode;
  initialized: boolean;
  serviceReady: boolean;
  initializeApp: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
};

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  initialized: false,
  serviceReady: false,
  initializeApp: async () => {
    const savedTheme = await StorageUtil.get<ThemeMode>(STORAGE_KEYS.theme);
    const serviceReady = await CloudService.bootstrap();

    set({
      theme: savedTheme || 'system',
      initialized: true,
      serviceReady,
    });
  },
  setTheme: async (theme) => {
    await StorageUtil.set(STORAGE_KEYS.theme, theme);
    set({ theme });
  },
}));
