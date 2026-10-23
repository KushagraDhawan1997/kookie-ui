import * as React from 'react';
import * as fs from 'fs';
import * as path from 'path';
import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import * as Components from '../../../src/components/index';
import { Theme } from '../../../src/components/theme';
import { Card } from '../../../src/components/card';
import { Box } from '../../../src/components/box';
import { cardPropDefs } from '../../../src/components/card.props';
import { marginPropDefs } from '../../../src/props/margin.props';

const SRC = path.join(__dirname, '../../../src');
const read = (file: string) =>
  fs.readFileSync(path.join(SRC, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function card(container: HTMLElement) {
  return container.querySelector('.kui-Card') as HTMLElement;
}

describe('Card', () => {
  test('sizes 1 to 4, rest 2', () => {
    expect(cardPropDefs.size.values).toEqual(['1', '2', '3', '4']);
    expect(cardPropDefs.size.default).toBe('2');
    const { container } = render(<Card />);
    expect(card(container).classList.contains('kui-r-size-2')).toBe(true);
  });

  test('follows the Theme size when unset', () => {
    const { container } = render(
      <Theme size="3">
        <Card />
        <Card size="1" />
      </Theme>,
    );
    const [themed, explicit] = Array.from(container.querySelectorAll('.kui-Card'));
    expect(themed.classList.contains('kui-r-size-3')).toBe(true);
    expect(explicit.classList.contains('kui-r-size-1')).toBe(true);
  });

  test('is a nesting surface', () => {
    const { container } = render(<Card />);
    expect(card(container).classList.contains('kui-SurfaceNest')).toBe(true);
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
    expect(css).not.toContain('kui-r-size-5');
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
    expect(container.querySelector('[data-testid="b"]')?.classList.contains('kui-r-mx-bleed')).toBe(true);
  });

  test('cancels the nearest surface padding', () => {
    const css = read('styles/utilities/margin.css');
    const sides = { m: 4, mx: 2, my: 2, mt: 1, mr: 1, mb: 1, ml: 1 };
    for (const [name, count] of Object.entries(sides)) {
      const rule = css.match(new RegExp(`\\.kui-r-${name}-bleed \\{(\\s*--margin[^}]*)\\}`));
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

describe('CheckboxCards and RadioCards are gone', () => {
  test('a Card holding a Checkbox or Radio takes their place', () => {
    for (const name of ['CheckboxCards', 'RadioCards']) expect(name in Components).toBe(false);
    for (const file of ['components/checkbox-cards.tsx', 'components/radio-cards.tsx', 'components/checkbox-cards.css', 'components/radio-cards.css']) {
      expect(fs.existsSync(path.join(SRC, file)), file).toBe(false);
    }
  });
});
