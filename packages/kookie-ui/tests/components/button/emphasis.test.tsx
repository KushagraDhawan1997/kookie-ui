import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Button, Chatbar, IconButton, MessageScroller, ToggleButton, ToggleIconButton, Toolbar } from '../../../src/components/index';

const RANKS = [
  ['loud', 'solid'],
  ['medium', 'raised'],
  ['quiet', 'ghost'],
] as const;

describe('emphasis is a button rank, and the same thing as its variant', () => {
  for (const [emphasis, variant] of RANKS) {
    it(`emphasis="${emphasis}" is variant="${variant}"`, () => {
      renderWithProviders(
        <>
          <Button emphasis={emphasis}>A</Button>
          <Button variant={variant}>B</Button>
          <IconButton emphasis={emphasis} aria-label="C">+</IconButton>
          <ToggleButton emphasis={emphasis}>D</ToggleButton>
          <ToggleIconButton emphasis={emphasis} aria-label="E">+</ToggleIconButton>
        </>,
      );
      const byName = (name: string) => screen.getByRole('button', { name });
      expect(byName('A').className).toBe(byName('B').className);
      for (const name of ['A', 'C', 'D', 'E']) expect(byName(name)).toHaveClass(`rt-variant-${variant}`);
    });
  }

  it('a button with neither rests at medium', () => {
    renderWithProviders(<Button>A</Button>);
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('rt-variant-raised');
  });

  it('passing both is an error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-expect-error emphasis and variant are mutually exclusive
    expect(() => renderWithProviders(<Button emphasis="loud" variant="solid">A</Button>)).toThrow(/emphasis.*variant.*not both/);
    vi.restoreAllMocks();
  });

  it('a toolbar button takes emphasis in place of its gray soft rest', () => {
    renderWithProviders(
      <Toolbar.Root aria-label="Tools">
        <Toolbar.Button emphasis="loud">Save</Toolbar.Button>
      </Toolbar.Root>,
    );
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toHaveClass('rt-variant-solid');
    expect(save).not.toHaveAttribute('data-accent-color', 'gray');
  });
});

describe('wrapped icon buttons take emphasis without throwing', () => {
  it('MessageScroller.Button and Chatbar.Send', () => {
    expect(() =>
      renderWithProviders(
        <MessageScroller.Root>
          <MessageScroller.Viewport>text</MessageScroller.Viewport>
          <MessageScroller.Button emphasis="loud" />
        </MessageScroller.Root>,
      ),
    ).not.toThrow();
    expect(() =>
      renderWithProviders(
        <Chatbar.Root>
          <Chatbar.Textarea aria-label="Message" />
          <Chatbar.Send emphasis="loud" />
        </Chatbar.Root>,
      ),
    ).not.toThrow();
  });
});
