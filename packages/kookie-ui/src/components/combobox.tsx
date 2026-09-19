'use client';

/**
 * Combobox: Radix Popover for positioning, dismissal and focus; cmdk for search,
 * filtering and keyboard navigation.
 *
 * Render path. State is split so an interaction re-renders only what reads it:
 * - `ComboboxContext` (Trigger, Value, Content): config and the selected value.
 *   Open state is not in it, so opening and closing re-render no consumer.
 * - `ComboboxSearchContext` (Input only): the search text.
 * - `ComboboxItemContext` (Items): stable values only. Items read "am I selected"
 *   from a store through `useSyncExternalStore`, so a selection re-renders the old
 *   and the new selected item, not all N.
 *
 * Highlight. cmdk's `data-selected` is the single highlight source, driven by both
 * the pointer and the keyboard. There is no separate CSS `:hover` highlight, so two
 * items are never lit at once and Enter always picks the lit item.
 */

import * as React from 'react';
import classNames from 'classnames';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { useCallbackRef, useComposedRefs, useControllableState, useLayoutEffect } from 'radix-ui/internal';
import { Command as CommandPrimitive, useCommandState } from 'cmdk';

import { extractProps } from '../helpers/extract-props.js';
import { useDeprecatedPanelBackgroundWarning } from '../helpers/use-deprecation-warning.js';
import { comboboxRootPropDefs, comboboxTriggerPropDefs, comboboxContentPropDefs } from './combobox.props.js';
import { marginPropDefs } from '../props/margin.props.js';
import { ChevronDownIcon, ThickCheckIcon } from './icons.js';
import { Theme, useThemeContext } from './theme.js';
import { requireReactElement } from '../helpers/require-react-element.js';
import * as Popover from './popover.js';
import { Slottable } from './slot.js';
import { VisuallyHidden } from './visually-hidden.js';

import type { textFieldRootPropDefs } from './text-field.props.js';
import type { MarginProps } from '../props/margin.props.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type TextFieldVariant = (typeof textFieldRootPropDefs.variant.values)[number];
type ComboboxValue = string | null;
type CommandFilter = (value: string, search: string, keywords?: string[]) => number;

// Hoisted so extractProps' compiled prop-def cache (keyed by object identity) hits.
const triggerSizingPropDefs = { size: comboboxRootPropDefs.size, highContrast: comboboxRootPropDefs.highContrast };
const contentSizePropDefs = { size: comboboxContentPropDefs.size };

const warned = new Set<string>();
function warnOnce(message: string) {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}

// ============================================================================
// Selection store
// ============================================================================

interface SelectionStore {
  get: () => ComboboxValue;
  set: (value: ComboboxValue) => void;
  subscribe: (listener: () => void) => () => void;
}

