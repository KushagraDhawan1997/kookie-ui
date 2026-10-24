'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Toolbar as ToolbarPrimitive } from 'radix-ui';

import { toolbarRootPropDefs } from './toolbar.props.js';
import { Button } from './button.js';
import * as DropdownMenu from './dropdown-menu.js';
import { Text } from './text.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSize } from '../helpers/theme-size.js';
import { layoutPropDefs } from '../props/layout.props.js';
import { usePaneBandSize } from './_internal/pane-chrome.js';

import type { ButtonProps } from './button.js';
import type { LayoutProps } from '../props/layout.props.js';
import type { TextProps } from './text.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';
import type { ButtonRankProps } from './button.js';

/*
 * Toolbar takes Kookie UI v2's contract (v2: components/toolbar), built on Radix instead of
 * Base UI. A toolbar is a row of controls with ONE tab stop: `role="toolbar"`, and the arrow
 * keys move focus between its controls. That keyboard is the reason it is a component.
 *
 * Its `size` reaches every control inside it that does not state its own. The row itself paints
 * nothing; a `ToolbarGroup` draws a quiet well around controls that belong together, and a
 * `ToolbarSeparator` draws a gray hairline between clusters. Use a `Flex` to cluster controls
 * without a well: the row spaces the clusters with `space-between`.
 */

type ToolbarSize = NonNullable<GetPropDefTypes<typeof toolbarRootPropDefs>['size']>;
type ToolbarOrientation = NonNullable<GetPropDefTypes<typeof toolbarRootPropDefs>['orientation']>;

interface ToolbarContextValue {
  size: ToolbarSize;
  orientation: ToolbarOrientation;
  backdrop: boolean;
}

const ToolbarContext = React.createContext<ToolbarContextValue | null>(null);

/** Set by a `ToolbarGroup`: its children rest quiet, and `disabled` turns them all off. */
const ToolbarGroupContext = React.createContext<{ disabled: boolean } | null>(null);

/**
 * True while a subtree is drawn into a `ToolbarOverflow`'s menu instead of into the row (v2
 * `InOverflow`). The parts answer it themselves: a `ToolbarButton` renders a menu item, a
 * `ToolbarGroup` a menu group, a `ToolbarSeparator` a menu separator.
 */
const InOverflowContext = React.createContext(false);

/**
 * True while this subtree is drawn into a `ToolbarOverflow`'s "More" menu instead of the row.
 *
 * The toolbar's own parts handle this already. Use it in your own component inside a
 * `ToolbarOverflow` to render a different form in the menu.
 */
