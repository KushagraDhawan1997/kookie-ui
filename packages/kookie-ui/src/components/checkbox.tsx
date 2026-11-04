'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { useControllableState } from 'radix-ui/internal';

import { checkboxPropDefs } from './checkbox.props.js';
import { ThickCheckIcon, ThickDividerHorizontalIcon } from './icons.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../hooks/theme-size.js';

import type { ComponentPropsWithout } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type CheckboxElement = React.ElementRef<typeof CheckboxPrimitive.Root>;
type CheckboxOwnProps = GetPropDefTypes<typeof checkboxPropDefs>;
interface CheckboxProps
  extends ComponentPropsWithout<
      typeof CheckboxPrimitive.Root,
      'asChild' | 'color' | 'defaultValue' | 'children'
    >,
    CheckboxOwnProps {}
const Checkbox = React.forwardRef<CheckboxElement, CheckboxProps>((ownProps, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, checkboxPropDefs.size);
  const {
    className,
    color,
    checked: checkedProp,
    defaultChecked: defaultCheckedProp,
    onCheckedChange,
    ...checkboxProps
  } = extractProps(props, checkboxPropDefs);

  const [checked, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultCheckedProp ?? false,
    onChange: onCheckedChange,
  });

  return (
    <CheckboxPrimitive.Root
      data-accent-color={color}
      {...checkboxProps}
      defaultChecked={defaultCheckedProp}
      checked={checked}
      onCheckedChange={setChecked}
      asChild={false}
      ref={forwardedRef}
      className={classNames('kui-reset', 'kui-BaseCheckboxRoot', 'kui-CheckboxRoot', className)}
    >
      <CheckboxPrimitive.Indicator
        asChild
        className="kui-BaseCheckboxIndicator kui-CheckboxIndicator"
      >
        {checked === 'indeterminate' ? <ThickDividerHorizontalIcon /> : <ThickCheckIcon />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
