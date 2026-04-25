import React, { ReactNode } from 'react';
import { P as PersistedStoreHook, E as ExtractState } from './types-DFtCzHd8.js';
import 'zustand';

/**
 * Same as createHydratedStore but returns a React context + Provider
 * for cases where the store needs to be scoped.
 */
declare function createHydratedStoreContext<S extends PersistedStoreHook<any>, T = ExtractState<S>, F extends Partial<T> = Partial<T>>(storeHook: S, fallbackValues: F): {
    Provider: ({ children }: {
        children: ReactNode;
    }) => React.FunctionComponentElement<React.ProviderProps<T | null>>;
    useStoreContext: <U = T>(selector?: (state: T) => U) => U;
};

export { createHydratedStoreContext };
