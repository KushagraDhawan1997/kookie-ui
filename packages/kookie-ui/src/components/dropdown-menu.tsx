'use client';

import * as React from 'react';
import classNames from 'classnames';
import { DropdownMenu as DropdownMenuPrimitive, Slot } from 'radix-ui';
import { useCallbackRef } from 'radix-ui/internal';

import { ScrollArea } from './scroll-area.js';
import {
  dropdownMenuContentPropDefs,
  dropdownMenuSubContentPropDefs,
  dropdownMenuItemPropDefs,
  dropdownMenuCheckboxItemPropDefs,
  dropdownMenuRadioItemPropDefs,
} from './dropdown-menu.props.js';
import { Theme, useThemeContext } from './theme.js';
import { ChevronDownIcon, ThickCheckIcon, ThickChevronLeftIcon, ThickChevronRightIcon, ThickDotIcon } from './icons.js';
import { extractProps } from '../helpers/extract-props.js';
import {
  DrillDownLevelContext,
  DrillDownRoot,
  SubContext,
  useCreateDrillDownStore,
  useDrillDownDirection,
  useDrillDownStore,
  usePanelPosition,
  useStackEntry,
  useSubContext,
} from './_internal/dropdown-menu-drill-down.js';
import { MenuProvider } from './_internal/menu-context.js';
import {
  MenuShortcut,
  getMenuAlignOffset,
  resolveMenuMaterial,
  toAriaKeyShortcuts,
  useResolvedResponsiveValue,
} from './_internal/base-menu.utils.js';
import { requireReactElement } from '../helpers/require-react-element.js';
import { useDeprecatedPanelBackgroundWarning } from '../helpers/use-deprecation-warning.js';

import type { SubmenuBehavior } from './_internal/dropdown-menu-drill-down.js';
import type { IconProps } from './icons.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes, Responsive } from '../props/prop-def.js';

/**
 * Open state of the menu, mirrored from Root so Content can reset drill-down
 * navigation when a force-mounted menu opens again.
 */
const DropdownMenuOpenContext = React.createContext(false);

interface DropdownMenuRootProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> {}
const DropdownMenuRoot: React.FC<DropdownMenuRootProps> = (props) => {
  const { open: openProp, defaultOpen = false, onOpenChange } = props;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const handleOpenChangeProp = useCallbackRef(onOpenChange);
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setUncontrolledOpen(next);
      handleOpenChangeProp(next);
    },
    [handleOpenChangeProp],
  );

  return (
    <DropdownMenuOpenContext.Provider value={open}>
      <DropdownMenuPrimitive.Root {...props} onOpenChange={handleOpenChange} />
    </DropdownMenuOpenContext.Provider>
  );
};
DropdownMenuRoot.displayName = 'DropdownMenu.Root';

type DropdownMenuTriggerElement = React.ElementRef<typeof DropdownMenuPrimitive.Trigger>;
interface DropdownMenuTriggerProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.Trigger, RemovedProps> {}
const DropdownMenuTrigger = React.forwardRef<DropdownMenuTriggerElement, DropdownMenuTriggerProps>(
  ({ children, ...props }, forwardedRef) => (
    <DropdownMenuPrimitive.Trigger {...props} ref={forwardedRef} asChild>
      {requireReactElement(children)}
    </DropdownMenuPrimitive.Trigger>
  ),
);
DropdownMenuTrigger.displayName = 'DropdownMenu.Trigger';

/** Visual props shared by Content and SubContent. */
type DropdownMenuSurfaceProps = GetPropDefTypes<typeof dropdownMenuSubContentPropDefs>;

type DropdownMenuContentContextValue = {
  size?: DropdownMenuSurfaceProps['size'];
  variant?: DropdownMenuSurfaceProps['variant'];
  color?: DropdownMenuSurfaceProps['color'];
  material?: DropdownMenuSurfaceProps['material'];
};
const DropdownMenuContentContext = React.createContext<DropdownMenuContentContextValue>({});

