'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Select as SelectPrimitive, ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { useComposedRefs, useLayoutEffect } from 'radix-ui/internal';

import { extractProps } from '../helpers/extract-props.js';
import { useThemeSize } from '../hooks/theme-size.js';
import { ChevronDownIcon, ThickCheckIcon } from './icons.js';
import { Spinner } from './spinner.js';
import {
  selectRootPropDefs,
  selectTriggerPropDefs,
  selectContentPropDefs,
} from './select.props.js';
import { useThemeContext } from './theme.js';
import { PortalTheme } from './_internal/portal-theme.js';
import { useThumbSync } from '../hooks/use-thumb-sync.js';

import type { GetPropDefTypes } from '../props/prop-def.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';

type SelectRootOwnProps = GetPropDefTypes<typeof selectRootPropDefs>;

// Trigger and Content pass the size prop def as its own record. It is hoisted because
// extractProps caches its compiled prop defs on the identity of each record it is given:
// a literal written at the call site would be a new object, and a recompile, every render.
const selectSizePropDefs = { size: selectRootPropDefs.size };

// Keys that open the list from the trigger, as in Radix.
const OPEN_KEYS = [' ', 'Enter', 'ArrowUp', 'ArrowDown'];

interface SelectContextValue extends SelectRootOwnProps {
  /** Whether the list is open. Undefined when Content is rendered outside a Kookie Select.Root. */
  open?: boolean;
}
const SelectContext = React.createContext<SelectContextValue>({});

interface SelectRootProps extends SelectPrimitive.SelectProps, SelectRootOwnProps {}
const SelectRoot: React.FC<SelectRootProps> = (props) => {
  const {
    children,
    size: sizeProp,
    open: openProp,
    defaultOpen,
    onOpenChange,
    ...rootProps
  } = props;
  const size = useThemeSize(sizeProp, selectRootPropDefs.size);

  // Root owns the open state and hands Radix a controlled `open`, so Content learns of a
  // change in the same render Radix does. Radix's uncontrolled state reports changes from an
  // effect, a render late, which would mount the open list once without its wrappers.
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const open = openProp ?? uncontrolledOpen;
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  return (
    <SelectPrimitive.Root {...rootProps} open={open} onOpenChange={handleOpenChange}>
      <SelectContext.Provider value={React.useMemo(() => ({ size, open }), [size, open])}>
        {children}
      </SelectContext.Provider>
    </SelectPrimitive.Root>
  );
};
SelectRoot.displayName = 'Select.Root';

type SelectTriggerElement = React.ElementRef<typeof SelectPrimitive.Trigger>;
type SelectTriggerOwnProps = GetPropDefTypes<typeof selectTriggerPropDefs>;
interface SelectTriggerProps
  extends ComponentPropsWithout<typeof SelectPrimitive.Trigger, RemovedProps>,
    SelectTriggerOwnProps {}
