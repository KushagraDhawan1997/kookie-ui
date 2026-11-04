import * as React from 'react';
import classNames from 'classnames';
import { Slot } from 'radix-ui';

import { chipPropDefs } from './chip.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { Tooltip } from './tooltip.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type ChipElement = React.ElementRef<'span'>;
type ChipOwnProps = GetPropDefTypes<typeof chipPropDefs>;

// Tooltip props that can be passed to Chip
interface ChipTooltipProps {
  tooltip?: React.ReactNode;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  tooltipAlign?: 'start' | 'center' | 'end';
  tooltipDelayDuration?: number;
  tooltipDisableHoverableContent?: boolean;
}

interface ChipProps
  extends ComponentPropsWithout<'span', RemovedProps>,
    ChipOwnProps,
    ChipTooltipProps {}

const Chip = React.forwardRef<ChipElement, ChipProps>((props, forwardedRef) => {
  const {
    asChild,
    className,
    children,
    color,
    radius,
    tooltip,
    tooltipSide = 'top',
    tooltipAlign = 'center',
    tooltipDelayDuration,
    tooltipDisableHoverableContent,
    ...chipProps
  } = extractProps(props, chipPropDefs);

  const Comp = asChild ? Slot.Root : 'span';

  const chip = (
    <Comp
      data-accent-color={color}
      data-radius={radius}
      // A tooltip opens on focus, so a chip that has one joins the tab order.
      tabIndex={tooltip ? 0 : undefined}
      {...chipProps}
      ref={forwardedRef}
      className={classNames('kui-reset', 'kui-Chip', className)}
    >
      {children}
    </Comp>
  );

  // If no tooltip is provided, return the chip as-is
  if (!tooltip) {
    return chip;
  }

  // Wrap with Tooltip when tooltip content is provided
  return (
    <Tooltip
      content={tooltip}
      side={tooltipSide}
      align={tooltipAlign}
      delayDuration={tooltipDelayDuration}
      disableHoverableContent={tooltipDisableHoverableContent}
    >
      {chip}
    </Tooltip>
  );
});
Chip.displayName = 'Chip';

export { Chip };
export type { ChipProps };
