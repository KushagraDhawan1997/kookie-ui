'use client';

import * as React from 'react';
import classNames from 'classnames';

import { separatorPropDefs } from './separator.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { useBreakpoint } from '../hooks/use-breakpoint.js';
import { SHELL_BREAKPOINTS } from './shell.types.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type SeparatorElement = React.ElementRef<'span'>;
type SeparatorOwnProps = GetPropDefTypes<typeof separatorPropDefs>;
interface SeparatorProps extends ComponentPropsWithout<'span', RemovedProps>, SeparatorOwnProps {}
type Orientation = 'horizontal' | 'vertical';

const Separator = React.forwardRef<SeparatorElement, SeparatorProps>((props, forwardedRef) => {
  const { className, color, decorative, ...separatorProps } = extractProps(props, separatorPropDefs);
  const responsive = typeof props.orientation === 'object' && props.orientation !== null;
  const { breakpoint } = useBreakpoint(responsive);

  // A responsive orientation announces the one drawn at the current breakpoint.
  let orientation: Orientation = 'horizontal';
  if (responsive) {
    const values = props.orientation as Partial<Record<string, Orientation>>;
    for (const bp of SHELL_BREAKPOINTS) {
      if (values[bp] !== undefined) orientation = values[bp]!;
      if (bp === breakpoint) break;
    }
  } else if (props.orientation === 'vertical') {
    orientation = 'vertical';
  }

  return (
    <span
      data-accent-color={color}
      role={decorative ? undefined : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      {...separatorProps}
      ref={forwardedRef}
      className={classNames('kui-Separator', className)}
    />
  );
});
Separator.displayName = 'Separator';

export { Separator };
export type { SeparatorProps };
