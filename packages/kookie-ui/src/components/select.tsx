'use client';

import { warnDeprecated } from '../helpers/warn-deprecated.js';
import * as React from 'react';
import classNames from 'classnames';
import { Select as SelectPrimitive, ScrollArea as ScrollAreaPrimitive } from 'radix-ui';

import { extractProps } from '../helpers/extract-props.js';
import { useThemeSize } from '../helpers/theme-size.js';
import { ChevronDownIcon, ThickCheckIcon } from './icons.js';
import {
  selectRootPropDefs,
  selectTriggerPropDefs,
  selectContentPropDefs,
} from './select.props.js';
import { useThemeContext, Theme } from './theme.js';
import { useThumbSync } from '../hooks/use-thumb-sync.js';

import type { GetPropDefTypes } from '../props/prop-def.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';

type SelectRootOwnProps = GetPropDefTypes<typeof selectRootPropDefs>;

type SelectContextValue = SelectRootOwnProps;
const SelectContext = React.createContext<SelectContextValue>({});

interface SelectRootProps extends SelectPrimitive.SelectProps, SelectContextValue {}
const SelectRoot: React.FC<SelectRootProps> = (props) => {
  const { children, size: sizeProp, ...rootProps } = props;
  const size = useThemeSize(sizeProp, selectRootPropDefs.size);
  return (
    <SelectPrimitive.Root {...rootProps}>
      <SelectContext.Provider value={React.useMemo(() => ({ size }), [size])}>
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
      { size: selectRootPropDefs.size },
      selectTriggerPropDefs,
    );


    const ariaProps = React.useMemo(
      () => ({
        'aria-invalid': error || undefined,
        'aria-busy': loading || undefined,
        'aria-disabled': disabled || undefined,
        'aria-readonly': readOnly || undefined,
      }),
      [error, loading, disabled, readOnly],
    );

    return (
      <SelectPrimitive.Trigger asChild>
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
              <div className="kui-SelectIcon kui-SelectLoadingIcon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="32"
                    strokeDashoffset="32"
                    className="kui-SelectLoadingIconCircle"
                  />
                </svg>
              </div>
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
      { size: selectRootPropDefs.size },
      selectContentPropDefs,
    );
    const themeContext = useThemeContext();
    const resolvedColor = color || themeContext.accentColor;
    const setThumbViewport = useThumbSync<HTMLDivElement>();
    return (
      <SelectPrimitive.Portal container={container}>
        <Theme asChild>
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
              <ScrollAreaPrimitive.Scrollbar
                className="kui-ScrollAreaScrollbar"
                orientation="vertical"
              >
                <ScrollAreaPrimitive.Thumb className="kui-ScrollAreaThumb" />
              </ScrollAreaPrimitive.Scrollbar>
            </ScrollAreaPrimitive.Root>
          </SelectPrimitive.Content>
        </Theme>
      </SelectPrimitive.Portal>
    );
  },
);
SelectContent.displayName = 'Select.Content';

type SelectItemElement = React.ElementRef<typeof SelectPrimitive.Item>;
interface SelectItemProps
  extends ComponentPropsWithout<typeof SelectPrimitive.Item, RemovedProps> {}
const SelectItem = React.forwardRef<SelectItemElement, SelectItemProps>((props, forwardedRef) => {
  const { className, children, ...itemProps } = props;

  // Detect if this is rich content (not just a string)
  const isRichContent = typeof children !== 'string';

  return (
    <SelectPrimitive.Item
      {...itemProps}
      asChild={false}
      ref={forwardedRef}
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
