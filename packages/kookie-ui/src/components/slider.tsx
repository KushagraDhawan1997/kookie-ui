import * as React from 'react';
import classNames from 'classnames';
import { Slider as SliderPrimitive } from 'radix-ui';

import { sliderPropDefs } from './slider.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';

import type { ComponentPropsWithout } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type SliderElement = React.ElementRef<typeof SliderPrimitive.Root>;
type SliderOwnProps = GetPropDefTypes<typeof sliderPropDefs>;
interface SliderProps
  extends ComponentPropsWithout<
      typeof SliderPrimitive.Root,
      'asChild' | 'color' | 'children' | 'defaultChecked'
    >,
    SliderOwnProps {
  ticks?: Array<{ value: number; label?: string }>;
  unit?: string;
}
const Slider = React.forwardRef<SliderElement, SliderProps>((ownProps, forwardedRef) => {
  const props = useThemeSizeProps(ownProps, sliderPropDefs.size);
  const { className, color, radius, tabIndex, ...sliderProps } = extractProps(
    props,
    sliderPropDefs,
  );
  const {
    ticks,
    unit,
    value: valueProp,
    defaultValue,
    onValueChange,
    onValueCommit,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rootProps
  } = sliderProps;
  const { showTickLabels, snapToTicks } = props;

  const min = rootProps.min ?? 0;
  const max = rootProps.max ?? 100;

  // The slider keeps its own copy of the value when uncontrolled, so the handles, their
  // labels and a tick press all read the current value rather than the first one.
  const [uncontrolledValue, setUncontrolledValue] = React.useState<number[]>(
    () => defaultValue ?? [min],
  );
  const isControlled = valueProp !== undefined;
  const currentValue = isControlled ? valueProp : uncontrolledValue;
  const tickIdPrefix = React.useId();

  // For snapping to ticks, we need to handle this differently
  // Radix slider doesn't support arbitrary step values, so we'll handle snapping in the onValueChange
  const step = rootProps.step;

  // Optimized snap-to-ticks with memoized sorted ticks
  const sortedTicks = React.useMemo(
    () => (ticks ? [...ticks].sort((a, b) => a.value - b.value) : []),
    [ticks],
  );

  // Function to snap value to nearest tick (optimized)
  const snapToNearestTick = React.useCallback(
    (value: number): number => {
      if (!snapToTicks || !sortedTicks.length) return value;

      // Binary search for closest tick
      let left = 0;
      let right = sortedTicks.length - 1;

      if (value <= sortedTicks[left].value) return sortedTicks[left].value;
      if (value >= sortedTicks[right].value) return sortedTicks[right].value;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (sortedTicks[mid].value === value) return value;

        if (sortedTicks[mid].value < value) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      // Find closest between left and right
      const leftDistance = Math.abs(value - sortedTicks[right].value);
      const rightDistance = Math.abs(value - sortedTicks[left].value);

      return leftDistance <= rightDistance ? sortedTicks[right].value : sortedTicks[left].value;
    },
    [snapToTicks, sortedTicks],
  );

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

  // Memoize tick elements for performance
  const tickElements = React.useMemo(() => {
    if (!ticks) return null;

    return ticks.map((tick, index) => ({
      ...tick,
      percentage: ((tick.value - min) / (max - min)) * 100,
      index,
    }));
  }, [ticks, min, max]);

  // Live region ref for accessibility announcements (no state = no re-renders)
  const announceRef = React.useRef<HTMLDivElement>(null);
  const announceTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle value changes with snapping
  const handleValueChange = React.useCallback(
    (newValue: number[]) => {
      const finalValue =
        snapToTicks && ticks ? newValue.map((v) => snapToNearestTick(v)) : newValue;

      // Update live region for screen readers (direct DOM update, no React state)
      if (announceRef.current) {
        const valueText = formatValueText(finalValue);
        announceRef.current.textContent = valueText;

        // Clear after delay to prevent spam
        if (announceTimeoutRef.current) {
          clearTimeout(announceTimeoutRef.current);
        }
        announceTimeoutRef.current = setTimeout(() => {
          if (announceRef.current) {
            announceRef.current.textContent = '';
          }
        }, 1000);
      }

      if (!isControlled) setUncontrolledValue(finalValue);
      onValueChange?.(finalValue);
    },
    [snapToTicks, ticks, snapToNearestTick, formatValueText, onValueChange, isControlled],
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
    <div className="kui-SliderContainer">
      {/* Live region for screen reader announcements */}
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="kui-sr-only"
      />

      <SliderPrimitive.Root
        data-accent-color={color}
        data-radius={radius}
        ref={forwardedRef}
        {...rootProps}
        value={currentValue}
        step={step}
        onValueChange={handleValueChange}
        onValueCommit={onValueCommit}
        asChild={false}
        className={classNames('kui-SliderRoot', className)}
      >
        <SliderPrimitive.Track className="kui-SliderTrack">
          <SliderPrimitive.Range
            className="kui-SliderRange"
            data-inverted={rootProps.inverted ? '' : undefined}
          />
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
        <div className="kui-SliderTicks" role="group" aria-label="Slider tick marks">
          {tickElements.map((tick) => {
            return (
              <button
                key={tick.index}
                className="kui-SliderTick"
                // Only `left` varies per tick; the centring transform lives in `.kui-SliderTick`.
                style={{ left: `${tick.percentage}%` }}
                onClick={() => {
                  // Move only the handle nearest the tick. When handles share a value, a
                  // tick above it moves the last of them and a tick below moves the first.
                  let nearest = 0;
                  currentValue.forEach((v, i) => {
                    const distance = Math.abs(v - tick.value);
                    const best = Math.abs(currentValue[nearest] - tick.value);
                    if (distance < best || (distance === best && tick.value > v)) nearest = i;
                  });
                  const newValue = currentValue
                    .map((v, i) => (i === nearest ? tick.value : v))
                    .sort((x, y) => x - y);

                  handleValueChange(newValue);
                  onValueCommit?.(newValue);
                }}
                aria-label={`Set to ${tick.label || (unit ? `${tick.value} ${unit}` : tick.value)}`}
                aria-describedby={tick.label ? undefined : `${tickIdPrefix}-tick-${tick.index}`}
                type="button"
              >
                <div className="kui-SliderTickMark" />
                {tick.label && showTickLabels !== false && (
                  <div className="kui-SliderTickLabel">{tick.label}</div>
                )}
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
