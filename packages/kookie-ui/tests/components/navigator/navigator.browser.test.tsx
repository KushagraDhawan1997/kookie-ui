/**
 * Navigator, mounted (ported from v2, 2026-11-03).
 *
 * The stack goes as deep as the path says, the screens underneath stay mounted but hidden, Back
 * is absent at the root and names where it goes, a pushed screen's title takes focus, in a pane
 * the band carries Back and the top title, and in a Dialog the title names the panel.
 */
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Dialog, Navigator, NavigatorLink, NavigatorScreen, Shell, Theme } from '../../../src/components/index';

const LEVELS = ['Settings', 'Notifications', 'Email', 'Digest'];

function screen(title: string) {
  const next = LEVELS[LEVELS.indexOf(title) + 1];
  return (
    <NavigatorScreen title={title}>
      {next ? <NavigatorLink value={next}>{next}</NavigatorLink> : <span data-end>{title}</span>}
      <input data-draft aria-label={`${title} draft`} />
    </NavigatorScreen>
  );
}

const visibleLevels = (root: Element) => [...root.querySelectorAll('.kui-NavigatorLevel')].filter((el) => (el as HTMLElement).offsetParent !== null);
const visibleTitle = (root: Element) => visibleLevels(root)[0]?.querySelector('h2')?.textContent;

describe('a stack of screens, any depth', () => {
  it('opens the path it is given, and shows only the top screen', async () => {
    const { container } = render(
      <Theme>
        <Navigator defaultPath={['Notifications', 'Email', 'Digest']} root={screen('Settings')} screen={screen} />
      </Theme>,
    );
    await waitFor(() => expect(container.querySelectorAll('.kui-NavigatorLevel')).toHaveLength(4));
    expect(visibleLevels(container)).toHaveLength(1);
    expect(visibleTitle(container)).toBe('Digest');
  });

  it('keeps what was typed on a screen underneath', async () => {
    const { container } = render(
      <Theme>
        <Navigator root={screen('Settings')} screen={screen} />
      </Theme>,
    );
    container.querySelector<HTMLInputElement>('[data-draft]')!.value = 'kept';
    container.querySelector<HTMLButtonElement>('.kui-NavigatorLink')!.click();
    await waitFor(() => expect(visibleTitle(container)).toBe('Notifications'));
    visibleLevels(container)[0]!.querySelector<HTMLButtonElement>('.kui-NavigatorBar button')!.click();
    await waitFor(() => expect(visibleTitle(container)).toBe('Settings'));
    expect(visibleLevels(container)[0]!.querySelector<HTMLInputElement>('[data-draft]')!.value).toBe('kept');
  });
});

describe('Back', () => {
  it('is absent at the root and names the screen it returns to', async () => {
    const { container } = render(
      <Theme>
        <Navigator root={screen('Settings')} screen={screen} />
      </Theme>,
    );
    expect(container.querySelector('.kui-NavigatorBar button')).toBeNull();
    container.querySelector<HTMLButtonElement>('.kui-NavigatorLink')!.click();
    await waitFor(() => expect(visibleLevels(container)[0]?.querySelector('.kui-NavigatorBar button')?.getAttribute('aria-label')).toBe('Back to Settings'));
  });

  it('moves focus to the new title on push, and back to the opener on pop', async () => {
    const { container } = render(
      <Theme>
        <Navigator root={screen('Settings')} screen={screen} />
      </Theme>,
    );
    const opener = container.querySelector<HTMLButtonElement>('.kui-NavigatorLink')!;
    opener.focus();
    opener.click();
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Notifications'));
    visibleLevels(container)[0]!.querySelector<HTMLButtonElement>('.kui-NavigatorBar button')!.click();
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });
});

describe('in a Shell pane, the pane band carries Back and the title', () => {
  it('puts Back and the top title together at the start of the band', async () => {
    const { container } = render(
      <Theme>
        <Shell.Root height="400px" style={{ width: 900 }}>
          <Shell.Content>work</Shell.Content>
          <Shell.Inspector defaultOpen presentation="fixed">
            <Navigator root={screen('Settings')} screen={screen} />
          </Shell.Inspector>
        </Shell.Root>
      </Theme>,
    );
    await waitFor(() => expect(container.querySelector('.kui-ToolbarTitle')?.textContent).toBe('Settings'));
    // No band of the screen's own inside a pane.
    expect(container.querySelector('.kui-NavigatorBar')).toBeNull();
    container.querySelector<HTMLButtonElement>('.kui-NavigatorLink')!.click();
    await waitFor(() => expect(container.querySelector('.kui-ToolbarTitle')?.textContent).toBe('Notifications'));
    const back = container.querySelector<HTMLElement>("[aria-label='Back to Settings']")!.getBoundingClientRect();
    const title = container.querySelector<HTMLElement>('.kui-ToolbarTitle')!.getBoundingClientRect();
    expect(title.left - back.right, 'the title split away from Back').toBeLessThan(40);
  });
});

describe('in a Dialog', () => {
  it("names the dialog with the screen's title and closes from the band", async () => {
    let open = true;
    render(
      <Theme>
        <Dialog.Root defaultOpen onOpenChange={(v) => (open = v)}>
          <Dialog.Content>
            <Navigator root={screen('Settings')} screen={screen} />
          </Dialog.Content>
        </Dialog.Root>
      </Theme>,
    );
    const dialog = await waitFor(() => document.querySelector<HTMLElement>('[role=dialog]')!);
    const labelledBy = dialog.getAttribute('aria-labelledby')!;
    expect(document.getElementById(labelledBy)?.textContent).toBe('Settings');
    dialog.querySelector<HTMLButtonElement>("[aria-label='Close']")!.click();
    await waitFor(() => expect(open).toBe(false));
  });
});
