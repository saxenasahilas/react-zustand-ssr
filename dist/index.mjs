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

// src/createHydratedStore.ts
function createHydratedStore(storeHook, fallbackValues) {
  return function useHydratedStore(selector, equalityFn) {
    const hydrated = useHydrated(storeHook);
    const state = storeHook(selector, equalityFn);
    if (!hydrated) {
      const fallbackState = { ...fallbackValues };
      if (selector) {
        return selector(fallbackState);
      }
      return fallbackState;
    }
    return state;
  };
}

// src/createHydratedStoreContext.ts
import React, { createContext, useContext } from "react";
function createHydratedStoreContext(storeHook, fallbackValues) {
  const Context = createContext(null);
  function Provider({ children }) {
    const hydrated = useHydrated(storeHook);
    const state = storeHook();
    const value = hydrated ? state : { ...fallbackValues };
    return React.createElement(Context.Provider, { value }, children);
  }
  function useStoreContext(selector) {
    const state = useContext(Context);
    if (state === null) {
      throw new Error("useStoreContext must be used within its Provider");
    }
    return selector ? selector(state) : state;
  }
  return {
    Provider,
    useStoreContext
  };
}
export {
  createHydratedStore,
  createHydratedStoreContext,
  useHydrated
};
