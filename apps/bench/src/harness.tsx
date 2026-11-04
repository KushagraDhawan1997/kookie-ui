import * as React from 'react';

/**
 * What every scene hands the runner: a way to change all of its content at once, so the runner
 * can time a re-render, and the element that scrolls, so it can time scrolling.
 */
export interface SceneApi {
  rerender: () => void;
  scroller?: () => HTMLElement | null;
}

declare global {
  interface Window {
    __bench: { scene?: SceneApi; mountedAt?: number };
  }
}

window.__bench = window.__bench ?? {};

/** Registers the scene and records when its first commit has painted. */
export function useScene(api: SceneApi) {
  React.useEffect(() => {
    window.__bench.scene = api;
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.__bench.mountedAt = performance.now();
      }, 0);
    });
  }, [api]);
}

/** A counter that changes every row of a scene when it moves. */
export function useVersion(): [number, () => void] {
  const [version, setVersion] = React.useState(0);
  const bump = React.useCallback(() => setVersion((v) => v + 1), []);
  return [version, bump];
}
