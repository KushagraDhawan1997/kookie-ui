'use client';

import * as React from 'react';
import classNames from 'classnames';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { useComposedRefs, useControllableState, useLayoutEffect } from 'radix-ui/internal';

import { segmentedControlRootPropDefs } from './segmented-control.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type SegmentedControlRootOwnProps = GetPropDefTypes<typeof segmentedControlRootPropDefs>;

interface SegmentedControlRootProps extends ComponentPropsWithout<'div', RemovedProps | 'dir'>, SegmentedControlRootOwnProps {
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string): void;
}

// Arrow keys select as they move focus, as in a radio group. The root marks a key press, and the
// item that takes focus from it selects itself. A click or Tab focuses without selecting.
const SegmentedControlContext = React.createContext<{ selectFromKeyboard(value: string): void } | null>(null);

const NAVIGATION_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']);

const SegmentedControlRoot = React.forwardRef<HTMLDivElement, SegmentedControlRootProps>((ownProps, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, segmentedControlRootPropDefs.size);
  const {
    className,
    children,
    radius,
    value: valueProp,
    defaultValue: defaultValueProp,
    onValueChange: onValueChangeProp,
    style,
    disabled,
    onKeyDown,
    onPointerDown,
    ...rootProps
  } = extractProps(props, segmentedControlRootPropDefs);

  const [value, setValue] = useControllableState({
    prop: valueProp,
    onChange: onValueChangeProp,
    defaultProp: defaultValueProp ?? '',
  });

  // The indicator is sized and placed from the item count and the selected index, written
  // as custom properties. They are read from the children on render, so the server markup
  // is right, then corrected from the DOM, which also sees items inside fragments or
  // wrapper components.
  const keyboardNavigationRef = React.useRef(false);
  const context = React.useMemo(
    () => ({
      selectFromKeyboard(itemValue: string) {
        if (!keyboardNavigationRef.current) return;
        keyboardNavigationRef.current = false;
        setValue(itemValue);
      },
    }),
    [setValue],
  );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(forwardedRef, rootRef);
  const items = React.Children.toArray(children).filter(React.isValidElement);
  const renderedCount = items.length;
  const renderedIndex = Math.max(
    0,
    items.findIndex((child) => (child.props as { value?: unknown }).value === value),
  );
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const domItems = Array.from(root.querySelectorAll(':scope > .kui-SegmentedControlItem'));
    const index = domItems.findIndex((item) => item.getAttribute('data-state') === 'on');
    root.style.setProperty('--segmented-control-count', String(domItems.length || 1));
    root.style.setProperty('--segmented-control-index', String(Math.max(0, index)));
  });

  return (
    <SegmentedControlContext.Provider value={context}>
      <ToggleGroupPrimitive.Root
        data-disabled={disabled || undefined}
        data-radius={radius}
        ref={composedRef}
        style={
          {
            '--segmented-control-count': renderedCount || 1,
            '--segmented-control-index': renderedIndex,
            ...style,
          } as React.CSSProperties
        }
        className={classNames('kui-SegmentedControlRoot', className)}
        onValueChange={(value) => {
          if (value) {
            setValue(value);
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          keyboardNavigationRef.current = NAVIGATION_KEYS.has(event.key);
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          keyboardNavigationRef.current = false;
        }}
        {...rootProps}
        type="single"
        value={value}
        asChild={false}
        disabled={!!disabled}
      >
        {children}
        <div className="kui-SegmentedControlIndicator" />
      </ToggleGroupPrimitive.Root>
    </SegmentedControlContext.Provider>
  );
});

SegmentedControlRoot.displayName = 'SegmentedControl.Root';

interface SegmentedControlItemOwnProps {
  value: string;
  /** When true, this segment can't be selected. */
  disabled?: boolean;
  /** When true, applies fixed square width for icon-only segments */
  iconOnly?: boolean;
}

interface SegmentedControlItemProps extends ComponentPropsWithout<typeof ToggleGroupPrimitive.Item, RemovedProps | 'type' | 'value'>, SegmentedControlItemOwnProps {}

const SegmentedControlItem = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(({ children, className, iconOnly, onFocus, ...props }, forwardedRef) => {
  const context = React.useContext(SegmentedControlContext);
  return (
    <ToggleGroupPrimitive.Item
      ref={forwardedRef}
      className={classNames('kui-reset', 'kui-SegmentedControlItem', className)}
      data-icon-only={iconOnly || undefined}
      onFocus={(event) => {
        onFocus?.(event);
        context?.selectFromKeyboard(props.value);
      }}
      {...props}
      asChild={false}
    >
      <span className="kui-SegmentedControlItemSeparator" />
      <span className="kui-SegmentedControlItemLabel">
        <span className="kui-SegmentedControlItemLabelActive">{children}</span>
        <span className="kui-SegmentedControlItemLabelInactive" aria-hidden>
          {children}
        </span>
      </span>
    </ToggleGroupPrimitive.Item>
  );
});

SegmentedControlItem.displayName = 'SegmentedControl.Item';

export { SegmentedControlRoot as Root, SegmentedControlItem as Item };
export type { SegmentedControlRootProps as RootProps, SegmentedControlItemProps as ItemProps };
