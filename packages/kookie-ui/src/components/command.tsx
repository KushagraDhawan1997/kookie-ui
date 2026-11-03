'use client';

/**
 * Command, from v2 (2026-11-03): a command palette, one field over everything the app can do.
 *
 * It is a Dialog: it covers the app, traps focus, locks the page and leaves on Escape. Inside are
 * two panes in a column anchored to the top, the search bar and the results, so a result count
 * never moves the field. The keyboard model is the package's: a row is highlighted from the first
 * frame and after every keystroke, the arrows move it, Enter runs it, and running a row closes the
 * palette. What rows exist and what they do is the app's.
 *
 * Filtering keeps the order of `items`: a palette is used by muscle memory, so typing never
 * reorders it. Pass `filter={null}` to narrow and rank `items` yourself.
 *
 * Differs from v2 in its machine only: v1 builds on cmdk where v2 builds on Base UI's Autocomplete.
 * A row that should be a link takes `asChild` around the app's link, where v2 takes `render`.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { Command as CommandPrimitive } from 'cmdk';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { PortalTheme } from './_internal/portal-theme.js';
import { useBodyPointerEventsCleanup } from '../hooks/use-body-pointer-events-cleanup.js';
import { useThemeSize } from '../hooks/theme-size.js';

type Size = '1' | '2' | '3' | '4';

/** The rows stand one step above the palette: it is the one object on screen, read from a distance. */
const ROW_STEP: Record<Size, Size> = { '1': '2', '2': '3', '3': '4', '4': '4' };

type CommandOpenChangeReason = 'item-press' | 'dismiss';
type CommandOpenChangeDetails = { reason: CommandOpenChangeReason };

type Filter = (item: unknown, query: string, itemToString: (item: unknown) => string) => boolean;

const SIZE_DEF = { values: ['1', '2', '3', '4'], default: '2' } as const;

const CommandSizeContext = React.createContext<Size>('2');
const CommandQueryContext = React.createContext<(query: string) => void>(() => {});
const CommandItemsContext = React.createContext<readonly unknown[]>([]);
const CommandCloseContext = React.createContext<(() => void) | null>(null);
const CommandListContext = React.createContext<{ query: string; filter: Filter | null; itemToString: (item: unknown) => string }>({
  query: '',
  filter: null,
  itemToString: String,
});
const CommandSeatContext = React.createContext<{ seat: HTMLElement | null; setSeat: (node: HTMLElement | null) => void } | null>(null);

/** What an item says, for the default filter: a string as itself, an object by its label, title or value. */
function defaultItemToString(item: unknown): string {
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>;
    for (const key of ['label', 'title', 'value', 'name']) {
      if (typeof record[key] === 'string') return record[key] as string;
    }
  }
  return '';
}

const defaultFilter: Filter = (item, query, itemToString) => itemToString(item).toLowerCase().includes(query.trim().toLowerCase());

/** A group is an item that carries its own `items`; it stays while any of them matches. */
function isGroup(item: unknown): item is { items: readonly unknown[] } {
  return Boolean(item && typeof item === 'object' && Array.isArray((item as { items?: unknown }).items));
}

function narrow(items: readonly unknown[], query: string, filter: Filter | null, itemToString: (item: unknown) => string): unknown[] {
  if (filter === null || query.trim() === '') return [...items];
  const out: unknown[] = [];
  for (const item of items) {
    if (isGroup(item)) {
      const kept = item.items.filter((member) => filter(member, query, itemToString));
      if (kept.length > 0) out.push({ ...item, items: kept });
    } else if (filter(item, query, itemToString)) {
      out.push(item);
    }
  }
  return out;
}

interface CommandProps {
  /**
   * The size step of the palette, from `"1"` to `"4"`. The rows are one step larger than the
   * app's controls at the same step, and the search text larger again. The default comes from
   * the theme.
   */
  size?: Size;
  /**
   * Every item the palette can show, before filtering. `CommandList` takes a function that turns
   * an item into a row. An item with its own `items` array is a group. Keep the array stable.
   */
  items: readonly unknown[];
  /** Whether the palette is open, for a controlled palette. Most are, because a key handler opens them. */
  open?: boolean;
  /** Whether the palette is open at the start, for an uncontrolled palette. */
  defaultOpen?: boolean;
  /** Called each time the palette opens or closes. `reason` is `"item-press"` when a row ran. */
  onOpenChange?: (open: boolean, details: CommandOpenChangeDetails) => void;
  /** A `CommandTrigger`, if there is one, and a `CommandContent`. */
  children: React.ReactNode;
}

