// src/useHydrated.ts
import { useSyncExternalStore } from "react";
function useHydrated(store) {
  return useSyncExternalStore(
    (callback) => {
      if (store.persist.hasHydrated()) {
        return () => {
        };
      }
      return store.persist.onRehydrateStorage(() => {
        return (state, error) => {
          callback();
        };
      });
    },
    () => store.persist.hasHydrated(),
    () => false
    // Always false on the server
  );
}

export {
  useHydrated
};