function useToolbarOverflow(): boolean {
  return React.useContext(InOverflowContext);
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

// ============================================================================
// Toolbar (root)
// ============================================================================

type ToolbarOwnProps = GetPropDefTypes<typeof toolbarRootPropDefs>;

interface ToolbarProps
  extends ComponentPropsWithout<typeof ToolbarPrimitive.Root, RemovedProps | 'orientation'>,
    ToolbarOwnProps,
    LayoutProps {
  /**
   * Gives every control a surface of its own, for a row that content passes behind, such as
   * `Shell.PaneHeader float`. Buttons rest `raised` instead of `soft`, and a group's well is
   * solid and raised.
   */
  backdrop?: boolean;
}

/**
 * A row of controls with one keyboard tab stop. The arrow keys move focus between the controls.
 *
 * Give it an `aria-label` (or `aria-labelledby`) that says what the controls act on.
 *
 * @example
 * ```tsx
 * <Toolbar aria-label="Formatting">
 *   <ToolbarGroup>
 *     <ToolbarButton iconOnly aria-label="Bold" aria-pressed={bold} onClick={toggleBold}>
 *       <HugeiconsIcon icon={TextBoldIcon} strokeWidth={1.75} />
 *     </ToolbarButton>
 *   </ToolbarGroup>
 *   <ToolbarSeparator />
 *   <ToolbarButton>Share</ToolbarButton>
 * </Toolbar>
 * ```
 */
const ToolbarRoot = React.forwardRef<HTMLDivElement, ToolbarProps>((props, forwardedRef) => {
  // Inside a Shell (a pane's header or footer, or the content area), a toolbar with no size
  // rests one step above the Shell's. A pane's scrolling list has no band.
  const band = usePaneBandSize();
  // Elsewhere it takes the nearest Theme's size.
  const size: ToolbarSize = useThemeSize(props.size ?? band ?? undefined, toolbarRootPropDefs.size);
  const orientation: ToolbarOrientation = props.orientation ?? toolbarRootPropDefs.orientation.default;
  const { className, orientation: _orientation, backdrop = false, children, ...rootProps } = extractProps(
    { ...props, size },
    toolbarRootPropDefs,
    layoutPropDefs,
  );

  const context = React.useMemo(() => ({ size, orientation, backdrop }), [size, orientation, backdrop]);

  return (
    <ToolbarPrimitive.Root
      {...rootProps}
      ref={forwardedRef}
      orientation={orientation}
      data-backdrop={backdrop || undefined}
      className={classNames('kui-Toolbar', className)}
    >
      <ToolbarContext.Provider value={context}>{children}</ToolbarContext.Provider>
    </ToolbarPrimitive.Root>
  );
});
ToolbarRoot.displayName = 'Toolbar';

// ============================================================================
// ToolbarGroup
// ============================================================================

interface ToolbarGroupProps extends ComponentPropsWithout<'div', RemovedProps> {
  /** Turns every control in the group off at once. */
  disabled?: boolean;
}

/**
 * Controls that belong together, drawn as one quiet well that stands level with a button
 * beside it. Buttons inside it rest as `ghost` unless they state a `variant`.
 * To cluster controls without a well, use a `Flex`.
 *
 * In a `ToolbarOverflow`'s menu it is a menu group. Outside a `Toolbar` (rendered through a
 * portal, for example) it still draws its well, as a horizontal group.
 */
const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ className, disabled = false, children, ...props }, forwardedRef) => {
    const toolbar = React.useContext(ToolbarContext);
    const overflow = React.useContext(InOverflowContext);
    const group = React.useMemo(() => ({ disabled }), [disabled]);

    if (overflow) {
      return (
        <DropdownMenu.Group {...props} ref={forwardedRef} className={className}>
          <ToolbarGroupContext.Provider value={group}>{children}</ToolbarGroupContext.Provider>
        </DropdownMenu.Group>
      );
    }

    return (
      <div
        role="group"
        data-orientation={toolbar?.orientation ?? 'horizontal'}
        data-disabled={disabled || undefined}
        {...props}
        ref={forwardedRef}
        className={classNames('kui-ToolbarGroup', className)}
      >
        <ToolbarGroupContext.Provider value={group}>{children}</ToolbarGroupContext.Provider>
      </div>
    );
  },
);
ToolbarGroup.displayName = 'Toolbar.Group';

// ============================================================================
// ToolbarButton
// ============================================================================

type ToolbarButtonBaseProps = Omit<ButtonProps, 'as' | 'variant' | 'emphasis'>;

/** A labelled button: takes every `Button` prop. */
type ToolbarTextButtonProps = ToolbarButtonBaseProps &
  ButtonRankProps & {
  iconOnly?: false;
};

/** An icon-only button: renders `Button iconOnly`, and the type requires an `aria-label`. */
type ToolbarIconButtonProps = Omit<ToolbarButtonBaseProps, 'aria-label' | 'aria-labelledby' | 'fullWidth'> &
  ButtonRankProps & {
  iconOnly: true;
  /** The control's accessible name. An icon has no words of its own, so this is required. */
  'aria-label': string;
};

type ToolbarButtonProps = ToolbarTextButtonProps | ToolbarIconButtonProps;

function isPressed(value: React.AriaAttributes['aria-pressed']) {
  return value === true || value === 'true';
}

/** Does an `asChild` child render a native `<button>`? Only then is it a Radix Toolbar.Button. */
function isButtonElement(children: React.ReactNode) {
  return React.isValidElement(children) && children.type === 'button';
}

/**
 * A `Button` that joins the toolbar's keyboard navigation, so a row of them is one tab stop.
 *
 * Set `iconOnly` (with an `aria-label`) for a symbol-only control. Set `aria-pressed` for a
 * control that toggles; a pressed button wears Button's pressed look. Set `asChild` to render
 * your own element, such as a link: `<ToolbarButton asChild><a href="/docs">Docs</a></ToolbarButton>`.
 * A link stays in the arrow-key row and gets no `type` attribute.
 *
 * It takes the toolbar's `size`, and rests as a gray `soft` button (`raised` in a toolbar with
 * `backdrop`, gray `ghost` inside a `ToolbarGroup`). A stated `size`, `variant` or `color` wins; a
 * stated `variant` without a `color` takes Button's own default colour.
 *
 * In a `ToolbarOverflow`'s menu it renders a menu item; an icon-only button uses its
 * `aria-label` as the item's text. Outside a `Toolbar` (rendered through a React portal, for
 * example) it renders a plain Button with the same rest look, as its own tab stop. Use
 * `ToolbarSlot` and `ToolbarFill` for a control that should join the row's arrow keys.
 */