/** Keys that navigate back one drill-down level, by writing direction. */
const BACK_KEYS = { ltr: 'ArrowLeft', rtl: 'ArrowRight' } as const;
const FORWARD_KEYS = { ltr: 'ArrowRight', rtl: 'ArrowLeft' } as const;

function isTextEntryTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
  );
}

function getDirection(element: HTMLElement | null): 'ltr' | 'rtl' {
  return element?.closest('[dir]')?.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
}

type DropdownMenuContentElement = React.ElementRef<typeof DropdownMenuPrimitive.Content>;
interface DropdownMenuContentProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.Content, RemovedProps>,
    DropdownMenuSurfaceProps {
  container?: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Portal>['container'];
  /**
   * Controls how submenus behave.
   * - `cascade`: Default cascading behavior where submenus open to the side (portal-based)
   * - `drill-down`: Mobile-friendly behavior where submenus replace the content inline
   * Supports responsive values: `{ initial: 'drill-down', md: 'cascade' }`
   */
  submenuBehavior?: Responsive<SubmenuBehavior>;
  /**
   * When true, skips the ScrollArea wrapper to allow VirtualMenu to handle its own scrolling.
   * Use this when rendering virtualized lists inside the dropdown.
   */
  virtualized?: boolean;
}
const DropdownMenuContent = React.forwardRef<DropdownMenuContentElement, DropdownMenuContentProps>(
  (props, forwardedRef) => {
    const themeContext = useThemeContext();

    useDeprecatedPanelBackgroundWarning(props.panelBackground);

    const material = resolveMenuMaterial(props.material, props.panelBackground, themeContext);
    const {
      size = dropdownMenuContentPropDefs.size.default,
      variant = dropdownMenuContentPropDefs.variant.default,
    } = props;
    const {
      className,
      children,
      color,
      container,
      forceMount,
      material: _material,
      panelBackground: _panelBackground,
      submenuBehavior,
      virtualized = false,
      onEscapeKeyDown,
      onKeyDown,
      ...contentProps
    } = extractProps(props, dropdownMenuContentPropDefs);

    const resolvedColor = color || themeContext.accentColor;
    const behavior = useResolvedResponsiveValue<SubmenuBehavior>(submenuBehavior, 'cascade');
    const isDrillDown = behavior === 'drill-down';
    const open = React.useContext(DropdownMenuOpenContext);
    const drillDownStore = useCreateDrillDownStore();

    // Escape goes back one drill-down level before it closes the menu.
    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      onEscapeKeyDown?.(event);
      if (event.defaultPrevented || !isDrillDown || drillDownStore.getDepth() === 0) return;
      event.preventDefault();
      drillDownStore.pop('keyboard');
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !isDrillDown || drillDownStore.getDepth() === 0) return;
      if (isTextEntryTarget(event.target)) return;
      if (event.key === BACK_KEYS[getDirection(event.currentTarget)]) {
        event.preventDefault();
        drillDownStore.pop('keyboard');
      }
    };

    const contextValue = React.useMemo(
      () => ({ size, variant, color: resolvedColor, material }),
      [size, variant, resolvedColor, material],
    );

    const contentBody = (
      <MenuProvider size={size}>
        <DropdownMenuContentContext.Provider value={contextValue}>
          <DrillDownRoot store={drillDownStore} behavior={behavior} open={open}>
            {children}
          </DrillDownRoot>
        </DropdownMenuContentContext.Provider>
      </MenuProvider>
    );

    return (
      <DropdownMenuPrimitive.Portal container={container} forceMount={forceMount}>
        <Theme asChild>
          <DropdownMenuPrimitive.Content
            data-accent-color={resolvedColor}
            data-material={material}
            data-panel-background={material}
            align="start"
            sideOffset={4}
            collisionPadding={10}
            {...contentProps}
            onEscapeKeyDown={handleEscapeKeyDown}
            onKeyDown={handleKeyDown}
            asChild={false}
            ref={forwardedRef}
            className={classNames(
              'rt-PopperContent',
              'rt-BaseMenuContent',
              'rt-DropdownMenuContent',
              className,
            )}
          >
            {virtualized ? (
              <div className={classNames('rt-BaseMenuViewport', 'rt-DropdownMenuViewport', 'rt-virtualized')}>
                {contentBody}
              </div>
            ) : (
              <ScrollArea type="auto" scrollbars="vertical">
                <div className={classNames('rt-BaseMenuViewport', 'rt-DropdownMenuViewport')}>
                  {contentBody}
                </div>
              </ScrollArea>
            )}
          </DropdownMenuPrimitive.Content>
        </Theme>
      </DropdownMenuPrimitive.Portal>
    );
  },
);
DropdownMenuContent.displayName = 'DropdownMenu.Content';