function createSelectionStore(initial: ComboboxValue): SelectionStore {
  let current = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => current,
    set: (next) => {
      if (Object.is(next, current)) return;
      current = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

// ============================================================================
// Contexts
// ============================================================================

interface ComboboxContextValue {
  value: ComboboxValue;
  displayValue?: string;
  setOpen: (open: boolean) => void;
  size?: ComboboxRootOwnProps['size'];
  highContrast?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  color?: string;
  loop: boolean;
  shouldFilter: boolean;
  filter?: CommandFilter;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  /** Reads the trigger's accessible name from the DOM (aria-label, aria-labelledby or <label>). */
  getTriggerLabel: () => string | undefined;
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

const useComboboxContext = (componentName: string) => {
  const ctx = React.useContext(ComboboxContext);
  if (!ctx) {
    throw new Error(`Combobox.${componentName} must be used within Combobox.Root`);
  }
  return ctx;
};

interface ComboboxSearchContextValue {
  value: string;
  setValue: (value: string) => void;
}

const ComboboxSearchContext = React.createContext<ComboboxSearchContextValue | null>(null);

interface ComboboxItemContextValue {
  store: SelectionStore;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const ComboboxItemContext = React.createContext<ComboboxItemContextValue | null>(null);

/** Values resolved by Content and read by Input and List. */
interface ComboboxContentContextValue {
  variant: 'solid' | 'soft';
  sizeClassName?: string;
  color?: string;
  material?: string;
  label?: string;
}

const ComboboxContentContext = React.createContext<ComboboxContentContextValue | null>(null);

const useComboboxContentContext = () => React.useContext(ComboboxContentContext);

// ============================================================================
// Root
// ============================================================================

type ComboboxRootOwnProps = GetPropDefTypes<typeof comboboxRootPropDefs> & {
  value?: ComboboxValue;
  defaultValue?: ComboboxValue;
  onValueChange?: (value: ComboboxValue) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchValueChange?: (value: string) => void;
  filter?: CommandFilter;
  shouldFilter?: boolean;
  loop?: boolean;
  disabled?: boolean;
  /** Clear the search text when an option is selected. Defaults to true. */
  resetSearchOnSelect?: boolean;
  /** Clear the search text when the popup is dismissed without a selection. Defaults to true. */
  resetSearchOnClose?: boolean;
  color?: (typeof comboboxTriggerPropDefs.color.values)[number];
  /**
   * Text shown in the trigger for the selected value. Without it the raw value is shown.
   * Can be a string or a function that receives the current value. Pass a stable
   * function (module scope or `useCallback`): an inline function runs on every render.
   * @example displayValue={(v) => items.find(i => i.value === v)?.label}
   */
  displayValue?: string | ((value: ComboboxValue) => string | undefined);
};

type PopoverRootProps = React.ComponentPropsWithoutRef<typeof Popover.Root>;
interface ComboboxRootProps extends PopoverRootProps, ComboboxRootOwnProps {}

function readElementLabel(el: HTMLElement): string | undefined {
  const ariaLabel = el.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;

  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    if (text) return text;
  }

  const labels = (el as HTMLButtonElement).labels;
  if (labels && labels.length > 0) {
    const text = Array.from(labels)
      .map((label) => label.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    if (text) return text;
  }

  return undefined;
}

const ComboboxRoot: React.FC<ComboboxRootProps> = (props) => {
  const {
    children,
    size = comboboxRootPropDefs.size.default,
    highContrast = comboboxRootPropDefs.highContrast.default,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search...',
    searchValue: searchValueProp,
    defaultSearchValue = '',
    onSearchValueChange,
    filter,
    shouldFilter = true,
    loop = true,
    disabled,
    resetSearchOnSelect = true,
    resetSearchOnClose = true,
    color,
    displayValue: displayValueProp,
    ...rootProps
  } = props;

  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const [value, setValue] = useControllableState<ComboboxValue>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const [searchValue, setSearchValue] = useControllableState<string>({
    prop: searchValueProp,
    defaultProp: defaultSearchValue,
    onChange: onSearchValueChange,
  });

  const resolvedDisplayValue = typeof displayValueProp === 'function' ? displayValueProp(value) : displayValueProp;

  // Items subscribe to this store instead of the context, so a selection
  // re-renders only the items whose selected state flips.
  const [store] = React.useState(() => createSelectionStore(value));
  useLayoutEffect(() => {
    store.set(value);
  }, [store, value]);

  // The radix setters change identity whenever their controlled prop changes.
  // Reading them through callback refs keeps these handlers stable, so the
  // contexts below do not change on every keystroke or selection.
  const handleOpenChange = useCallbackRef((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && resetSearchOnClose) setSearchValue('');
  });

  const onSelect = useCallbackRef((nextValue: string) => {
    setValue(nextValue);
    setOpen(false);
    if (resetSearchOnSelect) setSearchValue('');
  });

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const getTriggerLabel = React.useCallback(() => (triggerRef.current ? readElementLabel(triggerRef.current) : undefined), []);

  const contextValue = React.useMemo<ComboboxContextValue>(
    () => ({
      value,
      displayValue: resolvedDisplayValue,
      setOpen: handleOpenChange,
      size,
      highContrast,
      placeholder,
      searchPlaceholder,
      disabled,
      color,
      loop,
      shouldFilter,
      filter,
      triggerRef,
      getTriggerLabel,
    }),
    [value, resolvedDisplayValue, handleOpenChange, size, highContrast, placeholder, searchPlaceholder, disabled, color, loop, shouldFilter, filter, getTriggerLabel],
  );

  const searchContextValue = React.useMemo<ComboboxSearchContextValue>(() => ({ value: searchValue, setValue: setSearchValue }), [searchValue, setSearchValue]);

  const itemContextValue = React.useMemo<ComboboxItemContextValue>(() => ({ store, onSelect, disabled }), [store, onSelect, disabled]);

  return (
    <ComboboxContext.Provider value={contextValue}>
      <ComboboxSearchContext.Provider value={searchContextValue}>
        <ComboboxItemContext.Provider value={itemContextValue}>
          <Popover.Root open={open} onOpenChange={handleOpenChange} {...rootProps}>
            {children}
          </Popover.Root>
        </ComboboxItemContext.Provider>
      </ComboboxSearchContext.Provider>
    </ComboboxContext.Provider>
  );
};
ComboboxRoot.displayName = 'Combobox.Root';

// ============================================================================
// Trigger
// ============================================================================

type ComboboxTriggerElement = HTMLButtonElement;
type ComboboxTriggerOwnProps = GetPropDefTypes<typeof comboboxTriggerPropDefs>;
type NativeTriggerProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'color'>;
interface ComboboxTriggerProps extends NativeTriggerProps, MarginProps, ComboboxTriggerOwnProps {}

const ComboboxTrigger = React.forwardRef<ComboboxTriggerElement, ComboboxTriggerProps>((props, forwardedRef) => {
  const ctx = useComboboxContext('Trigger');

  const {
    children,
    className,
    placeholder,
    disabled,
    readOnly,
    error,
    loading,
    color,
    radius,
    material,
    onClick,
    onKeyDown,
    type: buttonType,
    ...triggerProps
  } = extractProps({ size: ctx.size, highContrast: ctx.highContrast, ...props }, triggerSizingPropDefs, comboboxTriggerPropDefs, marginPropDefs);

  // `panelBackground` has a className prop def, so extractProps strips it.
  const { panelBackground } = props;
  const resolvedMaterial = material ?? panelBackground;
  const isDisabled = disabled ?? ctx.disabled;
  const resolvedColor = color ?? ctx.color;
  // Read-only and loading triggers stay focusable but do not open.
  const isBlocked = Boolean(readOnly || loading);
  const isPlaceholder = ctx.value == null && ctx.displayValue == null;

  const composedRef = useComposedRefs(forwardedRef, ctx.triggerRef);

  const { getTriggerLabel } = ctx;
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!getTriggerLabel()) {
      warnOnce(
        'Combobox.Trigger has no accessible name. The combobox role does not take its name from its content. Add `aria-label`, `aria-labelledby`, or a `<label htmlFor>` that points at the trigger.',
      );
    }
  }, [getTriggerLabel]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    // Radix skips its open toggle when the event is default-prevented.
    if (isBlocked) event.preventDefault();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || isBlocked || isDisabled) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      ctx.setOpen(true);
    }
  };

  const defaultContent = (
    <>
      <span className="rt-SelectTriggerInner">
        <span className="rt-ComboboxValue">{ctx.displayValue ?? ctx.value ?? placeholder ?? ctx.placeholder}</span>
      </span>
      {loading ? (
        <div className="rt-SelectIcon rt-SelectLoadingIcon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset="32"
              className="rt-SelectLoadingIconCircle"
            />
          </svg>
        </div>
      ) : (
        <ChevronDownIcon className="rt-SelectIcon" />
      )}
    </>
  );

  // Radix Popover.Trigger supplies aria-expanded, aria-controls (the popup id) and
  // aria-haspopup="dialog", which matches the Popover dialog this opens.
  return (
    <Popover.Trigger disabled={isDisabled}>
      <button
        data-accent-color={resolvedColor}
        data-radius={radius}
        data-panel-background={resolvedMaterial}
        data-material={resolvedMaterial}
        data-error={error}
        data-loading={loading}
        data-disabled={isDisabled || undefined}
        data-read-only={readOnly || undefined}
        data-placeholder={isPlaceholder ? '' : undefined}
        {...triggerProps}
        // eslint-disable-next-line jsx-a11y/role-has-required-aria-props -- Popover.Trigger (Slot) adds aria-expanded and aria-controls
        role="combobox"
        aria-disabled={isDisabled || undefined}
        aria-readonly={readOnly || undefined}
        aria-invalid={error || undefined}
        aria-busy={loading || undefined}
        type={buttonType ?? 'button'}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={composedRef}
        className={classNames('rt-reset', 'rt-SelectTrigger', 'rt-ComboboxTrigger', className)}
      >
        {children ? requireReactElement(children) : defaultContent}
      </button>
    </Popover.Trigger>
  );
});
ComboboxTrigger.displayName = 'Combobox.Trigger';

