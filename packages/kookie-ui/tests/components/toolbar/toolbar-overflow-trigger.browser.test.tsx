import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { DropdownMenu, Theme, Toolbar, ToolbarButton, ToolbarOverflow } from '../../../src/components/index';

function Row() {
  return (
    <Theme>
      <div style={{ width: 160 }}>
        <Toolbar aria-label="Row">
          <ToolbarOverflow>
            <ToolbarButton>Alpha</ToolbarButton>
            <ToolbarButton>Bravo</ToolbarButton>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <ToolbarButton data-testid="share">Share</ToolbarButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item>Copy link</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </ToolbarOverflow>
        </Toolbar>
      </div>
    </Theme>
  );
}

// A menu trigger hands its open handlers and ARIA to the ToolbarButton it wraps. Moved into the
// More menu, the row has to keep them, or the trigger stops opening its menu.
describe('a menu trigger moved into ToolbarOverflow', () => {
  it('keeps its trigger props on the menu row', async () => {
    render(<Row />);
    await userEvent.click(await screen.findByRole('button', { name: 'More' }));
    const share = await screen.findByRole('menuitem', { name: 'Share' });
    expect(share).toHaveAttribute('aria-haspopup', 'menu');
    expect(share).toHaveAttribute('aria-expanded', 'false');
    expect(share).toHaveAttribute('data-testid', 'share');
  });

  it('opens its menu from the row by pointer', async () => {
    render(<Row />);
    await userEvent.click(await screen.findByRole('button', { name: 'More' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Share' }));
    expect(await screen.findByRole('menuitem', { name: 'Copy link' })).toBeTruthy();
    // It stays open: choosing the row must not close the More menu it lives in.
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole('menuitem', { name: 'Copy link' })).toBeTruthy();
  });

  it('opens its menu from the row by keyboard', async () => {
    render(<Row />);
    await userEvent.click(await screen.findByRole('button', { name: 'More' }));
    const share = await screen.findByRole('menuitem', { name: 'Share' });
    share.focus();
    await waitFor(() => expect(document.activeElement).toBe(share));
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('menuitem', { name: 'Copy link' })).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole('menuitem', { name: 'Copy link' })).toBeTruthy();
  });
});
