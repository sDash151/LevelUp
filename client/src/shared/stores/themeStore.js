import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((s) => {
        const next = s.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        return { theme: next };
      }),
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    {
      name: 'levelup-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);