/** A command palette: a field over a list of rows, in a dialog. Running a row closes it. */
function Command({ size: sizeProp, items, open, defaultOpen, onOpenChange, children }: CommandProps) {
  const size = useThemeSize<Size>(sizeProp, SIZE_DEF);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const controlled = open !== undefined;
  const isOpen = controlled ? open : internalOpen;

  const change = React.useCallback(
    (next: boolean, reason: CommandOpenChangeReason) => {
      onOpenChange?.(next, { reason });
      if (!controlled) setInternalOpen(next);
    },
    [onOpenChange, controlled],
  );
  const close = React.useCallback(() => change(false, 'item-press'), [change]);

  return (
    <CommandSizeContext.Provider value={size}>
      <CommandItemsContext.Provider value={items}>
        <CommandCloseContext.Provider value={close}>
          <DialogPrimitive.Root open={isOpen} onOpenChange={(next) => change(next, 'dismiss')} modal>
            {children}
          </DialogPrimitive.Root>
        </CommandCloseContext.Provider>
      </CommandItemsContext.Provider>
    </CommandSizeContext.Provider>
  );
}

interface CommandTriggerProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {}

/** Opens the palette. Most palettes open from a key handler instead, and render none. */
function CommandTrigger({ children, ...props }: CommandTriggerProps) {
  return (
    <DialogPrimitive.Trigger asChild {...props}>
      {children}
    </DialogPrimitive.Trigger>
  );
}

interface CommandContentProps {
  /** The palette's accessible name, such as "Search the documentation". */
  'aria-label': string;
  /**
   * How an item matches the query. The default keeps an item whose text contains the query.
   * `null` turns filtering off, for an app that narrows and ranks `items` itself.
   */
  filter?: Filter | null;
  /** What an item says, for the filter. The default reads a string, or an object's label, title or value. */
  itemToString?: (item: unknown) => string;
  /** Called with the query on every keystroke, and with `""` when the palette closes. */
  onQueryChange?: (query: string) => void;
  /** Keep the portal in a container of your own. */
  container?: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>['container'];
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** The palette: a column of the search bar over the results, anchored to the top of the window. */
function CommandContent({ 'aria-label': label, filter = defaultFilter, itemToString = defaultItemToString, onQueryChange, container, children, className, style }: CommandContentProps) {
  const size = React.useContext(CommandSizeContext);
  const [query, setQuery] = React.useState('');
  const [seat, setSeat] = React.useState<HTMLElement | null>(null);
  const report = React.useRef(onQueryChange);
  React.useEffect(() => {
    report.current = onQueryChange;
  });

  // Closing clears the query, so the palette opens fresh.
  React.useEffect(() => () => report.current?.(''), []);
  useBodyPointerEventsCleanup();

  const changeQuery = React.useCallback((next: string) => {
    setQuery(next);
    report.current?.(next);
  }, []);
  const listValue = React.useMemo(() => ({ query, filter, itemToString }), [query, filter, itemToString]);
  const seatValue = React.useMemo(() => ({ seat, setSeat }), [seat]);

  return (
    <DialogPrimitive.Portal container={container}>
      <PortalTheme asChild>
        <DialogPrimitive.Overlay className="kui-BaseDialogOverlay kui-CommandOverlay">
          <DialogPrimitive.Content
            aria-label={label}
            aria-describedby={undefined}
            className={classNames('kui-CommandContent', `kui-r-size-${size}`, className)}
            style={style}
            onCloseAutoFocus={() => {
              document.body.style.pointerEvents = '';
            }}
          >
            <DialogPrimitive.Title className="kui-sr-only">{label}</DialogPrimitive.Title>
            {/* cmdk owns the highlight and Enter; this file owns the filter, so order never changes. */}
            <CommandPrimitive label={label} shouldFilter={false} loop className="kui-CommandRoot">
              <CommandListContext.Provider value={listValue}>
                <CommandQueryContext.Provider value={changeQuery}>
                  <CommandSeatContext.Provider value={seatValue}>{children}</CommandSeatContext.Provider>
                </CommandQueryContext.Provider>
              </CommandListContext.Provider>
            </CommandPrimitive>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </PortalTheme>
    </DialogPrimitive.Portal>
  );
}

interface CommandInputProps extends Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>, 'value' | 'onValueChange' | 'aria-label'> {
  /** The field's accessible name. */
  'aria-label': string;
  /** An icon before the text, such as a search glyph. */
  leading?: React.ReactNode;
}

/** The search bar, a pane of its own. The palette opens with the caret in it. */
function CommandInput({ leading, className, ...props }: CommandInputProps) {
  const size = React.useContext(CommandSizeContext);
  const setQuery = React.useContext(CommandQueryContext);
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    // A press anywhere on the bar puts the caret in the field.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={classNames('kui-CommandSearch', `kui-r-size-${size}`)}
      onMouseDown={(event) => {
        if (event.target === inputRef.current) return;
        event.preventDefault();
        inputRef.current?.focus();
      }}
    >
      {leading ? (
        <span className="kui-CommandSearchSlot" aria-hidden>
          {leading}
        </span>
      ) : null}
      {/* `autoFocus` focuses inside the tap's own task, which is what raises the keyboard on iOS. */}
      <CommandPrimitive.Input
        ref={inputRef}
        // The palette is the field: it opens to type into, the one place autofocus is the design.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        {...props}
        onValueChange={setQuery}
        className={classNames('kui-reset', 'kui-CommandInput', className)}
      />
    </div>
  );
}

