import { useSyncExternalStore, useRef, useMemo } from 'react';
import { PersistedStoreHook } from './types';

/**
 * A hook that returns true once a persisted zustand store has finished
 * rehydrating from storage, and false during SSR and on the first
 * client render before rehydration completes.
 */
export function useHydrated<T>(store: PersistedStoreHook<T>): boolean {
  // We use a ref to track if we've already finished the first render pass on the client.
  // This helps us ensure that the first client render ALWAYS returns false to match the server,
  // preventing hydration mismatches.
  const isFirstRender = useRef(true);

  return useSyncExternalStore(
    (callback) => {
      // If already hydrated, we don't need to subscribe for the finish event,
      // but we still return a no-op cleanup for the subscription.
      if (store.persist.hasHydrated()) {
        return () => {};
      }

      // Subscribe to rehydration events
      return store.persist.onRehydrateStorage(() => {
        // This function is called when rehydration starts.
        // It returns another function that is called when rehydration ends.
        return (state, error) => {
          callback();
        };
      });
    },
    () => {
      // On the client:
      // If it's the very first call during hydration, we MUST return false
      // to match the server snapshot.
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return false;
      }
      // Subsequent calls return the actual hydration status.
      return store.persist.hasHydrated();
    },
    () => false // Always false on the server
  );
}
