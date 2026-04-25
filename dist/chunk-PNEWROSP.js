import {
  useHydrated
} from "./chunk-NY4L62ZX.js";

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
  createHydratedStoreContext
};