interface CommandListProps<T> {
  /** Turns an item into a row (a `CommandItem`) or a group (a `CommandGroup`). */
  children: (item: T) => React.ReactNode;
  className?: string;
}

/** The results, a pane of their own under the search bar. Its height follows the results. */
function CommandList<T>({ children, className }: CommandListProps<T>) {
  const size = React.useContext(CommandSizeContext);
  const items = React.useContext(CommandItemsContext);
  const { query, filter, itemToString } = React.useContext(CommandListContext);
  const seat = React.useContext(CommandSeatContext);
  const shown = React.useMemo(() => narrow(items, query, filter, itemToString), [items, query, filter, itemToString]);
  return (
    <div className={classNames('kui-BaseMenuContent', 'kui-variant-soft', `kui-r-size-${ROW_STEP[size]}`, 'kui-CommandPanel', className)}>
      <CommandPrimitive.List className={classNames('kui-BaseMenuViewport', 'kui-CommandList')}>
        {shown.map((item) => children(item as T))}
        {/* The empty state's seat, inside this pane, so it is the same box as the results. */}
        <div className="kui-CommandSeat" ref={seat ? seat.setSeat : undefined} />
      </CommandPrimitive.List>
    </div>
  );
}

const CommandGroupItemsContext = React.createContext<readonly unknown[]>([]);

interface CommandGroupProps {
  /** The group's own items, after filtering. Render them with `CommandCollection`. */
  items: readonly unknown[];
  children: React.ReactNode;
  className?: string;
}

/** A labelled run of rows. A group with no matching rows is left out. */
function CommandGroup({ items, children, className }: CommandGroupProps) {
  return (
    <CommandGroupItemsContext.Provider value={items}>
      <CommandPrimitive.Group className={classNames('kui-BaseMenuGroup', 'kui-CommandGroup', className)}>{children}</CommandPrimitive.Group>
    </CommandGroupItemsContext.Provider>
  );
}

interface CommandGroupLabelProps {
  children: React.ReactNode;
  className?: string;
}

/** The group's name, above its rows. */
function CommandGroupLabel({ children, className }: CommandGroupLabelProps) {
  return (
    <div className={classNames('kui-BaseMenuLabel', 'kui-CommandGroupLabel', className)} aria-hidden>
      {children}
    </div>
  );
}