// ============================================================================
// Value (standalone, for custom trigger layouts)
// ============================================================================

type ComboboxValueElement = HTMLSpanElement;
interface ComboboxValueProps extends React.ComponentPropsWithoutRef<'span'> {
  placeholder?: string;
}

const ComboboxValue = React.forwardRef<ComboboxValueElement, ComboboxValueProps>(({ placeholder, children, className, ...valueProps }, forwardedRef) => {
  const ctx = useComboboxContext('Value');
  const display = ctx.displayValue ?? ctx.value ?? undefined;
  return (
    <span {...valueProps} ref={forwardedRef} className={classNames('rt-ComboboxValue', className)}>
      {display ?? children ?? placeholder ?? ctx.placeholder}
    </span>
  );
});
ComboboxValue.displayName = 'Combobox.Value';

// ============================================================================
// Content
// ============================================================================

type ComboboxContentElement = React.ElementRef<typeof PopoverPrimitive.Content>;
type ComboboxContentOwnProps = GetPropDefTypes<typeof comboboxContentPropDefs> & {
  container?: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal>['container'];
};
interface ComboboxContentProps extends Omit<ComponentPropsWithout<typeof PopoverPrimitive.Content, RemovedProps>, 'size'>, ComboboxContentOwnProps {}

/** Announces the filtered result count to screen readers after typing settles. */
function ComboboxAnnouncer() {
  const count = useCommandState((state) => state.filtered.count);
  const search = useCommandState((state) => state.search);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    const next = !search ? '' : count === 0 ? 'No results' : `${count} result${count === 1 ? '' : 's'}`;
    const timeout = window.setTimeout(() => setMessage(next), search ? 400 : 0);
    return () => window.clearTimeout(timeout);
  }, [count, search]);

  return (
    <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
      {message}
    </VisuallyHidden>
  );
}

