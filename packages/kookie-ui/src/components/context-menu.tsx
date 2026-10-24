/**
 * Context Menu component that provides right-click menu functionality.
 * Requires client-side rendering due to event handling and portal usage.
 */
'use client';

import * as React from 'react';
import { VirtualMenu } from './virtual-menu.js';
import classNames from 'classnames';
import { ContextMenu as ContextMenuPrimitive, Slot } from 'radix-ui';
import { useCallbackRef } from 'radix-ui/internal';

import { ScrollArea } from './scroll-area.js';
import {
  contextMenuContentPropDefs,
  contextMenuSubContentPropDefs,
  contextMenuItemPropDefs,
  contextMenuCheckboxItemPropDefs,
  contextMenuRadioItemPropDefs,
} from './context-menu.props.js';
import { Theme, useThemeContext } from './theme.js';
import { ThickCheckIcon, ThickChevronRightIcon, ThickDotIcon } from './icons.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';
import { requireReactElement } from '../helpers/require-react-element.js';
import {
  MenuCloseProvider,
  MenuGroupLabelProvider,
  MenuProvider,
  useMenuGroupLabelId,
  useMenuGroupLabelledBy,
} from './_internal/menu-context.js';
import {
  MenuShortcut,
  getMenuAlignOffset,
  toAriaKeyShortcuts,
  useResolvedResponsiveValue,
} from './_internal/base-menu.utils.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes, Responsive } from '../props/prop-def.js';

interface ContextMenuRootProps
  extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root> {}
const ContextMenuRoot: React.FC<ContextMenuRootProps> = (props) => {
  const { open: openProp, onOpenChange } = props;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = openProp ?? uncontrolledOpen;

  const handleOpenChangeProp = useCallbackRef(onOpenChange);
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setUncontrolledOpen(next);
      handleOpenChangeProp(next);
    },
    [handleOpenChangeProp],
  );
  const close = React.useCallback(() => handleOpenChange(false), [handleOpenChange]);

  return (
    <MenuCloseProvider value={close}>
      <ContextMenuPrimitive.Root {...props} open={open} onOpenChange={handleOpenChange} />
    </MenuCloseProvider>
  );
};
ContextMenuRoot.displayName = 'ContextMenu.Root';

type ContextMenuTriggerElement = React.ElementRef<typeof ContextMenuPrimitive.Trigger>;
interface ContextMenuTriggerProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.Trigger, RemovedProps> {}
const ContextMenuTrigger = React.forwardRef<ContextMenuTriggerElement, ContextMenuTriggerProps>(
  ({ children, ...props }, forwardedRef) => (
    <ContextMenuPrimitive.Trigger {...props} ref={forwardedRef} asChild>
      {requireReactElement(children)}
    </ContextMenuPrimitive.Trigger>
  ),
);
ContextMenuTrigger.displayName = 'ContextMenu.Trigger';

/** Visual props shared by Content and SubContent. */
type ContextMenuSurfaceProps = GetPropDefTypes<typeof contextMenuContentPropDefs>;

