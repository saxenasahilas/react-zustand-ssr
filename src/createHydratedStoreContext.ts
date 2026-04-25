import React, { createContext, useContext, ReactNode } from 'react';
import { useHydrated } from './useHydrated';
import { PersistedStoreHook, ExtractState } from './types';

/**
 * Same as createHydratedStore but returns a React context + Provider
 * for cases where the store needs to be scoped.
 */
export function createHydratedStoreContext<
  S extends PersistedStoreHook<any>,
  T = ExtractState<S>,
  F extends Partial<T> = Partial<T>
>(storeHook: S, fallbackValues: F) {
  const Context = createContext<T | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const hydrated = useHydrated(storeHook);
    const state = storeHook();
    
    const value = hydrated ? state : ({ ...fallbackValues } as unknown as T);
    
    return React.createElement(Context.Provider, { value }, children);
  }

  function useStoreContext<U = T>(
    selector?: (state: T) => U
  ): U {
    const state = useContext(Context);
    if (state === null) {
      throw new Error('useStoreContext must be used within its Provider');
    }
    return selector ? selector(state) : (state as unknown as U);
  }

  return {
    Provider,
    useStoreContext,
  };
}