const ComboboxContent = React.forwardRef<ComboboxContentElement, ComboboxContentProps>((props, forwardedRef) => {
  const ctx = useComboboxContext('Content');
  const themeContext = useThemeContext();

  useDeprecatedPanelBackgroundWarning(props.panelBackground);

  const material = props.material ?? props.panelBackground ?? themeContext.material ?? themeContext.panelBackground;
  const size = props.size ?? ctx.size ?? comboboxContentPropDefs.size.default;
  const variant = props.variant ?? comboboxContentPropDefs.variant.default;
  const highContrast = props.highContrast ?? ctx.highContrast ?? comboboxContentPropDefs.highContrast.default;

  const {
    className,
    children,
    color,
    forceMount,
    container,
    material: _material,
    panelBackground: _panelBackground,
    onOpenAutoFocus,
    'aria-label': _ariaLabel,
    'aria-labelledby': ariaLabelledByProp,
    ...contentProps
  } = extractProps({ ...props, size, variant, highContrast }, comboboxContentPropDefs);

  const resolvedColor = color || ctx.color || themeContext.accentColor;


  // The trigger's name labels the popup, the search field and the listbox.
  // Read once per mount (the content remounts on every open); fall back to a
  // layout effect when the trigger was not attached yet (defaultOpen, forceMount).
  const { getTriggerLabel } = ctx;
  const [triggerLabel, setTriggerLabel] = React.useState(getTriggerLabel);
  useLayoutEffect(() => {
    if (triggerLabel !== undefined) return;
    const label = getTriggerLabel();
    if (label !== undefined) setTriggerLabel(label);
  }, [getTriggerLabel, triggerLabel]);

  const label = props['aria-label'] ?? triggerLabel;

  const contentContextValue = React.useMemo<ComboboxContentContextValue>(
    () => ({
      variant,
      // Responsive-aware size class for the search field (never String() a responsive object).
      sizeClassName: extractProps({ size }, contentSizePropDefs).className || undefined,
      color: resolvedColor,
      material,
      label,
    }),
    [variant, size, resolvedColor, material, label],
  );

  const commandRef = React.useRef<HTMLDivElement>(null);

  // Without a search field, focus would land on the popup itself, outside cmdk's
  // keydown handler. Focus the listbox instead so arrow keys and Enter work.
  const handleOpenAutoFocus = (event: Event) => {
    onOpenAutoFocus?.(event);
    if (event.defaultPrevented) return;
    const command = commandRef.current;
    if (!command || command.querySelector('[cmdk-input]')) return;
    event.preventDefault();
    const list = command.querySelector<HTMLElement>('[cmdk-list]');
    (list ?? command).focus({ preventScroll: true });
  };

  // Start the highlight on the selected option (cmdk trims item values).
  const initialHighlight = ctx.value?.trim() || undefined;

  return (
    <PopoverPrimitive.Portal container={container} forceMount={forceMount ? true : undefined}>
      <Theme asChild>
        <PopoverPrimitive.Content
          data-accent-color={resolvedColor}
          data-material={material}
          data-panel-background={material}
          align="start"
          sideOffset={4}
          collisionPadding={10}
          aria-label={ariaLabelledByProp ? undefined : label}
          aria-labelledby={ariaLabelledByProp}
          {...contentProps}
          forceMount={forceMount ? true : undefined}
          onOpenAutoFocus={handleOpenAutoFocus}
          ref={forwardedRef}
          className={classNames('rt-PopperContent', 'rt-BaseMenuContent', 'rt-ComboboxContent', className)}
        >
          <ComboboxContentContext.Provider value={contentContextValue}>
            <CommandPrimitive
              ref={commandRef}
              loop={ctx.loop}
              shouldFilter={ctx.shouldFilter}
              filter={ctx.filter}
              label={label}
              defaultValue={initialHighlight}
              className="rt-ComboboxCommand"
            >
              {children}
              <ComboboxAnnouncer />
            </CommandPrimitive>
          </ComboboxContentContext.Provider>
        </PopoverPrimitive.Content>
      </Theme>
    </PopoverPrimitive.Portal>
  );
});
ComboboxContent.displayName = 'Combobox.Content';

