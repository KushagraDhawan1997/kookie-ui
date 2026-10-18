import * as React from 'react';
import classNames from 'classnames';

import { BaseButton } from './_internal/base-button.js';
import { Tooltip } from './tooltip.js';
import { useTooltipWrapper } from '../hooks/use-tooltip-wrapper.js';
import { warnDeprecated } from '../helpers/warn-deprecated.js';
import type { BaseButtonProps } from './_internal/base-button.js';

type ButtonElement = React.ElementRef<typeof BaseButton>;

/**
 * Tooltip configuration props that can be passed to Button
 * These props are forwarded to the underlying Tooltip component
 */
export interface ButtonTooltipProps {
  /** Content to display in the tooltip on hover/focus */
  tooltip?: React.ReactNode;
  /** Side of the button where the tooltip should appear */
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of the tooltip relative to the button */
  tooltipAlign?: 'start' | 'center' | 'end';
  /** Delay before showing the tooltip (in milliseconds) */
  tooltipDelayDuration?: number;
  /** Whether to disable hoverable content behavior */
  tooltipDisableHoverableContent?: boolean;
}

/**
 * Core Button props excluding the 'as' prop for polymorphic behavior
 * Combines BaseButton props with tooltip functionality
 */
type ButtonEmphasis = 'loud' | 'medium' | 'quiet';

/** `emphasis` is a button's rank: loud is `solid`, medium is `raised`, quiet is `ghost`. */
const EMPHASIS_VARIANT = { loud: 'solid', medium: 'raised', quiet: 'ghost' } as const;

/**
 * A button states its rank with `emphasis` or its look with `variant`, never both.
 */
type ButtonRankProps =
  | {
      /** The button's look. `outline` and `surface` have no emphasis of their own. */
      variant?: BaseButtonProps['variant'];
      emphasis?: never;
    }
  | {
      /** The button's rank: `loud` (solid), `medium` (raised, the default) or `quiet` (ghost). */
      emphasis?: ButtonEmphasis;
      variant?: never;
    };

type ButtonOwnProps = Omit<BaseButtonProps, 'as' | 'variant'> &
  ButtonRankProps &
  ButtonTooltipProps & {
    /**
     * A square button holding only an icon. It needs an accessible name: `aria-label`,
     * `aria-labelledby`, or visible text. `IconButton` is this button with `iconOnly` set.
     */
    iconOnly?: boolean;
  };

/**
 * Polymorphic Button props that support rendering as different HTML elements
 * @template C - The element type to render as (defaults to 'button')
 */
type ButtonProps<C extends React.ElementType = 'button'> = ButtonOwnProps & {
  /** Element type to render as (e.g., 'a', 'span', etc.) */
  as?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof ButtonOwnProps>;

/**
 * Button component type that supports polymorphic rendering
 * @template C - The element type to render as
 */
type ButtonComponent = <C extends React.ElementType = 'button'>(props: ButtonProps<C> & { ref?: React.ForwardedRef<ButtonElement> }) => React.ReactElement | null;

/**
 * An icon-only button must have an accessible name. Throws in development, logs otherwise.
 */
function validateIconButtonName(props: Record<string, unknown>) {
  if (props['aria-label'] || props['aria-labelledby'] || props.children) return;
  const errorMessage =
    'IconButton: Icon buttons must have an accessible name. Please provide either:' +
    '\n- aria-label prop with descriptive text' +
    '\n- aria-labelledby prop referencing a label element' +
    '\n- or visible text children';
  if (process.env.NODE_ENV === 'development') throw new Error(errorMessage);
  console.error(errorMessage);
}

/**
 * Button component for triggering actions throughout your interface
 *
 * The Button component is the primary interactive element in the Kookie User Interface.
 * It provides six visual variants, four sizes, comprehensive color options, and built-in
 * tooltip support. The component automatically handles icon sizing, supports responsive
 * layouts, and provides accessibility compliance out of the box.
 *
 * @example
 * ```tsx
 * // Basic button
 * <Button>Click me</Button>
 *
 * // Button with variant and size
 * <Button variant="solid" size="3">Primary Action</Button>
 *
 * // Button with tooltip
 * <Button tooltip="Save your progress">Save</Button>
 *
 * // Polymorphic button as link
 * <Button as="a" href="/dashboard">Go to Dashboard</Button>
 * ```
 */
const Button = React.forwardRef(
  (
    {
      className,
      style,
      tooltip,
      tooltipSide = 'top',
      tooltipAlign = 'center',
      tooltipDelayDuration,
      tooltipDisableHoverableContent,
      iconOnly = false,
      emphasis,
      variant,
      ...props
    }: ButtonProps,
    forwardedRef: React.ForwardedRef<ButtonElement>,
  ) => {
    // Use shared tooltip wrapper hook for accessibility props
    const { tooltipId, hasTooltip, accessibilityProps: tooltipAccessibilityProps } = useTooltipWrapper(tooltip);

    if (iconOnly) {
      validateIconButtonName(props);
      if (props.fullWidth) {
        warnDeprecated('`fullWidth` on an icon-only button is deprecated and will be removed in 0.15.0. An icon button is square.');
      }
    }

    if (emphasis !== undefined && variant !== undefined) {
      throw new Error('Button: pass `emphasis` or `variant`, not both. They set the same thing.');
    }
    const resolvedVariant = emphasis !== undefined ? EMPHASIS_VARIANT[emphasis] : variant;

    const button = (
      <BaseButton
        {...props}
        variant={resolvedVariant}
        {...tooltipAccessibilityProps}
        ref={forwardedRef}
        className={classNames(iconOnly ? 'rt-IconButton' : 'rt-Button', className)}
        style={style}
      />
    );

    // If no tooltip is provided, return the button as-is for better performance
    if (!hasTooltip) {
      return button;
    }

    // Wrap with Tooltip when tooltip content is provided
    // This creates a compound component that handles both button and tooltip functionality
    return (
      <Tooltip content={tooltip} side={tooltipSide} align={tooltipAlign} delayDuration={tooltipDelayDuration} disableHoverableContent={tooltipDisableHoverableContent} id={tooltipId}>
        {button}
      </Tooltip>
    );
  },
) as ButtonComponent & { displayName?: string };

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonEmphasis };
