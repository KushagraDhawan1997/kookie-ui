/**
 * The outline: every box on the page, on a bare `o`. Dev only.
 *
 * Ported from Kookie UI v2's docs.
 *
 * It renders no markup of its own, because it has nothing to draw: it borrows every box
 * already on the page. The state is a `data-outline` attribute on <html>, which is also the
 * only element the rule below can be written against.
 *
 * `outline`, not `border` or `box-shadow`. An outline is painted outside the box and takes no
 * layout space, so it cannot move the boxes it is measuring — which is the whole job. A
 * border would push every nested element by 2px per level.
 *
 * BOTH THE RULE AND THE SCRIPT ARE GATED ON DEV, in one place: this component returns null in
 * a production build, so neither the CSS nor the listener ships. The rule lives here rather
 * than in globals.css for exactly that reason — globals.css has no way to be dev-only, and a
 * rule that styles `*` is not a thing to leave in a shipped stylesheet on the argument that
 * nothing writes the attribute.
 *
 * A second tool is a row in TOOLS, not a second component.
 */
'use client';

import { useEffect } from 'react';

/** Bare `o`. No modifier, ever: a modifier means the user meant a browser shortcut. */
const TOOLS: Record<
  string,
  { store: string; read: () => boolean; write: (on: boolean) => void }
> = {
  o: {
    store: 'kd-outline',
    read: () => document.documentElement.hasAttribute('data-outline'),
    write: (on) => document.documentElement.toggleAttribute('data-outline', on),
  },
};

/* The outline reads the accent's alpha ramp, so it composites over whatever it is measuring
   and flips with the appearance for free. Hairline at the token width, so it scales with the
   theme like every other line on the page. */
const CSS = `html[data-outline] * { outline: var(--border-width-standard) solid var(--accent-a7); }`;

function readStored(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeStored(key: string, on: boolean) {
  try {
    localStorage.setItem(key, on ? '1' : '0');
  } catch {
    /* Storage denied. The session's truth is the attribute; persistence is the extra. */
  }
}

export function DevOutline() {
  useEffect(() => {
    for (const tool of Object.values(TOOLS)) tool.write(readStored(tool.store));

    const typing = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.key) return;
      const tool = TOOLS[e.key.toLowerCase()];
      if (!tool) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (typing(e.target)) return;

      const on = !tool.read();
      tool.write(on);
      writeStored(tool.store, on);
    };

    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}

/** Null in production, so the rule and the listener both disappear from the build. */
export function DevOutlineGate() {
  if (process.env.NODE_ENV === 'production') return null;
  return <DevOutline />;
}
