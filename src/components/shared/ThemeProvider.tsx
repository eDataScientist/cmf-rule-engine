import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { uiThemeAtom, appThemeAtom } from '@/store/atoms/ui';
import { themes } from '@/lib/themes/colors';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [uiTheme] = useAtom(uiThemeAtom);
  const [appTheme] = useAtom(appThemeAtom);

  // Apply light/dark mode class
  useEffect(() => {
    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add the current theme class
    root.classList.add(uiTheme);

    console.log('[ThemeProvider] UI Theme changed to:', uiTheme);
  }, [uiTheme]);

  // Apply motor/medical accent colors
  useEffect(() => {
    const theme = themes[appTheme];
    const root = document.documentElement;

    // Add transition class for smooth theme changes
    root.style.transition = 'background-color 0.5s ease-in-out, color 0.5s ease-in-out';

    // Apply CSS variables for accent colors (motor/medical)
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-foreground', theme.primaryForeground);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-foreground', theme.accentForeground);
  }, [appTheme]);

  return <>{children}</>;
}