type ContextMenuContentContextValue = {
  size?: ContextMenuSurfaceProps['size'];
  color?: ContextMenuSurfaceProps['color'];
};
const ContextMenuContentContext = React.createContext<ContextMenuContentContextValue>({});
type ContextMenuContentElement = React.ElementRef<typeof ContextMenuPrimitive.Content>;
interface ContextMenuContentProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.Content, RemovedProps>,
    ContextMenuSurfaceProps {
  container?: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Portal>['container'];
  /**
   * When true, skips the ScrollArea wrapper to allow VirtualMenu to handle its own scrolling.
   * Use this when rendering virtualized lists inside the context menu.
   */
  virtualized?: boolean;
  /**
   * @deprecated Has no effect. ContextMenu submenus always cascade.
   */
  submenuBehavior?: Responsive<'cascade' | 'drill-down'>;
}
const ContextMenuContent = React.forwardRef<ContextMenuContentElement, ContextMenuContentProps>(
  (ownProps, forwardedRef) => {
    const props = useThemeSizeProps(ownProps, contextMenuContentPropDefs.size);
    const themeContext = useThemeContext();
    const {
      size = contextMenuContentPropDefs.size.default,
    } = props;
    const {
      className,
      children,
      color,
      container,
      forceMount,
      submenuBehavior: _submenuBehavior,
      virtualized = false,
      ...contentProps
    } = extractProps(props, contextMenuContentPropDefs);

    const resolvedColor = color || themeContext.accentColor;
    const scalarSize = useResolvedResponsiveValue(size, contextMenuContentPropDefs.size.default);

    const contextValue = React.useMemo(
      () => ({ size, color: resolvedColor }),
      [size, resolvedColor],
    );

    const body = (
      <MenuProvider size={size}>
        <ContextMenuContentContext.Provider value={contextValue}>{children}</ContextMenuContentContext.Provider>
      </MenuProvider>
    );

    return (
      <ContextMenuPrimitive.Portal container={container} forceMount={forceMount}>
        <Theme asChild>
          <ContextMenuPrimitive.Content
            data-accent-color={resolvedColor}
            alignOffset={getMenuAlignOffset(scalarSize)}
            collisionPadding={10}
            {...contentProps}
            asChild={false}
            ref={forwardedRef}
            className={classNames(
              'kui-PopperContent',
              'kui-BaseMenuContent',
          'kui-variant-soft',
              'kui-ContextMenuContent',
              className,
            )}
          >
            {virtualized ? (
              <div className={classNames('kui-BaseMenuViewport', 'kui-ContextMenuViewport', 'kui-virtualized')}>
                {body}
              </div>
            ) : (
              <ScrollArea type="auto" scrollbars="vertical">
                <div className={classNames('kui-BaseMenuViewport', 'kui-ContextMenuViewport')}>{body}</div>
              </ScrollArea>
            )}
          </ContextMenuPrimitive.Content>
        </Theme>
      </ContextMenuPrimitive.Portal>
    );
  },
);
ContextMenuContent.displayName = 'ContextMenu.Content';

type ContextMenuLabelElement = React.ElementRef<typeof ContextMenuPrimitive.Label>;
interface ContextMenuLabelProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.Label, RemovedProps> {}
const ContextMenuLabel = React.forwardRef<ContextMenuLabelElement, ContextMenuLabelProps>(
  ({ className, id: idProp, ...props }, forwardedRef) => {
    const id = useMenuGroupLabelId(idProp);
    return (
      <ContextMenuPrimitive.Label
        {...props}
        id={id}
        asChild={false}
        ref={forwardedRef}
        className={classNames('kui-BaseMenuLabel', 'kui-ContextMenuLabel', className)}
      />
    );
  },
);
ContextMenuLabel.displayName = 'ContextMenu.Label';

type ContextMenuItemElement = React.ElementRef<typeof ContextMenuPrimitive.Item>;
type ContextMenuItemOwnProps = GetPropDefTypes<typeof contextMenuItemPropDefs>;
interface ContextMenuItemProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.Item, RemovedProps>,
    ContextMenuItemOwnProps {}
const ContextMenuItem = React.forwardRef<ContextMenuItemElement, ContextMenuItemProps>(
  (props, forwardedRef) => {
    const {
      className,
      children,
      color = contextMenuItemPropDefs.color.default,
      shortcut,
      ...itemProps
    } = props;
    return (
      <ContextMenuPrimitive.Item
        data-accent-color={color}
        aria-keyshortcuts={shortcut ? toAriaKeyShortcuts(shortcut) : undefined}
        {...itemProps}
        ref={forwardedRef}
        className={classNames('kui-reset', 'kui-BaseMenuItem', 'kui-ContextMenuItem', className)}
      >
        <Slot.Slottable>{children}</Slot.Slottable>
        {shortcut && <MenuShortcut shortcut={shortcut} className="kui-ContextMenuShortcut" />}
      </ContextMenuPrimitive.Item>
    );
  },
);
ContextMenuItem.displayName = 'ContextMenu.Item';