const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>((props, forwardedRef) => {
  const toolbar = React.useContext(ToolbarContext);
  const group = React.useContext(ToolbarGroupContext);
  const overflow = React.useContext(InOverflowContext);
  const { iconOnly, size, variant, emphasis, color, disabled, asChild, onKeyDown, ...rest } = props;
  const off = disabled || group?.disabled || undefined;

  if (overflow) {
    return (
      <ToolbarOverflowItem
        // Only what a menu row means comes across; Button's box props (size, loading,
        // tooltip, fullWidth and the rest) would land on the DOM as unknown attributes.
        id={rest.id}
        className={rest.className}
        style={rest.style}
        onClick={rest.onClick as React.MouseEventHandler<HTMLDivElement> | undefined}
        aria-label={rest['aria-label']}
        ref={forwardedRef as unknown as React.Ref<HTMLDivElement>}
        asChild={asChild}
        iconOnly={iconOnly}
        disabled={off}
        color={color}
      >
        {rest.children}
      </ToolbarOverflowItem>
    );
  }

  // In a vertical toolbar, Up and Down belong to the toolbar. A menu trigger rendering this
  // hands its open-on-arrow handler in through `onKeyDown`; those two keys skip it (v2).
  const handleKeyDown =
    toolbar?.orientation === 'vertical' && onKeyDown
      ? (event: React.KeyboardEvent<HTMLButtonElement>) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') return;
          onKeyDown(event);
        }
      : onKeyDown;

  const pressed = isPressed(props['aria-pressed']);
  const stateProps =
    'data-state' in props || props['aria-pressed'] === undefined ? {} : { 'data-state': pressed ? 'on' : 'off' };

  const shared = {
    size: size ?? toolbar?.size,
    // A caller states the look by `variant` or the rank by `emphasis`, never both.
    ...(emphasis !== undefined
      ? { emphasis }
      : { variant: variant ?? (group ? 'ghost' : toolbar?.backdrop ? 'raised' : 'soft') }),
    // The gray rest is a pair with the default variant: a caller who states a variant or an
    // emphasis gets Button's own colour for it unless they state a colour too.
    color: color ?? (variant || emphasis ? undefined : 'gray'),
    ...stateProps,
  } as const;

  // The text and icon-only branches share every prop but the name; one Button renders both.
  const buttonProps = {
    ...rest,
    ...(iconOnly ? { iconOnly: true } : {}),
    ...(asChild ? { asChild: true } : {}),
    ...(handleKeyDown ? { onKeyDown: handleKeyDown } : {}),
    ...shared,
  } as ButtonProps;

  // Outside a toolbar there is no row to join: a plain Button, not a throw.
  if (!toolbar) {
    return <Button {...buttonProps} ref={forwardedRef} disabled={off} />;
  }

  // A link (or any non-button child) joins the row as a Radix Toolbar.Link, which sets no
  // `type`. Toolbar.Button would stamp `type="button"` on it.
  if (asChild && !isButtonElement(rest.children)) {
    return (
      <ToolbarPrimitive.Link asChild ref={forwardedRef as unknown as React.Ref<HTMLAnchorElement>}>
        <Button {...buttonProps} disabled={off} />
      </ToolbarPrimitive.Link>
    );
  }

  return (
    <ToolbarPrimitive.Button asChild ref={forwardedRef} disabled={off}>
      <Button {...buttonProps} />
    </ToolbarPrimitive.Button>
  );
});
ToolbarButton.displayName = 'Toolbar.Button';

interface ToolbarOverflowItemProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect' | 'color'> {
  asChild?: boolean;
  iconOnly?: boolean;
  disabled?: boolean;
  color?: ButtonProps['color'];
}

/**
 * A ToolbarButton drawn into the overflow menu: the same element, as a menu item. An icon-only
 * button's `aria-label` becomes the item's text beside its icon, since a menu row has room for
 * words. What prices a box (size, variant, emphasis, iconOnly) does not come across.
 */
