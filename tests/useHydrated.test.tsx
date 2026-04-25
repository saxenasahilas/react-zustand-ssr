import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import React from 'react';
import { useHydrated } from '../src/useHydrated';
import { createHydratedStore } from '../src/createHydratedStore';
import { createHydratedStoreContext } from '../src/createHydratedStoreContext';

describe('zustand-ssr comprehensive tests', () => {
  it('useHydrated: transitions to true', async () => {
    let hydrated = false;
    let finishCallback = () => {};

    const storeMock = {
      persist: {
        hasHydrated: () => hydrated,
        onRehydrateStorage: (fn: any) => {
          finishCallback = () => {
             const onFinish = fn();
             if (onFinish) onFinish();
          };
          return () => {};
        }
      }
    };

    const { result } = renderHook(() => useHydrated(storeMock as any));
    expect(result.current).toBe(false);

    await act(async () => {
      hydrated = true;
      finishCallback();
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current).toBe(true);
  });

  it('createHydratedStore: uses fallback then real value', async () => {
    let hydrated = false;
    const storeMock = Object.assign((selector?: any) => {
      const state = { count: 100 };
      return selector ? selector(state) : state;
    }, {
      persist: {
        hasHydrated: () => hydrated,
        onRehydrateStorage: () => () => {}
      }
    });

    const useHydratedStore = createHydratedStore(storeMock as any, { count: 0 });
    const { result } = renderHook(() => useHydratedStore((s) => s.count));

    expect(result.current).toBe(0);

    await act(async () => {
      hydrated = true;
      await new Promise(resolve => setTimeout(resolve, 150)); // Wait for interval
    });

    expect(result.current).toBe(100);
  });

  it('createHydratedStoreContext: works through provider', async () => {
    let hydrated = false;
    const storeMock = Object.assign(() => ({ count: 50 }), {
      persist: {
        hasHydrated: () => hydrated,
        onRehydrateStorage: () => () => {}
      }
    });

    const { Provider, useStoreContext } = createHydratedStoreContext(storeMock as any, { count: 0 });

    function Consumer() {
      const count = useStoreContext((s) => s.count);
      return <div data-testid="val">{count}</div>;
    }

    render(
      <Provider>
        <Consumer />
      </Provider>
    );

    expect(screen.getByTestId('val').textContent).toBe('0');

    await act(async () => {
      hydrated = true;
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(screen.getByTestId('val').textContent).toBe('50');
  });
});
