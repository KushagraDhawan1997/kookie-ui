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

// A toolbar with no size of its own rests one step above its panel, as in a Shell pane.
describe.each(panels)('$what top row size', ({ Part }) => {
  const steps = { '1': '2', '2': '3', '3': '4', '4': '4' } as const;
  for (const size of ['1', '2', '3', '4'] as const) {
    it(`size ${size} panel: the row and its buttons are size ${steps[size]}`, () => {
      render(
        <Theme>
          <Part.Root open>
            <Part.Content size={size} aria-describedby={undefined}>
              <Toolbar data-testid="row">
                <Toolbar.Title>
                  <Part.Title>Spark credits</Part.Title>
                </Toolbar.Title>
                <Toolbar.Button iconOnly aria-label="Close">
                  ×
                </Toolbar.Button>
              </Toolbar>
            </Part.Content>
          </Part.Root>
        </Theme>,
      );
      expect(document.querySelector('[data-testid="row"]')!.classList).toContain(`kui-r-size-${steps[size]}`);
      // The panel's title takes the row's title step, not its own heading size.
      const title = document.querySelector('.kui-ToolbarTitle')!;
      const heading = title.querySelector('.kui-Heading')!;
      expect(getComputedStyle(heading).fontSize).toBe(getComputedStyle(title).fontSize);
      // The panel's title reads one text step above a pane header's at the same row size.
      const titleStep = { '1': '3', '2': '4', '3': '5', '4': '6' } as const;
      expect(title.classList).toContain(`kui-r-size-${titleStep[steps[size]]}`);
    });
  }

  it('with no size, rests one step above the default panel size', () => {
    render(
      <Theme>
        <Part.Root open>
          <Part.Content aria-describedby={undefined}>
            <Toolbar data-testid="row">
              <Part.Title>T</Part.Title>
            </Toolbar>
          </Part.Content>
        </Part.Root>
      </Theme>,
    );
    expect(document.querySelector('[data-testid="row"]')!.classList).toContain('kui-r-size-3');
  });

  it('the title starts on the body inset, while Close stays at the corner', () => {
    render(
      <Theme>
        <Part.Root open>
          <Part.Content size="2" aria-describedby={undefined}>
            <Toolbar data-testid="row">
              <Toolbar.Title>
                <Part.Title>Spark credits</Part.Title>
              </Toolbar.Title>
              <Toolbar.Button iconOnly aria-label="Close" data-testid="close">
                ×
              </Toolbar.Button>
            </Toolbar>
            <p data-testid="body" style={{ margin: 0 }}>
              Body
            </p>
          </Part.Content>
        </Part.Root>
      </Theme>,
    );
    const left = (id: string) => document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect();
    // Where the title's text starts: its box plus the inset it takes.
    const titleEl = document.querySelector('.kui-ToolbarTitle')!;
    const textStart = titleEl.getBoundingClientRect().left + parseFloat(getComputedStyle(titleEl).paddingLeft);
    expect(textStart).toBeCloseTo(left('body').left, 0);
    expect(left('close').right).toBeGreaterThan(left('body').right);
  });

  it('a size on the toolbar wins', () => {
    render(
      <Theme>
        <Part.Root open>
          <Part.Content size="3" aria-describedby={undefined}>
            <Toolbar data-testid="row" size="1">
              <Part.Title>T</Part.Title>
            </Toolbar>
          </Part.Content>
        </Part.Root>
      </Theme>,
    );
    expect(document.querySelector('[data-testid="row"]')!.classList).toContain('kui-r-size-1');
  });
});
