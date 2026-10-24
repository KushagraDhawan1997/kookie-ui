import * as React from 'react';
import classNames from 'classnames';

import { separatorPropDefs } from './separator.props.js';
import { extractProps } from '../helpers/extract-props.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type SeparatorElement = React.ElementRef<'span'>;
type SeparatorOwnProps = GetPropDefTypes<typeof separatorPropDefs>;
interface SeparatorProps extends ComponentPropsWithout<'span', RemovedProps>, SeparatorOwnProps {}
const Separator = React.forwardRef<SeparatorElement, SeparatorProps>((props, forwardedRef) => {
  const { className, color, decorative, ...separatorProps } = extractProps(props, separatorPropDefs);
  // A responsive orientation announces the one it starts with.
  const orientation =
    typeof props.orientation === 'object' ? props.orientation.initial : props.orientation;
  return (
    <span
      data-accent-color={color}
      role={decorative ? undefined : 'separator'}
      aria-orientation={!decorative && orientation === 'vertical' ? 'vertical' : undefined}
      {...separatorProps}
      ref={forwardedRef}
      className={classNames('kui-Separator', className)}
    />
  );
});
Separator.displayName = 'Separator';

export { Separator };
export type { SeparatorProps };
