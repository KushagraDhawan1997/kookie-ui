import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button, Theme, Toggle } from '../../../src/components/index';

const HEIGHTS = { '1': 28, '2': 32, '3': 40, '4': 48 } as const;
const PX = { '1': 8, '2': 10, '3': 13, '4': 16 } as const;
const PX_PILL = { '1': 12, '2': 14, '3': 17, '4': 20 } as const;
const GAP = { '1': 4, '2': 8, '3': 8, '4': 12 } as const;
const ICON = { '1': 16, '2': 16, '3': 20, '4': 24 } as const;
const SIZES = ['1', '2', '3', '4'] as const;
const VARIANTS = ['raised', 'solid', 'soft', 'surface', 'outline', 'ghost'] as const;

const Icon = () => (
  <svg viewBox="0 0 24 24" data-testid="icon">
    <path d="M4 12h16" />
  </svg>
);

const box = (el: Element) => el.getBoundingClientRect();
const style = (el: Element) => getComputedStyle(el);

describe('buttons sit on the control ladder', () => {
  for (const size of SIZES) {
    it(`size ${size} is ${HEIGHTS[size]}px tall on every button and variant`, () => {
      render(
        <Theme>
          {VARIANTS.map((variant) => (
            <React.Fragment key={variant}>
              <Button size={size} variant={variant}>
                Label
              </Button>
              <Button iconOnly size={size} variant={variant} aria-label={`icon ${variant}`}>
                <Icon />
              </Button>
            </React.Fragment>
          ))}
          <Toggle size={size}>Toggle</Toggle>
          <Toggle iconOnly size={size} aria-label="toggle icon">
            <Icon />
          </Toggle>
        </Theme>,
      );
      for (const button of screen.getAllByRole('button')) {
        expect(box(button).height, button.textContent || button.getAttribute('aria-label')!).toBe(HEIGHTS[size]);
        expect(style(button).minHeight).toBe(`${HEIGHTS[size]}px`);
      }
    });

    it(`size ${size} pads ${PX[size]}px, gaps ${GAP[size]}px and draws ${ICON[size]}px icons`, () => {
      render(
        <Theme radius="medium">
          <Button size={size}>
            <Icon />
            Label
          </Button>
        </Theme>,
      );
      const button = screen.getByRole('button');
      expect(style(button).paddingInlineStart).toBe(`${PX[size]}px`);
      expect(style(button).paddingInlineEnd).toBe(`${PX[size]}px`);
      expect(style(button).columnGap).toBe(`${GAP[size]}px`);
      expect(box(screen.getByTestId('icon')).width).toBe(ICON[size]);
    });

    it(`size ${size} icon-only is a ${HEIGHTS[size]}px square with no inline padding`, () => {
      render(
        <Theme>
          <Button iconOnly size={size} aria-label="a">
            <Icon />
          </Button>
          <Toggle iconOnly size={size} variant="ghost" aria-label="b">
            <Icon />
          </Toggle>
          <Button size={size} iconOnly aria-label="c">
            <Icon />
          </Button>
        </Theme>,
      );
      for (const button of screen.getAllByRole('button')) {
        expect(box(button).width).toBe(HEIGHTS[size]);
        expect(box(button).height).toBe(HEIGHTS[size]);
        expect(style(button).paddingInlineStart).toBe('0px');
        expect(style(button).paddingInlineEnd).toBe('0px');
      }
    });

    it(`size ${size} at radius full pads a bare side ${PX_PILL[size]}px and an icon side ${PX[size]}px`, () => {
      render(
        <Theme radius="full">
          <Button size={size}>Bare</Button>
          <Button size={size}>
            <Icon />
            Leading
          </Button>
          <Button size={size}>
            Trailing
            <Icon />
          </Button>
        </Theme>,
      );
      const bare = screen.getByRole('button', { name: 'Bare' });
      const leading = screen.getByRole('button', { name: 'Leading' });
      const trailing = screen.getByRole('button', { name: 'Trailing' });
      expect(style(bare).paddingInlineStart).toBe(`${PX_PILL[size]}px`);
      expect(style(bare).paddingInlineEnd).toBe(`${PX_PILL[size]}px`);
      expect(style(leading).paddingInlineStart).toBe(`${PX[size]}px`);
      expect(style(leading).paddingInlineEnd).toBe(`${PX_PILL[size]}px`);
      expect(style(trailing).paddingInlineStart).toBe(`${PX_PILL[size]}px`);
      expect(style(trailing).paddingInlineEnd).toBe(`${PX[size]}px`);
      // A full corner is half the height.
      expect(style(bare).borderTopLeftRadius).toBe(`${HEIGHTS[size] / 2}px`);
    });
  }

  it('below radius full a bare side keeps the plain padding', () => {
    render(
      <Theme radius="medium">
        <Button>Bare</Button>
      </Theme>,
    );
    expect(style(screen.getByRole('button')).paddingInlineStart).toBe(`${PX['2']}px`);
  });

  it('the radius prop on the button reaches the pill padding too', () => {
    render(
      <Theme radius="medium">
        <Button radius="full">Bare</Button>
      </Theme>,
    );
    expect(style(screen.getByRole('button')).paddingInlineStart).toBe(`${PX_PILL['2']}px`);
  });
});

