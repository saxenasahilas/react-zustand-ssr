import { P as PersistedStoreHook, E as ExtractState } from './types-DFtCzHd8.cjs';
import 'zustand';

/**
 * A wrapper that returns a new hook. When called on the server or before
 * rehydration, it returns fallbackValues instead of the persisted state.
 * After rehydration, it returns real state.
 */
declare function createHydratedStore<S extends PersistedStoreHook<any>, T = ExtractState<S>, F extends Partial<T> = Partial<T>>(storeHook: S, fallbackValues: F): <U = T>(selector?: (state: T) => U, equalityFn?: (a: U, b: U) => boolean) => U;

export { createHydratedStore };
