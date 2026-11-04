import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Theme, Toolbar, ToolbarButton, ToolbarFill, ToolbarOverflow, ToolbarSlot } from '../../../src/components/index';

describe('a toggle in the More menu', () => {
  it('is a checkbox item that says whether it is pressed', async () => {
    const onClick = vi.fn();
    render(
      <Theme>
        <div style={{ width: 160 }}>
          <Toolbar aria-label="Row">
            <ToolbarOverflow>
              <ToolbarButton>Alpha</ToolbarButton>
              <ToolbarButton>Bravo</ToolbarButton>
              <ToolbarButton aria-pressed onClick={onClick}>
                Bold
              </ToolbarButton>
              <ToolbarButton aria-pressed={false}>Italic</ToolbarButton>
            </ToolbarOverflow>
          </Toolbar>
        </div>
      </Theme>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'More' }));
    const bold = await screen.findByRole('menuitemcheckbox', { name: 'Bold' });
    expect(bold.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Italic' }).getAttribute('aria-checked')).toBe('false');
    await userEvent.click(bold);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('ToolbarSlot', () => {
  it('warns when two slots of one name are mounted', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <ToolbarFill name="dup-check">
          <ToolbarButton>Share</ToolbarButton>
        </ToolbarFill>
        <Toolbar aria-label="One">
          <ToolbarSlot name="dup-check" />
        </Toolbar>
        <Toolbar aria-label="Two">
          <ToolbarSlot name="dup-check" />
        </Toolbar>
      </Theme>,
    );
    expect(warn.mock.calls.some((call) => String(call[0]).includes('ToolbarSlot') && String(call[0]).includes('dup-check'))).toBe(true);
  });

  it('does not warn for one slot', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Toolbar aria-label="One">
          <ToolbarSlot name="single-check" />
        </Toolbar>
      </Theme>,
    );
    expect(warn.mock.calls.some((call) => String(call[0]).includes('ToolbarSlot'))).toBe(false);
  });
});
