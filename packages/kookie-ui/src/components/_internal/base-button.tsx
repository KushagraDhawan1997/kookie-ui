import * as React from 'react';
import classNames from 'classnames';
import { Slot } from 'radix-ui';
import { useComposedRefs, useLayoutEffect } from 'radix-ui/internal';

import { baseButtonPropDefs } from './base-button.props.js';
import { Flex } from '../flex.js';
import { Spinner } from '../spinner.js';
import { TickIcon } from '../icons.js';
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
  BaseButtonDoneProps &
  ComponentPropsWithout<C, RemovedProps | keyof BaseButtonOwnProps | 'as' | 'done'>;

interface BaseButtonDoneProps {
  /**
   * Shows a tick in place of the icon to say that the action finished. The tick takes the
   * icon's box, so nothing moves, and the icon comes back as soon as `done` is false again. On
   * an `iconOnly` button the tick replaces the content. It doesn't block the press. Screen
   * readers don't announce the tick, so also change the label or `aria-label` (for example,
   * `Copy` to `Copied`).
   */
  done?: boolean;
}

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
    done = false,
    ...baseButtonProps
  } = extractProps(props, baseButtonPropDefs);

  // Loading blocks activation but keeps the native `disabled` off, so the button keeps focus
  // and its place in the tab order (aria-disabled carries the state). An explicit `disabled`
  // stays native on form controls; on anything else (a link, an asChild child) the `disabled`
  // attribute does nothing, so aria-disabled carries the state and the click is stopped here.
  const loading = Boolean(props.loading);
  const canLoad = props.loading !== undefined;
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
  // Rendering guesses from the children: an svg element, or a component at either end that is
  // not a known text component (`<Text>`, `<Kbd>`, `<Trans>` and the like), counts as an icon,
  // so the server output is right for icon components such as HugeIcons. After mount the
  // rendered DOM settles it: only an svg is an icon, which corrects a wrong guess.
  const childEdges = React.useMemo(() => {
    const content =
      asChild && React.isValidElement(children) ? (children.props as { children?: React.ReactNode }).children : children;
    // Fragments are see-through: their own first and last children are the edges.
    const items = flattenFragments(content);
    const isIcon = (node: React.ReactNode) =>
      React.isValidElement(node) &&
      (node.type === 'svg' ||
        (typeof node.type !== 'string' && node.type !== React.Fragment && !TEXT_COMPONENTS.has(componentName(node.type))));
    return { iconStart: isIcon(items[0]), iconEnd: isIcon(items[items.length - 1]) };
  }, [asChild, children]);
  const [domEdges, setDomEdges] = React.useState<{ iconStart: boolean; iconEnd: boolean } | null>(null);
  const elementRef = React.useRef<HTMLElement>(null);
  const composedRef = useComposedRefs(forwardedRef, elementRef as React.Ref<BaseButtonElement>);
  useLayoutEffect(() => {
    const element = elementRef.current;
    // While loading the sr-only copy and spinner follow the content, and while done the tick
    // stands at the start; keep the edges read before either.
    if (!element || loading || done) return;
    const contentRoot = element.querySelector(':scope > .kui-BaseButtonContent') ?? element;
    const iconStart = edgeIsSvg(contentRoot, 'start');
    const iconEnd = edgeIsSvg(contentRoot, 'end');
    setDomEdges((prev) => (prev && prev.iconStart === iconStart && prev.iconEnd === iconEnd ? prev : { iconStart, iconEnd }));
  });
  const { iconStart, iconEnd } = domEdges ?? childEdges;

  // Done swaps the icon for a tick in the same place: the leading icon when there is one, the
  // whole content on an icon-only button. Without a leading icon the tick goes before the label.
  const iconOnly = Boolean((baseButtonProps as Record<string, unknown>)['data-icon-only']);
  const content = React.useMemo(() => {
    if (!done) return children;
    const tick = <TickIcon key="kui-done-tick" className="kui-BaseButtonTick" aria-hidden />;
    const swap = (nodes: React.ReactNode): React.ReactNode => {
      if (iconOnly) return tick;
      const items = flattenFragments(nodes);
      const first = items.findIndex((node) => !(typeof node === 'string' && !node.trim()));
      if (iconStart && first !== -1) return items.map((node, index) => (index === first ? tick : node));
      return [tick, ...items];
    };
    if (asChild && React.isValidElement(children)) {
      const element = children as React.ReactElement<{ children?: React.ReactNode }>;
      return React.cloneElement(element, undefined, swap(element.props.children));
    }
    return swap(children);
  }, [done, children, iconOnly, iconStart, asChild]);

  // asChild takes precedence over as prop for Radix Slot integration
  // When asChild is true, we use Slot.Root to merge props onto the child element
  // When asChild is false, we render as the specified element (or button by default)
  const Comp = asChild ? Slot.Root : (as || 'button');

  // Only pass disabled for elements that support it
  // This prevents invalid HTML attributes on unsupported elements. With asChild, the child's own
  // element type decides: a link child gets aria-disabled, not an invalid `disabled`.
  const formElements = ['button', 'input', 'textarea', 'select'];
  const renderedType = asChild ? (React.isValidElement(children) ? children.type : undefined) : (as || 'button');
  const shouldPassDisabled = typeof renderedType === 'string' && formElements.includes(renderedType);

  // With asChild, Radix Slot runs the child's own onClick before ours, so a disabled asChild
  // button stops the click in the capture phase, before any bubble handler runs.
  const { onClickCapture } = baseButtonProps as { onClickCapture?: React.MouseEventHandler<HTMLElement> };
  const handleClickCapture = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (asChild && disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClickCapture?.(event);
    },
    [asChild, disabled, onClickCapture],
  );

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
      data-done={done || undefined}
      {...baseButtonProps}
      {...accessibilityProps}
      // After the spread: `data-disabled` styles `<Button asChild disabled>`, and a wrapping
      // Radix Toggle (asChild) passes `data-disabled={undefined}` that must not erase it.
      data-disabled={disabled || undefined}
      onClick={handleClick}
      onClickCapture={handleClickCapture}
      ref={composedRef}
      className={classNames('kui-reset', 'kui-BaseButton', className)}
      {...(shouldPassDisabled && { disabled: nativeDisabled })}
      {...(isNativeButtonElement && !hasExplicitTypeAttribute ? { type: 'button' } : {})}
    >
      {asChild && !loading ? (
        // asChild: Slot merges onto the single child, so the content can't take a wrapper or a sibling.
        content
      ) : (
        <>
          {/**
           * A button that takes `loading` (true or false) keeps its content in this wrapper, so
           * starting or stopping `loading` keeps the children in place (their state survives). A
           * button that never loads skips it, which saves a node per button. `display: contents`
           * keeps the button's flex
           * gap; while loading the wrapper is `visibility: hidden` under the spinner.
           *
           * `display: contents` removes the content from the accessibility tree in some browsers,
           * so while loading the wrapper is `aria-hidden` and a `kui-sr-only` copy carries the name.
           */}
          {canLoad ? (
            <span className="kui-BaseButtonContent" aria-hidden={loading || undefined}>
              {content}
            </span>
          ) : (
            content
          )}

          {loading ? (
            <>
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
          ) : null}
        </>
      )}
    </Comp>
  );
});
BaseButton.displayName = 'BaseButton';

/** Components that render text, never an icon, so the render-time guess skips them. */
const TEXT_COMPONENTS = new Set(['Text', 'Kbd', 'Code', 'Link', 'Em', 'Strong', 'Quote', 'Badge', 'Trans']);

/** A component's display name, looking through forwardRef and memo. */
function componentName(type: unknown): string {
  if (!type || (typeof type !== 'function' && typeof type !== 'object')) return '';
  const named = type as { displayName?: string; name?: string; render?: unknown; type?: unknown };
  return named.displayName || named.name || componentName(named.render) || componentName(named.type);
}

/** The child list with fragments opened up: a fragment's own children are the edges. */
function flattenFragments(nodes: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(nodes).flatMap((node) =>
    React.isValidElement(node) && node.type === React.Fragment
      ? flattenFragments((node.props as { children?: React.ReactNode }).children)
      : [node],
  );
}

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
