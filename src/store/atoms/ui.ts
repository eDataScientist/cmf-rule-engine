import { atomWithStorage } from 'jotai/utils';

export const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light');
export const appThemeAtom = atomWithStorage<'medical' | 'motor'>('app-theme', 'motor');
