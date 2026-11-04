import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Tooltip, TooltipProvider } from '../../../src/components/tooltip';
import { Button } from '../../../src/components/button';
import { Theme } from '../../../src/components/theme';

const hover = (el: Element) => fireEvent.pointerMove(el, { pointerType: 'mouse' });
const wait = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const tip = (name: string) => screen.queryAllByText(name).find((el) => el.closest('.kui-TooltipContent'));

afterEach(() => {
  vi.useRealTimers();
});

describe('Tooltip provider', () => {
  it('works with no Theme and no provider above it', () => {
    render(
      <Tooltip content="Undo" defaultOpen>
        <button type="button">Undo</button>
      </Tooltip>,
    );
    expect(tip('Undo')).toBeDefined();
  });

  it('gives a Button tooltip its own provider outside a Theme', () => {
    render(
      <Button tooltip="Save the file" tooltipDelayDuration={0}>
        Save
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('waits 200ms before opening, inside a Theme', () => {
    vi.useFakeTimers();
    render(
      <Theme>
        <Tooltip content="Bold">
          <button type="button">B</button>
        </Tooltip>
      </Theme>,
    );
    hover(screen.getByRole('button', { name: 'B' }));
    wait(199);
    expect(tip('Bold')).toBeUndefined();
    wait(1);
    expect(tip('Bold')).toBeDefined();
  });

  it('opens the next tooltip at once inside a TooltipProvider', () => {
    vi.useFakeTimers();
    render(
      <TooltipProvider>
        <Tooltip content="Bold">
          <button type="button">B</button>
        </Tooltip>
        <Tooltip content="Italic">
          <button type="button">I</button>
        </Tooltip>
      </TooltipProvider>,
    );
    const bold = screen.getByRole('button', { name: 'B' });
    hover(bold);
    wait(200);
    expect(tip('Bold')).toBeDefined();
    // The pointer moves along the row while the first tooltip is still open.
    hover(screen.getByRole('button', { name: 'I' }));
    expect(tip('Italic')).toBeDefined();
  });

  it('makes each lone tooltip wait on its own', () => {
    vi.useFakeTimers();
    render(
      <Theme>
        <Tooltip content="Bold">
          <button type="button">B</button>
        </Tooltip>
        <Tooltip content="Italic">
          <button type="button">I</button>
        </Tooltip>
      </Theme>,
    );
    const bold = screen.getByRole('button', { name: 'B' });
    hover(bold);
    wait(200);
    hover(screen.getByRole('button', { name: 'I' }));
    expect(tip('Italic')).toBeUndefined();
    wait(200);
    expect(tip('Italic')).toBeDefined();
  });
});
