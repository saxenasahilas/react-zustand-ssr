import {
  useHydrated
} from "./chunk-NY4L62ZX.js";

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

export {
  createHydratedStore
};
