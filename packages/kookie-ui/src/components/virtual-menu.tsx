'use client';

import * as React from 'react';
import classNames from 'classnames';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useLayoutEffect } from 'radix-ui/internal';
import { useMenuContext, useMenuClose, getMenuItemHeight } from './_internal/menu-context.js';

import type { MenuSize } from './_internal/menu-context.js';

/**
 * VirtualMenu - A virtualized menu component for rendering large lists efficiently.
 *
 * Uses TanStack Virtual to render only visible items.
 * Works inside any container (DropdownMenu.Content, Popover.Content, etc.)
 *
 * @example
 * // Simple usage with itemLabel
 * <VirtualMenu
 *   items={items}
 *   itemLabel={(item) => item.name}
 *   onSelect={handleSelect}
 * />
 *
 * @example
 * // Custom rendering with renderItem
 * const UserItem = React.memo(({ item, ...props }) => (
 *   <VirtualMenu.Item {...props}>
 *     <Avatar src={item.avatar} />
 *     {item.name}
 *   </VirtualMenu.Item>
 * ));
 *
 * <VirtualMenu items={users} renderItem={UserItem} onSelect={handleSelect} />
 */

// ============================================================================
// Types
// ============================================================================

/** Props passed to custom renderItem components */
interface VirtualMenuRenderItemProps<T> {
  /** The item data */
  item: T;
  /** Index in the items array */
  index: number;
  /** Whether this item is currently highlighted */
  isHighlighted: boolean;
  /** Unique ID for accessibility */
  id: string;
  /** Positioning styles - must be applied */
  style: React.CSSProperties;
  /** Tab index for focus management */
  tabIndex: number;
  /** Data attribute for CSS styling */
  'data-highlighted': true | undefined;
  /** Data attribute for event delegation */
  'data-index': number;
  /** Number of items in the whole list, since only some rows are mounted */
  'aria-setsize': number;
  /** Position of this row in the whole list, from 1 */
  'aria-posinset': number;
  /** Mouse enter handler */
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  /** Mouse leave handler */
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => void;
  /** Click handler */
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  /** Keyboard handler for Enter/Space activation */
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}

/** How rows are drawn: one of `itemLabel` or `renderItem` is required. */
type VirtualMenuRowProps<T> =
  | {
      /**
       * Simple label accessor for basic text items.
       * Can be a property key or a function.
       * @example
       * itemLabel="name"
       * itemLabel={(item) => item.name}
       */
      itemLabel: keyof T | ((item: T) => React.ReactNode);
      renderItem?: undefined;
    }
  | {
      itemLabel?: undefined;
      /**
       * Custom component for rendering items.
       * Must be memoized (React.memo) for optimal performance.
       * @example
       * const MyItem = React.memo(({ item, ...props }) => (
       *   <VirtualMenu.Item {...props}>{item.name}</VirtualMenu.Item>
       * ));
       * <VirtualMenu items={items} renderItem={MyItem} />
       */
      renderItem: React.ComponentType<VirtualMenuRenderItemProps<T>>;
    };

/** Attributes of the list element that pass through, such as `id`, `aria-labelledby` or `data-*`. */
type VirtualMenuDivProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'children' | 'onSelect' | 'role' | 'tabIndex' | 'aria-activedescendant'
>;

type VirtualMenuProps<T> = VirtualMenuDivProps & VirtualMenuRowProps<T> & VirtualMenuOwnProps<T>;

interface VirtualMenuOwnProps<T> {
  /** Array of items to render */
  items: T[];
  /**
   * Menu size - controls item height.
   * Automatically inherited from parent DropdownMenu.Content/ContextMenu.Content.
   * Only set manually when using VirtualMenu outside of a menu context.
   * @default '2' (or inherited from context)
   */
  size?: MenuSize;
  /**
   * Estimated height of each item in pixels.
   * Can be a number (same for all) or a function (per-item).
   * Usually not needed - height is automatically derived from size prop/context.
   * Use this only for custom item heights (e.g., variable height items).
   */
  estimatedItemSize?: number | ((index: number) => number);
  /** Number of items to render outside visible area */
  overscan?: number;
  /** Callback when an item is selected */
  onSelect?: (item: T, index: number) => void;
}

// ============================================================================
// Internal Memoized Item Component
// ============================================================================

/**
 * Rows get a new style object every render, so style is compared by the two values the
 * list sets. Every other prop is compared shallowly, so aria-*, data-* and handlers update.
 */
