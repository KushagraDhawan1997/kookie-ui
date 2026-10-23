import * as React from 'react';
import classNames from 'classnames';
import { Slot } from 'radix-ui';
import { useComposedRefs, useLayoutEffect } from 'radix-ui/internal';

import { baseButtonPropDefs } from './base-button.props.js';
import { Flex } from '../flex.js';
import { Spinner } from '../spinner.js';
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
  // stays native on form controls; on anything else (a link, an asChild child) the `disabled`
  // attribute does nothing, so aria-disabled carries the state and the click is stopped here.
  const loading = Boolean(props.loading);
  const disabled = Boolean(nativeDisabled) || loading;
  const { onClick, 'aria-describedby': ariaDescribedByProp } = baseButtonProps as {
    onClick?: React.MouseEventHandler<HTMLElement>;
    'aria-describedby'?: string;
  };
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
    [disabled, onClick],
  );

  // Which edges start or end with an icon. A bare edge pads wider under a full radius; an edge
  // holding an icon keeps the plain padding (the icon already stands between text and curve).
  // Only an svg is an icon. Rendering reads the children for an svg element at either end, so
  // the server output is right for inline svgs; after mount the rendered DOM settles it, which
  // also catches icon components (they render an svg) and rules out wrapped text (`<Text>`,
  // `<Kbd>`, `<Trans>`), whose first node is not an svg.
  const childEdges = React.useMemo(() => {
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
    const isIcon = (node: React.ReactNode) => React.isValidElement(node) && node.type === 'svg';
    return { iconStart: isIcon(items[0]), iconEnd: isIcon(items[items.length - 1]) };
  }, [asChild, children]);
  const [domEdges, setDomEdges] = React.useState<{ iconStart: boolean; iconEnd: boolean } | null>(null);
  const elementRef = React.useRef<HTMLElement>(null);
  const composedRef = useComposedRefs(forwardedRef, elementRef as React.Ref<BaseButtonElement>);
  useLayoutEffect(() => {
    const element = elementRef.current;
    // While loading the label sits in a wrapper; keep the edges read before it.
    if (!element || loading) return;
    const iconStart = edgeIsSvg(element, 'start');
    const iconEnd = edgeIsSvg(element, 'end');
    setDomEdges((prev) => (prev && prev.iconStart === iconStart && prev.iconEnd === iconEnd ? prev : { iconStart, iconEnd }));
  });
  const { iconStart, iconEnd } = domEdges ?? childEdges;

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

  // Loading keeps the caller's name (aria-label, aria-labelledby or the label text) and adds
  // aria-busy plus a description, as v2 does. A disabled element with no native `disabled`
  // announces itself through aria-disabled.
  const accessibilityProps = React.useMemo(() => {
    if (loading) {
      return {
        'aria-busy': true,
        'aria-disabled': true,
        'aria-describedby': [ariaDescribedByProp, describedById].filter(Boolean).join(' '),
      };
    }
    if (nativeDisabled && (!shouldPassDisabled || asChild)) {
      return { 'aria-disabled': true };
    }
    return {};
  }, [loading, describedById, ariaDescribedByProp, nativeDisabled, shouldPassDisabled, asChild]);

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
      ref={composedRef}
      className={classNames('kui-reset', 'kui-BaseButton', className)}
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
           * so we force remove it with `aria-hidden` and re-add it in the tree with a `kui-sr-only` copy.
           * Both are classes, not style attributes, so a loading button carries no inline style.
           */}
          <span className="kui-BaseButtonContent" aria-hidden>
            {children}
          </span>

          {/* The label stays the name; the hidden "Loading" only describes (aria-describedby reads hidden text). */}
          <span className="kui-sr-only">
            <span id={describedById} aria-hidden>
              Loading
            </span>
            {children}
          </span>

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

/** Whether the first or last rendered node of `element` (blank text and comments skipped) is an svg. */
function edgeIsSvg(element: Element, edge: 'start' | 'end'): boolean {
  let node = edge === 'start' ? element.firstChild : element.lastChild;
  while (node) {
    const blank =
      node.nodeType === Node.COMMENT_NODE || (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim());
    if (!blank) break;
    node = edge === 'start' ? node.nextSibling : node.previousSibling;
  }
  return node?.nodeType === Node.ELEMENT_NODE && (node as Element).localName === 'svg';
}

export { BaseButton };
export type { BaseButtonProps };
