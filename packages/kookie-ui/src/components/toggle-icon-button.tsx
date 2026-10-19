import * as React from 'react';
import { Toggle } from 'radix-ui';
import { ToggleButton } from './toggle-button.js';
import { BaseButton } from './_internal/base-button.js';
import type { IconButtonProps } from './icon-button.js';
import type { ButtonRankProps } from './button.js';

type ToggleIconButtonElement = React.ElementRef<typeof BaseButton>;

/**
 * Extract toggle-specific props from Radix Toggle
 * These props control the toggle state and behavior
 */
type ToggleProps = React.ComponentPropsWithoutRef<typeof Toggle.Root>;

/**
 * Required accessibility props for icon buttons (same as IconButton)
 * Icon buttons must have an accessible name to meet WCAG guidelines
 *
 * Three ways to provide accessibility:
 * 1. aria-label: Direct descriptive text
 * 2. aria-labelledby: Reference to a label element
 * 3. children: Visible text content (fallback)
 */
type AccessibilityProps =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-label'?: never; 'aria-labelledby': string }
  | { 'aria-label'?: never; 'aria-labelledby'?: never; children: React.ReactNode };

/**
 * Combine IconButton props with Toggle-specific props
 * Includes tooltip props from IconButton for comprehensive functionality
 */
type ToggleIconButtonProps = Omit<IconButtonProps, 'as' | 'variant' | 'emphasis'> &
  ButtonRankProps & {
    /** Controlled pressed state */
    pressed?: ToggleProps['pressed'];
    /** Callback when pressed state changes */
    onPressedChange?: ToggleProps['onPressedChange'];
    /** Default pressed state for uncontrolled usage */
    defaultPressed?: ToggleProps['defaultPressed'];
  };

/**
 * Intersection with accessibility props to ensure compliance
 * This type ensures all ToggleIconButton instances have proper accessibility
 */
type ToggleIconButtonPropsWithAccessibility = ToggleIconButtonProps & AccessibilityProps;

/**
 * ToggleIconButton component for icon buttons that can be pressed/unpressed. It is
 * `ToggleButton` with `iconOnly` set, kept as its own name for its stricter type.
 *
 * The ToggleIconButton component extends IconButton with toggle functionality
 * using Radix UI's Toggle primitive. It provides proper accessibility announcements,
 * controlled/uncontrolled state management, and seamless integration with
 * the existing IconButton component.
 *
 * Key features:
 * - Controlled and uncontrolled state management
 * - Live accessibility announcements for screen readers
 * - Enforced accessibility requirements (aria-label, aria-labelledby, or children)
 * - Automatic state validation and warnings
 * - Seamless integration with IconButton props and styling
 * - Proper ARIA attributes for toggle functionality
 * - Built-in tooltip support from IconButton
 *
 * @example
 * ```tsx
 * // Uncontrolled toggle icon button
 * <ToggleIconButton defaultPressed={false} aria-label="Toggle notifications">
 *   <Bell />
 * </ToggleIconButton>
 *
 * // Controlled toggle icon button
 * const [pressed, setPressed] = React.useState(false);
 * <ToggleIconButton
 *   pressed={pressed}
 *   onPressedChange={setPressed}
 *   aria-label="Toggle notifications"
 * >
 *   <Bell />
 * </ToggleIconButton>
 *
 * // Toggle icon button with tooltip
 * <ToggleIconButton
 *   variant="solid"
 *   size="3"
 *   color="blue"
 *   pressed={isActive}
 *   onPressedChange={setIsActive}
 *   aria-label="Toggle feature"
 *   tooltip="Toggle this feature on/off"
 * >
 *   <Star />
 * </ToggleIconButton>
 *
 * // Toggle icon button with aria-labelledby
 * <ToggleIconButton
 *   aria-labelledby="notifications-label"
 *   pressed={notificationsEnabled}
 *   onPressedChange={setNotificationsEnabled}
 * >
 *   <Bell />
 * </ToggleIconButton>
 * <span id="notifications-label">Toggle notifications</span>
 * ```
 */
const ToggleIconButton = React.forwardRef<ToggleIconButtonElement, ToggleIconButtonPropsWithAccessibility>((props, forwardedRef) => (
  <ToggleButton {...(props as React.ComponentPropsWithoutRef<typeof ToggleButton>)} iconOnly ref={forwardedRef} />
));
ToggleIconButton.displayName = 'ToggleIconButton';

export { ToggleIconButton };
export type { ToggleIconButtonPropsWithAccessibility as ToggleIconButtonProps };
