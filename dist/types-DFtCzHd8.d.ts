import { UseBoundStore, StoreApi } from 'zustand';

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

export type { ExtractState as E, PersistedStoreHook as P, WithPersist as W };