type DropdownMenuLabelElement = React.ElementRef<typeof DropdownMenuPrimitive.Label>;
interface DropdownMenuLabelProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.Label, RemovedProps> {}
const DropdownMenuLabel = React.forwardRef<DropdownMenuLabelElement, DropdownMenuLabelProps>(
  ({ className, ...props }, forwardedRef) => {
    if (!React.useContext(DrillDownLevelContext)) return null;
    return (
      <DropdownMenuPrimitive.Label
        {...props}
        asChild={false}
        ref={forwardedRef}
        className={classNames('rt-BaseMenuLabel', 'rt-DropdownMenuLabel', className)}
      />
    );
  },
);
DropdownMenuLabel.displayName = 'DropdownMenu.Label';

type DropdownMenuItemElement = React.ElementRef<typeof DropdownMenuPrimitive.Item>;
type DropdownMenuItemOwnProps = GetPropDefTypes<typeof dropdownMenuItemPropDefs>;
interface DropdownMenuItemProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.Item, RemovedProps>,
    DropdownMenuItemOwnProps {}
const DropdownMenuItem = React.forwardRef<DropdownMenuItemElement, DropdownMenuItemProps>(
  (props, forwardedRef) => {
    const {
      className,
      children,
      color = dropdownMenuItemPropDefs.color.default,
      shortcut,
      ...itemProps
    } = props;
    // In drill-down mode, items of levels that are not on screen do not mount.
    if (!React.useContext(DrillDownLevelContext)) return null;
    return (
      <DropdownMenuPrimitive.Item
        data-accent-color={color}
        aria-keyshortcuts={shortcut ? toAriaKeyShortcuts(shortcut) : undefined}
        {...itemProps}
        ref={forwardedRef}
        className={classNames('rt-reset', 'rt-BaseMenuItem', 'rt-DropdownMenuItem', className)}
      >
        <Slot.Slottable>{children}</Slot.Slottable>
        {shortcut && <MenuShortcut shortcut={shortcut} className="rt-DropdownMenuShortcut" />}
      </DropdownMenuPrimitive.Item>
    );
  },
);
DropdownMenuItem.displayName = 'DropdownMenu.Item';

type DropdownMenuGroupElement = React.ElementRef<typeof DropdownMenuPrimitive.Group>;
interface DropdownMenuGroupProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.Group, RemovedProps> {}
const DropdownMenuGroup = React.forwardRef<DropdownMenuGroupElement, DropdownMenuGroupProps>(
  ({ className, ...props }, forwardedRef) => (
    <DropdownMenuPrimitive.Group
      {...props}
      asChild={false}
      ref={forwardedRef}
      className={classNames('rt-BaseMenuGroup', 'rt-DropdownMenuGroup', className)}
    />
  ),
);
DropdownMenuGroup.displayName = 'DropdownMenu.Group';

type DropdownMenuRadioGroupElement = React.ElementRef<typeof DropdownMenuPrimitive.RadioGroup>;
interface DropdownMenuRadioGroupProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.RadioGroup, RemovedProps> {}
const DropdownMenuRadioGroup = React.forwardRef<
  DropdownMenuRadioGroupElement,
  DropdownMenuRadioGroupProps
