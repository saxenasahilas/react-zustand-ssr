"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/createHydratedStoreContext.ts
var createHydratedStoreContext_exports = {};
__export(createHydratedStoreContext_exports, {
  createHydratedStoreContext: () => createHydratedStoreContext
});
module.exports = __toCommonJS(createHydratedStoreContext_exports);
var import_react2 = __toESM(require("react"), 1);

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

// src/createHydratedStoreContext.ts
function createHydratedStoreContext(storeHook, fallbackValues) {
  const Context = (0, import_react2.createContext)(null);
  function Provider({ children }) {
    const hydrated = useHydrated(storeHook);
    const state = storeHook();
    const value = hydrated ? state : { ...fallbackValues };
    return import_react2.default.createElement(Context.Provider, { value }, children);
  }
  function useStoreContext(selector) {
    const state = (0, import_react2.useContext)(Context);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createHydratedStoreContext
});
