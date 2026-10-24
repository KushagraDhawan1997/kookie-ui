'use client';

/**
 * MessageScroller — a transcript that follows a conversation.
 *
 * The behaviour is shadcn/ui's Message Scroller primitive (`@shadcn/react/message-scroller`,
 * MIT, https://ui.shadcn.com). Streaming, anchoring a new turn, keeping your place when history
 * loads above, and jumping back to the latest are a body of edge cases nobody should rewrite, so
 * Kookie takes the primitive and adds only the surface: the parts, the class names, the button.
 *
 * Anatomy
 * ```tsx
 * <MessageScroller.Root>
 *   <MessageScroller.Viewport aria-label="Conversation">
 *     <MessageScroller.Content>
 *       <MessageScroller.Item messageId="u1" scrollAnchor>…</MessageScroller.Item>
 *       <MessageScroller.Item messageId="a1">…</MessageScroller.Item>
 *     </MessageScroller.Content>
 *   </MessageScroller.Viewport>
 *   <MessageScroller.Button aria-label="Jump to the latest" />
 * </MessageScroller.Root>
 * ```
 *
 * The viewport is its own scroller. Kookie's `ScrollArea` is Radix's, and Radix cannot hand its
 * viewport element to another library, so the transcript scrolls natively with a thin scrollbar.
 *
 * Requires React 19, which the primitive needs: it reads `ref` as a prop. On React 18 refs and
 * the scroll fade are lost, and a development build warns once.
 */

import * as React from 'react';
import classNames from 'classnames';
import {
  MessageScroller as Primitive,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
  type MessageScrollerDefaultScrollPosition,
  type MessageScrollerScrollOptions,
  type MessageScrollerScrollable,
  type MessageScrollerVisibilityState,
} from '@shadcn/react/message-scroller';

import { useComposedRefs } from 'radix-ui/internal';

import { Button as KuiButton } from './button.js';
import { useScrollEdges } from '../hooks/use-scroll-edges.js';
import type { ButtonProps as KuiButtonProps, ButtonRankProps } from './button.js';

interface RootProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Keeps the newest content in view while the reader is at the end. Default `true`.
   * Once the reader scrolls up, the transcript stays where they are until they return.
   */
  autoScroll?: boolean;
  /** Where the transcript opens: `end` (default), `start`, or the last anchored message. */
  defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
  /** Distance in pixels from the end that still counts as "at the end". */
  scrollEdgeThreshold?: number;
  /** Space in pixels kept above a message when one is scrolled to or anchored. */
  scrollMargin?: number;
}

let warnedReactVersion = false;

/** The primitive reads `ref` as a prop, which React 18 strips. Development only, once per page. */
function useReact19Check() {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || warnedReactVersion) return;
    if (Number.parseInt(React.version, 10) >= 19) return;
    warnedReactVersion = true;
    console.warn(`[kookie-ui] MessageScroller needs React 19; this page runs React ${React.version}. Refs and the scroll fade will not work.`);
  }, []);
}

/** Holds the scroll state. Everything else goes inside it. */
const Root = React.forwardRef<HTMLDivElement, RootProps>(({ autoScroll = true, defaultScrollPosition = 'end', scrollEdgeThreshold, scrollMargin, className, children, ...props }, forwardedRef) => {
  useReact19Check();
  return (
    <Primitive.Provider
      autoScroll={autoScroll}
      defaultScrollPosition={defaultScrollPosition}
      {...(scrollEdgeThreshold != null ? { scrollEdgeThreshold } : {})}
      {...(scrollMargin != null ? { scrollMargin } : {})}
    >
      <Primitive.Root {...props} ref={forwardedRef} className={classNames('kui-MessageScrollerRoot', className)}>
        {children}
      </Primitive.Root>
    </Primitive.Provider>
  );
});
Root.displayName = 'MessageScroller.Root';

interface ViewportProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Name of the transcript region, e.g. "Conversation". */
  'aria-label'?: string;
  /** Keep the reader's place when older messages are added above. Default `true`. */
  preserveScrollOnPrepend?: boolean;
  /**
   * Fades messages toward the top and bottom edges while there is more past them. A floating
   * band over an edge (a toolbar, a goal tray, a composer) can set `--scroll-fade-start` or
   * `--scroll-fade-end` to its height, so messages fade as they pass under it. Default `true`.
   */
  fade?: boolean;
}

