'use client';

import * as React from 'react';
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
  /** Menu size for calculating item heights (resolved to non-responsive value) */
  size?: MenuSize;
}

const MenuContext = React.createContext<MenuContextValue>({ isInsideMenu: false });

interface MenuProviderProps {
  children: React.ReactNode;
  /** Menu size passed from parent (DropdownMenu.Content, ContextMenu.Content, etc.) */
  size?: Responsive<MenuSize>;
}

/** Extract the base size from a potentially responsive value */
function resolveSize(size: Responsive<MenuSize> | undefined): MenuSize | undefined {
  if (!size) return undefined;
  if (typeof size === 'string') return size;
  // For responsive objects, use the 'initial' value
  return size.initial;
}

export function MenuProvider({ children, size }: MenuProviderProps) {
  const resolvedSize = resolveSize(size);
  const value = React.useMemo(() => ({ isInsideMenu: true, size: resolvedSize }), [resolvedSize]);
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenuContext() {
  return React.useContext(MenuContext);
}

/** Map menu size to item height in pixels */
export const menuSizeToItemHeight: Record<MenuSize, number> = {
  '1': 24, // --space-5
  '2': 32, // --space-6
};
