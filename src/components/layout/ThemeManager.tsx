
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useThemeStore } from '@/store/useThemeStore';
import { themes } from '@/lib/themes';

function ThemeCssUpdater() {
  const { colorTheme } = useThemeStore();
  const { resolvedTheme } = useTheme(); // This gives us the actual theme (light or dark), resolving 'system'

  React.useEffect(() => {
    const root = window.document.documentElement;
    const selectedTheme = themes.find(t => t.name === colorTheme) || themes[0];

    // Remove all old theme classes
    root.classList.remove(...themes.map(t => `theme-${t.name.toLowerCase()}`));
    // Add the new theme class
    root.classList.add(`theme-${selectedTheme.name.toLowerCase()}`);

    // Apply CSS variables for the current mode (light/dark)
    const cssVars = resolvedTheme === 'dark' ? selectedTheme.cssVars.dark : selectedTheme.cssVars.light;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

  }, [colorTheme, resolvedTheme]);

  return null; // This component doesn't render anything
}

export function ThemeManager({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeStore();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      forcedTheme={mode === 'system' ? undefined : mode} // Control the theme mode from our store
    >
      <ThemeCssUpdater />
      {children}
    </NextThemesProvider>
  );
}
