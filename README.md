# zustand-ssr

[![npm version](https://img.shields.io/npm/v/zustand-ssr.svg)](https://www.npmjs.com/package/zustand-ssr)
[![bundle size](https://img.shields.io/bundlephobia/minzip/zustand-ssr)](https://bundlephobia.com/package/zustand-ssr)
[![license](https://img.shields.io/npm/l/zustand-ssr.svg)](https://github.com/yourusername/zustand-ssr/blob/main/LICENSE)

Solve Zustand `persist` middleware SSR hydration mismatches in Next.js — no `useEffect`, no `isMounted`, no cascading renders.

## The Problem

When using Zustand's `persist` middleware with Next.js (App Router or Pages Router), developers often face React hydration errors. This happens because the server renders the initial/empty state, while the client hydrates with state already present in `localStorage`.

### The "Broken" Workaround

Commonly, developers use an `isMounted` pattern:

```tsx
// ❌ BROKEN: Causes cascading renders and "setState within effect" warnings
function Counter() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  const count = useStore((s) => s.count);
  
  if (!mounted) return <div>0</div>;
  return <div>{count}</div>;
}
```

This causes a secondary error: "calling setState synchronously within an effect can trigger cascading renders."

## The Solution

`zustand-ssr` solves this properly using `useSyncExternalStore`. It returns the fallback value on the server and during the very first client render, then automatically triggers a single, safe re-render once rehydration is complete.

## Installation

```bash
npm install zustand-ssr
# or
yarn add zustand-ssr
```

Requires `zustand ^5.0.0` and `react ^18.0.0`.

## Usage

### 1. `useHydrated(store)`

A hook that returns `true` once a persisted zustand store has finished rehydrating.

```tsx
import { useHydrated } from 'zustand-ssr';
import { useStore } from './store';

function Counter() {
  const hydrated = useHydrated(useStore);
  const count = useStore((s) => s.count);
  
  if (!hydrated) return <div>0</div>; // safe SSR fallback
  return <div>{count}</div>;          // real persisted value
}
```

### 2. `createHydratedStore(storeHook, fallbackValues)`

A wrapper that returns a new hook which automatically handles fallback values until hydration is complete.

```tsx
import { createHydratedStore } from 'zustand-ssr';
import { useStore } from './store';

const useHydratedStore = createHydratedStore(useStore, { count: 0 });

function Counter() {
  // No hydration check needed — fallback is automatic
  const count = useHydratedStore((s) => s.count);
  return <div>{count}</div>;
}
```

### 3. `createHydratedStoreContext(storeHook, fallbackValues)`

For scoped stores using React Context.

```tsx
const { Provider, useStoreContext } = createHydratedStoreContext(useStore, { count: 0 });

function App() {
  return (
    <Provider>
      <Counter />
    </Provider>
  );
}
```

## How it works

The package uses `useSyncExternalStore` to subscribe to Zustand's `onRehydrateStorage` event. 

1. **On the Server:** `getServerSnapshot` always returns `false` (not hydrated).
2. **On the Client (First Render):** `getClientSnapshot` returns `false` to match the server, preventing hydration mismatch.
3. **After Hydration:** Once Zustand finishes reading from storage, the subscription fires, `getClientSnapshot` returns `true`, and React triggers a safe re-render with the persisted data.

### Reliability & Performance

- **Safety Fallback:** To handle cases where Zustand's `onRehydrateStorage` might be unreliable (e.g., sync storage or reported library edge cases), `useHydrated` includes a periodic safety check that verifies `hasHydrated()` until it returns true.
- **Concurrent Rendering:** Using `useSyncExternalStore` ensures a consistent UI but triggers a synchronous re-render once hydration completes. For exceptionally large stores, this may briefly block the main thread.

## TypeScript

The `useHydrated` hook is type-safe. It will throw a TypeScript error if you pass a store that doesn't use the `persist` middleware.

```tsx
const useSimpleStore = create((set) => ({ count: 0 }));
useHydrated(useSimpleStore); // ❌ TS Error: Argument of type ... is not assignable to ...
```

## Why not just use `isMounted`?

The `useEffect` + `isMounted` pattern is a "hack" that forces a re-render after the component has mounted. While it solves the hydration error, it often leads to:
1. **Cascading Renders:** Setting state in `useEffect` causes an immediate second render pass for the entire subtree.
2. **UI Flicker:** The user sees the fallback for a split second even if the data was available immediately.
3. **Complexity:** You have to manually manage this state in every component.

`useSyncExternalStore` is the React-recommended way to subscribe to external data sources while maintaining hydration compatibility.

## License

MIT
