'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive, Direction } from 'radix-ui';
import { Context, Primitive, useControllableState } from 'radix-ui/internal';

const { useDirection } = Direction;

/* -------------------------------------------------------------------------------------------------
 * CheckboxGroup
 * -----------------------------------------------------------------------------------------------*/
const CHECKBOX_GROUP_NAME = 'CheckboxGroup';

type ScopedProps<P> = P & { __scopeCheckboxGroup?: Context.Scope };
const [createCheckboxGroupContext, createCheckboxGroupScope] = Context.createContextScope(
  CHECKBOX_GROUP_NAME,
  [CheckboxPrimitive.createCheckboxScope],
);
const useCheckboxScope = CheckboxPrimitive.createCheckboxScope();

type CheckboxGroupContextValue = {
  name?: string;
  required: boolean;
  disabled: boolean;
  value?: string[];
  onItemCheck(value: string): void;
  onItemUncheck(value: string): void;
};

const [CheckboxGroupProvider, useCheckboxGroupContext] =
  createCheckboxGroupContext<CheckboxGroupContextValue>(CHECKBOX_GROUP_NAME);

type CheckboxGroupElement = React.ElementRef<typeof Primitive.div>;
type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>;
interface CheckboxGroupProps extends PrimitiveDivProps {
  name?: CheckboxGroupContextValue['name'];
  required?: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>['required'];
  disabled?: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>['disabled'];
  dir?: 'ltr' | 'rtl';
  /**
   * @deprecated Has no effect. Each checkbox is its own tab stop, as with native checkboxes,
   * so there is no arrow-key navigation to orient.
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * @deprecated Has no effect. Each checkbox is its own tab stop, as with native checkboxes,
   * so there is no arrow-key navigation to loop.
   */
  loop?: boolean;
  defaultValue?: string[];
  value?: CheckboxGroupContextValue['value'];
  onValueChange?: (value: string[]) => void;
}

const CheckboxGroup = React.forwardRef<CheckboxGroupElement, CheckboxGroupProps>(
  (props: ScopedProps<CheckboxGroupProps>, forwardedRef) => {
    const {
      __scopeCheckboxGroup,
      name,
      defaultValue,
      value: valueProp,
      required = false,
      disabled = false,
      orientation: _orientation,
      dir,
      loop: _loop,
      onValueChange,
      ...groupProps
    } = props;
    const direction = useDirection(dir);
    const [value = [], setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? [],
      onChange: onValueChange,
    });

    const handleItemCheck = React.useCallback(
      (itemValue: string) => setValue((prevValue = []) => [...prevValue, itemValue]),
      [setValue],
    );

    const handleItemUncheck = React.useCallback(
      (itemValue: string) =>
        setValue((prevValue = []) => prevValue.filter((value) => value !== itemValue)),
      [setValue],
    );

    return (
      <CheckboxGroupProvider
        scope={__scopeCheckboxGroup}
        name={name}
        required={required}
        disabled={disabled}
        value={value}
        onItemCheck={handleItemCheck}
        onItemUncheck={handleItemUncheck}
      >
        <Primitive.div
          role="group"
          data-disabled={disabled ? '' : undefined}
          dir={direction}
          {...groupProps}
          ref={forwardedRef}
        />
      </CheckboxGroupProvider>
    );
  },
);

CheckboxGroup.displayName = CHECKBOX_GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * CheckboxGroupItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'CheckboxGroupItem';

type CheckboxGroupItemElement = React.ElementRef<typeof CheckboxPrimitive.Root>;
type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;
interface CheckboxGroupItemProps
  extends Omit<CheckboxProps, 'checked' | 'defaultChecked' | 'onCheckedChange' | 'name'> {
  value: string;
}

const CheckboxGroupItem = React.forwardRef<CheckboxGroupItemElement, CheckboxGroupItemProps>(
  (props: ScopedProps<CheckboxGroupItemProps>, forwardedRef) => {
    const { __scopeCheckboxGroup, disabled, ...itemProps } = props;
    const context = useCheckboxGroupContext(ITEM_NAME, __scopeCheckboxGroup);
    const isDisabled = context.disabled || disabled;
    const checkboxScope = useCheckboxScope(__scopeCheckboxGroup);
    const checked = context.value?.includes(itemProps.value);
    // A required group needs at least one box checked, not every box: the items are
    // required only while none is checked.
    const isRequired = context.required && (context.value?.length ?? 0) === 0;

    return (
      <CheckboxPrimitive.Root
        name={context.name}
        disabled={isDisabled}
        required={isRequired}
        checked={checked}
        {...checkboxScope}
        {...itemProps}
        ref={forwardedRef}
        onCheckedChange={(checked) => {
          if (checked) {
            context.onItemCheck(props.value);
          } else {
            context.onItemUncheck(props.value);
          }
        }}
      />
    );
  },
);

CheckboxGroupItem.displayName = ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * CheckboxGroupIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = 'CheckboxGroupIndicator';

type CheckboxGroupIndicatorElement = React.ElementRef<typeof CheckboxPrimitive.Indicator>;
type CheckboxIndicatorProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Indicator>;
interface CheckboxGroupIndicatorProps extends CheckboxIndicatorProps {}

const CheckboxGroupIndicator = React.forwardRef<
  CheckboxGroupIndicatorElement,
  CheckboxGroupIndicatorProps
>((props: ScopedProps<CheckboxGroupIndicatorProps>, forwardedRef) => {
  const { __scopeCheckboxGroup, ...indicatorProps } = props;
  const checkboxScope = useCheckboxScope(__scopeCheckboxGroup);
  return <CheckboxPrimitive.Indicator {...checkboxScope} {...indicatorProps} ref={forwardedRef} />;
});

CheckboxGroupIndicator.displayName = INDICATOR_NAME;

/* ---------------------------------------------------------------------------------------------- */

const Root = CheckboxGroup;
const Item = CheckboxGroupItem;
const Indicator = CheckboxGroupIndicator;

export {
  createCheckboxGroupScope,
  //
  CheckboxGroup,
  CheckboxGroupItem,
  CheckboxGroupIndicator,
  //
  Root,
  Item,
  Indicator,
};
export type { CheckboxGroupProps, CheckboxGroupItemProps, CheckboxGroupIndicatorProps };
