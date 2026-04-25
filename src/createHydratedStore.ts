import { useHydrated } from './useHydrated';
import { PersistedStoreHook, ExtractState } from './types';

/**
 * A wrapper that returns a new hook. When called on the server or before
 * rehydration, it returns fallbackValues instead of the persisted state.
 * After rehydration, it returns real state.
 */
export function createHydratedStore<
  S extends PersistedStoreHook<any>,
  T = ExtractState<S>,
  F extends Partial<T> = Partial<T>
>(storeHook: S, fallbackValues: F) {
  return function useHydratedStore<U = T>(
    selector?: (state: T) => U,
    equalityFn?: (a: U, b: U) => boolean
  ): U {
    const hydrated = useHydrated(storeHook);
    
    // We call the original hook regardless to maintain hook order and subscriptions,
    // but we might ignore its value if not hydrated.
    // However, zustand hooks are stable.
    const state = (storeHook as any)(selector, equalityFn);
    
    if (!hydrated) {
      // Apply selector to fallback values if provided
      const fallbackState = { ...fallbackValues } as unknown as T;
      if (selector) {
        return selector(fallbackState);
      }
      return fallbackState as unknown as U;
    }
    
    return state;
  };
}
