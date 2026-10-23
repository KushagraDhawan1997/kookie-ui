'use client';

import { warnDeprecated } from '../helpers/warn-deprecated.js';
import * as React from 'react';
import classNames from 'classnames';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { useControllableState } from 'radix-ui/internal';

import { segmentedControlRootPropDefs } from './segmented-control.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type SegmentedControlRootOwnProps = GetPropDefTypes<typeof segmentedControlRootPropDefs>;

interface SegmentedControlRootProps
  extends ComponentPropsWithout<'div', RemovedProps | 'dir'>,
    SegmentedControlRootOwnProps {
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string): void;
}

const SegmentedControlRoot = React.forwardRef<HTMLDivElement, SegmentedControlRootProps>(
  (ownProps, forwardedRef) => {
    const props = useThemeSizeProps(ownProps, segmentedControlRootPropDefs.size);
    const {
      className,
      children,
      radius,
      value: valueProp,
      defaultValue: defaultValueProp,
      onValueChange: onValueChangeProp,
      ...rootProps
    } = extractProps(props, segmentedControlRootPropDefs);

    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChangeProp,
      defaultProp: defaultValueProp ?? '',
    });

    return (
      <ToggleGroupPrimitive.Root
        data-disabled={props.disabled || undefined}
        data-radius={radius}
        ref={forwardedRef}
        className={classNames('kui-SegmentedControlRoot', className)}
        onValueChange={(value) => {
          if (value) {
            setValue(value);
          }
        }}
        {...rootProps}
        type="single"
        value={value}
        asChild={false}
        disabled={!!props.disabled}
      >
        {children}
        <div className="kui-SegmentedControlIndicator" />
      </ToggleGroupPrimitive.Root>
    );
  },
);

SegmentedControlRoot.displayName = 'SegmentedControl.Root';

interface SegmentedControlItemOwnProps {
  value: string;
  /** When true, applies fixed square width for icon-only segments */
  iconOnly?: boolean;
}

interface SegmentedControlItemProps
  extends ComponentPropsWithout<
      typeof ToggleGroupPrimitive.Item,
      RemovedProps | 'disabled' | 'type' | 'value'
    >,
    SegmentedControlItemOwnProps {}

const SegmentedControlItem = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  ({ children, className, iconOnly, ...props }, forwardedRef) => (
    <ToggleGroupPrimitive.Item
      ref={forwardedRef}
      className={classNames('kui-reset', 'kui-SegmentedControlItem', className)}
      data-icon-only={iconOnly || undefined}
      {...props}
      disabled={false}
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
  ),
);

SegmentedControlItem.displayName = 'SegmentedControl.Item';

export { SegmentedControlRoot as Root, SegmentedControlItem as Item };
export type { SegmentedControlRootProps as RootProps, SegmentedControlItemProps as ItemProps };
