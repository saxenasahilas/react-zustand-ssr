import { UseBoundStore, StoreApi } from 'zustand';
import React, { ReactNode } from 'react';

type WithPersist<S> = S extends {
    persist: any;
} ? S : never;
type PersistedStoreHook<T> = UseBoundStore<StoreApi<T>> & {
    persist: {
        onRehydrateStorage: (fn: (state: T | undefined, error: unknown) => void | ((state: T | undefined, error: unknown) => void)) => () => void;
        hasHydrated: () => boolean;
    };
};
type ExtractState<S> = S extends {
    getState: () => infer T;
} ? T : never;

/**
 * A hook that returns true once a persisted zustand store has finished
 * rehydrating from storage, and false during SSR and on the first
 * client render before rehydration completes.
 */
declare function useHydrated<T>(store: PersistedStoreHook<T>): boolean;

/**
 * A wrapper that returns a new hook. When called on the server or before
 * rehydration, it returns fallbackValues instead of the persisted state.
 * After rehydration, it returns real state.
 */
declare function createHydratedStore<S extends PersistedStoreHook<any>, T = ExtractState<S>, F extends Partial<T> = Partial<T>>(storeHook: S, fallbackValues: F): <U = T>(selector?: (state: T) => U, equalityFn?: (a: U, b: U) => boolean) => U;

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

export { type ExtractState, type PersistedStoreHook, type WithPersist, createHydratedStore, createHydratedStoreContext, useHydrated };
