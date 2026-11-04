'use client';

import * as React from 'react';
import classNames from 'classnames';

import { Kbd } from '../kbd.js';
import { useBreakpoint } from '../../hooks/use-breakpoint.js';

import type { Breakpoint, Responsive } from '../../props/prop-def.js';

const BREAKPOINTS_DESCENDING: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs', 'initial'];

/**
 * Resolves a responsive value for the given breakpoint, falling back through
 * the smaller breakpoints when the current one is not set.
 */
function resolveResponsiveValue<T>(
  value: T | Partial<Record<Breakpoint, T>> | undefined,
  currentBreakpoint: Breakpoint,
  defaultValue: T,
): T {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value !== 'object') return value;

  const map = value as Partial<Record<Breakpoint, T>>;
  for (let i = BREAKPOINTS_DESCENDING.indexOf(currentBreakpoint); i < BREAKPOINTS_DESCENDING.length; i++) {
    const resolved = map[BREAKPOINTS_DESCENDING[i]];
    if (resolved !== undefined) return resolved;
  }
  return defaultValue;
}

/**
 * Resolves a possibly responsive value against the current viewport. Only a
 * responsive object subscribes to breakpoint changes; a plain value costs
 * nothing.
 */
function useResolvedResponsiveValue<T>(value: Responsive<T> | undefined, defaultValue: T): T {
  const isResponsive = typeof value === 'object' && value !== null;
  const { breakpoint } = useBreakpoint(isResponsive);
  return resolveResponsiveValue(value as T | Partial<Record<Breakpoint, T>> | undefined, breakpoint, defaultValue);
}

/** Content padding per menu size, in px (see base-menu.css). */
// The panel padding ladder (--panel-p-N).
const CONTENT_PADDING: Record<string, number> = { '1': 8, '2': 12, '3': 16, '4': 24 };

/**
 * Offset that lines the first item of a menu up with its anchor: the pointer
 * for a context menu, or the sub trigger for a submenu. It cancels the content
 * padding.
 */
function getMenuAlignOffset(size: string): number {
  return -(CONTENT_PADDING[size] ?? CONTENT_PADDING['2']);
}

const KEY_SYMBOLS: Record<string, string> = {
  '⌘': 'Meta',
  cmd: 'Meta',
  command: 'Meta',
  meta: 'Meta',
  '⌥': 'Alt',
  option: 'Alt',
  opt: 'Alt',
  alt: 'Alt',
  '⇧': 'Shift',
  shift: 'Shift',
  '⌃': 'Control',
  ctrl: 'Control',
  control: 'Control',
  '⌫': 'Backspace',
  '⌦': 'Delete',
  '⏎': 'Enter',
  '↵': 'Enter',
  '⎋': 'Escape',
  esc: 'Escape',
  '⇥': 'Tab',
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
};

const ariaKeyShortcutsCache = new Map<string, string>();

/**
 * Converts a display shortcut such as "⌘ ⇧ P" or "Ctrl+S" into the
 * `aria-keyshortcuts` format ("Meta+Shift+P", "Control+S").
 */
function toAriaKeyShortcuts(shortcut: string): string | undefined {
  const cached = ariaKeyShortcutsCache.get(shortcut);
  if (cached !== undefined) return cached || undefined;

  // Modifier symbols are tokens of their own ("⌘⇧P"); otherwise split on "+" and spaces.
  const tokens = shortcut.match(/[⌘⌥⇧⌃]|[^\s+⌘⌥⇧⌃]+/gu) ?? [];
  const keys = tokens.map((token) => {
    const mapped = KEY_SYMBOLS[token] ?? KEY_SYMBOLS[token.toLowerCase()];
    return mapped ?? (token.length === 1 ? token.toUpperCase() : token);
  });
  const result = keys.join('+');
  ariaKeyShortcutsCache.set(shortcut, result);
  return result || undefined;
}

/**
 * The keyboard shortcut hint at the end of a menu item. It is hidden from
 * assistive technology because the item exposes it through
 * `aria-keyshortcuts` instead of reading it as part of the item name.
 */
function MenuShortcut({ shortcut, className }: { shortcut: string; className?: string }) {
  return (
    <div aria-hidden className={classNames('kui-BaseMenuShortcut', className)}>
      <Kbd size="1">{shortcut}</Kbd>
    </div>
  );
}

export {
  resolveResponsiveValue,
  useResolvedResponsiveValue,
  getMenuAlignOffset,
  toAriaKeyShortcuts,
  MenuShortcut,
};
