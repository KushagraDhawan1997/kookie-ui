'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import classNames from 'classnames';
import { composeEventHandlers, composeRefs, useLayoutEffect } from 'radix-ui/internal';

import { textFieldRootPropDefs, textFieldGroupPropDefs, textFieldSlotPropDefs, type TextFieldSlotScrubProps } from './text-field.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { mergeStyles } from '../helpers/merge-styles.js';
import { useThemeSizeProps } from '../hooks/theme-size.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { NotInputTextualAttributes } from '../helpers/input-attributes.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type TextFieldRootElement = React.ElementRef<'input'>;
type TextFieldRootOwnProps = GetPropDefTypes<typeof textFieldRootPropDefs> & {
  defaultValue?: string | number;
  value?: string | number;
  type?: 'date' | 'datetime-local' | 'email' | 'hidden' | 'month' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url' | 'week';
};
type TextFieldInputProps = ComponentPropsWithout<'input', NotInputTextualAttributes | 'color' | 'defaultValue' | 'size' | 'type' | 'value'>;
interface TextFieldRootProps extends TextFieldInputProps, TextFieldRootOwnProps {}

// Each Slot registers its id here, so the input can list slot content in aria-describedby. A scrub
// slot also registers its arrow-key step, and reads whether the field takes input at all.
type ScrubKeyHandler = (direction: 1 | -1, shiftKey: boolean, altKey: boolean) => void;
type TextFieldContextValue = {
  registerSlot: (id: string) => () => void;
  registerScrub: (handler: ScrubKeyHandler) => () => void;
  inert: boolean;
};
const TextFieldContext = React.createContext<TextFieldContextValue | null>(null);

// Clicking anything a person could mean to press keeps its own press: the guard is a focusability
// list, not a tag list. `[tabindex]` catches role-based widgets; `label` already redirects a click.
const FOCUSABLE_IN_SLOT = 'button, a, input, select, textarea, label, [tabindex], [contenteditable]';

// A Group decides the look of its fields: their size, variant and radius come from it. A field
// can still take its own color, and is disabled when either it or the group is.
type TextFieldGroupContextValue = Pick<TextFieldGroupOwnProps, 'size' | 'variant' | 'radius' | 'color' | 'disabled'>;
const TextFieldGroupContext = React.createContext<TextFieldGroupContextValue | null>(null);

