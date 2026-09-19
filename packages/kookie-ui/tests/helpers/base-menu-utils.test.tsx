import * as React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import {
  getMenuAlignOffset,
  resolveMenuMaterial,
  resolveResponsiveValue,
  toAriaKeyShortcuts,
} from '../../src/components/_internal/base-menu.utils.js';
import { MenuProvider, getMenuItemHeight, useMenuContext } from '../../src/components/_internal/menu-context.js';
import { Theme } from '../../src/components/theme.js';

describe('resolveResponsiveValue', () => {
  test('returns plain values unchanged', () => {
    expect(resolveResponsiveValue('drill-down', 'md', 'cascade')).toBe('drill-down');
  });

  test('returns the default for undefined', () => {
    expect(resolveResponsiveValue(undefined, 'md', 'cascade')).toBe('cascade');
  });

  test('uses the exact breakpoint when set', () => {
    expect(resolveResponsiveValue({ initial: 'a', md: 'b' }, 'md', 'z')).toBe('b');
  });

  test('falls back through smaller breakpoints', () => {
    expect(resolveResponsiveValue({ initial: 'a', sm: 'b' }, 'xl', 'z')).toBe('b');
    expect(resolveResponsiveValue({ initial: 'a', md: 'b' }, 'sm', 'z')).toBe('a');
  });

  test('uses the default when no breakpoint at or below matches', () => {
    expect(resolveResponsiveValue({ lg: 'b' }, 'md', 'z')).toBe('z');
  });
});

describe('getMenuAlignOffset', () => {
  test('cancels the content padding for each size', () => {
    expect(getMenuAlignOffset('1', '100%')).toBe(-8);
    expect(getMenuAlignOffset('2', '100%')).toBe(-12);
  });

  test('scales with the theme', () => {
    expect(getMenuAlignOffset('2', '110%')).toBe(-13);
    expect(getMenuAlignOffset('1', '90%')).toBe(-7);
  });

  test('never returns NaN', () => {
    expect(Number.isNaN(getMenuAlignOffset('unknown', 'bogus'))).toBe(false);
  });
});

describe('resolveMenuMaterial', () => {
  const theme = { material: 'solid', panelBackground: 'translucent' } as const;

  test('prefers the material prop, then panelBackground, then the theme material', () => {
    expect(resolveMenuMaterial('translucent', 'solid', theme)).toBe('translucent');
    expect(resolveMenuMaterial(undefined, 'translucent', theme)).toBe('translucent');
    expect(resolveMenuMaterial(undefined, undefined, theme)).toBe('solid');
  });
});

describe('toAriaKeyShortcuts', () => {
  test.each([
    ['⌘ C', 'Meta+C'],
    ['⌘⇧P', 'Meta+Shift+P'],
    ['Ctrl+Shift+S', 'Control+Shift+S'],
    ['⌥ ⌫', 'Alt+Backspace'],
    ['Esc', 'Escape'],
    ['F2', 'F2'],
  ])('%s -> %s', (input, expected) => {
    expect(toAriaKeyShortcuts(input)).toBe(expected);
  });

  test('returns undefined for an empty shortcut', () => {
    expect(toAriaKeyShortcuts('  ')).toBeUndefined();
  });
});

describe('MenuProvider', () => {
  function Probe({ onValue }: { onValue: (value: ReturnType<typeof useMenuContext>) => void }) {
    onValue(useMenuContext());
    return null;
  }

  test('resolves a responsive size and scales the item height', () => {
    let value: ReturnType<typeof useMenuContext> | undefined;
    render(
      <Theme scaling="110%">
        <MenuProvider size={{ initial: '1', xl: '2' }}>
          <Probe onValue={(v) => (value = v)} />
        </MenuProvider>
      </Theme>,
    );
    expect(value?.isInsideMenu).toBe(true);
    expect(value?.size).toBe('1');
    expect(value?.itemHeight).toBeCloseTo(26.4);
  });

  test('item heights follow the size tokens', () => {
    expect(getMenuItemHeight('1', '100%')).toBe(24);
    expect(getMenuItemHeight('2', '100%')).toBe(32);
    expect(getMenuItemHeight('2', '90%')).toBeCloseTo(28.8);
  });
});
