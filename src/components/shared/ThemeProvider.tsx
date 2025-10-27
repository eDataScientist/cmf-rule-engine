import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { appThemeAtom } from '@/store/atoms/ui';
import { themes } from '@/lib/themes/colors';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [appTheme] = useAtom(appThemeAtom);

  useEffect(() => {
    const theme = themes[appTheme];
    const root = document.documentElement;

    // Add transition class for smooth theme changes
    root.style.transition = 'background-color 0.5s ease-in-out, color 0.5s ease-in-out';
    document.body.style.transition = 'background 0.5s ease-in-out';

    // Apply CSS variables
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-foreground', theme.foreground);
    root.style.setProperty('--color-card', theme.card);
    root.style.setProperty('--color-card-foreground', theme.cardForeground);
    root.style.setProperty('--color-popover', theme.popover);
    root.style.setProperty('--color-popover-foreground', theme.popoverForeground);
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-foreground', theme.primaryForeground);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-secondary-foreground', theme.secondaryForeground);
    root.style.setProperty('--color-muted', theme.muted);
    root.style.setProperty('--color-muted-foreground', theme.mutedForeground);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-foreground', theme.accentForeground);
    root.style.setProperty('--color-destructive', theme.destructive);
    root.style.setProperty('--color-destructive-foreground', theme.destructiveForeground);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-input', theme.input);
    root.style.setProperty('--color-ring', theme.ring);

    // Apply body gradient background with smooth transition
    document.body.style.background = `
      radial-gradient(circle at 20% 20%, ${theme.gradientStart}, transparent 55%),
      radial-gradient(circle at 80% 0%, ${theme.gradientMid}, transparent 65%),
      linear-gradient(120deg, rgba(248, 250, 255, 0.85), ${theme.gradientEnd})
    `;
  }, [appTheme]);

  return <>{children}</>;
}
