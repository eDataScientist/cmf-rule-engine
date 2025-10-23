import { atom } from 'jotai';
import type { ClaimData } from '@/lib/types/claim';
import type { TraceResult } from '@/lib/types/trace';

export const currentClaimAtom = atom<ClaimData | null>(null);

export const claimBatchAtom = atom<ClaimData[]>([]);

export const traceResultsAtom = atom<TraceResult[]>([]);
