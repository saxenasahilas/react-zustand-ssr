import { useState, useEffect } from 'react';
import { PersistedStoreHook } from './types';

/**
 * A hook that returns true once a persisted zustand store has finished
 * rehydrating from storage, and false during SSR and on the first
 * client render before rehydration completes.
 */
export function useHydrated<T>(store: PersistedStoreHook<T>): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (store.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsubscribe = store.persist.onRehydrateStorage(() => {
      return () => {
        setHydrated(true);
      };
    });

    const interval = setInterval(() => {
      if (store.persist.hasHydrated()) {
        setHydrated(true);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [store]);

  return hydrated;
}
