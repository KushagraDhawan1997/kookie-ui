import * as React from 'react';

/**
 * A titled panel closes from its top row (RULES.md, 2026-11-11). Every Dialog and Sheet with a
 * title has an X at the end of a Toolbar in its top row; Cancel, Escape and a press outside don't
 * replace it. Dev only, once per mount.
 *
 * It reads the DOM after paint, not the props: the title and the close can each come from the
 * caller or from a Navigator, which draws both. Radix points `aria-labelledby` at the title's id
 * whether or not a title mounted, so "titled" means that id names an element in the panel.
 */
function useCloseWarning(what: 'Dialog' | 'Sheet'): (node: HTMLElement | null) => void {
  const seen = React.useRef(false);
  return React.useCallback(
    (node: HTMLElement | null) => {
      if (process.env.NODE_ENV === 'production' || !node || seen.current) return;
      requestAnimationFrame(() => {
        if (seen.current || !node.isConnected) return;
        const titleId = node.getAttribute('aria-labelledby');
        const title = titleId ? node.ownerDocument.getElementById(titleId) : null;
        if (!title || !node.contains(title)) return;
        const close = Array.from(node.querySelectorAll('.kui-Toolbar button')).some((button) =>
          /^(close|dismiss|done)\b/i.test((button.getAttribute('aria-label') || button.textContent || '').trim()),
        );
        if (close) return;
        seen.current = true;
        console.warn(
          `[kookie-ui] A titled <${what}> has no Close in its top row. Put a <Toolbar> first in ` +
            `<${what}.Content>, holding <Toolbar.Title><${what}.Title>…</${what}.Title></Toolbar.Title> and ` +
            `<${what}.Close><Toolbar.Button iconOnly aria-label="Close">…</Toolbar.Button></${what}.Close>.`,
        );
      });
    },
    [what],
  );
}

export { useCloseWarning };
