import { P as PersistedStoreHook } from './types-DFtCzHd8.js';
import 'zustand';

/**
 * A hook that returns true once a persisted zustand store has finished
 * rehydrating from storage, and false during SSR and on the first
 * client render before rehydration completes.
 */
declare function useHydrated<T>(store: PersistedStoreHook<T>): boolean;

export { useHydrated };