const ToolbarOverflowItem = React.forwardRef<HTMLDivElement, ToolbarOverflowItemProps>(
  ({ asChild, iconOnly, disabled, color, children, 'aria-label': label, ...props }, forwardedRef) => {
    const words = iconOnly ? label : undefined;
    const itemProps = {
      ...props,
      ...(iconOnly ? {} : label ? { 'aria-label': label } : {}),
      disabled,
      ...(color ? { color: color as DropdownMenu.ItemProps['color'] } : {}),
    };
    if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
      const child = words
        ? React.cloneElement(children, undefined, children.props.children, <span>{words}</span>)
        : children;
      return (
        <DropdownMenu.Item {...itemProps} ref={forwardedRef} asChild>
          {child}
        </DropdownMenu.Item>
      );
    }
    return (
      <DropdownMenu.Item {...itemProps} ref={forwardedRef}>
        {children}
        {words}
      </DropdownMenu.Item>
    );
  },
);
ToolbarOverflowItem.displayName = 'Toolbar.OverflowItem';

// ============================================================================
// ToolbarOverflow
// ============================================================================

interface ToolbarOverflowProps extends ComponentPropsWithout<'div', RemovedProps> {
  /** The accessible name of the "More" button. Defaults to `More`. */
  label?: string;
  /** The controls in the cluster, in order. The ones that don't fit move into the "More" menu. */
  children?: React.ReactNode;
}

/** Three filled dots for the "More" button. Internal, so the library carries no icon set. */
function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentcolor" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <circle cx="3.25" cy="8" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="12.75" cy="8" r="1.25" />
    </svg>
  );
}

/**
 * A cluster of controls that collapses into a "More" menu when the row runs out of room.
 *
 * It takes the room the row leaves, and when its controls don't fit, they move into the menu
 * from the end of the cluster. A `ToolbarButton` shows as a menu item there, and a
 * `ToolbarGroup` as a menu group. Use `useToolbarOverflow()` in your own components to render a
 * different form in the menu.
 *
 * It measures on mount and on resize (v2 ToolbarOverflow): each control's width is cached while
 * it is in the row, since a hidden control has no width to measure.
 */
const ToolbarOverflow = React.forwardRef<HTMLDivElement, ToolbarOverflowProps>(
  ({ label = 'More', className, children, ...props }, forwardedRef) => {
    const items = React.Children.toArray(children);
    const count = items.length;

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const widths = React.useRef<number[]>([]);
    const triggerWidth = React.useRef(0);
    const [shown, setShown] = React.useState(count);
    const [tick, setTick] = React.useState(0);

    // A different set of children is a different set of widths: show them all and measure again.
    const [measuredCount, setMeasuredCount] = React.useState(count);
    if (measuredCount !== count) {
      setMeasuredCount(count);
      setShown(count);
    }
    useIsomorphicLayoutEffect(() => {
      widths.current = [];
    }, [count]);

    useIsomorphicLayoutEffect(() => {
      const root = rootRef.current;
      if (!root) return;

      // The root's children are one seat per visible child, then the trigger.
      const kids = Array.from(root.children) as HTMLElement[];
      const visible = Math.min(shown, count);
      for (let i = 0; i < visible; i++) {
        const el = kids[i];
        if (el) widths.current[i] = el.offsetWidth;
      }
      const trigger = kids[visible];
      if (trigger) triggerWidth.current = trigger.offsetWidth;

      const gap = Number.parseFloat(getComputedStyle(root).columnGap) || 0;
      const available = root.clientWidth;

      let total = 0;
      let counted = 0;
      for (let i = 0; i < count; i++) {
        const width = widths.current[i];
        // Never seen in the row, so there is nothing to decide with yet.
        if (width === undefined) return;
        // An empty seat leaves the layout, so it spends no gap.
        if (width === 0) continue;
        total += width + (counted > 0 ? gap : 0);
        counted += 1;
      }

      let next = count;
      if (total > available) {
        // Before the trigger exists, the row's height stands in for its width: an icon-only
        // button is square. The next pass, before paint, corrects it.
        const budget = available - (triggerWidth.current || root.clientHeight) - gap;
        let used = 0;
        let drawn = 0;
        next = 0;
        for (let i = 0; i < count; i++) {
          const own = widths.current[i]!;
          if (own > 0) {
            const width = own + (drawn > 0 ? gap : 0);
            if (used + width > budget) break;
            used += width;
            drawn += 1;
          }
          next += 1;
        }
      }
      if (next !== shown) setShown(next);
    }, [shown, count, tick]);

    // Watch the row and every seat in it: a control whose content changes (a page's actions
    // arriving after navigation) changes its width without the row's width changing.
    React.useEffect(() => {
      const root = rootRef.current;
      if (!root || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => setTick((n) => n + 1));
      observer.observe(root);
      for (const seat of Array.from(root.children)) observer.observe(seat);
      return () => observer.disconnect();
    }, [shown, count]);

    const attach = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    return (
      <div {...props} ref={attach} className={classNames('kui-ToolbarOverflow', className)}>
        {items.slice(0, shown).map((item, i) => (
          // The seat is a position in the row, so its key is the index.
          <div key={i} className="kui-ToolbarOverflowSeat">
            {item}
          </div>
        ))}
        {shown < count ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <ToolbarButton iconOnly aria-label={label}>
                <MoreIcon />
              </ToolbarButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <InOverflowContext.Provider value>{items.slice(shown)}</InOverflowContext.Provider>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : null}
      </div>
    );
  },
);
ToolbarOverflow.displayName = 'Toolbar.Overflow';

