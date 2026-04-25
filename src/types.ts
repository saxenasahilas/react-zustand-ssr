import { StoreApi, UseBoundStore } from 'zustand';

export type WithPersist<S> = S extends { persist: any } ? S : never;

export type PersistedStoreHook<T> = UseBoundStore<StoreApi<T>> & {
  persist: {
    onRehydrateStorage: (fn: (state: T | undefined, error: unknown) => void | ((state: T | undefined, error: unknown) => void)) => () => void;
    hasHydrated: () => boolean;
  };
};

export type ExtractState<S> = S extends { getState: () => infer T } ? T : never;