// ============================================================================
// Input
// ============================================================================

type ComboboxInputElement = React.ElementRef<typeof CommandPrimitive.Input>;
interface ComboboxInputProps extends Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>, 'value' | 'onValueChange'> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  variant?: TextFieldVariant;
  value?: string;
  onValueChange?: (value: string) => void;
}

const ComboboxInput = React.forwardRef<ComboboxInputElement, ComboboxInputProps>(
  ({ className, startAdornment, endAdornment, placeholder, variant: inputVariant, value, onValueChange, ...inputProps }, forwardedRef) => {
    const ctx = useComboboxContext('Input');
    const search = React.useContext(ComboboxSearchContext);
    const contentContext = useComboboxContentContext();

    const contentVariant = contentContext?.variant ?? 'solid';
    const textFieldVariant = inputVariant ?? (contentVariant === 'solid' ? 'surface' : 'soft');

    // The search text lives in Root; only this component subscribes to it.
    const searchValue = value ?? search?.value ?? '';
    const handleSearchChange = onValueChange ?? search?.setValue;

    const inputField = (
      <div
        className={classNames('rt-TextFieldRoot', 'rt-ComboboxInputRoot', contentContext?.sizeClassName, `rt-variant-${textFieldVariant}`)}
        data-accent-color={contentContext?.color}
        data-material={contentContext?.material}
        data-panel-background={contentContext?.material}
      >
        {startAdornment ? <div className="rt-TextFieldSlot">{startAdornment}</div> : null}
        <CommandPrimitive.Input
          {...inputProps}
          ref={forwardedRef}
          value={searchValue}
          onValueChange={handleSearchChange}
          placeholder={placeholder ?? ctx.searchPlaceholder}
          className={classNames('rt-reset', 'rt-TextFieldInput', className)}
        />
        {endAdornment ? (
          <div className="rt-TextFieldSlot" data-side="right">
            {endAdornment}
          </div>
        ) : null}
      </div>
    );

    return contentContext ? <div className="rt-ComboboxSearch">{inputField}</div> : inputField;
  },
);
ComboboxInput.displayName = 'Combobox.Input';