function areRowPropsEqual<P extends { style?: React.CSSProperties }>(prev: P, next: P) {
  if (prev.style?.height !== next.style?.height) return false;
  if (prev.style?.transform !== next.style?.transform) return false;
  const prevKeys = Object.keys(prev) as (keyof P)[];
  if (prevKeys.length !== Object.keys(next).length) return false;
  return prevKeys.every((key) => key === 'style' || Object.is(prev[key], next[key]));
}

interface SimpleItemProps {
  label: React.ReactNode;
  isHighlighted: boolean;
  id: string;
  style: React.CSSProperties;
  tabIndex: number;
  'data-highlighted': true | undefined;
  'data-index': number;
  'aria-setsize': number;
  'aria-posinset': number;
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => void;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}

const SimpleItem = React.memo(
  function SimpleItem({
    label,
    isHighlighted: _isHighlighted,
    id,
    style,
    tabIndex,
    'data-highlighted': dataHighlighted,
    'data-index': dataIndex,
    'aria-setsize': setSize,
    'aria-posinset': posInSet,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onKeyDown,
  }: SimpleItemProps) {
    return (
      <div
        id={id}
        role="menuitem"
        className={classNames('kui-reset', 'kui-BaseMenuItem', 'kui-VirtualMenuItem')}
        style={style}
        tabIndex={tabIndex}
        data-highlighted={dataHighlighted}
        data-index={dataIndex}
        aria-setsize={setSize}
        aria-posinset={posInSet}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        {label}
      </div>
    );
  },
  areRowPropsEqual,
);

// ============================================================================
// VirtualMenu Component
// ============================================================================

/**
 * Measures the row height the menu's CSS draws (--base-menu-item-height), so rows follow
 * the theme scale instead of the fixed 100% table. Returns undefined until measured.
 */
function useMeasuredRowHeight(
  rootRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  size: MenuSize | undefined,
) {
  const [height, setHeight] = React.useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    const probe = document.createElement('div');
    probe.className = 'kui-reset kui-BaseMenuItem kui-VirtualMenuItem';
    probe.setAttribute('aria-hidden', 'true');
    probe.style.visibility = 'hidden';
    probe.textContent = '\u00a0';
    root.appendChild(probe);
    const measured = probe.getBoundingClientRect().height;
    probe.remove();
    setHeight(measured > 0 ? measured : undefined);
  }, [rootRef, enabled, size]);
  return enabled ? height : undefined;
}

