'use client';

import * as React from 'react';

import { useResolvedResponsiveValue } from './base-menu.utils.js';

import type { Responsive } from '../../props/prop-def.js';

/**
 * Context to detect if a component is rendered inside a menu (DropdownMenu, ContextMenu, etc.)
 * Used by VirtualMenu to adjust its behavior:
 * - Skip role="menu" when inside a parent menu (parent owns the role)
 * - Delegate certain keyboard handling to parent
 * - Use the correct item height based on menu size
 */

export type MenuSize = '1' | '2' | '3' | '4';

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

/**
 * Menu row height in pixels per size: the line height plus --row-inset-N above and below
 * (base-menu.css), never under the 24px target floor.
 */
export const menuSizeToItemHeight: Record<MenuSize, number> = {
  '1': 24,
  '2': 30,
  '3': 34,
  '4': 38,
};

export function getMenuItemHeight(size: MenuSize): number {
  return menuSizeToItemHeight[size];
}

export function MenuProvider({ children, size }: MenuProviderProps) {
  const resolvedSize = useResolvedResponsiveValue<MenuSize | undefined>(size, undefined);
  const itemHeight = resolvedSize ? getMenuItemHeight(resolvedSize) : undefined;
  const value = React.useMemo(
    () => ({ isInsideMenu: true, size: resolvedSize, itemHeight }),
    [resolvedSize, itemHeight],
  );
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenuContext() {
  return React.useContext(MenuContext);
}

/**
 * Closes the whole menu from inside it. DropdownMenu.Root and ContextMenu.Root provide it,
 * so a VirtualMenu row can close the menu on select the way a menu item does.
 */
const MenuCloseContext = React.createContext<(() => void) | undefined>(undefined);
export const MenuCloseProvider = MenuCloseContext.Provider;

export function useMenuClose() {
  return React.useContext(MenuCloseContext);
}
