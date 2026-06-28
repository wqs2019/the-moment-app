import { create } from 'zustand';

import { STORAGE_KEYS } from '../config/constant';
import { ThemeMode } from '../config/theme';
import CloudService from '../services/tcb';
import StorageUtil from '../utils/storage';
import { User } from '../types/user';
import authService from '../services/authService';

type AppState = {
  theme: ThemeMode;
  initialized: boolean;
  serviceReady: boolean;
  isLoggedIn: boolean;
  user: User | null;
  sessionToken: string | null;
  initializeApp: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setLoggedIn: (status: boolean, user?: User | null, token?: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'system',
  initialized: false,
  serviceReady: false,
  isLoggedIn: false,
  user: null,
  sessionToken: null,
  initializeApp: async () => {
    const savedTheme = await StorageUtil.get<ThemeMode>(STORAGE_KEYS.theme);
    const serviceReady = await CloudService.bootstrap();
    
    let isLoggedIn = false;
    let user = null;
    let sessionToken = null;

    if (serviceReady) {
      const token = await StorageUtil.get<string>('the_moment_session_token');
      if (token) {
        try {
          const session = await authService.validateSession(token);
          isLoggedIn = true;
          user = session.user;
          sessionToken = session.token;
        } catch (error) {
          console.warn('Session validation failed:', error);
          await StorageUtil.remove('the_moment_session_token');
        }
      }
    }

    set({
      theme: savedTheme || 'system',
      initialized: true,
      serviceReady,
      isLoggedIn,
      user,
      sessionToken,
    });
  },
  setTheme: async (theme) => {
    await StorageUtil.set(STORAGE_KEYS.theme, theme);
    set({ theme });
  },
  setLoggedIn: async (status, user = null, token = null) => {
    if (status && token) {
      await StorageUtil.set('the_moment_session_token', token);
    } else if (!status) {
      await StorageUtil.remove('the_moment_session_token');
    }
    set({ isLoggedIn: status, user, sessionToken: token });
  },
  logout: async () => {
    await StorageUtil.remove('the_moment_session_token');
    set({ isLoggedIn: false, user: null, sessionToken: null });
  },
}));