function VirtualMenuRootInner<T>(
  {
    items,
    itemLabel,
    renderItem: RenderItem,
    size: sizeProp,
    estimatedItemSize: estimatedItemSizeProp,
    overscan = 5,
    onSelect,
    className,
    style,
    onKeyDown,
    onFocus,
    ...rootProps
  }: VirtualMenuProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const menuId = React.useId();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
  const { isInsideMenu, size: contextSize, itemHeight: contextItemHeight } = useMenuContext();
  const closeMenu = useMenuClose();

  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      parentRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  // Inside a menu, the CSS row height is measured so it tracks the theme scale.
  const measuredItemHeight = useMeasuredRowHeight(
    parentRef,
    isInsideMenu && sizeProp == null && estimatedItemSizeProp == null,
    contextSize,
  );

  // Resolve item height: explicit prop > own size > measured CSS row > parent menu > default size '2'.
  const estimatedItemSize =
    estimatedItemSizeProp ??
    (sizeProp
      ? getMenuItemHeight(sizeProp)
      : (measuredItemHeight ?? contextItemHeight ?? getMenuItemHeight(contextSize ?? '2')));

  // Validate props
  if (!itemLabel && !RenderItem) {
    throw new Error('VirtualMenu requires either itemLabel or renderItem prop');
  }

  // Normalize itemLabel to a function
  const getLabel = React.useMemo(() => {
    if (!itemLabel) return null;
    if (typeof itemLabel === 'function') return itemLabel;
    return (item: T) => item[itemLabel] as React.ReactNode;
  }, [itemLabel]);

  // Derive safe highlighted index
  const safeHighlightedIndex = React.useMemo(() => {
    if (items.length === 0) return -1;
    if (highlightedIndex < 0) return -1;
    return Math.min(highlightedIndex, items.length - 1);
  }, [highlightedIndex, items.length]);

  // Normalize estimatedItemSize to a function
  const getItemSize = React.useMemo(
    () =>
      typeof estimatedItemSize === 'function'
        ? estimatedItemSize
        : () => estimatedItemSize,
    [estimatedItemSize],
  );

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getItemSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Re-measure cached rows when the resolved row height changes.
  useLayoutEffect(() => {
    virtualizer.measure();
  }, [virtualizer, estimatedItemSize]);

  // Inside a menu, the menu focuses its own content on open (and a submenu on keyboard
  // open). Hand that focus to the list so arrow keys reach the rows.
  React.useEffect(() => {
    const root = parentRef.current;
    if (!isInsideMenu || !root) return;
    const content = root.closest<HTMLElement>('[data-radix-menu-content]');
    if (!content) return;
    const handleFocusIn = (event: FocusEvent) => {
      if (event.target === content) root.focus({ preventScroll: true });
    };
    content.addEventListener('focusin', handleFocusIn);
    if (document.activeElement === content) root.focus({ preventScroll: true });
    return () => content.removeEventListener('focusin', handleFocusIn);
  }, [isInsideMenu]);

  // Refs for stable handler references
  const onKeyDownRef = React.useRef(onKeyDown);
  const onFocusRef = React.useRef(onFocus);
  onKeyDownRef.current = onKeyDown;
  onFocusRef.current = onFocus;
  const itemsRef = React.useRef(items);
  const onSelectRef = React.useRef(onSelect);
  const closeMenuRef = React.useRef(closeMenu);
  itemsRef.current = items;
  onSelectRef.current = onSelect;
  closeMenuRef.current = closeMenu;

  // Choosing a row calls onSelect, then closes the parent menu like a menu item does.
  const selectIndex = React.useCallback((idx: number) => {
    const currentItems = itemsRef.current;
    if (idx < 0 || idx >= currentItems.length) return;
    onSelectRef.current?.(currentItems[idx], idx);
    closeMenuRef.current?.();
  }, []);

  const scrollToIndexRef = React.useRef(virtualizer.scrollToIndex);
  scrollToIndexRef.current = virtualizer.scrollToIndex;

  const highlightedIndexRef = React.useRef(safeHighlightedIndex);
  highlightedIndexRef.current = safeHighlightedIndex;

  // Stable event handlers
  const handleItemMouseEnter = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    const index = e.currentTarget.dataset.index;
    if (index != null) {
      setHighlightedIndex(Number(index));
    }
  }, []);

  const handleItemClick = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    const index = e.currentTarget.dataset.index;
    if (index != null) selectIndex(Number(index));
  }, [selectIndex]);

  // Leaving a row clears its highlight, as a Radix item does on pointer leave.
  const handleItemMouseLeave = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    const index = Number(e.currentTarget.dataset.index);
    setHighlightedIndex((current) => (current === index ? -1 : current));
  }, []);

  // Item-level keyboard handler for Enter/Space activation (satisfies a11y lint rule)
  const handleItemKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      const index = e.currentTarget.dataset.index;
      if (index != null) selectIndex(Number(index));
    }
  }, [selectIndex]);

  // Keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDownRef.current?.(e);
    if (e.defaultPrevented) return;
    const currentItems = itemsRef.current;
    const currentHighlightedIndex = highlightedIndexRef.current;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex =
          currentHighlightedIndex < currentItems.length - 1 ? currentHighlightedIndex + 1 : 0;
        setHighlightedIndex(nextIndex);
        scrollToIndexRef.current(nextIndex, { align: 'auto' });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex =
          currentHighlightedIndex > 0 ? currentHighlightedIndex - 1 : currentItems.length - 1;
        setHighlightedIndex(prevIndex);
        scrollToIndexRef.current(prevIndex, { align: 'auto' });
        break;
      }
      case 'Home': {
        e.preventDefault();
        setHighlightedIndex(0);
        scrollToIndexRef.current(0, { align: 'start' });
        break;
      }
      case 'End': {
        e.preventDefault();
        const lastIndex = currentItems.length - 1;
        setHighlightedIndex(lastIndex);
        scrollToIndexRef.current(lastIndex, { align: 'end' });
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        selectIndex(currentHighlightedIndex);
        break;
      }
      case 'Tab': {
        // Inside a menu, Tab does not leave it. On its own, the list is one tab stop.
        if (isInsideMenu) e.preventDefault();
        break;
      }
      case 'Escape': {
        // Inside a menu, the menu handles Escape and returns focus to its trigger.
        if (!isInsideMenu) e.currentTarget.blur();
        break;
      }
      default: {
        // The parent menu's typeahead would move focus off the list onto one of its items.
        if (isInsideMenu && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.stopPropagation();
        }
      }
    }
  }, [selectIndex, isInsideMenu]);

  // Keyboard focus on the list highlights the first row when none is highlighted.
  const handleFocus = React.useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    onFocusRef.current?.(e);
    if (e.target !== e.currentTarget) return;
    if (highlightedIndexRef.current < 0 && itemsRef.current.length > 0) setHighlightedIndex(0);
  }, []);

  // Item ID generator
  const getItemId = React.useCallback(
    (index: number) => `${menuId}-item-${index}`,
    [menuId],
  );

  // Memoize styles
  const rootStyle = React.useMemo(
    () => ({
      overflow: 'auto' as const,
      position: 'relative' as const,
      ...style,
    }),
    [style],
  );

  const totalSize = virtualizer.getTotalSize();
  const viewportStyle = React.useMemo(
    () => ({
      height: `${totalSize}px`,
      width: '100%' as const,
      position: 'relative' as const,
    }),
    [totalSize],
  );

  return (
    <div
      {...rootProps}
      ref={setRootRef}
      role={isInsideMenu ? 'group' : 'menu'}
      aria-activedescendant={safeHighlightedIndex >= 0 ? getItemId(safeHighlightedIndex) : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      className={classNames(
        'kui-VirtualMenuRoot',
        // On its own, the list draws menu rows at its own size (virtual-menu.css).
        !isInsideMenu && `kui-r-size-${sizeProp ?? '2'}`,
        className,
      )}
      style={rootStyle}
    >
      <div className="kui-VirtualMenuViewport" style={viewportStyle}>
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          const index = virtualRow.index;
          const isHighlighted = safeHighlightedIndex === index;

          const itemStyle: React.CSSProperties = {
            height: virtualRow.size,
            transform: `translateY(${virtualRow.start}px)`,
          };

          const commonProps = {
            id: getItemId(index),
            isHighlighted,
            style: itemStyle,
            // The list holds focus and points aria-activedescendant at the row, so it is the only tab stop.
            tabIndex: -1,
            'data-highlighted': isHighlighted ? true as const : undefined,
            'data-index': index,
            'aria-setsize': items.length,
            'aria-posinset': index + 1,
            onMouseEnter: handleItemMouseEnter,
            onMouseLeave: handleItemMouseLeave,
            onClick: handleItemClick,
            onKeyDown: handleItemKeyDown,
          };

          // Use renderItem if provided, otherwise use SimpleItem with itemLabel
          if (RenderItem) {
            return (
              <RenderItem
                key={virtualRow.key}
                item={item}
                index={index}
                {...commonProps}
              />
            );
          }

          return (
            <SimpleItem
              key={virtualRow.key}
              label={getLabel!(item)}
              {...commonProps}
            />
          );
        })}
      </div>
    </div>
  );
}

