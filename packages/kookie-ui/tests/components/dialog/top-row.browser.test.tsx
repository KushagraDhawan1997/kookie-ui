import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Dialog, Navigator, NavigatorScreen, Sheet, Theme, Toolbar } from '../../../src/components/index';

afterEach(cleanup);

// A Toolbar first in a panel's content is its top row: it sits where a Navigator's band sits,
// one step (4px) closer to the panel's edge than the content, with the Close at the far end.
function offsets(row: HTMLElement) {
  const panel = row.closest<HTMLElement>('.kui-BaseDialogContent')!;
  const p = panel.getBoundingClientRect();
  const r = row.getBoundingClientRect();
  return { top: Math.round(r.top - p.top), start: Math.round(r.left - p.left), end: Math.round(p.right - r.right) };
}

const panels = [
  { what: 'Dialog', Part: Dialog },
  { what: 'Sheet', Part: Sheet },
] as const;

describe.each(panels)('$what top row', ({ Part }) => {
  for (const size of ['1', '2', '3', '4'] as const) {
    it(`size ${size}: a hand-built top row matches a Navigator's band`, () => {
      render(
        <Theme>
          <Part.Root open>
            <Part.Content size={size} aria-describedby={undefined}>
              <Toolbar data-testid="row">
                <Toolbar.Title>
                  <Part.Title>Rename project</Part.Title>
                </Toolbar.Title>
                <Part.Close>
                  <Toolbar.Button iconOnly aria-label="Close">
                    ×
                  </Toolbar.Button>
                </Part.Close>
              </Toolbar>
            </Part.Content>
          </Part.Root>
        </Theme>,
      );
      const hand = offsets(document.querySelector<HTMLElement>('[data-testid="row"]')!);
      const pad = parseFloat(getComputedStyle(document.querySelector('.kui-BaseDialogContent')!).paddingTop);
      cleanup();

      render(
        <Theme>
          <Part.Root open>
            <Part.Content size={size} aria-describedby={undefined}>
              <Navigator>
                <NavigatorScreen title="Rename project">Body</NavigatorScreen>
              </Navigator>
            </Part.Content>
          </Part.Root>
        </Theme>,
      );
      const band = offsets(document.querySelector<HTMLElement>('.kui-NavigatorBar')!);

      expect(hand).toEqual(band);
      expect(hand.top).toBe(pad - 4);
    });
  }
});
