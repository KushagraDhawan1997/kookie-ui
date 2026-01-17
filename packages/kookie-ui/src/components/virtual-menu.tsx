'use client';

import * as React from 'react';
import classNames from 'classnames';
import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * VirtualMenu - A virtualized menu component for rendering large lists efficiently.
 * 
 * Uses TanStack Virtual to render only visible items.
 * Works inside any container (DropdownMenu.Content, Sidebar.Content, Popover.Content, etc.)
 * 
 * @example
 * <VirtualMenu items={items} onSelect={handleSelect}>
 *   {(item, { isHighlighted, ...props }) => (
 *     <VirtualMenu.Item {...props}>{item.label}</VirtualMenu.Item>
 *   )}
 * </VirtualMenu>
 */

// ============================================================================
// Constants
// ============================================================================

/** Stable no-op function to avoid creating new references */
const noop = () => {};

// ============================================================================
// Types
// ============================================================================

interface VirtualMenuItemRenderProps {
  /** Unique ID for accessibility (aria-activedescendant) */
  id: string;
  /** Whether this item is currently highlighted (keyboard/hover) */
  isHighlighted: boolean;
  /** Positioning styles - must be applied for virtualization to work */
  style: React.CSSProperties;
  /** Menu item role */
  role: 'menuitem';
  /** Tab index for focus management */
  tabIndex: number;
  /** Position in set for accessibility */
  'aria-posinset': number;
  /** Total set size for accessibility */
  'aria-setsize': number;
  /** Data attribute for CSS styling */
  'data-highlighted': true | undefined;
  /** Data attribute for event delegation - used internally */
  'data-index': number;
  /** Mouse enter handler for hover highlighting */
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  /** Mouse leave handler */
  onMouseLeave: () => void;
  /** Click handler for selection */
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

interface VirtualMenuProps<T> {
  /** Array of items to render */
  items: T[];
  /**
   * Estimated height of each item in pixels.
   * Can be a number (same for all) or a function (per-item).
   * @default 36
   * @example
   * // Fixed height
   * estimatedItemSize={36}
   * // Variable heights
   * estimatedItemSize={(index) => items[index].type === 'header' ? 48 : 36}
   */
  estimatedItemSize?: number | ((index: number) => number);
  /** Number of items to render outside visible area (default: 5) */
  overscan?: number;
  /** Callback when an item is selected */
  onSelect?: (item: T, index: number) => void;
  /** Render function for each item */
  children: (item: T, props: VirtualMenuItemRenderProps) => React.ReactNode;
  /** Additional class name for the root element */
  className?: string;
  /** Additional styles for the root element */
  style?: React.CSSProperties;
  /** Accessible label for the menu */
  'aria-label'?: string;
}

// ============================================================================
// VirtualMenu Component
// ============================================================================

function VirtualMenuRoot<T>({
  items,
  estimatedItemSize = 36,
  overscan = 5,
  onSelect,
  children,
  className,
  style,
  'aria-label': ariaLabel,
}: VirtualMenuProps<T>) {
  const menuId = React.useId();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

  // Derive safe highlighted index - clamp to valid range when items change
  // This avoids useEffect and keeps highlight stable when possible
  const safeHighlightedIndex = React.useMemo(() => {
    if (items.length === 0) return -1;
    if (highlightedIndex < 0) return -1;
    return Math.min(highlightedIndex, items.length - 1);
  }, [highlightedIndex, items.length]);

  // Normalize estimatedItemSize to always be a function
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

  // Store items and onSelect in refs for stable handler references
  const itemsRef = React.useRef(items);
  const onSelectRef = React.useRef(onSelect);
  itemsRef.current = items;
  onSelectRef.current = onSelect;

  // Store scrollToIndex in ref for stable keyboard handler
  const scrollToIndexRef = React.useRef(virtualizer.scrollToIndex);
  scrollToIndexRef.current = virtualizer.scrollToIndex;

  // Stable handler for mouse enter - reads index from data attribute
  const handleItemMouseEnter = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    const index = e.currentTarget.dataset.index;
    if (index != null) {
      setHighlightedIndex(Number(index));
    }
  }, []);

  // Stable handler for click - reads index from data attribute
  const handleItemClick = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    const index = e.currentTarget.dataset.index;
    if (index != null) {
      const idx = Number(index);
      const currentItems = itemsRef.current;
      if (idx >= 0 && idx < currentItems.length) {
        onSelectRef.current?.(currentItems[idx], idx);
      }
    }
  }, []);

  // Store highlightedIndex in ref for stable keyboard handler
  const highlightedIndexRef = React.useRef(safeHighlightedIndex);
  highlightedIndexRef.current = safeHighlightedIndex;

  // Handle keyboard navigation - uses refs for stable reference
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
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
        if (currentHighlightedIndex >= 0 && currentHighlightedIndex < currentItems.length) {
          onSelectRef.current?.(currentItems[currentHighlightedIndex], currentHighlightedIndex);
        }
        break;
      }
      case 'Tab': {
        // Prevent Tab from moving focus out of the menu
        e.preventDefault();
        break;
      }
      case 'Escape': {
        // Blur the menu to allow parent (e.g., DropdownMenu) to handle close
        e.currentTarget.blur();
        break;
      }
    }
  }, []);

  // Helper to generate item IDs for aria-activedescendant
  const getItemId = React.useCallback(
    (index: number) => `${menuId}-item-${index}`,
    [menuId],
  );

  // Create item props generator - uses stable handlers with data-index for event delegation
  // Static positioning styles (position, top, left, width) are in CSS for performance
  const getItemProps = React.useCallback(
    (index: number, virtualRow: { start: number; size: number }): VirtualMenuItemRenderProps => ({
      id: getItemId(index),
      isHighlighted: safeHighlightedIndex === index,
      style: {
        height: virtualRow.size,
        transform: `translateY(${virtualRow.start}px)`,
      },
      role: 'menuitem',
      tabIndex: safeHighlightedIndex === index ? 0 : -1,
      'aria-posinset': index + 1,
      'aria-setsize': items.length,
      'data-highlighted': safeHighlightedIndex === index ? true : undefined,
      'data-index': index,
      onMouseEnter: handleItemMouseEnter,
      onMouseLeave: noop,
      onClick: handleItemClick,
    }),
    [getItemId, safeHighlightedIndex, items.length, handleItemMouseEnter, handleItemClick],
  );

  // Memoize root styles to prevent object recreation on each render
  const rootStyle = React.useMemo(
    () => ({
      overflow: 'auto' as const,
      position: 'relative' as const,
      ...style,
    }),
    [style],
  );

  // Memoize viewport styles - only height changes based on total size
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
      ref={parentRef}
      role="menu"
      aria-label={ariaLabel}
      aria-activedescendant={safeHighlightedIndex >= 0 ? getItemId(safeHighlightedIndex) : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={classNames('rt-VirtualMenuRoot', className)}
      style={rootStyle}
    >
      <div className="rt-VirtualMenuViewport" style={viewportStyle}>
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          const props = getItemProps(virtualRow.index, virtualRow);
          return (
            <React.Fragment key={virtualRow.key}>
              {children(item, props)}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

VirtualMenuRoot.displayName = 'VirtualMenu';

// ============================================================================
// VirtualMenu.Item Component
// ============================================================================

interface VirtualMenuItemProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

const VirtualMenuItemInner = React.forwardRef<HTMLDivElement, VirtualMenuItemProps>(
  ({ className, children, ...props }, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        className={classNames('rt-reset', 'rt-BaseMenuItem', 'rt-VirtualMenuItem', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

VirtualMenuItemInner.displayName = 'VirtualMenu.Item';

// Memoized version with custom comparison for virtualized rendering
// Compares only the values that affect rendering, not object references
const VirtualMenuItem = React.memo(VirtualMenuItemInner, (prevProps, nextProps) => {
  // Compare style values (height, transform) instead of object reference
  const prevStyle = prevProps.style as React.CSSProperties | undefined;
  const nextStyle = nextProps.style as React.CSSProperties | undefined;
  if (prevStyle?.height !== nextStyle?.height) return false;
  if (prevStyle?.transform !== nextStyle?.transform) return false;

  // Compare highlight state
  if (prevProps['data-highlighted'] !== nextProps['data-highlighted']) return false;

  // Compare accessibility props
  if (prevProps['aria-posinset'] !== nextProps['aria-posinset']) return false;
  if (prevProps.tabIndex !== nextProps.tabIndex) return false;
  if (prevProps.id !== nextProps.id) return false;

  // Compare className and children
  if (prevProps.className !== nextProps.className) return false;
  if (prevProps.children !== nextProps.children) return false;

  // Event handlers are stable (from useCallback with []), so we skip comparing them
  return true;
});

// ============================================================================
// Exports
// ============================================================================

const VirtualMenu = Object.assign(VirtualMenuRoot, {
  Item: VirtualMenuItem,
});

export { VirtualMenu };
export type { VirtualMenuProps, VirtualMenuItemProps, VirtualMenuItemRenderProps };
