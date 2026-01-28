'use client';

import * as React from 'react';
import classNames from 'classnames';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMenuContext, menuSizeToItemHeight } from './_internal/menu-context.js';

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
  /** Mouse enter handler */
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  /** Mouse leave handler */
  onMouseLeave: () => void;
  /** Click handler */
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  /** Keyboard handler for Enter/Space activation */
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}

interface VirtualMenuProps<T> {
  /** Array of items to render */
  items: T[];
  /**
   * Simple label accessor for basic text items.
   * Can be a property key or a function.
   * @example
   * itemLabel="name"
   * itemLabel={(item) => item.name}
   */
  itemLabel?: keyof T | ((item: T) => React.ReactNode);
  /**
   * Custom component for rendering items.
   * Must be memoized (React.memo) for optimal performance.
   * @example
   * const MyItem = React.memo(({ item, ...props }) => (
   *   <VirtualMenu.Item {...props}>{item.name}</VirtualMenu.Item>
   * ));
   * <VirtualMenu items={items} renderItem={MyItem} />
   */
  renderItem?: React.ComponentType<VirtualMenuRenderItemProps<T>>;
  /**
   * Menu size - controls item height.
   * Automatically inherited from parent DropdownMenu.Content/ContextMenu.Content.
   * Only set manually when using VirtualMenu outside of a menu context.
   * @default '2' (or inherited from context)
   */
  size?: '1' | '2';
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
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Accessible label for the menu */
  'aria-label'?: string;
}

// ============================================================================
// Internal Memoized Item Component
// ============================================================================

interface SimpleItemProps {
  label: React.ReactNode;
  isHighlighted: boolean;
  id: string;
  style: React.CSSProperties;
  tabIndex: number;
  'data-highlighted': true | undefined;
  'data-index': number;
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
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
    onMouseEnter,
    onMouseLeave,
    onClick,
    onKeyDown,
  }: SimpleItemProps) {
    return (
      <div
        id={id}
        role="menuitem"
        className={classNames('rt-reset', 'rt-BaseMenuItem', 'rt-VirtualMenuItem')}
        style={style}
        tabIndex={tabIndex}
        data-highlighted={dataHighlighted}
        data-index={dataIndex}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        {label}
      </div>
    );
  },
  (prev, next) => {
    // Custom comparison - only re-render if these change
    if (prev.label !== next.label) return false;
    if (prev['data-highlighted'] !== next['data-highlighted']) return false;
    if (prev.style.height !== next.style.height) return false;
    if (prev.style.transform !== next.style.transform) return false;
    if (prev.tabIndex !== next.tabIndex) return false;
    if (prev.id !== next.id) return false;
    // Event handlers are stable, skip comparison
    return true;
  },
);

// ============================================================================
// VirtualMenu Component
// ============================================================================

function VirtualMenuRoot<T>({
  items,
  itemLabel,
  renderItem: RenderItem,
  size: sizeProp,
  estimatedItemSize: estimatedItemSizeProp,
  overscan = 5,
  onSelect,
  className,
  style,
  'aria-label': ariaLabel,
}: VirtualMenuProps<T>) {
  const menuId = React.useId();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
  const { isInsideMenu, size: contextSize } = useMenuContext();

  // Resolve size: prop > context > default '2'
  const resolvedSize = sizeProp ?? contextSize ?? '2';
  
  // Resolve item height: explicit prop > derived from size
  const estimatedItemSize = estimatedItemSizeProp ?? menuSizeToItemHeight[resolvedSize];

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

  // Refs for stable handler references
  const itemsRef = React.useRef(items);
  const onSelectRef = React.useRef(onSelect);
  itemsRef.current = items;
  onSelectRef.current = onSelect;

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
    if (index != null) {
      const idx = Number(index);
      const currentItems = itemsRef.current;
      if (idx >= 0 && idx < currentItems.length) {
        onSelectRef.current?.(currentItems[idx], idx);
      }
    }
  }, []);

  const noop = React.useCallback(() => {}, []);

  // Item-level keyboard handler for Enter/Space activation (satisfies a11y lint rule)
  const handleItemKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const index = e.currentTarget.dataset.index;
      if (index != null) {
        const idx = Number(index);
        const currentItems = itemsRef.current;
        if (idx >= 0 && idx < currentItems.length) {
          onSelectRef.current?.(currentItems[idx], idx);
        }
      }
    }
  }, []);

  // Keyboard navigation
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
        e.preventDefault();
        break;
      }
      case 'Escape': {
        (e.currentTarget as HTMLElement).blur();
        break;
      }
    }
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
      ref={parentRef}
      role={isInsideMenu ? undefined : 'menu'}
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
            tabIndex: isHighlighted ? 0 : -1,
            'data-highlighted': isHighlighted ? true as const : undefined,
            'data-index': index,
            onMouseEnter: handleItemMouseEnter,
            onMouseLeave: noop,
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
        className={classNames('rt-reset', 'rt-BaseMenuItem', 'rt-VirtualMenuItem', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

VirtualMenuItemInner.displayName = 'VirtualMenu.Item';

// Memoized with custom comparison
const VirtualMenuItem = React.memo(VirtualMenuItemInner, (prevProps, nextProps) => {
  const prevStyle = prevProps.style as React.CSSProperties | undefined;
  const nextStyle = nextProps.style as React.CSSProperties | undefined;
  if (prevStyle?.height !== nextStyle?.height) return false;
  if (prevStyle?.transform !== nextStyle?.transform) return false;
  if (prevProps['data-highlighted'] !== nextProps['data-highlighted']) return false;
  if (prevProps.tabIndex !== nextProps.tabIndex) return false;
  if (prevProps.id !== nextProps.id) return false;
  if (prevProps.className !== nextProps.className) return false;
  if (prevProps.children !== nextProps.children) return false;
  return true;
});

// ============================================================================
// Exports
// ============================================================================

const VirtualMenu = Object.assign(VirtualMenuRoot, {
  Item: VirtualMenuItem,
});

export { VirtualMenu };
export type { VirtualMenuProps, VirtualMenuItemProps, VirtualMenuRenderItemProps };