describe('button states', () => {
  it('every variant shares one focus ring: 2px solid, offset 2px', () => {
    render(
      <Theme>
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </Theme>,
    );
    const rings = new Set<string>();
    for (const button of screen.getAllByRole('button')) {
      const css = style(button);
      expect(css.getPropertyValue('--focus-ring-width').trim()).toBe('2px');
      expect(css.getPropertyValue('--focus-ring-offset').trim()).toBe('2px');
      rings.add(css.getPropertyValue('--focus-8'));
    }
    expect(rings.size).toBe(1);
  });

  it('disabled is a colour remap: no opacity, still hit-tests, default cursor', () => {
    render(
      <Theme>
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} disabled>
            {variant}
          </Button>
        ))}
        <Toggle disabled defaultPressed>
          toggle
        </Toggle>
      </Theme>,
    );
    for (const button of screen.getAllByRole('button')) {
      const css = style(button);
      expect(css.opacity, button.textContent!).toBe('1');
      expect(css.pointerEvents, button.textContent!).not.toBe('none');
      expect(css.cursor, button.outerHTML).toBe('default');
    }
  });

  it('a loading button stays focusable and blocks clicks', () => {
    let clicks = 0;
    render(
      <Theme>
        <Button loading onClick={() => clicks++}>
          Save
        </Button>
      </Theme>,
    );
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button).toHaveAttribute('aria-disabled', 'true');
    button.focus();
    expect(document.activeElement).toBe(button);
    button.click();
    expect(clicks).toBe(0);
    expect(style(button).cursor).toBe('progress');
  });
});

describe('button review checks', () => {
  it('a focused button draws the 2px focus-8 outline at a 2px offset on every variant', () => {
    render(
      <Theme>
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </Theme>,
    );
    let ringed = 0;
    for (const button of screen.getAllByRole('button')) {
      button.focus();
      if (!button.matches(':focus-visible')) continue;
      ringed++;
      const css = style(button);
      expect(css.outlineStyle, button.textContent!).toBe('solid');
      expect(css.outlineWidth, button.textContent!).toBe('2px');
      expect(css.outlineOffset, button.textContent!).toBe('2px');
    }
    expect(ringed).toBe(VARIANTS.length);
  });

  it('an icon inside a fragment still marks its edge', () => {
    render(
      <Theme radius="full">
        <Button>
          <>
            <Icon />
            Lead
          </>
        </Button>
      </Theme>,
    );
    const button = screen.getByRole('button');
    expect(style(button).paddingInlineStart).toBe(`${PX['2']}px`);
    expect(style(button).paddingInlineEnd).toBe(`${PX_PILL['2']}px`);
  });
});
