'use client';

import { useSyncExternalStore } from 'react';

/**
 * useHydrated — true only on the client, after hydration.
 *
 * Implemented with useSyncExternalStore instead of `useEffect(setMounted)`
 * (which React 19's new lint rules flag): the server snapshot is always
 * false, the client snapshot always true, so React reconciles the flip
 * without us calling setState in an effect.
 */
const emptySubscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
