'use client';

/**
 * Sheet
 *
 * A side-placed overlay built on top of Radix Dialog. It inherits accessibility,
 * focus management, overlay behavior, and sizing scales from the base dialog, and
 * adds side placement and slide motion suited for navigation panels and drawers.
 *
 * Structure mirrors Dialog:
 * - Root, Trigger, Content, Title, Description, Close
 *
 * Notes
 * - Side: set with `side` on `Sheet.Content`. Aliases: `left` → `start`, `right` → `end`.
 * - Sizing: reuses Dialog content prop defs (width/min/max/height/size). Size follows the
 *   Theme size; start/end sheets cap at the size's overlay width unless maxWidth is set.
 * - A11y: provide an accessible name via `Sheet.Title` or `aria-label` on `Sheet.Content`.
 *   Radix owns the focus trap, initial focus and the return of focus to the trigger.
 *
 * Example
 * <Sheet.Root>
 *   <Sheet.Trigger>
 *     <Button>Open</Button>
 *   </Sheet.Trigger>
 *   <Sheet.Content side="end" width={{ initial: '280px', md: '360px' }}>
 *     <Sheet.Title>Details</Sheet.Title>
 *     ...
 *     <Sheet.Close>
 *       <Button>Close</Button>
 *     </Sheet.Close>
 *   </Sheet.Content>
 * </Sheet.Root>
 */

import * as React from 'react';
import classNames from 'classnames';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { dialogContentPropDefs } from './dialog.props.js';
import type { DialogContentOwnProps } from './dialog.props.js';
import { Theme } from './theme.js';
import { Heading } from './heading.js';
import { Text } from './text.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../hooks/theme-size.js';
import { requireReactElement } from '../helpers/require-react-element.js';
import { useBodyPointerEventsCleanup } from '../hooks/use-body-pointer-events-cleanup.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { HeadingProps } from './heading.js';

/**
 * Supported sides for the Sheet.
 * Aliases are normalized RTL-aware: `left` → `start`, `right` → `end`.
 */
type SheetSide = 'start' | 'end' | 'top' | 'bottom' | 'left' | 'right';

/**
 * Sheet is a side-placed overlay built on the Dialog primitive.
 * It reuses Dialog's accessibility, focus, overlay, and size scales, while adding side placement and slide motion.
 */

// Root
/**
 * Props for `Sheet.Root` (Radix Dialog root with `modal` forced on).
 */
interface SheetRootProps extends ComponentPropsWithout<typeof DialogPrimitive.Root, 'modal'> {}
const Root: React.FC<SheetRootProps> = (props) => <DialogPrimitive.Root {...props} modal />;
Root.displayName = 'Sheet.Root';

// Trigger
/** Element type for `Sheet.Trigger`. */
type SheetTriggerElement = React.ElementRef<typeof DialogPrimitive.Trigger>;
/** Props for `Sheet.Trigger` (expects a single element child). */
interface SheetTriggerProps extends ComponentPropsWithout<typeof DialogPrimitive.Trigger, RemovedProps> {}
const Trigger = React.forwardRef<SheetTriggerElement, SheetTriggerProps>(({ children, ...props }, ref) => (
  <DialogPrimitive.Trigger {...props} ref={ref} asChild>
    {requireReactElement(children)}
  </DialogPrimitive.Trigger>
));
Trigger.displayName = 'Sheet.Trigger';

// Content
/** Element type for `Sheet.Content`. */
// Reuse dialog content prop defs for size/width/height tokens.
// Built once at module scope: `extractProps` memoises on the identity of the
// prop def objects it is handed, so rebuilding these per render would recompile
// them every time a sheet renders.
const { align: _alignPropDef, ...dialogPropDefsForSheet } = dialogContentPropDefs;
const sheetPropDefs = dialogPropDefsForSheet;

/** Counts the Sheet.Title elements mounted inside a Sheet.Content, for the dev-only name check. */
const SheetTitleCountContext = React.createContext<React.MutableRefObject<number> | null>(null);

type SheetContentElement = React.ElementRef<typeof DialogPrimitive.Content>;
interface SheetContentProps
  extends ComponentPropsWithout<typeof DialogPrimitive.Content, RemovedProps>,
    Omit<DialogContentOwnProps, 'align'> {
  /** Side where the Sheet should appear. `left`/`right` alias to `start`/`end`. */
  side?: SheetSide;
  /** Optional DOM container to portal into. Defaults to `document.body`. */
  container?: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>['container'];
}

/**
 * Renders the Sheet panel. Normalizes left/right to logical start/end and
 * forwards dialog sizing props. Provide an accessible name via `Sheet.Title`
 * or `aria-label`.
 */