type ContextMenuGroupElement = React.ElementRef<typeof ContextMenuPrimitive.Group>;
interface ContextMenuGroupProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.Group, RemovedProps> {}
const ContextMenuGroup = React.forwardRef<ContextMenuGroupElement, ContextMenuGroupProps>(
  ({ className, 'aria-labelledby': ariaLabelledBy, ...props }, forwardedRef) => {
    const [labelledBy, setLabelId] = useMenuGroupLabelledBy(ariaLabelledBy);
    return (
      <MenuGroupLabelProvider value={setLabelId}>
        <ContextMenuPrimitive.Group
          aria-labelledby={labelledBy}
          {...props}
          asChild={false}
          ref={forwardedRef}
          className={classNames('kui-BaseMenuGroup', 'kui-ContextMenuGroup', className)}
        />
      </MenuGroupLabelProvider>
    );
  },
);
ContextMenuGroup.displayName = 'ContextMenu.Group';

type ContextMenuRadioGroupElement = React.ElementRef<typeof ContextMenuPrimitive.RadioGroup>;
interface ContextMenuRadioGroupProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.RadioGroup, RemovedProps> {}
const ContextMenuRadioGroup = React.forwardRef<
  ContextMenuRadioGroupElement,
  ContextMenuRadioGroupProps
>(({ className, 'aria-labelledby': ariaLabelledBy, ...props }, forwardedRef) => {
  const [labelledBy, setLabelId] = useMenuGroupLabelledBy(ariaLabelledBy);
  return (
    <MenuGroupLabelProvider value={setLabelId}>
      <ContextMenuPrimitive.RadioGroup
        aria-labelledby={labelledBy}
        {...props}
        asChild={false}
        ref={forwardedRef}
        className={classNames('kui-BaseMenuRadioGroup', 'kui-ContextMenuRadioGroup', className)}
      />
    </MenuGroupLabelProvider>
  );
});
ContextMenuRadioGroup.displayName = 'ContextMenu.RadioGroup';

type ContextMenuRadioItemElement = React.ElementRef<typeof ContextMenuPrimitive.RadioItem>;
type ContextMenuRadioItemOwnProps = GetPropDefTypes<typeof contextMenuRadioItemPropDefs>;
interface ContextMenuRadioItemProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.RadioItem, RemovedProps>,
    ContextMenuRadioItemOwnProps {}
const ContextMenuRadioItem = React.forwardRef<
  ContextMenuRadioItemElement,
  ContextMenuRadioItemProps
>((props, forwardedRef) => {
  const {
    children,
    className,
    color = contextMenuRadioItemPropDefs.color.default,
    ...itemProps
  } = props;
  return (
    <ContextMenuPrimitive.RadioItem
      {...itemProps}
      asChild={false}
      ref={forwardedRef}
      data-accent-color={color}
      className={classNames(
        'kui-BaseMenuItem',
        'kui-BaseMenuRadioItem',
        'kui-ContextMenuItem',
        'kui-ContextMenuRadioItem',
        className,
      )}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      <ContextMenuPrimitive.ItemIndicator className="kui-BaseMenuItemIndicator kui-ContextMenuItemIndicator">
        <ThickDotIcon className="kui-BaseMenuItemIndicatorIcon kui-ContextMenuItemIndicatorIcon" />
      </ContextMenuPrimitive.ItemIndicator>
    </ContextMenuPrimitive.RadioItem>
  );
});
ContextMenuRadioItem.displayName = 'ContextMenu.RadioItem';