// ============================================================================
// ToolbarSlot and ToolbarFill
// ============================================================================

type SlotEntry = { id: string; node: React.ReactNode };

const EMPTY_ENTRIES: readonly SlotEntry[] = [];
const slotEntries = new Map<string, readonly SlotEntry[]>();
const slotListeners = new Set<() => void>();

function subscribeSlots(listener: () => void) {
  slotListeners.add(listener);
  return () => {
    slotListeners.delete(listener);
  };
}

function setSlotEntry(name: string, id: string, node: React.ReactNode) {
  const list = slotEntries.get(name) ?? EMPTY_ENTRIES;
  const index = list.findIndex((entry) => entry.id === id);
  const next = index === -1 ? [...list, { id, node }] : list.map((entry) => (entry.id === id ? { id, node } : entry));
  slotEntries.set(name, next);
  slotListeners.forEach((listener) => listener());
}

function removeSlotEntry(name: string, id: string) {
  const list = slotEntries.get(name);
  if (!list) return;
  const next = list.filter((entry) => entry.id !== id);
  if (next.length === 0) slotEntries.delete(name);
  else slotEntries.set(name, next);
  slotListeners.forEach((listener) => listener());
}

interface ToolbarSlotProps {
  /** Which `ToolbarFill` renders here. Use one name per slot. Defaults to `default`. */
  name?: string;
}

/**
 * A place in a toolbar that content elsewhere in the app fills, such as a page adding its own
 * actions to a header toolbar the layout owns.
 *
 * It renders whatever the `ToolbarFill` with the same `name` holds, as if it were written here:
 * the controls take the toolbar's size and join its arrow-key row. It adds no element.
 */
function ToolbarSlot({ name = 'default' }: ToolbarSlotProps) {
  const entries = React.useSyncExternalStore(
    subscribeSlots,
    () => slotEntries.get(name) ?? EMPTY_ENTRIES,
    () => EMPTY_ENTRIES,
  );
  return (
    <>
      {entries.map((entry) => (
        <React.Fragment key={entry.id}>{entry.node}</React.Fragment>
      ))}
    </>
  );
}
ToolbarSlot.displayName = 'Toolbar.Slot';

interface ToolbarFillProps {
  /** The `ToolbarSlot` to render into. Defaults to `default`. */
  name?: string;
  /** The controls to show in the slot, such as `ToolbarButton`s. */
  children?: React.ReactNode;
}

/**
 * Sends its children to the `ToolbarSlot` with the same `name`, and renders nothing where it
 * is written. Use it instead of a React portal: a portal keeps the page's React tree, so a
 * ToolbarButton in it can't join the toolbar's arrow keys.
 *
 * The children render inside the toolbar, so they read the toolbar's context, not the page's.
 * They appear after the page mounts on the client, not in server-rendered HTML.
 */
function ToolbarFill({ name = 'default', children }: ToolbarFillProps) {
  const id = React.useId();
  useIsomorphicLayoutEffect(() => {
    setSlotEntry(name, id, children);
  }, [name, id, children]);
  useIsomorphicLayoutEffect(() => () => removeSlotEntry(name, id), [name, id]);
  return null;
}
ToolbarFill.displayName = 'Toolbar.Fill';