>(({ className, ...props }, forwardedRef) => (
  <DropdownMenuPrimitive.RadioGroup
    {...props}
    asChild={false}
    ref={forwardedRef}
    className={classNames('rt-BaseMenuRadioGroup', 'rt-DropdownMenuRadioGroup', className)}
  />
));
DropdownMenuRadioGroup.displayName = 'DropdownMenu.RadioGroup';

type DropdownMenuRadioItemElement = React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>;
type DropdownMenuRadioItemOwnProps = GetPropDefTypes<typeof dropdownMenuRadioItemPropDefs>;
interface DropdownMenuRadioItemProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.RadioItem, RemovedProps>,
    DropdownMenuRadioItemOwnProps {}
const DropdownMenuRadioItem = React.forwardRef<
  DropdownMenuRadioItemElement,
  DropdownMenuRadioItemProps
>((props, forwardedRef) => {
  const {
    children,
    className,
    color = dropdownMenuRadioItemPropDefs.color.default,
    ...itemProps
  } = props;
  if (!React.useContext(DrillDownLevelContext)) return null;
  return (
    <DropdownMenuPrimitive.RadioItem
      {...itemProps}
      asChild={false}
      ref={forwardedRef}
      data-accent-color={color}
      className={classNames(
        'rt-BaseMenuItem',
        'rt-BaseMenuRadioItem',
        'rt-DropdownMenuItem',
        'rt-DropdownMenuRadioItem',
        className,
      )}
    >
      {children}
      <DropdownMenuPrimitive.ItemIndicator className="rt-BaseMenuItemIndicator rt-DropdownMenuItemIndicator">
        <ThickDotIcon className="rt-BaseMenuItemIndicatorIcon rt-DropdownMenuItemIndicatorIcon" />
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.RadioItem>
  );
});
DropdownMenuRadioItem.displayName = 'DropdownMenu.RadioItem';

type DropdownMenuCheckboxItemElement = React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>;
type DropdownMenuCheckboxItemOwnProps = GetPropDefTypes<typeof dropdownMenuCheckboxItemPropDefs>;
interface DropdownMenuCheckboxItemProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.CheckboxItem, RemovedProps>,
    DropdownMenuCheckboxItemOwnProps {}
const DropdownMenuCheckboxItem = React.forwardRef<
  DropdownMenuCheckboxItemElement,
  DropdownMenuCheckboxItemProps
