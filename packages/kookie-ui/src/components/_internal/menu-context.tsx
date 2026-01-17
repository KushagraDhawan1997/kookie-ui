'use client';

import * as React from 'react';

/**
 * Context to detect if a component is rendered inside a menu (DropdownMenu, ContextMenu, etc.)
 * Used by VirtualMenu to adjust its behavior:
 * - Skip role="menu" when inside a parent menu (parent owns the role)
 * - Delegate certain keyboard handling to parent
 */

interface MenuContextValue {
  /** Whether we're inside a menu that owns the menu role */
  isInsideMenu: boolean;
}

const MenuContext = React.createContext<MenuContextValue>({ isInsideMenu: false });

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ isInsideMenu: true }), []);
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenuContext() {
  return React.useContext(MenuContext);
}