/** The scrolling element. */
const Viewport = React.forwardRef<HTMLDivElement, ViewportProps>(({ className, 'aria-label': label, fade = true, ...props }, forwardedRef) => {
  const setEdgesElement = useScrollEdges<HTMLDivElement>(fade);
  const ref = useComposedRefs(forwardedRef, setEdgesElement);
  return (
    // The primitive names an unnamed viewport "Messages", in English. An empty name is skipped by
    // accessible-name computation, so a transcript is only named when the app names it.
    <Primitive.Viewport aria-label={label ?? ''} {...props} ref={ref} data-fade={fade ? '' : undefined} className={classNames('kui-MessageScrollerViewport', className)} />
  );
});
Viewport.displayName = 'MessageScroller.Viewport';

type ContentProps = React.ComponentPropsWithoutRef<'div'>;

/** The list of messages, inside the viewport. */
const Content = React.forwardRef<HTMLDivElement, ContentProps>(({ className, ...props }, forwardedRef) => (
  <Primitive.Content {...props} ref={forwardedRef} className={classNames('kui-MessageScrollerContent', className)} />
));
Content.displayName = 'MessageScroller.Content';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  /** A stable id, so the row can be scrolled to with `useMessageScroller().scrollToMessage`. */
  messageId?: string;
  /** Anchor this row near the top when it arrives. Set it on the person's own messages. */
  scrollAnchor?: boolean;
}

/** One row of the transcript. */
const Item = React.forwardRef<HTMLDivElement, ItemProps>(({ className, ...props }, forwardedRef) => (
  <Primitive.Item {...props} ref={forwardedRef} className={classNames('kui-MessageScrollerItem', className)} />
));
Item.displayName = 'MessageScroller.Item';

type ButtonProps = Omit<KuiButtonProps, 'aria-label' | 'aria-labelledby' | 'variant' | 'emphasis' | 'iconOnly' | 'fullWidth'> &
  ButtonRankProps & {
    /** Accessible name, in your words. Default "Jump to the latest". */
    'aria-label'?: string;
    /** `end` jumps to the latest message (default); `start` to the first. */
    direction?: 'start' | 'end';
    /** Scroll behaviour of the jump. Default `auto`, an instant jump with no long animation. */
    behavior?: ScrollBehavior;
  };

/**
 * Jumps back to the latest message. It renders only while the reader is away from the end.
 * Place it inside `Root`, after the viewport. It sits over the viewport's bottom edge.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ direction = 'end', behavior = 'auto', className, children, size, variant = 'surface', emphasis, color = 'gray', radius = 'full', 'aria-label': label, onClick, ...props }, forwardedRef) => {
    const { scrollToEnd, scrollToStart } = useMessageScroller();

    // The primitive blurs the button on click, which drops keyboard focus to the page. Kookie
    // jumps itself and moves focus to the viewport instead, since the button hides at the end.
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      const viewport = event.currentTarget.closest('.kui-MessageScrollerRoot')?.querySelector<HTMLElement>('.kui-MessageScrollerViewport');
      viewport?.focus({ preventScroll: true });
      if (direction === 'start') scrollToStart({ behavior });
      else scrollToEnd({ behavior });
    };

    return (
      <Primitive.Button
        direction={direction}
        behavior={behavior}
        onClick={handleClick}
        render={
          <KuiButton
            iconOnly
            {...props}
            ref={forwardedRef}
            size={size}
            {...(emphasis ? { emphasis } : { variant })}
            color={color}
            radius={radius}
            aria-label={label ?? (direction === 'end' ? 'Jump to the latest' : 'Jump to the first')}
            className={classNames('kui-MessageScrollerButton', className)}
            data-direction={direction}
          >
            {children ?? (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden style={direction === 'start' ? { transform: 'rotate(180deg)' } : undefined}>
                <path d="M7.5 2.5v10M3.5 8.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </KuiButton>
        }
      />
    );
  },
);
Button.displayName = 'MessageScroller.Button';

export { Root, Viewport, Content, Item, Button, useMessageScroller, useMessageScrollerScrollable, useMessageScrollerVisibility };
export type {
  RootProps as MessageScrollerRootProps,
  ViewportProps as MessageScrollerViewportProps,
  ContentProps as MessageScrollerContentProps,
  ItemProps as MessageScrollerItemProps,
  ButtonProps as MessageScrollerButtonProps,
  MessageScrollerDefaultScrollPosition,
  MessageScrollerScrollOptions,
  MessageScrollerScrollable,
  MessageScrollerVisibilityState,
};
