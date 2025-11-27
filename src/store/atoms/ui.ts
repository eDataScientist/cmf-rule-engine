import { atomWithStorage } from 'jotai/utils';

// UI Theme (light/dark mode)
export const uiThemeAtom = atomWithStorage<'light' | 'dark'>('ui-theme', 'dark');

// App Theme (motor/medical - for accent colors)
export const appThemeAtom = atomWithStorage<'medical' | 'motor'>('app-theme', 'motor');
