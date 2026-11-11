import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Button, Dialog, Navigator, NavigatorScreen, Sheet, Theme, Toolbar } from '../../../src/components/index';

const noClose = (spy: ReturnType<typeof vi.spyOn>, what: string) =>
  spy.mock.calls.some((args: unknown[]) => String(args[0]).includes(`A titled <${what}> has no Close`));

// The warning reads the DOM after paint, so let two frames pass before asserting silence.
const afterPaint = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

const panels = [
  { what: 'Dialog', Part: Dialog },
  { what: 'Sheet', Part: Sheet },
] as const;

describe.each(panels)('$what close warning', ({ what, Part }) => {
  it('warns when a titled panel has no Close in a top-row Toolbar', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Part.Root open>
          <Part.Content aria-describedby={undefined}>
            <Part.Title>Rename project</Part.Title>
            <Part.Close>
              <Button>Cancel</Button>
            </Part.Close>
          </Part.Content>
        </Part.Root>
      </Theme>,
    );
    await waitFor(() => expect(noClose(warn, what)).toBe(true));
    warn.mockRestore();
  });

  it('does not warn with a Close X in a top-row Toolbar', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Part.Root open>
          <Part.Content aria-describedby={undefined}>
            <Toolbar>
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
    await afterPaint();
    expect(noClose(warn, what)).toBe(false);
    warn.mockRestore();
  });

  it('does not warn when a Navigator draws the band', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Part.Root open>
          <Part.Content aria-describedby={undefined}>
            <Navigator>
              <NavigatorScreen title="Settings">Body</NavigatorScreen>
            </Navigator>
          </Part.Content>
        </Part.Root>
      </Theme>,
    );
    await afterPaint();
    expect(noClose(warn, what)).toBe(false);
    warn.mockRestore();
  });

  it('does not warn when the panel has no title, only an aria-label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Part.Root open>
          <Part.Content aria-label="Share" aria-describedby={undefined}>
            <Button>Copy link</Button>
          </Part.Content>
        </Part.Root>
      </Theme>,
    );
    await afterPaint();
    expect(noClose(warn, what)).toBe(false);
    warn.mockRestore();
  });
});
