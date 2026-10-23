'use client';

import * as React from 'react';

type ThemeSize = '1' | '2' | '3' | '4';

/** The rest of the 1-4 index when no Theme states a size. */
const THEME_SIZE_DEFAULT: ThemeSize = '2';

/**
 * The app-wide size index, provided by `Theme` beside `ThemeContext`.
 *
 * It is its own context, holding one string, so a component that only needs
 * the size does not re-render when the accent colour or appearance changes.
 */
const ThemeSizeContext = React.createContext<ThemeSize>(THEME_SIZE_DEFAULT);
ThemeSizeContext.displayName = 'ThemeSizeContext';

interface SizePropDef {
  values: readonly string[];
  default?: string;
}

/**
 * Maps the theme size onto a component's own range: the value itself when the
 * component has it, otherwise the nearest end of the range (`4` on a 1-3 scale
 * is `3`, on a 1-2 scale it is `2`).
 */
function clampSize(size: ThemeSize, values: readonly string[]): string {
  if (values.includes(size)) return size;
  const n = Number(size);
  let nearest = values[0];
  let distance = Infinity;
  for (let i = 0; i < values.length; i++) {
    const d = Math.abs(Number(values[i]) - n);
    if (d < distance) {
      distance = d;
      nearest = values[i];
    }
  }
  return nearest;
}

/**
 * The size a component on the 1-4 index takes: what the caller said, else the
 * nearest Theme's size, mapped into the component's range.
 */
function useThemeSize<V>(explicit: V | undefined, propDef: SizePropDef): V {
  const themeSize = React.useContext(ThemeSizeContext);
  if (explicit !== undefined) return explicit;
  // The clamped value is one of `propDef.values`, which is what `V` ranges over.
  return clampSize(themeSize, propDef.values) as V;
}

/**
 * Fills `size` from the nearest Theme when the caller left it unset, so the
 * result can go straight into `extractProps`. An explicit size, responsive
 * object included, wins.
 *
 * Returns the same props object when there is nothing to fill: when a size is
 * set, or when the theme size resolves to the prop def's own default (the
 * common case, a Theme with no size), so `extractProps` applies it as before.
 */
function useThemeSizeProps<P extends { size?: unknown }>(props: P, propDef: SizePropDef): P {
  const themeSize = React.useContext(ThemeSizeContext);
  if (props.size !== undefined) return props;
  const size = clampSize(themeSize, propDef.values);
  if (size === propDef.default) return props;
  return { ...props, size };
}

export { ThemeSizeContext, THEME_SIZE_DEFAULT, clampSize, useThemeSize, useThemeSizeProps };
export type { ThemeSize };