// ============================================================================
// List
// ============================================================================

type ComboboxListElement = React.ElementRef<typeof CommandPrimitive.List>;
interface ComboboxListProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> {}

// cmdk's List owns its id (referenced by the input's aria-controls), role and
// aria-label (set from `label`), so none of them are overridden here.
const ComboboxList = React.forwardRef<ComboboxListElement, ComboboxListProps>(({ className, children, label, ...listProps }, forwardedRef) => {
  const contentContext = useComboboxContentContext();
  return (
    <div className="rt-ComboboxScrollArea">
      <div className={classNames('rt-BaseMenuViewport', 'rt-ComboboxViewport')}>
        <CommandPrimitive.List {...listProps} label={label ?? contentContext?.label} ref={forwardedRef} className={classNames('rt-ComboboxList', className)}>
          {children}
        </CommandPrimitive.List>
      </div>
    </div>
  );
});
ComboboxList.displayName = 'Combobox.List';

// ============================================================================
// Empty
// ============================================================================

type ComboboxEmptyElement = React.ElementRef<typeof CommandPrimitive.Empty>;
interface ComboboxEmptyProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> {}

const ComboboxEmpty = React.forwardRef<ComboboxEmptyElement, ComboboxEmptyProps>(({ className, ...emptyProps }, forwardedRef) => (
  <CommandPrimitive.Empty {...emptyProps} ref={forwardedRef} className={classNames('rt-ComboboxEmpty', className)} />
));
ComboboxEmpty.displayName = 'Combobox.Empty';

// ============================================================================
// Group
// ============================================================================

type ComboboxGroupElement = React.ElementRef<typeof CommandPrimitive.Group>;
interface ComboboxGroupProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> {}

const ComboboxGroup = React.forwardRef<ComboboxGroupElement, ComboboxGroupProps>(({ className, ...groupProps }, forwardedRef) => (
  <CommandPrimitive.Group {...groupProps} ref={forwardedRef} className={classNames('rt-BaseMenuGroup', 'rt-ComboboxGroup', className)} />
));
ComboboxGroup.displayName = 'Combobox.Group';

// ============================================================================
// Label
// ============================================================================

type ComboboxLabelElement = React.ElementRef<'div'>;
interface ComboboxLabelProps extends React.ComponentPropsWithoutRef<'div'> {}

const ComboboxLabel = React.forwardRef<ComboboxLabelElement, ComboboxLabelProps>(({ className, id: idProp, ...labelProps }, forwardedRef) => {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const localRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(forwardedRef, localRef);

  // cmdk renders the group's role="group" element itself and gives no way to
  // label it from a child, so name it after this label when inside a Group.
  useLayoutEffect(() => {
    const group = localRef.current?.closest('[cmdk-group-items]');
    if (!group || group.hasAttribute('aria-labelledby')) return;
    group.setAttribute('aria-labelledby', id);
    return () => {
      if (group.getAttribute('aria-labelledby') === id) group.removeAttribute('aria-labelledby');
    };
  }, [id]);

  return <div {...labelProps} id={id} ref={composedRef} className={classNames('rt-BaseMenuLabel', 'rt-ComboboxLabel', className)} />;
});
ComboboxLabel.displayName = 'Combobox.Label';

// ============================================================================
// Separator
// ============================================================================

type ComboboxSeparatorElement = React.ElementRef<typeof CommandPrimitive.Separator>;
interface ComboboxSeparatorProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> {}

const ComboboxSeparator = React.forwardRef<ComboboxSeparatorElement, ComboboxSeparatorProps>(({ className, ...separatorProps }, forwardedRef) => (
  <CommandPrimitive.Separator {...separatorProps} ref={forwardedRef} className={classNames('rt-BaseMenuSeparator', 'rt-ComboboxSeparator', className)} />
));
ComboboxSeparator.displayName = 'Combobox.Separator';

// ============================================================================
// Item
// ============================================================================

/** Plain text of a React node tree, used as the item's search text. */
function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return getNodeText(node.props.children);
  return '';
}

