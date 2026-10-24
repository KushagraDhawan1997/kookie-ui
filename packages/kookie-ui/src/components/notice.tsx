'use client';

/**
 * Notice and Confirmation — what the app tells the person while it is true.
 *
 * Two questions place every message: what is it about, and what made it appear.
 *
 * - **Notice** — a condition that is true now, which nobody just caused: a usage limit, a
 *   connection lost, a goal that finished. It takes space in the layout and never floats, so it
 *   cannot cover what it is about. At most one action, and that action FIXES the condition. A
 *   dismiss button only ACKNOWLEDGES it, and the app owns that state (`onDismiss`), because a
 *   component cannot remember a dismissal across a reload.
 * - **Confirmation** — a question that waits for an answer: a quiet no before a loud yes, and no
 *   dismiss button, because closing a question does not answer it. It never takes focus, so a
 *   person can answer in the composer instead.
 *
 * Placement is the caller's. In a chat, both go in `Chatbar.Root`'s `notices`.
 * A notice with no action and no dismiss button is just a sentence: use `Text`.
 */

import * as React from 'react';
import classNames from 'classnames';

import { Button } from './button.js';
import { Text } from './text.js';
import { ThemeSizeContext, useThemeSize } from '../helpers/theme-size.js';
import { accentColorPropDef } from '../props/color.prop.js';

type NoticeSize = '1' | '2' | '3' | '4';

/** The size a notice takes when it doesn't set one. `Chatbar.Root` provides its own size here. */
const NoticeSizeContext = React.createContext<NoticeSize | undefined>(undefined);

/** Notice's own range, the Theme's four sizes. */
const noticeSizePropDef = { values: ['1', '2', '3', '4'] as const };
type NoticeColor = (typeof accentColorPropDef)['color']['values'][number];

interface StripProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'children'> {
  /** Padding, text and button size. Defaults to the nearest Theme's size. */
  size?: NoticeSize;
  /**
   * The category of the message, not its volume. Default `gray`. Use a colour only when it adds a
   * fact the words don't already give, such as `red` for something that stops the next step.
   */
  color?: NoticeColor;
  /** The message. */
  children: React.ReactNode;
}

interface NoticeProps extends StripProps {
  /** An icon before the message. It is hidden from assistive technology. */
  icon?: React.ReactNode;
  /**
   * One action that fixes the condition, such as `<Button>Add credits</Button>`. A control in it
   * that sets no `size` takes the notice's size.
   */
  action?: React.ReactNode;
  /**
   * Called when the person presses the dismiss button, which shows only when this is set.
   * Dismissing hides the message; it does not fix the condition. Remove the notice and remember
   * the choice in your app.
   */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. Default "Dismiss". */
  dismissLabel?: string;
}

interface ConfirmationProps extends StripProps {
  /** The yes. Name the action, such as "Run" or "Allow up to $18". */
  confirmLabel: string;
  /** The no. Default "Not now". */
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** The yes is running: it shows a spinner and the no is disabled. */
  busy?: boolean;
}

const Strip = React.forwardRef<HTMLDivElement, StripProps & { kind: 'notice' | 'confirmation'; trailing: React.ReactNode; leading?: React.ReactNode }>(
  ({ kind, size = '2', color = 'gray', className, children, trailing, leading, ...props }, forwardedRef) => (
    <div
      role="status"
      aria-live="polite"
      {...props}
      ref={forwardedRef}
      className={classNames('kui-NoticeRoot', `kui-r-size-${size}`, className)}
      data-kind={kind}
      data-accent-color={color}
    >
      {leading ? (
        <span className="kui-NoticeIcon" aria-hidden>
          {leading}
        </span>
      ) : null}
      <Text as="div" size={size} className="kui-NoticeText">
        {children}
      </Text>
      {trailing}
    </div>
  ),
);
Strip.displayName = 'Strip';

/** A condition that is true now, with at most one action that fixes it. */
const Notice = React.forwardRef<HTMLDivElement, NoticeProps>(({ icon, action, onDismiss, dismissLabel = 'Dismiss', size: sizeProp, ...props }, forwardedRef) => {
  const contextSize = React.useContext(NoticeSizeContext);
  const size = useThemeSize(sizeProp ?? contextSize, noticeSizePropDef);
  const trailing =
    action || onDismiss ? (
      <span className="kui-NoticeActions">
        {action ? <ThemeSizeContext.Provider value={size}>{action}</ThemeSizeContext.Provider> : null}
        {onDismiss ? (
          <Button iconOnly size={size} variant="ghost" color="gray" aria-label={dismissLabel} className="kui-NoticeDismiss" onClick={onDismiss}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <path d="M4 4l7 7M11 4l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Button>
        ) : null}
      </span>
    ) : null;
  return <Strip {...props} size={size} ref={forwardedRef} kind="notice" leading={icon} trailing={trailing} />;
});
Notice.displayName = 'Notice';

/** A question that waits for an answer: a quiet no, a loud yes, and no dismiss button. */
const Confirmation = React.forwardRef<HTMLDivElement, ConfirmationProps>(
  ({ confirmLabel, cancelLabel = 'Not now', onConfirm, onCancel, busy = false, size: sizeProp, color = 'gray', ...props }, forwardedRef) => {
    const contextSize = React.useContext(NoticeSizeContext);
    const size = useThemeSize(sizeProp ?? contextSize, noticeSizePropDef);
    return (
    <Strip
      {...props}
      size={size}
      color={color}
      ref={forwardedRef}
      kind="confirmation"
      trailing={
        <span className="kui-NoticeActions">
          <Button size={size} variant="ghost" color="gray" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button size={size} variant="solid" color={color} loading={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </span>
      }
    />
    );
  },
);
Confirmation.displayName = 'Confirmation';

export { Notice, Confirmation, NoticeSizeContext };
export type { NoticeProps, ConfirmationProps };
