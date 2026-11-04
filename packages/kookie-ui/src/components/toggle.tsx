import * as React from 'react';
import classNames from 'classnames';
import { Toggle as TogglePrimitive } from 'radix-ui';
import { Button } from './button.js';
import type { ButtonIconOnlyProps, ButtonProps, ButtonRankProps } from './button.js';

type ToggleOwnProps = {
  /** Whether the toggle is on. The controlled counterpart of `defaultPressed`. */
  pressed?: boolean;
  /** Fires when the pressed state changes, with the new state. */
  onPressedChange?: (pressed: boolean) => void;
  /** Whether the toggle starts on. The uncontrolled counterpart of `pressed`. */
  defaultPressed?: boolean;
};

/**
 * Toggle takes every `Button` prop except `as` and `done`: a toggle's state is `pressed`, and a
 * tick in place of its icon would read as a second state. Set `iconOnly` for a square toggle holding only
 * an icon; the type then requires `aria-label` or `aria-labelledby`.
 */
type ToggleProps = Omit<ButtonProps<'button'>, 'as' | 'variant' | 'emphasis' | 'iconOnly' | 'done'> &
  ButtonRankProps &
  ButtonIconOnlyProps &
  ToggleOwnProps;

type ToggleElement = React.ElementRef<typeof Button>;

/**
 * A button that stays pressed: bold in a formatting bar, a filter that is on or off. One
 * control, two states, `aria-pressed` from the primitive. It is a `Button` in every other
 * respect, and wears Button's pressed look while on.
 *
 * Picking one of several is a `SegmentedControl`.
 *
 * @example
 * ```tsx
 * <Toggle defaultPressed={false}>Show hidden</Toggle>
 *
 * <Toggle iconOnly aria-label="Bold" pressed={bold} onPressedChange={setBold}>
 *   <BoldIcon />
 * </Toggle>
 * ```
 */
const Toggle = React.forwardRef<ToggleElement, ToggleProps>(
  ({ pressed, onPressedChange, defaultPressed, children, className, ...buttonProps }, forwardedRef) => {
    // `done` is not a Toggle prop; a call that slips past the type drops it rather than showing a tick.
    delete (buttonProps as { done?: boolean }).done;
    // aria-pressed is the whole announcement: a screen reader reads the new state on its own.
    const warnedRef = React.useRef(false);
    React.useEffect(() => {
      if (
        process.env.NODE_ENV === 'development' &&
        pressed !== undefined &&
        onPressedChange === undefined &&
        !warnedRef.current
      ) {
        warnedRef.current = true;
        console.warn(
          'Toggle: You provided a `pressed` prop without an `onPressedChange` handler. ' +
            'This will result in a read-only toggle button. If you want the button to be interactive, ' +
            'you should provide an `onPressedChange` handler.',
        );
      }
    }, [pressed, onPressedChange]);

    return (
      <TogglePrimitive.Root pressed={pressed} onPressedChange={onPressedChange} defaultPressed={defaultPressed} asChild>
        <Button {...(buttonProps as ButtonProps)} ref={forwardedRef} className={classNames('kui-Toggle', className)}>
          {children}
        </Button>
      </TogglePrimitive.Root>
    );
  },
);
Toggle.displayName = 'Toggle';

export { Toggle };
export type { ToggleProps };