>((props, forwardedRef) => {
  const {
    children,
    className,
    shortcut,
    color = dropdownMenuCheckboxItemPropDefs.color.default,
    ...itemProps
  } = props;
  if (!React.useContext(DrillDownLevelContext)) return null;
  return (
    <DropdownMenuPrimitive.CheckboxItem
      aria-keyshortcuts={shortcut ? toAriaKeyShortcuts(shortcut) : undefined}
      {...itemProps}
      asChild={false}
      ref={forwardedRef}
      data-accent-color={color}
      className={classNames(
        'rt-BaseMenuItem',
        'rt-BaseMenuCheckboxItem',
        'rt-DropdownMenuItem',
        'rt-DropdownMenuCheckboxItem',
        className,
      )}
    >
      {children}
      <DropdownMenuPrimitive.ItemIndicator className="rt-BaseMenuItemIndicator rt-DropdownMenuItemIndicator">
        <ThickCheckIcon className="rt-BaseMenuItemIndicatorIcon rt-DropdownMenuItemIndicatorIcon" />
      </DropdownMenuPrimitive.ItemIndicator>
      {shortcut && <MenuShortcut shortcut={shortcut} className="rt-DropdownMenuShortcut" />}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});
DropdownMenuCheckboxItem.displayName = 'DropdownMenu.CheckboxItem';

interface DropdownMenuSubProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Sub> {
  /**
   * Label displayed in the back button when using drill-down mode.
   * If not provided, defaults to "Back".
   */
  label?: React.ReactNode;
}
const DropdownMenuSub: React.FC<DropdownMenuSubProps> = ({
  label = 'Back',
  open,
  defaultOpen,
  onOpenChange,
  children,
}) => {
  const drillDownStore = useDrillDownStore();
  const id = React.useId();
  const subContextValue = React.useMemo(() => ({ id, label }), [id, label]);
  const isOpenInDrillDown = usePanelPosition(drillDownStore, id) !== 'closed';

  // Drill-down: `open` and `defaultOpen` drive the stack; the stack drives
  // `onOpenChange`. A controlled `open` is applied when it changes.
  React.useLayoutEffect(() => {
    if (!drillDownStore || open === undefined) return;
    if (open && !drillDownStore.isOpen(id)) drillDownStore.push(id, null);
    else if (!open && drillDownStore.isOpen(id)) drillDownStore.close(id);
  }, [drillDownStore, open, id]);

  const defaultOpenRef = React.useRef(defaultOpen);
  React.useLayoutEffect(() => {
    if (drillDownStore && defaultOpenRef.current && open === undefined) drillDownStore.push(id, null);
    // Only on mount, like an uncontrolled default.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenChange = useCallbackRef(onOpenChange);
  const wasOpenRef = React.useRef(isOpenInDrillDown);
  React.useEffect(() => {
    if (!drillDownStore || wasOpenRef.current === isOpenInDrillDown) return;
    wasOpenRef.current = isOpenInDrillDown;
    handleOpenChange(isOpenInDrillDown);
  }, [drillDownStore, isOpenInDrillDown, handleOpenChange]);

  // Radix Sub stays mounted in both behaviors so switching behavior does not
  // remount the subtree. It only renders context; in drill-down its trigger
  // and content are never rendered, so it reports no open changes of its own.
  return (
    <SubContext.Provider value={subContextValue}>
      <DropdownMenuPrimitive.Sub
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={drillDownStore ? undefined : onOpenChange}
      >
        {children}
      </DropdownMenuPrimitive.Sub>
    </SubContext.Provider>
  );
};
DropdownMenuSub.displayName = 'DropdownMenu.Sub';

type DropdownMenuSubTriggerElement = React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>;
interface DropdownMenuSubTriggerProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.SubTrigger, RemovedProps> {}
const DropdownMenuSubTrigger = React.forwardRef<
  DropdownMenuSubTriggerElement,
  DropdownMenuSubTriggerProps
>((props, forwardedRef) => {
  const { className, children, onKeyDown, ...subTriggerProps } = props;
  const drillDownStore = useDrillDownStore();
  const subContext = useSubContext();
  const isLevelVisible = React.useContext(DrillDownLevelContext);

  if (drillDownStore && subContext) {
    if (!isLevelVisible) return null;

    const handleSelect = (event: Event) => {
      // Navigating does not close the menu.
      event.preventDefault();
      drillDownStore.push(subContext.id);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || subTriggerProps.disabled) return;
      if (event.key === FORWARD_KEYS[getDirection(event.currentTarget)]) {
        event.preventDefault();
        drillDownStore.push(subContext.id, 'keyboard');
      }
    };

    return (
      <DropdownMenuPrimitive.Item
        aria-haspopup="menu"
        {...subTriggerProps}
        data-drill-down-trigger={subContext.id}
        data-drill-down-name={subTriggerProps.textValue}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        ref={forwardedRef}
        className={classNames(
          'rt-reset',
          'rt-BaseMenuItem',
          'rt-BaseMenuSubTrigger',
          'rt-DropdownMenuItem',
          'rt-DropdownMenuSubTrigger',
          'rt-DropdownMenuDrillDownSubTrigger',
          className,
        )}
      >
        {children}
        <div className="rt-BaseMenuShortcut rt-DropdownMenuShortcut">
          <ThickChevronRightIcon className="rt-BaseMenuSubTriggerIcon rt-DropdownMenuSubTriggerIcon" />
        </div>
      </DropdownMenuPrimitive.Item>
    );
  }

  return (
    <DropdownMenuPrimitive.SubTrigger
      {...subTriggerProps}
      onKeyDown={onKeyDown}
      asChild={false}
      ref={forwardedRef}
      className={classNames(
        'rt-BaseMenuItem',
        'rt-BaseMenuSubTrigger',
        'rt-DropdownMenuItem',
        'rt-DropdownMenuSubTrigger',
        className,
      )}
    >
      {children}
      <div className="rt-BaseMenuShortcut rt-DropdownMenuShortcut">
        <ThickChevronRightIcon className="rt-BaseMenuSubTriggerIcon rt-DropdownMenuSubTriggerIcon" />
      </div>
    </DropdownMenuPrimitive.SubTrigger>
  );
});
DropdownMenuSubTrigger.displayName = 'DropdownMenu.SubTrigger';

type DropdownMenuSeparatorElement = React.ElementRef<typeof DropdownMenuPrimitive.Separator>;
interface DropdownMenuSeparatorProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.Separator, RemovedProps> {}
const DropdownMenuSeparator = React.forwardRef<
  DropdownMenuSeparatorElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, forwardedRef) => {
  if (!React.useContext(DrillDownLevelContext)) return null;
  return (
    <DropdownMenuPrimitive.Separator
      {...props}
      asChild={false}
      ref={forwardedRef}
      className={classNames('rt-BaseMenuSeparator', 'rt-DropdownMenuSeparator', className)}
    />
  );
});
DropdownMenuSeparator.displayName = 'DropdownMenu.Separator';