const TextFieldRoot = React.forwardRef<TextFieldRootElement, TextFieldRootProps>((fieldProps, forwardedRef) => {
  const group = React.useContext(TextFieldGroupContext);
  const ownProps = group
    ? {
        ...fieldProps,
        size: group.size,
        variant: group.variant,
        radius: group.radius,
        color: fieldProps.color ?? group.color,
        disabled: Boolean(group.disabled || fieldProps.disabled),
      }
    : fieldProps;
  // The caller's className and style are kept apart from the size and variant classes: with an
  // error message they go on the wrapper, which is then the one box the parent lays out.
  const { className: ownClassName, style: ownStyle, ...themedProps } = useThemeSizeProps(ownProps, textFieldRootPropDefs.size);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { children, className, color, radius, style, ...inputProps } = extractProps(themedProps, textFieldRootPropDefs);
  const wrapped = Boolean(inputProps.errorMessage);

  // Generate unique IDs for accessibility
  const errorId = React.useId();

  // Slot content qualifies the value, so it describes the input (as in v2), in mount order.
  const [slotIds, setSlotIds] = React.useState<string[]>([]);
  const registerSlot = React.useCallback((id: string) => {
    setSlotIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => setSlotIds((prev) => prev.filter((slotId) => slotId !== id));
  }, []);
  const scrubKeyRef = React.useRef<ScrubKeyHandler | null>(null);
  const registerScrub = React.useCallback((handler: ScrubKeyHandler) => {
    scrubKeyRef.current = handler;
    return () => {
      if (scrubKeyRef.current === handler) scrubKeyRef.current = null;
    };
  }, []);
  // A disabled or read-only field takes no input, so its slot does not scrub or step either.
  const inert = Boolean(inputProps.disabled || inputProps.readOnly);
  const contextValue = React.useMemo(() => ({ registerSlot, registerScrub, inert }), [registerSlot, registerScrub, inert]);

  const { 'aria-describedby': ariaDescribedby, 'aria-labelledby': ariaLabelledby, 'aria-invalid': ariaInvalid } = inputProps;

  // Invalid when `error` is set or the caller passes aria-invalid; the CSS keys on aria-invalid only.
  const isInvalid = Boolean(inputProps.error) || ariaInvalid === true || ariaInvalid === 'true';

  // Build aria-describedby string. The caller's ids stay; ours are appended.
  const describedBy = React.useMemo(() => {
    const parts = [];
    if (inputProps.errorMessage) parts.push(errorId);
    if (ariaDescribedby) parts.push(ariaDescribedby);
    parts.push(...slotIds);
    return parts.length > 0 ? parts.join(' ') : undefined;
  }, [inputProps.errorMessage, ariaDescribedby, errorId, slotIds]);

  // Build aria attributes
  const ariaProps = React.useMemo(
    () => ({
      'aria-invalid': isInvalid ? true : ariaInvalid,
      'aria-describedby': describedBy,
      'aria-labelledby': ariaLabelledby,
    }),
    [isInvalid, ariaInvalid, describedBy, ariaLabelledby],
  );

  // Filter out our custom props to avoid DOM warnings
  const { error, errorMessage, required, 'aria-describedby': _ariaDescribedby, 'aria-labelledby': _ariaLabelledby, onKeyDown, ...nativeInputProps } = inputProps;

  // With a scrub slot, Up and Down step the value at once, by the slot's step, with the same Shift
  // and Option multipliers as a drag. The caller's handler runs first and can prevent it.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const step = scrubKeyRef.current;
    if (!step || inert || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
    event.preventDefault();
    step(event.key === 'ArrowUp' ? 1 : -1, event.shiftKey, event.altKey);
  };

  // Clicking the padding or a passive slot focuses the input. preventDefault stops the browser
  // from moving focus to the root first, so the input is focused once, synchronously.
  const handleMouseDown = React.useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest(FOCUSABLE_IN_SLOT)) return;

    const input = inputRef.current;
    if (!input) return;

    // Same selector as in the CSS to find the right slot
    const isRightSlot = target.closest(`
        .kui-TextFieldSlot[data-side='right'],
        .kui-TextFieldSlot:not([data-side='right']) ~ .kui-TextFieldSlot:not([data-side='left'])
      `);

    const cursorPosition = isRightSlot ? input.value.length : 0;

    event.preventDefault();
    input.focus();
    // Only some input types support this, browsers will throw an error if not supported
    // See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange#:~:text=Note%20that%20according,not%20support%20selection%22.
    try {
      input.setSelectionRange(cursorPosition, cursorPosition);
    } catch {}
  }, []);

  // A pointer-only hit-target redirect to the input; keyboard users reach the input directly.
  const field = (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      data-accent-color={color}
      data-radius={radius}
      style={wrapped ? style : mergeStyles(style, ownStyle)}
      className={classNames('kui-TextFieldRoot', className, !wrapped && ownClassName, {
        // Not used by the library's CSS (invalid styling keys on aria-invalid); kept as a hook for app styles.
        'kui-error': isInvalid,
      })}
      onMouseDown={handleMouseDown}
    >
      <input
        {...nativeInputProps}
        required={required || undefined}
        {...ariaProps}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
        ref={composeRefs(inputRef, forwardedRef)}
        className="kui-reset kui-TextFieldInput"
      />
      <TextFieldContext.Provider value={contextValue}>{children}</TextFieldContext.Provider>
    </div>
  );
  // The wrapper is always there, so a message coming or going never moves the field in the tree:
  // moving it would remount the input, dropping focus, the caret and an uncontrolled value. With
  // no message it is `display: contents` and the field is the box the parent lays out; with one
  // it holds the field and the message below it, and the caller's className and style size the pair.
  return (
    <div className={classNames('kui-TextFieldWrapper', wrapped && ownClassName)} style={wrapped ? ownStyle : undefined} data-message={wrapped || undefined}>
      {field}
      {wrapped ? (
        <div id={errorId} className="kui-TextFieldErrorMessage" role="alert">
          {inputProps.errorMessage}
        </div>
      ) : null}
    </div>
  );
});
TextFieldRoot.displayName = 'TextField.Root';