const Content = React.forwardRef<SheetContentElement, SheetContentProps>((allProps, forwardedRef) => {
  const { side = 'start', forceMount, container, className, ...ownProps } = allProps;
  const restProps = useThemeSizeProps(ownProps, sheetPropDefs.size);
  const normalizedSideMap: Record<SheetSide, 'start' | 'end' | 'top' | 'bottom'> = {
    left: 'start',
    right: 'end',
    start: 'start',
    end: 'end',
    top: 'top',
    bottom: 'bottom',
  };
  const normalizedSide = normalizedSideMap[side];
  // Size/width/height class names come from the dialog defs — see `sheetPropDefs`.
  const { className: extractedClassName, ...contentProps } = extractProps(restProps, sheetPropDefs);

  // Dev-only a11y guard: the panel needs a name. A Sheet.Title anywhere inside counts it
  // in a layout effect, which runs before this ref is attached, so nesting doesn't matter.
  const titleCountRef = React.useRef(0);
  const combinedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
      if (process.env.NODE_ENV !== 'production' && node) {
        const hasName = titleCountRef.current > 0 || Boolean(node.getAttribute('aria-label')) || Boolean(node.getAttribute('aria-labelledby'));
        if (!hasName) {
          console.warn('Sheet.Content: Missing accessible name. Include Sheet.Title inside it or provide aria-label.');
        }
      }
    },
    [forwardedRef],
  );

  useBodyPointerEventsCleanup();

  return (
    <DialogPrimitive.Portal container={container} forceMount={forceMount}>
      <SheetTitleCountContext.Provider value={titleCountRef}>
        <Theme asChild>
          <DialogPrimitive.Overlay className="kui-BaseDialogOverlay kui-DialogOverlay kui-SheetOverlay">
            <DialogPrimitive.Content
              {...contentProps}
              ref={combinedRef}
              className={classNames('kui-BaseDialogContent', 'kui-SheetContent', className, extractedClassName)}
              data-side={normalizedSide}
              aria-modal="true"
            />
          </DialogPrimitive.Overlay>
        </Theme>
      </SheetTitleCountContext.Provider>
    </DialogPrimitive.Portal>
  );
});
Content.displayName = 'Sheet.Content';

// Title - renders as Heading with sensible defaults
type SheetTitleElement = React.ElementRef<typeof Heading>;
type SheetTitleProps = HeadingProps;
/** Accessible title for the Sheet. Renders as Heading with sensible defaults. */
const Title = React.forwardRef<SheetTitleElement, SheetTitleProps>(({ size = '4', weight = 'medium', ...props }, ref) => {
  const titleCountRef = React.useContext(SheetTitleCountContext);
  React.useLayoutEffect(() => {
    if (!titleCountRef) return;
    titleCountRef.current += 1;
    return () => {
      titleCountRef.current -= 1;
    };
  }, [titleCountRef]);
  return (
    <DialogPrimitive.Title asChild>
      <Heading ref={ref} size={size} weight={weight} {...props} />
    </DialogPrimitive.Title>
  );
});
Title.displayName = 'Sheet.Title';

// Description - renders as Text with sensible defaults
type SheetDescriptionElement = React.ElementRef<typeof Text>;
type SheetDescriptionProps = React.ComponentPropsWithoutRef<typeof Text>;
/** Supplementary description text for Sheet content. Renders as Text with sensible defaults. */
const Description = React.forwardRef<SheetDescriptionElement, SheetDescriptionProps>(({ size = '2', emphasis = 'medium', ...rest }, ref) => (
  <DialogPrimitive.Description asChild>
    <Text ref={ref} size={size} emphasis={emphasis} {...rest} />
  </DialogPrimitive.Description>
));
Description.displayName = 'Sheet.Description';

type SheetCloseElement = React.ElementRef<typeof DialogPrimitive.Close>;
interface SheetCloseProps extends ComponentPropsWithout<typeof DialogPrimitive.Close, RemovedProps> {}
/** Close button for the Sheet. Expects a single element child rendered via `asChild`. */
const Close = React.forwardRef<SheetCloseElement, SheetCloseProps>(({ children, ...props }, ref) => (
  <DialogPrimitive.Close {...props} ref={ref} asChild>
    {requireReactElement(children)}
  </DialogPrimitive.Close>
));
Close.displayName = 'Sheet.Close';

export { Root, Trigger, Content, Title, Description, Close };
export type {
  SheetRootProps as RootProps,
  SheetTriggerProps as TriggerProps,
  SheetContentProps as ContentProps,
  SheetTitleProps as TitleProps,
  SheetDescriptionProps as DescriptionProps,
  SheetCloseProps as CloseProps,
};
