'use client';

import * as React from 'react';

import { useThemeContext } from '../theme.js';
import { useResolvedResponsiveValue } from './base-menu.utils.js';

import type { Responsive } from '../../props/prop-def.js';

/**
 * Context to detect if a component is rendered inside a menu (DropdownMenu, ContextMenu, etc.)
 * Used by VirtualMenu to adjust its behavior:
 * - Skip role="menu" when inside a parent menu (parent owns the role)
 * - Delegate certain keyboard handling to parent
 * - Use the correct item height based on menu size
 */

export type MenuSize = '1' | '2';

interface MenuContextValue {
  /** Whether we're inside a menu that owns the menu role */
  isInsideMenu: boolean;
  /** Menu size for the current breakpoint */
  size?: MenuSize;
  /** Item height in px for the current size and theme scaling */
  itemHeight?: number;
}

const MenuContext = React.createContext<MenuContextValue>({ isInsideMenu: false });

interface MenuProviderProps {
  children: React.ReactNode;
  /** Menu size passed from parent (DropdownMenu.Content, ContextMenu.Content, etc.) */
  size?: Responsive<MenuSize>;
}

/** Map menu size to item height in pixels at 100% scaling */
export const menuSizeToItemHeight: Record<MenuSize, number> = {
  '1': 24, // --space-5
  '2': 32, // --space-6
};

/** Item height in px for a size at the given theme scaling ("100%", "110%"…). */
export function getMenuItemHeight(size: MenuSize, scaling: string | undefined): number {
  const scale = scaling ? parseFloat(scaling) / 100 : 1;
  return menuSizeToItemHeight[size] * (Number.isFinite(scale) ? scale : 1);
}

export function MenuProvider({ children, size }: MenuProviderProps) {
  const resolvedSize = useResolvedResponsiveValue<MenuSize | undefined>(size, undefined);
  const { scaling } = useThemeContext();
  const itemHeight = resolvedSize ? getMenuItemHeight(resolvedSize, scaling) : undefined;
  const value = React.useMemo(
    () => ({ isInsideMenu: true, size: resolvedSize, itemHeight }),
    [resolvedSize, itemHeight],
  );
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenuContext() {
  return React.useContext(MenuContext);
}
