'use client';

import * as React from 'react';
import { useLayoutEffect } from 'radix-ui/internal';

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

/** The register function of the menu Group a Label sits in (see useMenuGroupLabelId). */
const MenuGroupLabelContext = React.createContext<((id: string | null) => void) | null>(null);

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
  // A submenu is its own surface, so its labels never name a group of the parent menu.
  return (
    <MenuContext.Provider value={value}>
      <MenuGroupLabelContext.Provider value={null}>{children}</MenuGroupLabelContext.Provider>
    </MenuContext.Provider>
  );
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

/**
 * Names a menu group by its label, the way v2's MenuGroup does. A Group holds the id of
 * the Label inside it and points aria-labelledby at it, so a screen reader announces the
 * section name when focus enters the group.
 */
export const MenuGroupLabelProvider = MenuGroupLabelContext.Provider;

/** For a Group: the id its aria-labelledby points to, and the setter a nested Label calls. */
export function useMenuGroupLabelledBy(ariaLabelledBy: string | undefined) {
  const [labelId, setLabelId] = React.useState<string | null>(null);
  return [ariaLabelledBy ?? labelId ?? undefined, setLabelId] as const;
}

/** For a Label: its id, registered with the Group it sits in while the label is rendered. */
export function useMenuGroupLabelId(idProp: string | undefined, rendered = true) {
  const register = React.useContext(MenuGroupLabelContext);
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  useLayoutEffect(() => {
    if (!register || !rendered) return;
    register(id);
    return () => register(null);
  }, [register, id, rendered]);
  return register ? id : idProp;
}
