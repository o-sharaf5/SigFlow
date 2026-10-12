'use client';

import { useEffect, useRef, useState } from 'react';
import { DEFAULT_SIGNATURE, SignatureData } from './signature-types';

const STORAGE_KEY = 'sigflow:draft:v1';

/**
 * useLocalDraft — debounced localStorage persistence with safe hydration.
 *
 * Two gotchas handled here:
 * - SSR: we start from DEFAULT_SIGNATURE and hydrate in useEffect, so the
 *    server and first client render match (no React hydration mismatch).
 *  - Quota/corruption: JSON.parse and setItem are wrapped so a bad draft or a
 *    full quota never bricks the editor.
 */
export function useLocalDraft() {
  const [data, setData] = useState<SignatureData>(DEFAULT_SIGNATURE);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore once on mount (client-only). setState-in-effect is intentional
  // here: localStorage is external mutable state that doesn't exist during
  // SSR, so there is no other way to hydrate without a mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Merge, not replace: future schema additions won't crash old drafts.
        const parsed = JSON.parse(raw) as Partial<SignatureData>;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData({
          personal: { ...DEFAULT_SIGNATURE.personal, ...parsed.personal },
          social: { ...DEFAULT_SIGNATURE.social, ...parsed.social },
          avatar: { ...DEFAULT_SIGNATURE.avatar, ...parsed.avatar },
          style: { ...DEFAULT_SIGNATURE.style, ...parsed.style },
        });
      }
    } catch {
      /* corrupt draft -> keep defaults */
    }
    setHydrated(true);
  }, []);

  // Write with a 400ms debounce so typing doesn't hammer localStorage.
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* private mode / quota exceeded -> silently skip persistence */
      }
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, hydrated]);

  const resetDraft = () => {
    setData(DEFAULT_SIGNATURE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return { data, setData, resetDraft, hydrated };
}