type ContextMenuCheckboxItemElement = React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>;
type ContextMenuCheckboxItemOwnProps = GetPropDefTypes<typeof contextMenuCheckboxItemPropDefs>;
interface ContextMenuCheckboxItemProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.CheckboxItem, RemovedProps>,
    ContextMenuCheckboxItemOwnProps {}
const ContextMenuCheckboxItem = React.forwardRef<
  ContextMenuCheckboxItemElement,
  ContextMenuCheckboxItemProps
>((props, forwardedRef) => {
  const {
    children,
    className,
    shortcut,
    color = contextMenuCheckboxItemPropDefs.color.default,
    ...itemProps
  } = props;
  return (
    <ContextMenuPrimitive.CheckboxItem
      aria-keyshortcuts={shortcut ? toAriaKeyShortcuts(shortcut) : undefined}
      {...itemProps}
      asChild={false}
      ref={forwardedRef}
      data-accent-color={color}
      className={classNames(
        'kui-BaseMenuItem',
        'kui-BaseMenuCheckboxItem',
        'kui-ContextMenuItem',
        'kui-ContextMenuCheckboxItem',
        className,
      )}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      <ContextMenuPrimitive.ItemIndicator className="kui-BaseMenuItemIndicator kui-ContextMenuItemIndicator">
        <ThickCheckIcon className="kui-BaseMenuItemIndicatorIcon kui-ContextMenuItemIndicatorIcon" />
      </ContextMenuPrimitive.ItemIndicator>
      {shortcut && <MenuShortcut shortcut={shortcut} className="kui-ContextMenuShortcut" />}
    </ContextMenuPrimitive.CheckboxItem>
  );
});
ContextMenuCheckboxItem.displayName = 'ContextMenu.CheckboxItem';

interface ContextMenuSubProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.Sub, RemovedProps> {}
const ContextMenuSub: React.FC<ContextMenuSubProps> = (props) => (
  <ContextMenuPrimitive.Sub {...props} />
);
ContextMenuSub.displayName = 'ContextMenu.Sub';

type ContextMenuSubTriggerElement = React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>;
interface ContextMenuSubTriggerProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.SubTrigger, RemovedProps> {}
const ContextMenuSubTrigger = React.forwardRef<
  ContextMenuSubTriggerElement,
  ContextMenuSubTriggerProps
>((props, forwardedRef) => {
  const { className, children, ...subTriggerProps } = props;
  return (
    <ContextMenuPrimitive.SubTrigger
      {...subTriggerProps}
      asChild={false}
      ref={forwardedRef}
      className={classNames(
        'kui-BaseMenuItem',
        'kui-BaseMenuSubTrigger',
        'kui-ContextMenuItem',
        'kui-ContextMenuSubTrigger',
        className,
      )}
    >
      {children}
      <div className="kui-BaseMenuShortcut kui-ContextMenuShortcut">
        <ThickChevronRightIcon className="kui-BaseMenuSubTriggerIcon kui-ContextMenuSubTriggerIcon" />
      </div>
    </ContextMenuPrimitive.SubTrigger>
  );
});
ContextMenuSubTrigger.displayName = 'ContextMenu.SubTrigger';

type ContextMenuSubContentElement = React.ElementRef<typeof ContextMenuPrimitive.SubContent>;
interface ContextMenuSubContentProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.SubContent, RemovedProps>,
    ContextMenuSurfaceProps {
  container?: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Portal>['container'];
  /**
   * When true, skips the ScrollArea wrapper to allow VirtualMenu to handle its own scrolling.
   */
  virtualized?: boolean;
}
const ContextMenuSubContent = React.forwardRef<
  ContextMenuSubContentElement,
  ContextMenuSubContentProps
