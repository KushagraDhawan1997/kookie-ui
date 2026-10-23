import * as React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import {
  getMenuAlignOffset,
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
    expect(getMenuAlignOffset('1')).toBe(-8);
    expect(getMenuAlignOffset('2')).toBe(-12);
  });

  test('falls back to size 2 for an unknown size', () => {
    expect(getMenuAlignOffset('unknown')).toBe(-12);
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

  test('resolves a responsive size and its item height', () => {
    let value: ReturnType<typeof useMenuContext> | undefined;
    render(
      <Theme>
        <MenuProvider size={{ initial: '1', xl: '2' }}>
          <Probe onValue={(v) => (value = v)} />
        </MenuProvider>
      </Theme>,
    );
    expect(value?.isInsideMenu).toBe(true);
    expect(value?.size).toBe('1');
    expect(value?.itemHeight).toBe(28);
  });

  test('item heights follow the size tokens', () => {
    // The scale is fixed, so a size maps to one height.
    expect(getMenuItemHeight('1')).toBe(28);
    expect(getMenuItemHeight('2')).toBe(32);
  });
});
