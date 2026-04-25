import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useHydrated } from '../src/useHydrated';
import { createHydratedStore } from '../src/createHydratedStore';
import { createHydratedStoreContext } from '../src/createHydratedStoreContext';

interface CounterState {
  count: number;
  name: string;
  inc: () => void;
}

describe('zustand-ssr exhaustive tests', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('useHydrated should handle multiple hooks on the same store', async () => {
    const useStore = create<CounterState>()(
      persist(
        (set) => ({
          count: 0,
          name: 'test',
          inc: () => set((state) => ({ count: state.count + 1 })),
        }),
        { name: 'multi-hook-test' }
      )
    );

    const { result: h1 } = renderHook(() => useHydrated(useStore as any));
    const { result: h2 } = renderHook(() => useHydrated(useStore as any));

    expect(h1.current).toBe(h2.current);
    // In sync environment they might both be true immediately
    expect(h1.current).toBe(true);
  });

  it('createHydratedStore should work with selectors and equality functions', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(JSON.stringify({ state: { count: 42, name: 'persisted' }, version: 0 })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    const useStore = create<CounterState>()(
      persist(
        (set) => ({
          count: 0,
          name: 'initial',
          inc: () => set((state) => ({ count: state.count + 1 })),
        }),
        { name: 'selector-test' }
      )
    );

    const useHydratedStore = createHydratedStore(useStore as any, { count: -1, name: 'fallback' });

    const { result: count } = renderHook(() => useHydratedStore((s) => s.count));
    const { result: name } = renderHook(() => useHydratedStore((s) => s.name));

    expect(count.current).toBe(42);
    expect(name.current).toBe('persisted');
  });

  it('createHydratedStoreContext should provide state correctly', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(JSON.stringify({ state: { count: 100 }, version: 0 })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    const useStore = create<CounterState>()(
      persist(
        (set) => ({
          count: 0,
          name: 'ctx',
          inc: () => set((state) => ({ count: state.count + 1 })),
        }),
        { name: 'ctx-test' }
      )
    );

    const { Provider, useStoreContext } = createHydratedStoreContext(useStore as any, { count: 0 });

    function Consumer() {
      const count = useStoreContext((s) => s.count);
      return <div data-testid="count">{count}</div>;
    }

    render(
      <Provider>
        <Consumer />
      </Provider>
    );

    expect(screen.getByTestId('count').textContent).toBe('100');
  });

  it('createHydratedStoreContext should throw if used outside provider', () => {
    const useStore = create<CounterState>()(
      persist(
        (set) => ({
          count: 0,
          name: 'error',
          inc: () => set((state) => ({ count: state.count + 1 })),
        }),
        { name: 'error-test' }
      )
    );

    const { useStoreContext } = createHydratedStoreContext(useStore as any, { count: 0 });

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useStoreContext())).toThrow('useStoreContext must be used within its Provider');
    
    consoleSpy.mockRestore();
  });

  it('should handle rehydration errors gracefully', async () => {
    const useStore = create<CounterState>()(
      persist(
        (set) => ({
          count: 0,
          name: 'error-handling',
          inc: () => set((state) => ({ count: state.count + 1 })),
        }),
        { 
          name: 'fail-test',
          onRehydrateStorage: () => {
            return (state, error) => {
               // Hydration finished (even if error occurred)
            };
          }
        }
      )
    );

    const { result } = renderHook(() => useHydrated(useStore as any));
    expect(result.current).toBe(true); // Once rehydrate storage callback fires, it's "hydrated" (attempt finished)
  });
});
