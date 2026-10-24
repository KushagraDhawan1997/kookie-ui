import * as React from 'react';
import classNames from 'classnames';
import { Direction, Slider as SliderPrimitive } from 'radix-ui';

import { sliderPropDefs } from './slider.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';

import type { ComponentPropsWithout } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type SliderElement = React.ElementRef<typeof SliderPrimitive.Root>;
type SliderOwnProps = GetPropDefTypes<typeof sliderPropDefs>;
interface SliderProps extends ComponentPropsWithout<typeof SliderPrimitive.Root, 'asChild' | 'color' | 'children' | 'defaultChecked'>, SliderOwnProps {
  ticks?: Array<{ value: number; label?: string }>;
  unit?: string;
}
const Slider = React.forwardRef<SliderElement, SliderProps>((ownProps, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, sliderPropDefs.size);
  const { className, color, radius, tabIndex, ...sliderProps } = extractProps(props, sliderPropDefs);
  const {
    ticks,
    unit,
    showTickLabels,
    snapToTicks,
    value: valueProp,
    defaultValue,
    onValueChange,
    onValueCommit,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rootProps
  } = sliderProps;
  const min = rootProps.min ?? 0;
  const max = rootProps.max ?? 100;

  // The slider keeps its own copy of the value when uncontrolled, so the handles, their
  // labels and a tick press all read the current value rather than the first one.
  const [uncontrolledValue, setUncontrolledValue] = React.useState<number[]>(() => defaultValue ?? [min]);
  const isControlled = valueProp !== undefined;
  const currentValue = isControlled ? valueProp : uncontrolledValue;
  const tickIdPrefix = React.useId();

  // For snapping to ticks, we need to handle this differently
  // Radix slider doesn't support arbitrary step values, so we'll handle snapping in the onValueChange
  const step = rootProps.step;

  // Optimized snap-to-ticks with memoized sorted ticks
  const sortedTicks = React.useMemo(() => (ticks ? [...ticks].sort((a, b) => a.value - b.value) : []), [ticks]);

  // The nearest tick to a value.
  const snapToNearestTick = React.useCallback(
    (value: number): number => {
      let nearest = sortedTicks[0].value;
      for (const tick of sortedTicks) {
        if (Math.abs(tick.value - value) < Math.abs(nearest - value)) nearest = tick.value;
      }
      return nearest;
    },
    [sortedTicks],
  );

  // A key press moves the handle one step, which the nearest tick would undo. So a key press
  // that does not reach another tick goes on to the next tick the way it moved.
  const snapKeyStep = React.useCallback(
    (value: number, previous: number): number => {
      const nearest = snapToNearestTick(value);
      if (value > previous && nearest <= previous) {
        return sortedTicks.find((tick) => tick.value > previous)?.value ?? previous;
      }
      if (value < previous && nearest >= previous) {
        return [...sortedTicks].reverse().find((tick) => tick.value < previous)?.value ?? previous;
      }
      return nearest;
    },
    [snapToNearestTick, sortedTicks],
  );

  // Whether the change under way came from the keyboard, so snapping knows how to read it.
  const keyboardChangeRef = React.useRef(false);

  // Format value text for accessibility
  const formatValueText = React.useCallback(
    (values: number[]): string => {
      const formatValue = (val: number) => (unit ? `${val} ${unit}` : val.toString());

      if (values.length === 1) {
        return `${formatValue(values[0])} out of ${formatValue(max)}`;
      } else if (values.length === 2) {
        return `${formatValue(values[0])} to ${formatValue(values[1])} out of ${formatValue(max)}`;
      } else {
        return `${values.map(formatValue).join(', ')} out of ${formatValue(max)}`;
      }
    },
    [unit, max],
  );

  // Ticks sit where the handle sits for their value. Radix flips the handle for a right to
  // left slider and for `inverted`, and runs a vertical slider from the bottom.
  const direction = Direction.useDirection(rootProps.dir);
  const orientation = rootProps.orientation ?? 'horizontal';
  const flipped = orientation === 'vertical' ? !rootProps.inverted : (direction === 'rtl') !== Boolean(rootProps.inverted);

  const tickElements = React.useMemo(() => {
    if (!ticks) return null;

    return ticks.map((tick, index) => {
      const percentage = ((tick.value - min) / (max - min)) * 100;
      return { ...tick, percentage: flipped ? 100 - percentage : percentage, index };
    });
  }, [ticks, min, max, flipped]);

  // Live region ref for accessibility announcements (no state = no re-renders)
  const announceRef = React.useRef<HTMLDivElement>(null);
  const announceTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Says the new value after a tick press. Focus stays on the tick, so nothing else reports
  // it. The handle reports its own value on key presses and drags.
  const announce = React.useCallback(
    (values: number[]) => {
      if (!announceRef.current) return;
      announceRef.current.textContent = formatValueText(values);
      if (announceTimeoutRef.current) clearTimeout(announceTimeoutRef.current);
      announceTimeoutRef.current = setTimeout(() => {
        if (announceRef.current) announceRef.current.textContent = '';
      }, 1000);
    },
    [formatValueText],
  );

  // Handle value changes with snapping
  const handleValueChange = React.useCallback(
    (newValue: number[]) => {
      const snapping = snapToTicks && sortedTicks.length > 0;
      const finalValue = !snapping ? newValue : newValue.map((v, i) => (keyboardChangeRef.current && currentValue[i] !== undefined ? snapKeyStep(v, currentValue[i]) : snapToNearestTick(v)));

      if (!isControlled) setUncontrolledValue(finalValue);
      onValueChange?.(finalValue);
    },
    [snapToTicks, sortedTicks, snapKeyStep, snapToNearestTick, currentValue, onValueChange, isControlled],
  );

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (announceTimeoutRef.current) {
        clearTimeout(announceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="kui-SliderContainer" data-orientation={orientation} data-has-ticks={tickElements ? '' : undefined}>
      {/* Live region for screen reader announcements */}
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="kui-sr-only" />

      <SliderPrimitive.Root
        data-accent-color={color}
        data-radius={radius}
        ref={forwardedRef}
        {...rootProps}
        value={currentValue}
        step={step}
        onKeyDown={(event) => {
          keyboardChangeRef.current = true;
          rootProps.onKeyDown?.(event);
        }}
        onPointerDown={(event) => {
          keyboardChangeRef.current = false;
          rootProps.onPointerDown?.(event);
        }}
        onValueChange={handleValueChange}
        onValueCommit={onValueCommit}
        asChild={false}
        className={classNames('kui-SliderRoot', className)}
      >
        <SliderPrimitive.Track className="kui-SliderTrack">
          <SliderPrimitive.Range className="kui-SliderRange" data-inverted={rootProps.inverted ? '' : undefined} />
        </SliderPrimitive.Track>
        {currentValue.map((value, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="kui-SliderThumb"
            {...(tabIndex !== undefined ? { tabIndex } : undefined)}
            // The caller's name goes to every handle. Without one, Radix names the two
            // handles of a range "Minimum" and "Maximum".
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-valuetext={unit ? `${value} ${unit}` : undefined}
          />
        ))}
      </SliderPrimitive.Root>
      {tickElements && (
        <div className="kui-SliderTicks" data-orientation={orientation} role="group" aria-label="Slider tick marks">
          {tickElements.map((tick) => {
            return (
              <button
                key={tick.index}
                className="kui-SliderTick"
                // Only the offset varies per tick; the centring transform lives in `.kui-SliderTick`.
                style={orientation === 'vertical' ? { top: `${tick.percentage}%` } : { left: `${tick.percentage}%` }}
                disabled={rootProps.disabled}
                onClick={() => {
                  // Move only the handle nearest the tick. When handles share a value, a
                  // tick above it moves the last of them and a tick below moves the first.
                  let nearest = 0;
                  currentValue.forEach((v, i) => {
                    const distance = Math.abs(v - tick.value);
                    const best = Math.abs(currentValue[nearest] - tick.value);
                    if (distance < best || (distance === best && tick.value > v)) nearest = i;
                  });
                  const newValue = currentValue.map((v, i) => (i === nearest ? tick.value : v)).sort((x, y) => x - y);

                  keyboardChangeRef.current = false;
                  handleValueChange(newValue);
                  onValueCommit?.(newValue);
                  announce(newValue);
                }}
                aria-label={`Set to ${tick.label || (unit ? `${tick.value} ${unit}` : tick.value)}`}
                aria-describedby={tick.label ? undefined : `${tickIdPrefix}-tick-${tick.index}`}
                type="button"
              >
                <div className="kui-SliderTickMark" />
                {tick.label && showTickLabels !== false && <div className="kui-SliderTickLabel">{tick.label}</div>}
                {!tick.label && (
                  <span id={`${tickIdPrefix}-tick-${tick.index}`} className="kui-sr-only">
                    {unit ? `${tick.value} ${unit}` : tick.value}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
Slider.displayName = 'Slider';

export { Slider };
export type { SliderProps };
