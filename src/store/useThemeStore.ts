
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themes } from '@/lib/themes';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  colorTheme: string;
  mode: ThemeMode;
  setColorTheme: (themeName: string) => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorTheme: 'Default',
      mode: 'system',
      setColorTheme: (themeName) => {
        if (themes.some(t => t.name === themeName)) {
          set({ colorTheme: themeName });
        }
      },
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'focusdo-theme-storage', // name of the item in the storage (must be unique)
    }
  )
);
