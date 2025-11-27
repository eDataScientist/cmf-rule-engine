import { atom } from 'jotai';
import type { ReactNode } from 'react';

// Header breadcrumbs - array of { label, href? }
export interface Breadcrumb {
  label: string;
  href?: string;
}

// Custom header state that pages can set
export const headerBreadcrumbsAtom = atom<Breadcrumb[] | null>(null);
export const headerActionsAtom = atom<ReactNode | null>(null);

// Full canvas mode - removes padding from main content area
export const fullCanvasModeAtom = atom<boolean>(false);
