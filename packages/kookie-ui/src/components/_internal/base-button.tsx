import * as React from 'react';
import classNames from 'classnames';
import { Slot } from 'radix-ui';

import { baseButtonPropDefs } from './base-button.props.js';
import { Flex } from '../flex.js';
import { Spinner } from '../spinner.js';
import { VisuallyHidden } from '../visually-hidden.js';
import { extractProps } from '../../helpers/extract-props.js';
import { useThemeSizeProps } from '../../helpers/theme-size.js';

import type { ComponentPropsWithout, RemovedProps } from '../../helpers/component-props.js';
import type { GetPropDefTypes } from '../../props/prop-def.js';

type BaseButtonElement = React.ElementRef<'button'>;
type BaseButtonOwnProps = GetPropDefTypes<typeof baseButtonPropDefs>;

/**
 * Polymorphic BaseButton props that support rendering as different HTML elements
 * Uses the proper ComponentPropsWithout pattern for type safety
 * @template C - The element type to render as (defaults to 'button')
 */
type PolymorphicBaseButtonProps<C extends React.ElementType = 'button'> = {
  /** Element type to render as (e.g., 'a', 'span', etc.) */
  as?: C;
} & BaseButtonOwnProps &
  ComponentPropsWithout<C, RemovedProps | keyof BaseButtonOwnProps | 'as'>;

/**
 * BaseButton props interface that combines all available props
 */
interface BaseButtonProps extends PolymorphicBaseButtonProps {}

/**
 * BaseButton component that provides the core button functionality
 *
 * This is the foundational button component that handles all the complex logic
 * including loading states, accessibility, performance optimizations, and
 * polymorphic rendering. It's used by Button and Toggle to ensure consistent behavior across the design system.
 *
 * Key features:
 * - Loading state with spinner and accessibility announcements
 * - Comprehensive accessibility support
 * - Polymorphic rendering support
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BaseButton>Click me</BaseButton>
 *
 * // With loading state
 * <BaseButton loading>Processing...</BaseButton>
 *
 * // Polymorphic rendering
 * <BaseButton as="a" href="/link">Link Button</BaseButton>
 * ```
 */
const BaseButton = React.forwardRef<BaseButtonElement, BaseButtonProps>((ownProps, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, baseButtonPropDefs.size);

  // Extract button-specific props from the combined props object
  const {
    className,
    children,
    asChild,
    as,
    color,
    radius,
    disabled: nativeDisabled,
    ...baseButtonProps
  } = extractProps(props, baseButtonPropDefs);

  // Loading blocks activation but keeps the native `disabled` off, so the button keeps focus
  // and its place in the tab order (aria-disabled carries the state). An explicit `disabled`
  // stays native.
  const loading = Boolean(props.loading);
  const disabled = Boolean(nativeDisabled) || loading;
  const { onClick } = baseButtonProps as { onClick?: React.MouseEventHandler<HTMLElement> };
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
    [loading, onClick],
  );

  // Which edges start or end with an icon. A bare edge pads wider under a full radius; an edge
  // holding an icon keeps the plain padding (the icon already stands between text and curve).
  const { iconStart, iconEnd } = React.useMemo(() => {
    const content =
      asChild && React.isValidElement(children) ? (children.props as { children?: React.ReactNode }).children : children;
    // Fragments are see-through: their own first and last children are the edges.
    const flatten = (nodes: React.ReactNode): React.ReactNode[] =>
      React.Children.toArray(nodes).flatMap((node) =>
        React.isValidElement(node) && node.type === React.Fragment
          ? flatten((node.props as { children?: React.ReactNode }).children)
          : [node],
      );
    const items = flatten(content);
    const isIcon = (node: React.ReactNode) =>
      React.isValidElement(node) && (node.type === 'svg' || typeof node.type !== 'string');
    return { iconStart: isIcon(items[0]), iconEnd: isIcon(items[items.length - 1]) };
  }, [asChild, children]);


  // asChild takes precedence over as prop for Radix Slot integration
  // When asChild is true, we use Slot.Root to merge props onto the child element
  // When asChild is false, we render as the specified element (or button by default)
  const Comp = asChild ? Slot.Root : (as || 'button');

  // Only pass disabled for elements that support it
  // This prevents invalid HTML attributes on unsupported elements
  const shouldPassDisabled = asChild || !as || ['button', 'input', 'textarea', 'select'].includes(as);

  // Determine if we are rendering a real <button> element so we can set a safe
  // default type. Native <button> defaults to type="submit" which can cause
  // accidental form submissions. We default to type="button" unless the user
  // explicitly provided a type or we're using asChild (unknown underlying node).
  const isNativeButtonElement = !asChild && (!as || as === 'button');
  const hasExplicitTypeAttribute = 'type' in (baseButtonProps as Record<string, unknown>);

  // Generate unique ID for loading announcements
  const loadingId = React.useId();
  const describedById = loading ? `${loadingId}-loading` : undefined;

  // Extract button text for accessibility announcements
  const buttonText = React.useMemo(() => {
    if (typeof children === 'string') return children;
    if (React.isValidElement(children) && typeof (children.props as any)?.children === 'string') {
      return (children.props as any).children;
    }
    return 'button';
  }, [children]);

  // Enhanced accessibility props for loading state
  // These ensure screen readers announce the loading state properly
  const accessibilityProps = React.useMemo(() => {
    if (props.loading) {
      return {
        'aria-busy': true,
        'aria-disabled': true,
        'aria-describedby': describedById,
        'aria-label': `${buttonText} (loading)`,
      };
    }
    return {};
  }, [props.loading, describedById, buttonText]);

  return (
    <Comp
      data-accent-color={color}
      data-radius={radius}
      data-icon-start={iconStart || undefined}
      data-icon-end={iconEnd || undefined}
      {...baseButtonProps}
      {...accessibilityProps}
      // After the spread: `data-disabled` styles `<Button asChild disabled>`, and a wrapping
      // Radix Toggle (asChild) passes `data-disabled={undefined}` that must not erase it.
      data-disabled={disabled || undefined}
      onClick={handleClick}
      ref={forwardedRef}
      className={classNames('rt-reset', 'rt-BaseButton', className)}
      {...(shouldPassDisabled && { disabled: nativeDisabled })}
      {...(isNativeButtonElement && !hasExplicitTypeAttribute ? { type: 'button' } : {})}
    >
      {props.loading ? (
        <>
          {/**
           * We need a wrapper to set `visibility: hidden` to hide the button content whilst we show the `Spinner`.
           * The button is a flex container with a `gap`, so we use `display: contents` to ensure the correct flex layout.
           *
           * However, `display: contents` removes the content from the accessibility tree in some browsers,
           * so we force remove it with `aria-hidden` and re-add it in the tree with `VisuallyHidden`
           */}
          <span style={{ display: 'contents', visibility: 'hidden' }} aria-hidden>
            {children}
          </span>

          {/* Enhanced accessibility for loading state */}
          <VisuallyHidden>
            <span id={describedById}>{buttonText} is loading, please wait...</span>
            {children}
          </VisuallyHidden>

          {/* Centered spinner overlay during loading state */}
          <Flex asChild align="center" justify="center" position="absolute" inset="0">
            <span>
              <Spinner aria-hidden="true" />
            </span>
          </Flex>
        </>
      ) : (
        children
      )}
    </Comp>
  );
});
BaseButton.displayName = 'BaseButton';

export { BaseButton };
export type { BaseButtonProps };