>((props, forwardedRef) => {
  const parent = React.useContext(ContextMenuContentContext);

  // A submenu inherits the parent surface, and its own props win.
  const size = props.size ?? parent.size;
  const color = props.color ?? parent.color;

  const {
    className,
    children,
    container,
    forceMount,
    color: _color,
    virtualized = false,
    ...subContentProps
  } = extractProps({ ...props, size }, contextMenuSubContentPropDefs);

  const scalarSize = useResolvedResponsiveValue(size, contextMenuSubContentPropDefs.size.default);

  const contextValue = React.useMemo(
    () => ({ size, color }),
    [size, color],
  );

  const body = (
    <MenuProvider size={size}>
      <ContextMenuContentContext.Provider value={contextValue}>{children}</ContextMenuContentContext.Provider>
    </MenuProvider>
  );

  return (
    <ContextMenuPrimitive.Portal container={container} forceMount={forceMount}>
      <Theme asChild>
        <ContextMenuPrimitive.SubContent
          data-accent-color={color}
          alignOffset={getMenuAlignOffset(scalarSize)}
          // Side offset accounts for the outer solid box-shadow
          sideOffset={1}
          collisionPadding={10}
          {...subContentProps}
          asChild={false}
          ref={forwardedRef}
          className={classNames(
            'kui-PopperContent',
            'kui-BaseMenuContent',
          'kui-variant-soft',
            'kui-BaseMenuSubContent',
            'kui-ContextMenuContent',
            'kui-ContextMenuSubContent',
            className,
          )}
        >
          {virtualized ? (
            <div className={classNames('kui-BaseMenuViewport', 'kui-ContextMenuViewport', 'kui-virtualized')}>
              {body}
            </div>
          ) : (
            <ScrollArea type="auto" scrollbars="vertical">
              <div className={classNames('kui-BaseMenuViewport', 'kui-ContextMenuViewport')}>{body}</div>
            </ScrollArea>
          )}
        </ContextMenuPrimitive.SubContent>
      </Theme>
    </ContextMenuPrimitive.Portal>
  );
});
ContextMenuSubContent.displayName = 'ContextMenu.SubContent';

type ContextMenuSeparatorElement = React.ElementRef<typeof ContextMenuPrimitive.Separator>;
interface ContextMenuSeparatorProps
  extends ComponentPropsWithout<typeof ContextMenuPrimitive.Separator, RemovedProps> {}
const ContextMenuSeparator = React.forwardRef<
  ContextMenuSeparatorElement,
  ContextMenuSeparatorProps
>(({ className, ...props }, forwardedRef) => (
  <ContextMenuPrimitive.Separator
    {...props}
    asChild={false}
    ref={forwardedRef}
    className={classNames('kui-BaseMenuSeparator', 'kui-ContextMenuSeparator', className)}
  />
));
ContextMenuSeparator.displayName = 'ContextMenu.Separator';

export {
  ContextMenuRoot as Root,
  ContextMenuTrigger as Trigger,
  ContextMenuContent as Content,
  ContextMenuLabel as Label,
  ContextMenuItem as Item,
  ContextMenuGroup as Group,
  ContextMenuRadioGroup as RadioGroup,
  ContextMenuRadioItem as RadioItem,
  ContextMenuCheckboxItem as CheckboxItem,
  ContextMenuSub as Sub,
  ContextMenuSubTrigger as SubTrigger,
  ContextMenuSubContent as SubContent,
  ContextMenuSeparator as Separator,
  VirtualMenu as Virtual,
};

export type {
  ContextMenuRootProps as RootProps,
  ContextMenuTriggerProps as TriggerProps,
  ContextMenuContentProps as ContentProps,
  ContextMenuLabelProps as LabelProps,
  ContextMenuItemProps as ItemProps,
  ContextMenuGroupProps as GroupProps,
  ContextMenuRadioGroupProps as RadioGroupProps,
  ContextMenuRadioItemProps as RadioItemProps,
  ContextMenuCheckboxItemProps as CheckboxItemProps,
  ContextMenuSubProps as SubProps,
  ContextMenuSubTriggerProps as SubTriggerProps,
  ContextMenuSubContentProps as SubContentProps,
  ContextMenuSeparatorProps as SeparatorProps,
};
