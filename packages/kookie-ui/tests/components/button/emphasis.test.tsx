import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Button, Toggle, Toolbar } from '../../../src/components/index';

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
          <Button iconOnly emphasis={emphasis} aria-label="C">+</Button>
          <Toggle emphasis={emphasis}>D</Toggle>
          <Toggle iconOnly emphasis={emphasis} aria-label="E">+</Toggle>
        </>,
      );
      const byName = (name: string) => screen.getByRole('button', { name });
      expect(byName('A').className).toBe(byName('B').className);
      for (const name of ['A', 'C', 'D', 'E']) expect(byName(name)).toHaveClass(`kui-variant-${variant}`);
    });
  }

  it('a button or toggle with neither is solid, as before 0.14', () => {
    renderWithProviders(
      <>
        <Button>A</Button>
        <Button iconOnly aria-label="B">+</Button>
        <Toggle>C</Toggle>
        <Toggle iconOnly aria-label="D">+</Toggle>
      </>,
    );
    for (const name of ['A', 'B', 'C', 'D']) expect(screen.getByRole('button', { name })).toHaveClass('kui-variant-solid');
  });

  it('passing both logs an error and emphasis wins, without throwing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-expect-error emphasis and variant are mutually exclusive
    expect(() => renderWithProviders(<Button emphasis="loud" variant="soft">A</Button>)).not.toThrow();
    expect(error.mock.calls.some(([message]) => /emphasis.*variant.*not both/.test(String(message)))).toBe(true);
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('kui-variant-solid');
    vi.restoreAllMocks();
  });

  it('a toolbar button takes emphasis in place of its gray soft rest', () => {
    renderWithProviders(
      <Toolbar.Root aria-label="Tools">
        <Toolbar.Button emphasis="loud">Save</Toolbar.Button>
      </Toolbar.Root>,
    );
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toHaveClass('kui-variant-solid');
    expect(save).not.toHaveAttribute('data-accent-color', 'gray');
  });
});