/** The row at the top of a drill-down panel that returns to the parent level. */
function DrillDownBackItem({ label, name }: { label: React.ReactNode; name: string }) {
  const drillDownStore = useDrillDownStore();

  const handleSelect = React.useCallback(
    (event: Event) => {
      // Navigating does not close the menu.
      event.preventDefault();
      drillDownStore?.pop();
    },
    [drillDownStore],
  );

  // The visible label is often the submenu title, so the accessible name says
  // what the row does while still containing the visible text.
  const labelText = typeof label === 'string' ? label : name;
  const ariaLabel = labelText && labelText !== 'Back' ? `Back from ${labelText}` : undefined;

  return (
    <DropdownMenuPrimitive.Item
      aria-label={ariaLabel}
      textValue={labelText || 'Back'}
      onSelect={handleSelect}
      className={classNames(
        'rt-reset',
        'rt-BaseMenuItem',
        'rt-DropdownMenuItem',
        'rt-DropdownMenuDrillDownBackItem',
      )}
    >
      <ThickChevronLeftIcon className="rt-BaseMenuSubTriggerIcon rt-DropdownMenuDrillDownBackIcon" />
      <span className="rt-DropdownMenuDrillDownBackLabel">{label}</span>
    </DropdownMenuPrimitive.Item>
  );
}

/** Radix positioning and layer props that have no meaning for an inline drill-down panel. */
type PopperOnlyProps =
  | 'loop'
  | 'onEscapeKeyDown'
  | 'onPointerDownOutside'
  | 'onFocusOutside'
  | 'onInteractOutside'
  | 'sideOffset'
  | 'alignOffset'
  | 'avoidCollisions'
  | 'collisionBoundary'
  | 'collisionPadding'
  | 'arrowPadding'
  | 'sticky'
  | 'hideWhenDetached'
  | 'updatePositionStrategy';

function omitPopperProps<T extends Record<string, unknown>>(props: T): Omit<T, PopperOnlyProps> {
  const {
    loop: _loop,
    onEscapeKeyDown: _onEscapeKeyDown,
    onPointerDownOutside: _onPointerDownOutside,
    onFocusOutside: _onFocusOutside,
    onInteractOutside: _onInteractOutside,
    sideOffset: _sideOffset,
    alignOffset: _alignOffset,
    avoidCollisions: _avoidCollisions,
    collisionBoundary: _collisionBoundary,
    collisionPadding: _collisionPadding,
    arrowPadding: _arrowPadding,
    sticky: _sticky,
    hideWhenDetached: _hideWhenDetached,
    updatePositionStrategy: _updatePositionStrategy,
    ...rest
  } = props;
  return rest;
}