interface CommandCollectionProps<T> {
  /** Turns one of the group's items into a row. */
  children: (item: T) => React.ReactNode;
}

/** The group's rows. */
function CommandCollection<T>({ children }: CommandCollectionProps<T>) {
  const items = React.useContext(CommandGroupItemsContext);
  return <>{items.map((item) => children(item as T))}</>;
}

interface CommandItemProps extends Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>, 'value' | 'onSelect'> {
  /** The item this row shows. A string is also the row's identity for the highlight. */
  value?: unknown;
  /** Runs when the row is pressed or Enter is pressed on it. The palette then closes. */
  onSelect?: () => void;
  /** An icon before the label. */
  leading?: React.ReactNode;
  /** Something after the label, such as a shortcut. */
  trailing?: React.ReactNode;
  /** Set when running the row destroys something. */
  tone?: 'destructive';
  /** Renders the child, such as your router's link, as the row. Enter follows the link. */
  asChild?: boolean;
}

/** One row. Running it, by press or by Enter, runs `onSelect` and closes the palette. */
function CommandItem({ value, onSelect, leading, trailing, tone, asChild, children, className, ...props }: CommandItemProps) {
  const close = React.useContext(CommandCloseContext);
  const id = React.useId();
  const element = React.useRef<HTMLDivElement>(null);
  const clicked = React.useRef(false);
  const itemValue = typeof value === 'string' ? value : id;

  const run = () => {
    onSelect?.();
    close?.();
  };

  // cmdk runs a row from Enter without a click. A link has to be clicked to navigate, so Enter
  // clicks it, and the click comes back through here as the run.
  const handleSelect = () => {
    if (clicked.current) {
      clicked.current = false;
      run();
      return;
    }
    // Found by attribute, not by ref: an app's link component need not forward a ref.
    const node = element.current ?? document.querySelector(`[data-kui-command-item="${CSS.escape(id)}"]`);
    if (asChild && node instanceof HTMLAnchorElement) {
      node.click();
      return;
    }
    run();
  };

  const child = asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null;
  const inner = (label: React.ReactNode) => (
    <>
      {leading ? (
        <span className="kui-CommandItemSlot" data-slot="leading" aria-hidden>
          {leading}
        </span>
      ) : null}
      <span className="kui-CommandItemLabel">{label}</span>
      {trailing ? (
        <span className="kui-CommandItemSlot" data-slot="trailing">
          {trailing}
        </span>
      ) : null}
    </>
  );

  return (
    <CommandPrimitive.Item
      {...props}
      ref={element}
      data-kui-command-item={id}
      value={itemValue}
      asChild={Boolean(child)}
      onSelect={handleSelect}
      onClickCapture={() => {
        clicked.current = true;
      }}
      data-tone={tone}
      className={classNames('kui-reset', 'kui-BaseMenuItem', 'kui-CommandItem', className)}
    >
      {child ? React.cloneElement(child, undefined, inner(child.props.children)) : inner(children)}
    </CommandPrimitive.Item>
  );
}

interface CommandEmptyProps {
  children: React.ReactNode;
  className?: string;
}

/** What the results pane says when nothing matches. It renders inside that pane. */
function CommandEmpty({ children, className }: CommandEmptyProps) {
  const seat = React.useContext(CommandSeatContext);
  if (!seat?.seat) return null;
  return createPortal(<CommandPrimitive.Empty className={classNames('kui-CommandEmpty', className)}>{children}</CommandPrimitive.Empty>, seat.seat);
}

export { Command, CommandTrigger, CommandContent, CommandInput, CommandList, CommandGroup, CommandGroupLabel, CommandCollection, CommandItem, CommandEmpty, ROW_STEP as COMMAND_ROW_STEP };
export type {
  CommandProps,
  CommandTriggerProps,
  CommandContentProps,
  CommandInputProps,
  CommandListProps,
  CommandGroupProps,
  CommandGroupLabelProps,
  CommandCollectionProps,
  CommandItemProps,
  CommandEmptyProps,
  CommandOpenChangeDetails,
  CommandOpenChangeReason,
};