type ComboboxItemElement = React.ElementRef<typeof CommandPrimitive.Item>;
interface ComboboxItemProps extends Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>, 'keywords' | 'onSelect'> {
  /**
   * Text matched by search. Defaults to the text of `children`. Set it when the
   * children are components whose text is not in the JSX (it cannot be read).
   */
  label?: string;
  /** Additional keywords for search filtering. */
  keywords?: string[];
  /** Called when the item is selected. */
  onSelect?: (value: string) => void;
}

const ComboboxItem = React.forwardRef<ComboboxItemElement, ComboboxItemProps>(
  ({ className, children, label, value, disabled, onSelect, keywords, ...itemProps }, forwardedRef) => {
    const itemContext = React.useContext(ComboboxItemContext);
    if (!itemContext) {
      throw new Error('Combobox.Item must be used within Combobox.Root');
    }
    const { store, onSelect: onSelectFromRoot, disabled: rootDisabled } = itemContext;

    // Without `value`, cmdk uses the trimmed text of string children.
    const itemValue = value ?? (typeof children === 'string' ? children.trim() : undefined);
    const getIsSelected = () => itemValue !== undefined && store.get() === itemValue;
    const isSelected = React.useSyncExternalStore(store.subscribe, getIsSelected, getIsSelected);

    const onSelectProp = useCallbackRef(onSelect);
    // cmdk passes its resolved value (the `value` prop, or the text when `value` is omitted).
    const handleSelect = React.useCallback(
      (resolvedValue: string) => {
        const nextValue = value ?? resolvedValue;
        onSelectFromRoot(nextValue);
        onSelectProp(nextValue);
      },
      [value, onSelectFromRoot, onSelectProp],
    );

    // cmdk matches only `value` and `keywords`, so add the visible text as a keyword.
    const text = (label ?? getNodeText(children)).replace(/\s+/g, ' ').trim();
    const searchKeywords = text ? (keywords ? [text, ...keywords] : [text]) : keywords;
    // cmdk stores keywords only when `value` changes. Remount the cmdk item when
    // they change so a new label or keyword list is picked up.
    const keywordsKey = searchKeywords ? searchKeywords.join(' ') : '';

    const isDisabled = disabled ?? rootDisabled ?? false;

    return (
      <CommandPrimitive.Item
        key={keywordsKey}
        {...itemProps}
        value={value}
        keywords={searchKeywords}
        // cmdk owns aria-selected (the highlighted option); the chosen option is aria-checked.
        aria-checked={isSelected}
        disabled={isDisabled || undefined}
        ref={forwardedRef}
        onSelect={handleSelect}
        className={classNames('rt-reset', 'rt-BaseMenuItem', 'rt-ComboboxItem', className)}
      >
        {isSelected ? (
          <span className={classNames('rt-BaseMenuItemIndicator', 'rt-ComboboxItemIndicator')}>
            <ThickCheckIcon className={classNames('rt-BaseMenuItemIndicatorIcon', 'rt-ComboboxItemIndicatorIcon')} />
          </span>
        ) : null}
        <Slottable>{children}</Slottable>
      </CommandPrimitive.Item>
    );
  },
);
ComboboxItem.displayName = 'Combobox.Item';

// ============================================================================
// Exports
// ============================================================================

export {
  ComboboxRoot as Root,
  ComboboxTrigger as Trigger,
  ComboboxValue as Value,
  ComboboxContent as Content,
  ComboboxInput as Input,
  ComboboxList as List,
  ComboboxEmpty as Empty,
  ComboboxGroup as Group,
  ComboboxLabel as Label,
  ComboboxSeparator as Separator,
  ComboboxItem as Item,
};

export type {
  ComboboxRootProps as RootProps,
  ComboboxTriggerProps as TriggerProps,
  ComboboxValueProps as ValueProps,
  ComboboxContentProps as ContentProps,
  ComboboxInputProps as InputProps,
  ComboboxListProps as ListProps,
  ComboboxEmptyProps as EmptyProps,
  ComboboxGroupProps as GroupProps,
  ComboboxLabelProps as LabelProps,
  ComboboxSeparatorProps as SeparatorProps,
  ComboboxItemProps as ItemProps,
};