type DropdownMenuSubContentElement = React.ElementRef<typeof DropdownMenuPrimitive.SubContent>;
interface DropdownMenuSubContentProps
  extends ComponentPropsWithout<typeof DropdownMenuPrimitive.SubContent, RemovedProps>,
    DropdownMenuSurfaceProps {
  container?: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Portal>['container'];
  /**
   * When true, skips the ScrollArea wrapper so a VirtualMenu can handle its own
   * scrolling. Applies to cascade submenus; a drill-down panel scrolls with the
   * root content.
   */
  virtualized?: boolean;
}
const DropdownMenuSubContent = React.forwardRef<
  DropdownMenuSubContentElement,
  DropdownMenuSubContentProps
>((props, forwardedRef) => {
  const drillDownStore = useDrillDownStore();
  const subContext = useSubContext();

  if (drillDownStore && subContext) {
    return (
      <DrillDownPanel {...props} ref={forwardedRef} store={drillDownStore} sub={subContext} />
    );
  }
  return <CascadeSubContent {...props} ref={forwardedRef} />;
});
DropdownMenuSubContent.displayName = 'DropdownMenu.SubContent';

const CascadeSubContent = React.forwardRef<DropdownMenuSubContentElement, DropdownMenuSubContentProps>(
  (props, forwardedRef) => {
    const parent = React.useContext(DropdownMenuContentContext);
    const themeContext = useThemeContext();

    useDeprecatedPanelBackgroundWarning(props.panelBackground);

    // A submenu inherits the parent surface, and its own props win.
    const size = props.size ?? parent.size;
    const variant = props.variant ?? parent.variant;
    const color = props.color ?? parent.color;
    const material =
      props.material ?? props.panelBackground ?? parent.material ?? resolveMenuMaterial(undefined, undefined, themeContext);

    const {
      className,
      children,
      container,
      forceMount,
      color: _color,
      material: _material,
      panelBackground: _panelBackground,
      virtualized = false,
      ...subContentProps
    } = extractProps({ ...props, size, variant }, dropdownMenuSubContentPropDefs);

    const scalarSize = useResolvedResponsiveValue(size, dropdownMenuSubContentPropDefs.size.default);

    const contextValue = React.useMemo(
      () => ({ size, variant, color, material }),
      [size, variant, color, material],
    );

    const body = (
      <MenuProvider size={size}>
        <DropdownMenuContentContext.Provider value={contextValue}>{children}</DropdownMenuContentContext.Provider>
      </MenuProvider>
    );

    return (
      <DropdownMenuPrimitive.Portal container={container} forceMount={forceMount}>
        <Theme asChild>
          <DropdownMenuPrimitive.SubContent
            data-accent-color={color}
            data-material={material}
            data-panel-background={material}
            alignOffset={getMenuAlignOffset(scalarSize, themeContext.scaling)}
            // Side offset accounts for the outer solid box-shadow
            sideOffset={1}
            collisionPadding={10}
            {...subContentProps}
            asChild={false}
            ref={forwardedRef}
            className={classNames(
              'rt-PopperContent',
              'rt-BaseMenuContent',
              'rt-BaseMenuSubContent',
              'rt-DropdownMenuContent',
              'rt-DropdownMenuSubContent',
              className,
            )}
          >
            {virtualized ? (
              <div className={classNames('rt-BaseMenuViewport', 'rt-DropdownMenuViewport', 'rt-virtualized')}>
                {body}
              </div>
            ) : (
              <ScrollArea type="auto" scrollbars="vertical">
                <div className={classNames('rt-BaseMenuViewport', 'rt-DropdownMenuViewport')}>{body}</div>
              </ScrollArea>
            )}
          </DropdownMenuPrimitive.SubContent>
        </Theme>
      </DropdownMenuPrimitive.Portal>
    );
  },
);
CascadeSubContent.displayName = 'DropdownMenu.CascadeSubContent';

interface DrillDownPanelProps extends DropdownMenuSubContentProps {
  store: NonNullable<ReturnType<typeof useDrillDownStore>>;
  sub: NonNullable<ReturnType<typeof useSubContext>>;
}