const SelectTrigger = React.forwardRef<SelectTriggerElement, SelectTriggerProps>(
  (props, forwardedRef) => {
    const context = React.useContext(SelectContext);
    const {
      children,
      className,
      color,
      radius,
      placeholder,
      error,
      loading,
      disabled,
      readOnly,
      ...triggerProps
    } = extractProps(
      // Pass size value from the context to generate styles
      { size: context?.size, ...props },
      // Pass size prop def to allow it to be extracted
      selectSizePropDefs,
      selectTriggerPropDefs,
    );

    // The props win when set; otherwise a caller's own aria-* (a form library's aria-invalid)
    // stays, so both paths reach the accessibility tree and the CSS, as on TextField.
    const {
      'aria-invalid': ariaInvalid,
      'aria-busy': ariaBusy,
      'aria-disabled': ariaDisabled,
      'aria-readonly': ariaReadOnly,
    } = triggerProps;
    const isInvalid = Boolean(error) || ariaInvalid === true || ariaInvalid === 'true';
    const ariaProps = React.useMemo(
      () => ({
        'aria-invalid': isInvalid ? true : ariaInvalid,
        'aria-busy': loading || ariaBusy,
        'aria-disabled': disabled || ariaDisabled,
        'aria-readonly': readOnly || ariaReadOnly,
      }),
      [isInvalid, ariaInvalid, loading, ariaBusy, disabled, ariaDisabled, readOnly, ariaReadOnly],
    );

    // Read-only and loading triggers stay focusable but do not open or take typeahead,
    // as on Combobox. Radix skips its own handler when the event is default-prevented.
    const isBlocked = Boolean(readOnly || loading);
    const blockedHandlers = isBlocked
      ? {
          onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => event.preventDefault(),
          onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.currentTarget.focus();
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
            const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
            if (OPEN_KEYS.includes(event.key) || (!isModifierKey && event.key.length === 1)) {
              event.preventDefault();
            }
          },
        }
      : undefined;

    return (
      // `disabled` goes to Radix, which merges it with Root's and sets the native attribute.
      <SelectPrimitive.Trigger asChild disabled={disabled} {...blockedHandlers}>
        <button
          data-accent-color={color}
          data-radius={radius}
          data-error={error}
          data-loading={loading}
          {...triggerProps}
          {...ariaProps}
          ref={forwardedRef}
          className={classNames('kui-reset', 'kui-SelectTrigger', className)}
        >
          <span className="kui-SelectTriggerInner">
            <SelectPrimitive.Value placeholder={placeholder}>{children}</SelectPrimitive.Value>
          </span>
          <SelectPrimitive.Icon asChild>
            {loading ? (
              <span className="kui-SelectIcon kui-SelectLoadingIcon" aria-hidden="true">
                <Spinner />
              </span>
            ) : (
              <ChevronDownIcon className="kui-SelectIcon" />
            )}
          </SelectPrimitive.Icon>
        </button>
      </SelectPrimitive.Trigger>
    );
  },
);
SelectTrigger.displayName = 'Select.Trigger';

type SelectContentElement = React.ElementRef<typeof SelectPrimitive.Content>;
type SelectContentOwnProps = GetPropDefTypes<typeof selectContentPropDefs>;
interface SelectContentProps
  extends ComponentPropsWithout<typeof SelectPrimitive.Content, RemovedProps>,
    SelectContentOwnProps {
  container?: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Portal>['container'];
}
const SelectContent = React.forwardRef<SelectContentElement, SelectContentProps>(
  (props, forwardedRef) => {
    const context = React.useContext(SelectContext);
    const { className, children, color, container, ...contentProps } = extractProps(
      // Pass size value from the context to generate styles
      { size: context?.size, ...props },
      // Pass size prop def to allow it to be extracted
      selectSizePropDefs,
      selectContentPropDefs,
    );
    const themeContext = useThemeContext();

    // While closed, Radix still renders Content's children, into a detached fragment: the
    // items must exist for the trigger's value label, typeahead and the native form select.
    // Nothing in that fragment is ever shown, so the theme wrapper and the scroll area, with
    // its two resize observers, are left out until the list opens.
    if (context.open === false && !contentProps.forceMount) {
      return (
        <SelectPrimitive.Portal container={container}>
          <SelectPrimitive.Content {...contentProps} asChild={false} ref={forwardedRef}>
            {children}
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      );
    }

    const resolvedColor = color || themeContext.accentColor;
    return (
      <SelectPrimitive.Portal container={container}>
        <PortalTheme asChild>
          <SelectPrimitive.Content
            data-accent-color={resolvedColor}
            sideOffset={4}
            {...contentProps}
            asChild={false}
            ref={forwardedRef}
            className={classNames(
              'kui-PopperContent',
              'kui-BaseMenuContent',
              'kui-variant-soft',
              'kui-SelectContent',
              className,
            )}
          >
            <SelectScrollArea>{children}</SelectScrollArea>
          </SelectPrimitive.Content>
        </PortalTheme>
      </SelectPrimitive.Portal>
    );
  },
);
SelectContent.displayName = 'Select.Content';