type TextFieldGroupOwnProps = GetPropDefTypes<typeof textFieldGroupPropDefs>;
interface TextFieldGroupProps extends ComponentPropsWithout<'div', RemovedProps>, TextFieldGroupOwnProps {}

/**
 * Joins two or more fields into one, such as X, Y and Z: one edge, square inner corners and a
 * hairline between the fields. The group draws the edge, so each field keeps only its fill.
 */
const TextFieldGroup = React.forwardRef<HTMLDivElement, TextFieldGroupProps>((ownProps, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, textFieldGroupPropDefs.size);
  const { size, variant, radius, color, disabled } = props;
  const { className, children, radius: _radius, color: _color, disabled: _disabled, ...domProps } = extractProps(props, textFieldGroupPropDefs);
  const contextValue = React.useMemo(() => ({ size, variant, radius, color, disabled }), [size, variant, radius, color, disabled]);
  return (
    <div
      role="group"
      data-accent-color={color}
      data-radius={radius}
      data-disabled={disabled || undefined}
      {...domProps}
      ref={forwardedRef}
      className={classNames('kui-TextFieldGroup', className)}
    >
      <TextFieldGroupContext.Provider value={contextValue}>{children}</TextFieldGroupContext.Provider>
    </div>
  );
});
TextFieldGroup.displayName = 'TextField.Group';

type TextFieldSlotElement = React.ElementRef<'div'>;
type TextFieldSlotOwnProps = GetPropDefTypes<typeof textFieldSlotPropDefs> & TextFieldSlotScrubProps;
interface TextFieldSlotProps extends ComponentPropsWithout<'div', RemovedProps>, TextFieldSlotOwnProps {}

