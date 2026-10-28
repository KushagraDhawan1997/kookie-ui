import * as React from 'react';
import classNames from 'classnames';

import { BaseButton } from './_internal/base-button.js';
import { Tooltip } from './tooltip.js';
import { useTooltipWrapper } from '../hooks/use-tooltip-wrapper.js';
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
      /** The button's rank: `loud` (solid, the default), `medium` (raised) or `quiet` (ghost). */
      emphasis?: ButtonEmphasis;
      variant?: never;
    };

/**
 * An icon-only button is square and holds only its icon, so it has no visible text: the type
 * requires `aria-label` or `aria-labelledby`. It never takes the full width.
 */
type ButtonIconOnlyProps =
  | {
      /** Makes the button square and shows only the icon in `children`. Requires `aria-label` or `aria-labelledby`. */
      iconOnly: true;
      /** The button's name for screen readers. Required with `iconOnly` unless `aria-labelledby` is set. */
      'aria-label': string;
      fullWidth?: never;
    }
  | {
      /** Makes the button square and shows only the icon in `children`. Requires `aria-label` or `aria-labelledby`. */
      iconOnly: true;
      /** The id of an element that names this button. Use it instead of `aria-label`. */
      'aria-labelledby': string;
      fullWidth?: never;
    }
  | { iconOnly?: false };

type ButtonOwnProps = Omit<BaseButtonProps, 'as' | 'variant'> & ButtonRankProps & ButtonTooltipProps & ButtonIconOnlyProps;

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
 * An icon-only button must have an accessible name. Logs an error, never throws: a name that is
 * still loading (an empty `aria-label` while a translation loads) must not crash the tree.
 */
function validateIconButtonName(props: Record<string, unknown>) {
  if (props['aria-label'] || props['aria-labelledby']) return;
  const errorMessage =
    'Button: an `iconOnly` button must have an accessible name. Pass `aria-label`, or ' +
    '`aria-labelledby` referencing a label element.';
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
 *
 * // Square, icon-only button: needs an accessible name
 * <Button iconOnly aria-label="Settings"><Settings /></Button>
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

    // An icon-only button is square, so it never takes the full width.
    if (iconOnly) {
      validateIconButtonName(props as Record<string, unknown>);
      (props as { fullWidth?: boolean }).fullWidth = false;
    }

    // Both set the same thing. The types forbid it; an untyped spread that sets both logs and
    // `emphasis` wins, rather than crashing the tree.
    if (emphasis !== undefined && variant !== undefined && process.env.NODE_ENV !== 'production') {
      console.error('Button: pass `emphasis` or `variant`, not both. They set the same thing; `emphasis` wins.');
    }
    const resolvedVariant = emphasis !== undefined ? EMPHASIS_VARIANT[emphasis] : variant;

    // The tooltip's description joins the caller's aria-describedby rather than replacing it.
    const callerDescribedBy = (props as { 'aria-describedby'?: string })['aria-describedby'];
    const tooltipDescribedBy = (tooltipAccessibilityProps as { 'aria-describedby'?: string })['aria-describedby'];
    const ariaDescribedBy = [callerDescribedBy, tooltipDescribedBy].filter(Boolean).join(' ') || undefined;

    const button = (
      <BaseButton
        {...props}
        variant={resolvedVariant}
        aria-describedby={ariaDescribedBy}
        ref={forwardedRef}
        data-icon-only={iconOnly || undefined}
        className={classNames('kui-Button', className)}
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
export type { ButtonProps, ButtonEmphasis, ButtonRankProps, ButtonIconOnlyProps };
