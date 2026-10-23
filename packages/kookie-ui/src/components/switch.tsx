import * as React from 'react';
import classNames from 'classnames';
import { Switch as SwitchPrimitive } from 'radix-ui';

import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';
import { marginPropDefs } from '../props/margin.props.js';
import { switchPropDefs } from './switch.props.js';

import type { MarginProps } from '../props/margin.props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';
import type { ComponentPropsWithout } from '../helpers/component-props.js';

type SwitchElement = React.ElementRef<typeof SwitchPrimitive.Root>;
type SwitchOwnProps = GetPropDefTypes<typeof switchPropDefs>;
interface SwitchProps
  extends ComponentPropsWithout<
      typeof SwitchPrimitive.Root,
      'asChild' | 'color' | 'defaultValue' | 'children'
    >,
    MarginProps,
    SwitchOwnProps {}
const Switch = React.forwardRef<SwitchElement, SwitchProps>((ownProps, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, switchPropDefs.size);
  const { className, color, ...switchProps } = extractProps(
    props,
    switchPropDefs,
    marginPropDefs,
  );
  return (
    <SwitchPrimitive.Root
      data-accent-color={color}
      {...switchProps}
      asChild={false}
      ref={forwardedRef}
      className={classNames('rt-reset', 'rt-SwitchRoot', className)}
    >
      <SwitchPrimitive.Thumb className="rt-SwitchThumb" />
    </SwitchPrimitive.Root>
  );
});
Switch.displayName = 'Switch';

export { Switch };
export type { SwitchProps };
