import * as React from 'react';
import * as fs from 'fs';
import * as path from 'path';
import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import * as Components from '../../../src/components/index';
import { Theme } from '../../../src/components/theme';
import { Card } from '../../../src/components/card';
import { Box } from '../../../src/components/box';
import * as CheckboxCards from '../../../src/components/checkbox-cards';
import * as RadioCards from '../../../src/components/radio-cards';
import { cardPropDefs } from '../../../src/components/card.props';
import { checkboxCardsRootPropDefs } from '../../../src/components/checkbox-cards.props';
import { radioCardsRootPropDefs } from '../../../src/components/radio-cards.props';
import { marginPropDefs } from '../../../src/props/margin.props';

const SRC = path.join(__dirname, '../../../src');
const read = (file: string) =>
  fs.readFileSync(path.join(SRC, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function card(container: HTMLElement) {
  return container.querySelector('.rt-Card') as HTMLElement;
}

describe('Card', () => {
  test('sizes 1 to 4, rest 2', () => {
    expect(cardPropDefs.size.values).toEqual(['1', '2', '3', '4']);
    expect(cardPropDefs.size.default).toBe('2');
    const { container } = render(<Card />);
    expect(card(container).classList.contains('rt-r-size-2')).toBe(true);
  });

  test('follows the Theme size when unset', () => {
    const { container } = render(
      <Theme size="3">
        <Card />
        <Card size="1" />
      </Theme>,
    );
    const [themed, explicit] = Array.from(container.querySelectorAll('.rt-Card'));
    expect(themed.classList.contains('rt-r-size-3')).toBe(true);
    expect(explicit.classList.contains('rt-r-size-1')).toBe(true);
  });

  test('is a nesting surface', () => {
    const { container } = render(<Card />);
    expect(card(container).classList.contains('rt-SurfaceNest')).toBe(true);
  });

  test('has no flush or inset prop', () => {
    expect('flush' in cardPropDefs).toBe(false);
    expect('inset' in cardPropDefs).toBe(false);
    // @ts-expect-error removed props
    const { container } = render(<Card flush inset />);
    expect(card(container).hasAttribute('data-flush')).toBe(false);
    expect(card(container).hasAttribute('data-inset')).toBe(false);
  });

  test('pads --kui-sf-p and draws --kui-sf-r', () => {
    const css = read('components/card.css');
    expect(css).toMatch(/--base-card-padding-top:\s*var\(--kui-sf-p\)/);
    expect(css).toMatch(/--base-card-border-radius:\s*var\(--kui-sf-r\)/);
  });

  test('base card sizes read the surface ladder, no size 5', () => {
    const css = read('components/_internal/base-card.css');
    for (const n of [1, 2, 3, 4]) {
      expect(css).toContain(`--base-card-padding-top: var(--surface-p-${n})`);
      expect(css).toContain(`--base-card-border-radius: var(--radius-surface-${n})`);
    }
    expect(css).not.toContain('rt-r-size-5');
    expect(css).not.toMatch(/data-(flush|inset)/);
    expect(css).not.toContain('--inset-');
  });
});

describe('bleed', () => {
  test('every margin prop takes bleed', () => {
    for (const name of ['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'] as const) {
      expect(marginPropDefs[name].values).toContain('bleed');
    }
  });

  test('writes the bleed class', () => {
    const { container } = render(
      <Card>
        <Box mx="bleed" data-testid="b" />
      </Card>,
    );
    expect(container.querySelector('[data-testid="b"]')?.classList.contains('rt-r-mx-bleed')).toBe(true);
  });

  test('cancels the nearest surface padding', () => {
    const css = read('styles/utilities/margin.css');
    const sides = { m: 4, mx: 2, my: 2, mt: 1, mr: 1, mb: 1, ml: 1 };
    for (const [name, count] of Object.entries(sides)) {
      const rule = css.match(new RegExp(`\\.rt-r-${name}-bleed \\{(\\s*--margin[^}]*)\\}`));
      expect(rule, name).not.toBeNull();
      const decls = rule![1].match(/calc\(-1 \* var\(--kui-sf-p, 0px\)\)/g) ?? [];
      expect(decls.length, name).toBe(count);
    }
  });
});

describe('Inset', () => {
  test('is gone', () => {
    expect('Inset' in Components).toBe(false);
    expect(fs.existsSync(path.join(SRC, 'components/inset.tsx'))).toBe(false);
    expect(fs.existsSync(path.join(SRC, 'components/inset.css'))).toBe(false);
    expect(read('components/index.css')).not.toContain('inset.css');
  });
});

describe('CheckboxCards and RadioCards', () => {
  test('sizes 1 to 4, rest 2', () => {
    for (const defs of [checkboxCardsRootPropDefs, radioCardsRootPropDefs]) {
      expect(defs.size.values).toEqual(['1', '2', '3', '4']);
      expect(defs.size.default).toBe('2');
    }
  });

  test('items take the resolved size, including the default and the Theme size', () => {
    const { container } = render(
      <>
        <CheckboxCards.Root>
          <CheckboxCards.Item value="a">A</CheckboxCards.Item>
        </CheckboxCards.Root>
        <Theme size="4">
          <RadioCards.Root>
            <RadioCards.Item value="a">A</RadioCards.Item>
          </RadioCards.Root>
        </Theme>
      </>,
    );
    const checkboxItem = container.querySelector('.rt-CheckboxCardsItem') as HTMLElement;
    const radioItem = container.querySelector('.rt-RadioCardsItem') as HTMLElement;
    expect(checkboxItem.classList.contains('rt-r-size-2')).toBe(true);
    expect(radioItem.classList.contains('rt-r-size-4')).toBe(true);
  });

  test('responsive size reaches the items', () => {
    const { container } = render(
      <RadioCards.Root size={{ initial: '1', md: '3' }}>
        <RadioCards.Item value="a">A</RadioCards.Item>
      </RadioCards.Root>,
    );
    const item = container.querySelector('.rt-RadioCardsItem') as HTMLElement;
    expect(item.classList.contains('rt-r-size-1')).toBe(true);
    expect(item.classList.contains('md:rt-r-size-3')).toBe(true);
  });

  test('item corners follow the surface ladder, no size 5', () => {
    for (const file of ['components/checkbox-cards.css', 'components/radio-cards.css']) {
      const css = read(file);
      expect(css, file).not.toContain('rt-r-size-5');
      expect(css, file).not.toContain('--base-card-border-radius');
    }
  });
});