const TextFieldSlot = React.forwardRef<TextFieldSlotElement, TextFieldSlotProps>((props, forwardedRef) => {
  // Extract scrub props first (not part of PropDef system)
  const { scrub: scrubProp, scrubValue, scrubStep = 1, scrubSensitivity = 1, scrubMin, scrubMax, scrubShiftMultiplier = 10, scrubAltMultiplier = 0.1, onScrub, ...restProps } = props;

  // Then extract styling props
  const { className, color, side, onPointerDown, onPointerMove, onPointerUp, onLostPointerCapture, ...slotProps } = extractProps(
    restProps,
    textFieldSlotPropDefs,
  );

  // A slot of text describes the input (see TextFieldRoot); a caller's own id is kept. A slot
  // holding a control, such as a show-password button, does not: the input would be described
  // by the button's name.
  const generatedId = React.useId();
  const slotId = slotProps.id ?? generatedId;
  const fieldContext = React.useContext(TextFieldContext);
  const registerSlot = fieldContext?.registerSlot;
  const registerScrub = fieldContext?.registerScrub;
  const scrub = Boolean(scrubProp) && !fieldContext?.inert;
  const slotRef = React.useRef<HTMLDivElement>(null);
  // Unknown until the slot has rendered; it registers once it is known to hold only text.
  const [holdsControl, setHoldsControl] = React.useState<boolean | null>(null);
  useLayoutEffect(() => {
    const next = Boolean(slotRef.current?.querySelector(FOCUSABLE_IN_SLOT));
    setHoldsControl((prev) => (prev === next ? prev : next));
  });
  React.useEffect(() => (holdsControl === false ? registerSlot?.(slotId) : undefined), [registerSlot, slotId, holdsControl]);

  const [isScrubbing, setIsScrubbing] = React.useState(false);
  // Where the virtual cursor starts. Movement is written straight to the cursor element, so a
  // scrub does not re-render the slot on every mouse move.
  const [cursorStart, setCursorStart] = React.useState({ x: 0, y: 0 });
  const cursorRef = React.useRef<HTMLImageElement>(null);
  // Virtual cursor Y, tracked beside virtualX
  const virtualY = React.useRef(0);

  // Track accumulated sub-step movement for precision
  const accumulatedMovement = React.useRef(0);
  // Track current value for clamping (initialized to scrubValue when scrubbing starts)
  const currentValue = React.useRef(0);
  // Track virtual X position for wrap-around (separate from rendered position)
  const virtualX = React.useRef(0);
  // Track pointer ID for capture mode
  const pointerIdRef = React.useRef<number | null>(null);
  // Track last X position for capture mode (movementX calculation)
  const lastXRef = React.useRef(0);

  // Store scrub config in refs so document handlers can access latest values
  const scrubConfigRef = React.useRef({
    scrubValue,
    scrubStep,
    scrubSensitivity,
    scrubMin,
    scrubMax,
    scrubShiftMultiplier,
    scrubAltMultiplier,
    onScrub,
  });
  scrubConfigRef.current = {
    scrubValue,
    scrubStep,
    scrubSensitivity,
    scrubMin,
    scrubMax,
    scrubShiftMultiplier,
    scrubAltMultiplier,
    onScrub,
  };

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (!scrub) return;

      // Don't start scrubbing if clicking on interactive elements
      const target = event.target as HTMLElement;
      if (target.closest(FOCUSABLE_IN_SLOT)) return;

      event.preventDefault();
      accumulatedMovement.current = 0;
      // Initialize to current value so min/max clamping works correctly
      currentValue.current = scrubValue ?? 0;

      // Initialize virtual cursor at actual mouse position
      virtualX.current = event.clientX;
      virtualY.current = event.clientY;
      setCursorStart({ x: event.clientX, y: event.clientY });

      const slot = slotRef.current;
      if (!slot) return;

      // Pointer capture in every browser. Pointer lock gave endless travel in Chrome, but Chrome
      // shows its "Press Esc to show your cursor" banner on every drag, which is noise for a
      // gesture repeated all day. Captured, the drag keeps going past the window, up to the edge
      // of the screen.
      pointerIdRef.current = event.pointerId;
      lastXRef.current = event.clientX;
      slot.setPointerCapture(event.pointerId);
      setIsScrubbing(true);
    },
    [scrub, scrubValue],
  );

  // Shared scrub calculation logic
  const processScrubMovement = React.useCallback((movementX: number, movementY: number, shiftKey: boolean, altKey: boolean) => {
    const config = scrubConfigRef.current;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Update virtual position with wrap-around at viewport edges
    virtualX.current += movementX;
    if (virtualX.current > viewportWidth) {
      virtualX.current = virtualX.current % viewportWidth;
    } else if (virtualX.current < 0) {
      virtualX.current = viewportWidth + (virtualX.current % viewportWidth);
    }

    // Also track Y with wrap-around
    let newY = virtualY.current + movementY;
    if (newY > viewportHeight) {
      newY = newY % viewportHeight;
    } else if (newY < 0) {
      newY = viewportHeight + (newY % viewportHeight);
    }
    virtualY.current = newY;

    const cursor = cursorRef.current;
    if (cursor) {
      cursor.style.left = `${virtualX.current}px`;
      cursor.style.top = `${newY}px`;
    }

    // Accumulate movement for sensitivity calculation
    accumulatedMovement.current += movementX;

    // Calculate how many steps we've moved
    const stepsFromMovement = accumulatedMovement.current / config.scrubSensitivity;

    if (Math.abs(stepsFromMovement) >= 1) {
      // Determine modifier multiplier
      let multiplier = 1;
      if (shiftKey) {
        multiplier = config.scrubShiftMultiplier;
      } else if (altKey) {
        multiplier = config.scrubAltMultiplier;
      }

      // Calculate delta
      const wholeSteps = Math.trunc(stepsFromMovement);
      const delta = wholeSteps * config.scrubStep * multiplier;

      // Apply min/max clamping if bounds are set
      let clampedDelta = delta;
      if (config.scrubMin !== undefined || config.scrubMax !== undefined) {
        const newValue = currentValue.current + delta;
        const clampedValue = Math.max(config.scrubMin ?? -Infinity, Math.min(config.scrubMax ?? Infinity, newValue));
        clampedDelta = clampedValue - currentValue.current;
        currentValue.current = clampedValue;
      } else {
        currentValue.current += delta;
      }

      // Fire callback with clamped delta (isChanging = true during drag)
      if (clampedDelta !== 0) {
        config.onScrub?.(clampedDelta, true);
      }

      // Keep the fractional remainder for smooth sub-pixel accumulation
      accumulatedMovement.current = (stepsFromMovement - wholeSteps) * config.scrubSensitivity;
    }
  }, []);

  // End scrubbing helper
  const endScrubbing = React.useCallback(() => {
    scrubConfigRef.current.onScrub?.(0, false);
    accumulatedMovement.current = 0;
    currentValue.current = 0;
    pointerIdRef.current = null;
    setIsScrubbing(false);
  }, []);

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent) => {
      if (!isScrubbing) return;

      const movementX = event.clientX - lastXRef.current;
      lastXRef.current = event.clientX;

      processScrubMovement(movementX, event.movementY, event.shiftKey, event.altKey);
    },
    [isScrubbing, processScrubMovement],
  );

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;

      const slot = slotRef.current;
      if (slot && pointerIdRef.current !== null) {
        slot.releasePointerCapture(pointerIdRef.current);
      }
      endScrubbing();
    },
    [endScrubbing],
  );

  const handleLostPointerCapture = React.useCallback(() => {
    if (isScrubbing) {
      endScrubbing();
    }
  }, [isScrubbing, endScrubbing]);

  // Hide native cursor and disable text selection during pointer capture scrubbing
  React.useEffect(() => {
    if (!isScrubbing) return;

    // Create a style element to hide cursor globally during scrub
    const style = document.createElement('style');
    style.textContent = '* { cursor: none !important; user-select: none !important; }';
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isScrubbing]);

  // Up and Down on the input step once. The step is a whole change, so it reports isChanging
  // false at once: one undo step per press, as a drag is one per release.
  React.useEffect(() => {
    if (!scrub || !registerScrub) return;
    return registerScrub((direction, shiftKey, altKey) => {
      const config = scrubConfigRef.current;
      const multiplier = shiftKey ? config.scrubShiftMultiplier : altKey ? config.scrubAltMultiplier : 1;
      const start = config.scrubValue ?? 0;
      const next = Math.max(config.scrubMin ?? -Infinity, Math.min(config.scrubMax ?? Infinity, start + direction * config.scrubStep * multiplier));
      if (next !== start) config.onScrub?.(next - start, false);
    });
  }, [scrub, registerScrub]);

  // Render virtual cursor via portal to body so it's not clipped
  // Using a data URI of ew-resize cursor for a native look
  const virtualCursor = isScrubbing
    ? ReactDOM.createPortal(
        <img
          ref={cursorRef}
          className="kui-TextFieldSlotScrubCursor"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='black' stroke='white' stroke-width='1' d='M0 12 L5 7 L5 10 L19 10 L19 7 L24 12 L19 17 L19 14 L5 14 L5 17 Z'/%3E%3C/svg%3E"
          alt=""
          style={{
            position: 'fixed',
            left: cursorStart.x,
            top: cursorStart.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 99999,
            width: 24,
            height: 24,
          }}
          aria-hidden="true"
        />,
        document.body,
      )
    : null;

  return (
    <div
      data-accent-color={color}
      data-side={side}
      data-scrub={scrub || undefined}
      data-scrubbing={isScrubbing || undefined}
      {...slotProps}
      id={slotId}
      ref={composeRefs(slotRef, forwardedRef)}
      className={classNames('kui-TextFieldSlot', className)}
      // The caller's handlers run first; the scrub handlers only when `scrub` is set.
      onPointerDown={scrub ? composeEventHandlers(onPointerDown, handlePointerDown) : onPointerDown}
      onPointerMove={scrub ? composeEventHandlers(onPointerMove, handlePointerMove) : onPointerMove}
      onPointerUp={scrub ? composeEventHandlers(onPointerUp, handlePointerUp) : onPointerUp}
      onLostPointerCapture={scrub ? composeEventHandlers(onLostPointerCapture, handleLostPointerCapture) : onLostPointerCapture}
    >
      {slotProps.children}
      {virtualCursor}
    </div>
  );
});
TextFieldSlot.displayName = 'TextField.Slot';

export { TextFieldRoot as Root, TextFieldGroup as Group, TextFieldSlot as Slot };
export type { TextFieldRootProps as RootProps, TextFieldGroupProps as GroupProps, TextFieldSlotProps as SlotProps };
