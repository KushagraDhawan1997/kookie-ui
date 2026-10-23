import * as React from 'react';
import classNames from 'classnames';
import { Toggle as TogglePrimitive } from 'radix-ui';
import { Button } from './button.js';
import type { ButtonIconOnlyProps, ButtonProps, ButtonRankProps } from './button.js';
import { useToggleState } from '../hooks/use-toggle-state.js';

type ToggleOwnProps = {
  /** Whether the toggle is on. The controlled counterpart of `defaultPressed`. */
  pressed?: boolean;
  /** Fires when the pressed state changes, with the new state. */
  onPressedChange?: (pressed: boolean) => void;
  /** Whether the toggle starts on. The uncontrolled counterpart of `pressed`. */
  defaultPressed?: boolean;
};

/**
 * Toggle takes every `Button` prop except `as`. Set `iconOnly` for a square toggle holding only
 * an icon; the type then requires `aria-label` or `aria-labelledby`.
 */
type ToggleProps = Omit<ButtonProps<'button'>, 'as' | 'variant' | 'emphasis' | 'iconOnly'> &
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
    const { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy } = buttonProps as {
      'aria-label'?: string;
      'aria-labelledby'?: string;
    };

    // The label behind aria-labelledby is read once per id, not on every press.
    const cachedLabelRef = React.useRef<string | null>(null);
    React.useEffect(() => {
      cachedLabelRef.current = null;
    }, [ariaLabelledBy]);

    /**
     * The name announced when the pressed state changes: aria-label, then the label
     * aria-labelledby points at, then visible text.
     */
    const getAccessibleName = React.useCallback(() => {
      if (ariaLabel) return ariaLabel;
      if (ariaLabelledBy) {
        if (cachedLabelRef.current === null) {
          cachedLabelRef.current = document.getElementById(ariaLabelledBy)?.textContent || 'Toggle';
        }
        return cachedLabelRef.current;
      }
      if (typeof children === 'string') return children;
      if (React.isValidElement(children) && typeof (children.props as { children?: unknown })?.children === 'string') {
        return (children.props as { children: string }).children;
      }
      return 'Toggle';
    }, [ariaLabel, ariaLabelledBy, children]);

    // Shared toggle state hook: accessibility announcements and controlled-state warnings.
    const { handlePressedChange } = useToggleState({
      pressed,
      onPressedChange,
      getAccessibleName,
      componentName: 'Toggle',
    });

    return (
      <TogglePrimitive.Root pressed={pressed} onPressedChange={handlePressedChange} defaultPressed={defaultPressed} asChild>
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
