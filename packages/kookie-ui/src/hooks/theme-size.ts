'use client';

import * as React from 'react';

import { THEME_SIZE_DEFAULT, clampSize } from '../helpers/theme-size.js';
import type { ThemeSize } from '../helpers/theme-size.js';

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

export { ThemeSizeContext, useThemeSize, useThemeSizeProps };
