import * as React from 'react';
import classNames from 'classnames';

import { Card } from './card.js';
import { Flex } from './flex.js';
import { Heading } from './heading.js';

import type { CardProps } from './card.js';
import type { FlexProps } from './flex.js';

// ============================================================================
// AppBar Root
// ============================================================================

type AppBarRootElement = React.ElementRef<'div'>;
type Anchor = 'top' | 'bottom' | 'left' | 'right';
type SpaceScale = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

interface AppBarRootProps extends Omit<CardProps, 'asChild'> {
  /**
   * Which edge to anchor to. Sets position: sticky and the appropriate edge.
   * @default "top"
   */
  anchor?: Anchor;
  /**
   * Floating mode adds margin from edges for a detached look with absolute positioning.
   * When false (default), uses inset mode with negative margins to go edge-to-edge inside Cards.
   * @default false
   */
  floating?: boolean;
  /**
   * Margin offset from edges when floating. Uses space scale values.
   * @default "2"
   */
  offset?: SpaceScale;
}

/**
 * An app bar: the band anchored to one edge of a pane, with left, center and right sections
 * and a title. It publishes its height (or width) to its parent as `--rt-app-bar-height`
 * (`--rt-app-bar-width`) so content can pad itself clear of it.
 *
 * This component was called `Toolbar` until 0.11.0. It is not a `role="toolbar"`: for a row of
 * controls with one tab stop and arrow-key navigation, use `Toolbar`.
 */
const AppBarRoot = React.forwardRef<AppBarRootElement, AppBarRootProps>(
  (props, forwardedRef) => {
    const {
      anchor = 'top',
      floating = false,
      offset = '2',
      size = '1',
      variant = 'ghost',
      material,
      className,
      style,
      children,
      ...restProps
    } = props;

    const isHorizontal = anchor === 'top' || anchor === 'bottom';
    const internalRef = React.useRef<HTMLDivElement>(null);

    // Merge refs
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    // Expose height/width as CSS variable on parent element
    React.useEffect(() => {
      const element = internalRef.current;
      if (!element) return;

      const parent = element.parentElement;
      if (!parent) return;

      const update = () => {
        let dimension = isHorizontal ? element.offsetHeight : element.offsetWidth;

        // For floating mode, include the margin in the total space
        if (floating) {
          const computedStyle = getComputedStyle(element);
          const margin = parseFloat(computedStyle.marginTop) || 0;
          dimension += margin * 2;
        }

        // `--rt-toolbar-*` are the names this bar published while it was called Toolbar.
        // They are still written so existing layouts keep their offset; prefer `--rt-app-bar-*`.
        if (isHorizontal) {
          parent.style.setProperty('--rt-app-bar-height', `${dimension}px`);
          parent.style.setProperty('--rt-toolbar-height', `${dimension}px`);
        } else {
          parent.style.setProperty('--rt-app-bar-width', `${dimension}px`);
          parent.style.setProperty('--rt-toolbar-width', `${dimension}px`);
        }
      };

      update();

      const resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(element);

      return () => resizeObserver.disconnect();
    }, [isHorizontal, floating]);

    const computedStyle = floating
      ? { margin: `var(--space-${offset})`, ...style }
      : style;

    return (
      <Card
        ref={mergedRef}
        size={size}
        variant={variant}
        material={material}
        data-anchor={anchor}
        data-floating={floating || undefined}
        className={classNames('rt-AppBar', className)}
        style={computedStyle}
        {...restProps}
      >
        <div className="rt-AppBarInner">
          {children}
        </div>
      </Card>
    );
  },
);
AppBarRoot.displayName = 'AppBar.Root';

// ============================================================================
// AppBar Left (for horizontal) / Start (alias)
// ============================================================================

type AppBarSectionElement = React.ElementRef<'div'>;
type AppBarSectionProps = FlexProps;

const AppBarLeft = React.forwardRef<AppBarSectionElement, AppBarSectionProps>(
  ({ gap = '2', align = 'center', className, children, ...props }, forwardedRef) => (
    <Flex
      ref={forwardedRef}
      align={align}
      gap={gap}
      className={classNames('rt-AppBarSection', 'rt-AppBarLeft', className)}
      {...props}
    >
      {children}
    </Flex>
  ),
);
AppBarLeft.displayName = 'AppBar.Left';

// ============================================================================
// AppBar Center
// ============================================================================

const AppBarCenter = React.forwardRef<AppBarSectionElement, AppBarSectionProps>(
  ({ gap = '2', align = 'center', justify = 'center', className, children, ...props }, forwardedRef) => (
    <Flex
      ref={forwardedRef}
      align={align}
      justify={justify}
      gap={gap}
      className={classNames('rt-AppBarSection', 'rt-AppBarCenter', className)}
      {...props}
    >
      {children}
    </Flex>
  ),
);
AppBarCenter.displayName = 'AppBar.Center';

// ============================================================================
// AppBar Right (for horizontal) / End (alias)
// ============================================================================

const AppBarRight = React.forwardRef<AppBarSectionElement, AppBarSectionProps>(
  ({ gap = '2', align = 'center', justify = 'end', className, children, ...props }, forwardedRef) => (
    <Flex
      ref={forwardedRef}
      align={align}
      justify={justify}
      gap={gap}
      className={classNames('rt-AppBarSection', 'rt-AppBarRight', className)}
      {...props}
    >
      {children}
    </Flex>
  ),
);
AppBarRight.displayName = 'AppBar.Right';

// ============================================================================
// AppBar Title
// ============================================================================

type AppBarTitleElement = React.ElementRef<typeof Heading>;
type AppBarTitleProps = React.ComponentPropsWithoutRef<typeof Heading>;

const AppBarTitle = React.forwardRef<AppBarTitleElement, AppBarTitleProps>(
  ({ className, size = '2', weight = 'medium', truncate = true, children, ...props }, forwardedRef) => (
    <Heading
      ref={forwardedRef}
      size={size}
      weight={weight}
      truncate={truncate}
      className={classNames('rt-AppBarTitle', className)}
      {...props}
    >
      {children}
    </Heading>
  ),
);
AppBarTitle.displayName = 'AppBar.Title';

// ============================================================================
// Exports
// ============================================================================

const AppBar = AppBarRoot as typeof AppBarRoot & {
  Root: typeof AppBarRoot;
  Left: typeof AppBarLeft;
  Center: typeof AppBarCenter;
  Right: typeof AppBarRight;
  Title: typeof AppBarTitle;
};

AppBar.Root = AppBarRoot;
AppBar.Left = AppBarLeft;
AppBar.Center = AppBarCenter;
AppBar.Right = AppBarRight;
AppBar.Title = AppBarTitle;

export {
  AppBar,
  AppBarRoot as Root,
  AppBarLeft as Left,
  AppBarCenter as Center,
  AppBarRight as Right,
  AppBarTitle as Title,
};
export type {
  AppBarRootProps as RootProps,
  AppBarSectionProps as LeftProps,
  AppBarSectionProps as CenterProps,
  AppBarSectionProps as RightProps,
  AppBarTitleProps as TitleProps,
};