const VirtualMenuRoot = React.forwardRef(VirtualMenuRootInner) as (<T>(
  props: VirtualMenuProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement) & { displayName?: string };
VirtualMenuRoot.displayName = 'VirtualMenu';

// ============================================================================
// VirtualMenu.Item Component (for custom renderItem usage)
// ============================================================================

interface VirtualMenuItemProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  /** Data attribute for highlight styling */
  'data-highlighted'?: true | undefined;
  /** Data attribute for event delegation */
  'data-index'?: number;
}

const VirtualMenuItemInner = React.forwardRef<HTMLDivElement, VirtualMenuItemProps>(
  ({ className, children, ...props }, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        role="menuitem"
        className={classNames('kui-reset', 'kui-BaseMenuItem', 'kui-VirtualMenuItem', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

VirtualMenuItemInner.displayName = 'VirtualMenu.Item';

// Style is compared by height and transform; every other prop shallowly.
const VirtualMenuItem = React.memo(VirtualMenuItemInner, areRowPropsEqual);

// ============================================================================
// Exports
// ============================================================================

const VirtualMenu = Object.assign(VirtualMenuRoot, {
  Item: VirtualMenuItem,
});

export { VirtualMenu };
export type { VirtualMenuProps, VirtualMenuItemProps, VirtualMenuRenderItemProps };