/** The open list's scroll area. Its own component so the thumb sync hook runs only while open. */
function SelectScrollArea({ children }: { children: React.ReactNode }) {
  const setThumbViewport = useThumbSync<HTMLDivElement>();
  return (
    <ScrollAreaPrimitive.Root type="auto" className="kui-ScrollAreaRoot">
      <SelectPrimitive.Viewport
        asChild
        className={classNames('kui-BaseMenuViewport', 'kui-SelectViewport')}
      >
        <ScrollAreaPrimitive.Viewport
          ref={setThumbViewport}
          className="kui-ScrollAreaViewport"
          style={{ overflowY: undefined }}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
      </SelectPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar className="kui-ScrollAreaScrollbar" orientation="vertical">
        <ScrollAreaPrimitive.Thumb className="kui-ScrollAreaThumb" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}

type SelectItemElement = React.ElementRef<typeof SelectPrimitive.Item>;
interface SelectItemProps
  extends ComponentPropsWithout<typeof SelectPrimitive.Item, RemovedProps> {}
const SelectItem = React.forwardRef<SelectItemElement, SelectItemProps>((props, forwardedRef) => {
  const { className, children, ...itemProps } = props;

  // Detect if this is rich content (not just a string)
  const isRichContent = typeof children !== 'string';

  // Rich content is not the same as several lines: an icon and a label is one line, and its mark
  // stays centred. Only content taller than one and a half lines pins the mark to the first line.
  // Written to the DOM, not state, so measuring never re-renders the list.
  const itemRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(forwardedRef, itemRef);
  useLayoutEffect(() => {
    const item = itemRef.current;
    const text = item?.querySelector(':scope > :not(.kui-SelectItemIndicator)');
    if (!item || !text || !isRichContent) return;
    const lineHeight = parseFloat(getComputedStyle(item).lineHeight);
    item.toggleAttribute('data-multiline', text.getBoundingClientRect().height > lineHeight * 1.5);
  });

  return (
    <SelectPrimitive.Item
      {...itemProps}
      asChild={false}
      ref={composedRef}
      className={classNames(
        'kui-reset',
        'kui-BaseMenuItem',
        'kui-SelectItem',
        { 'kui-SelectItemRich': isRichContent },
        className,
      )}
    >
      <SelectPrimitive.ItemIndicator className="kui-SelectItemIndicator">
        <ThickCheckIcon className="kui-SelectItemIndicatorIcon" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = 'Select.Item';

type SelectGroupElement = React.ElementRef<typeof SelectPrimitive.Group>;
interface SelectGroupProps
  extends ComponentPropsWithout<typeof SelectPrimitive.Group, RemovedProps> {}
const SelectGroup = React.forwardRef<SelectGroupElement, SelectGroupProps>(
  ({ className, ...props }, forwardedRef) => (
    <SelectPrimitive.Group
      {...props}
      asChild={false}
      ref={forwardedRef}
      className={classNames('kui-SelectGroup', className)}
    />
  ),
);
SelectGroup.displayName = 'Select.Group';

type SelectLabelElement = React.ElementRef<typeof SelectPrimitive.Label>;
interface SelectLabelProps
  extends ComponentPropsWithout<typeof SelectPrimitive.Label, RemovedProps> {}
const SelectLabel = React.forwardRef<SelectLabelElement, SelectLabelProps>(
  ({ className, ...props }, forwardedRef) => (
    <SelectPrimitive.Label
      {...props}
      asChild={false}
      ref={forwardedRef}
      className={classNames('kui-BaseMenuLabel', 'kui-SelectLabel', className)}
    />
  ),
);
SelectLabel.displayName = 'Select.Label';

type SelectSeparatorElement = React.ElementRef<typeof SelectPrimitive.Separator>;
interface SelectSeparatorProps
  extends ComponentPropsWithout<typeof SelectPrimitive.Separator, RemovedProps> {}
const SelectSeparator = React.forwardRef<SelectSeparatorElement, SelectSeparatorProps>(
  ({ className, ...props }, forwardedRef) => (
    <SelectPrimitive.Separator
      {...props}
      asChild={false}
      ref={forwardedRef}
      className={classNames('kui-BaseMenuSeparator', 'kui-SelectSeparator', className)}
    />
  ),
);
SelectSeparator.displayName = 'Select.Separator';

export {
  SelectRoot as Root,
  SelectTrigger as Trigger,
  SelectContent as Content,
  SelectItem as Item,
  SelectGroup as Group,
  SelectLabel as Label,
  SelectSeparator as Separator,
};

export type {
  SelectRootProps as RootProps,
  SelectTriggerProps as TriggerProps,
  SelectContentProps as ContentProps,
  SelectItemProps as ItemProps,
  SelectGroupProps as GroupProps,
  SelectLabelProps as LabelProps,
  SelectSeparatorProps as SeparatorProps,
};
