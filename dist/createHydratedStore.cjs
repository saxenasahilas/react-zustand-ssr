"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/createHydratedStore.ts
var createHydratedStore_exports = {};
__export(createHydratedStore_exports, {
  createHydratedStore: () => createHydratedStore
});
module.exports = __toCommonJS(createHydratedStore_exports);

// src/useHydrated.ts
var import_react = require("react");
function useHydrated(store) {
  return (0, import_react.useSyncExternalStore)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createHydratedStore
});