// ============================================================================
// ToolbarSeparator
// ============================================================================

type ToolbarSeparatorProps = ComponentPropsWithout<typeof ToolbarPrimitive.Separator, RemovedProps | 'orientation'>;

/**
 * A gray hairline between two clusters, announced as a separator. Its direction is always
 * opposite to the toolbar's. In a `ToolbarOverflow`'s menu it is a menu separator.
 */
const ToolbarSeparator = React.forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  ({ className, ...props }, forwardedRef) => {
    const toolbar = React.useContext(ToolbarContext);
    const overflow = React.useContext(InOverflowContext);
    if (overflow) return <DropdownMenu.Separator {...props} ref={forwardedRef} className={className} />;
    if (!toolbar) {
      return (
        <div
          role="separator"
          aria-orientation="vertical"
          data-orientation="vertical"
          {...props}
          ref={forwardedRef}
          className={classNames('kui-ToolbarSeparator', className)}
        />
      );
    }
    return (
      <ToolbarPrimitive.Separator
        {...props}
        ref={forwardedRef}
        className={classNames('kui-ToolbarSeparator', className)}
      />
    );
  },
);
ToolbarSeparator.displayName = 'Toolbar.Separator';

// ============================================================================
// ToolbarTitle
// ============================================================================

/** The title's text step: one step above the label of a button at the same size. */
const TITLE_SIZE = { '1': '2', '2': '3', '3': '4', '4': '5' } as const satisfies Record<ToolbarSize, TextProps['size']>;

interface ToolbarTitleProps {
  /** The title text. With none, the title renders nothing. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** The id of the title, so that the toolbar's `aria-labelledby` can point at it. */
  id?: string;
}

/**
 * What the row is about, at its leading edge. One line: it truncates rather than wrapping.
 * Its text step follows the toolbar's `size`, and it takes more air from the controls beside it
 * than they take from each other.
 */
const ToolbarTitle = React.forwardRef<HTMLSpanElement, ToolbarTitleProps>(
  ({ className, children, style, id }, forwardedRef) => {
    const toolbar = React.useContext(ToolbarContext);
    const themeSize = useThemeSize<ToolbarSize>(undefined, toolbarRootPropDefs.size);
    const size = toolbar?.size ?? themeSize;
    if (children === undefined || children === null || children === false) return null;
    return (
      <Text
        ref={forwardedRef}
        as="span"
        size={TITLE_SIZE[size]}
        weight="medium"
        truncate
        id={id}
        style={style}
        className={classNames('kui-ToolbarTitle', className)}
      >
        {children}
      </Text>
    );
  },
);
ToolbarTitle.displayName = 'Toolbar.Title';

// ============================================================================
// Exports
// ============================================================================

const Toolbar = Object.assign(ToolbarRoot, {
  Root: ToolbarRoot,
  Group: ToolbarGroup,
  Button: ToolbarButton,
  Separator: ToolbarSeparator,
  Title: ToolbarTitle,
  Overflow: ToolbarOverflow,
  Slot: ToolbarSlot,
  Fill: ToolbarFill,
});

export {
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarTitle,
  ToolbarOverflow,
  ToolbarSlot,
  ToolbarFill,
  useToolbarOverflow,
  ToolbarRoot as Root,
  ToolbarGroup as Group,
  ToolbarButton as Button,
  ToolbarSeparator as Separator,
  ToolbarTitle as Title,
  ToolbarOverflow as Overflow,
  ToolbarSlot as Slot,
  ToolbarFill as Fill,
};
export type {
  ToolbarProps,
  ToolbarGroupProps,
  ToolbarButtonProps,
  ToolbarSeparatorProps,
  ToolbarTitleProps,
  ToolbarOverflowProps,
  ToolbarSlotProps,
  ToolbarFillProps,
  ToolbarProps as RootProps,
  ToolbarGroupProps as GroupProps,
  ToolbarButtonProps as ButtonProps,
  ToolbarSeparatorProps as SeparatorProps,
  ToolbarTitleProps as TitleProps,
  ToolbarOverflowProps as OverflowProps,
  ToolbarSlotProps as SlotProps,
  ToolbarFillProps as FillProps,
};