/**
 * A submenu rendered inline in drill-down mode. It mounts its children only
 * while it is on the navigation stack, and shows its own items only while it
 * is the top level; deeper panels inside it stay mounted.
 */
const DrillDownPanel = React.forwardRef<DropdownMenuSubContentElement, DrillDownPanelProps>(
  ({ store, sub, ...props }, forwardedRef) => {
    const position = usePanelPosition(store, sub.id);
    const entry = useStackEntry(store, sub.id);
    const direction = useDrillDownDirection(position === 'top' ? store : null);

    if (position === 'closed') return null;

    const {
      className,
      children,
      container: _container,
      forceMount: _forceMount,
      virtualized: _virtualized,
      size: _size,
      variant: _variant,
      color: _color,
      material: _material,
      panelBackground: _panelBackground,
      ...panelProps
    } = omitPopperProps(props);

    const isTop = position === 'top';
    const name = entry?.name || (typeof sub.label === 'string' ? sub.label : '');

    return (
      <div
        role="group"
        aria-label={name || undefined}
        {...panelProps}
        ref={forwardedRef}
        data-drill-down-panel={sub.id}
        data-drill-down-active={isTop ? true : undefined}
        data-animation-direction={isTop ? (direction ?? undefined) : undefined}
        className={classNames('rt-DropdownMenuDrillDownPanel', className)}
      >
        {isTop && (
          <>
            <DrillDownBackItem label={sub.label} name={name} />
            <DropdownMenuPrimitive.Separator className="rt-BaseMenuSeparator rt-DropdownMenuSeparator" />
          </>
        )}
        <DrillDownLevelContext.Provider value={isTop}>{children}</DrillDownLevelContext.Provider>
      </div>
    );
  },
);
DrillDownPanel.displayName = 'DropdownMenu.DrillDownPanel';

type DropdownMenuTriggerIconElement = React.ElementRef<'svg'>;
interface DropdownMenuTriggerIconProps extends IconProps {}
const DropdownMenuTriggerIcon = React.forwardRef<
  DropdownMenuTriggerIconElement,
  DropdownMenuTriggerIconProps
>(({ className, ...props }, forwardedRef) => (
  <ChevronDownIcon
    {...props}
    ref={forwardedRef}
    className={classNames('rt-DropdownMenuTriggerIcon', className)}
  />
));
DropdownMenuTriggerIcon.displayName = 'DropdownMenu.TriggerIcon';

export {
  DropdownMenuRoot as Root,
  DropdownMenuTrigger as Trigger,
  DropdownMenuTriggerIcon as TriggerIcon,
  DropdownMenuContent as Content,
  DropdownMenuLabel as Label,
  DropdownMenuItem as Item,
  DropdownMenuGroup as Group,
  DropdownMenuRadioGroup as RadioGroup,
  DropdownMenuRadioItem as RadioItem,
  DropdownMenuCheckboxItem as CheckboxItem,
  DropdownMenuSub as Sub,
  DropdownMenuSubTrigger as SubTrigger,
  DropdownMenuSubContent as SubContent,
  DropdownMenuSeparator as Separator,
};

export type {
  DropdownMenuRootProps as RootProps,
  DropdownMenuTriggerProps as TriggerProps,
  DropdownMenuTriggerIconProps as TriggerIconProps,
  DropdownMenuContentProps as ContentProps,
  DropdownMenuLabelProps as LabelProps,
  DropdownMenuItemProps as ItemProps,
  DropdownMenuGroupProps as GroupProps,
  DropdownMenuRadioGroupProps as RadioGroupProps,
  DropdownMenuRadioItemProps as RadioItemProps,
  DropdownMenuCheckboxItemProps as CheckboxItemProps,
  DropdownMenuSubProps as SubProps,
  DropdownMenuSubTriggerProps as SubTriggerProps,
  DropdownMenuSubContentProps as SubContentProps,
  DropdownMenuSeparatorProps as SeparatorProps,
  SubmenuBehavior,
};
