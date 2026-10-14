'use client';

import * as React from 'react';
import classNames from 'classnames';
import { useComposedRefs } from '../../helpers/react-utils.js';
import { PaneResizeContext } from './shell-resize.js';
import { PaneHandle, SidebarHandle } from './shell-handles.js';
import { usePane, paneAttributes, usePresentationTable } from './shell-pane.js';
import { splitHandles, useResizablePane, type SizeChangeMeta } from './shell-resizable.js';
import { useInsetRegistration, warnOnce, type PaneValue } from './shell-store.js';
import { navigationRest, startAnchoredGrowth, withoutRemovedPaneProps } from './shell-rest.js';
import { readBreakpoint } from '../../hooks/use-breakpoint.js';
import type { Breakpoint, CSSPropertiesWithVars, PaneBaseProps, Responsive, SidebarMode } from '../shell.types.js';

type SidebarStateChangeMeta = { reason: 'init' | 'toggle' | 'responsive' | 'dismiss' };
type SidebarControlledProps = { state: Responsive<SidebarMode>; onStateChange?: (state: SidebarMode, meta: SidebarStateChangeMeta) => void; defaultState?: never };
type SidebarUncontrolledProps = { defaultState?: SidebarMode | Partial<Record<Breakpoint, SidebarMode>>; onStateChange?: (state: SidebarMode, meta: SidebarStateChangeMeta) => void; state?: never };
type SidebarPublicProps = PaneBaseProps & {
  thinSize?: number;
  /** `both` toggles through collapsed, thin and expanded; `single` between collapsed and the default. */
  toggleModes?: 'both' | 'single';
  size?: number | string;
  defaultSize?: number | string;
  onSizeChange?: (size: number, meta: SizeChangeMeta) => void;
  sizeUpdate?: 'throttle' | 'debounce';
  sizeUpdateMs?: number;
  /** When true, adds margin and triggers the gray backdrop on the Shell. */
  inset?: boolean;
} & (SidebarControlledProps | SidebarUncontrolledProps);

type SidebarComponent = React.ForwardRefExoticComponent<SidebarPublicProps & React.RefAttributes<HTMLDivElement>> & { Handle: typeof SidebarHandle };

const toValue = (mode: SidebarMode): PaneValue => (mode === 'collapsed' ? 'closed' : mode === 'thin' ? 'thin' : 'open');
const toMode = (value: PaneValue): SidebarMode => (value === 'closed' ? 'collapsed' : value === 'thin' ? 'thin' : 'expanded');

function modeToValue(state: Responsive<SidebarMode> | undefined): PaneValue | Partial<Record<Breakpoint, PaneValue>> | undefined {
  if (state === undefined) return undefined;
  if (typeof state === 'string') return toValue(state);
  const map: Partial<Record<Breakpoint, PaneValue>> = {};
  for (const [bp, mode] of Object.entries(state) as Array<[Breakpoint, SidebarMode | undefined]>) {
    if (mode !== undefined) map[bp] = toValue(mode);
  }
  return map;
}

const SIDEBAR_PROP_NAMES = { controlled: 'state', default: 'defaultState' };

/** Since 0.8.0 the Sidebar is in the frame from 768px up, the boundary kookie-ui-v2 uses everywhere. It was 1024px. */
const SIDEBAR_DEFAULT_PRESENTATION = { initial: 'overlay', sm: 'fixed' } as const;

const toggleBoth = (current: PaneValue): PaneValue => (current === 'closed' ? 'thin' : current === 'thin' ? 'open' : 'closed');
const toggleSingle = (current: PaneValue, defaultHere: PaneValue | undefined): PaneValue => {
  const target: PaneValue = defaultHere === 'thin' ? 'thin' : 'open';
  if (current === 'closed') return target;
  return current === target ? 'closed' : target;
};

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarPublicProps>((props, ref) => {
  const {
    className,
    presentation = SIDEBAR_DEFAULT_PRESENTATION,
    expandedSize = 288,
    minSize = 200,
    maxSize = 400,
    resizable = false,
    collapsible = true,
    onExpand,
    onCollapse,
    onResize,
    onResizeStart,
    onResizeEnd,
    snapPoints,
    snapTolerance,
    collapseThreshold,
    paneId,
    persistence,
    children,
    style,
    thinSize = 64,
    toggleModes = 'both',
    state,
    defaultState,
    onStateChange,
    size,
    defaultSize,
    onSizeChange,
    sizeUpdate,
    sizeUpdateMs = 50,
    inset,
    id,
    ...domProps
  } = props;

  const { table, attributes } = usePresentationTable(presentation, 'fixed');
  const pane = usePane({
    name: 'sidebar',
    label: 'Sidebar',
    propNames: SIDEBAR_PROP_NAMES,
    id,
    controlled: modeToValue(state),
    defaultValue: modeToValue(defaultState),
    presentationTable: table,
    builtIn: navigationRest,
    onChange: (value, reason) => onStateChange?.(toMode(value), { reason }),
    toggleNext: toggleModes === 'single' ? toggleSingle : toggleBoth,
    onExpand,
    onCollapse,
    size: expandedSize,
  });
  useInsetRegistration('sidebar', inset);

  React.useEffect(() => {
    if (snapPoints !== undefined || collapseThreshold !== undefined || paneId !== undefined || persistence !== undefined) {
      warnOnce('Shell.Sidebar: `snapPoints`, `collapseThreshold`, `paneId` and `persistence` are deprecated and are removed in 1.0. Keep the size in your own state with `size`/`onSizeChange`.');
    }
  }, [snapPoints, collapseThreshold, paneId, persistence]);

  const elementRef = React.useRef<HTMLElement | null>(null);
  const composedRef = useComposedRefs(ref, pane.setElement, elementRef);

  const resize = useResizablePane({
    name: 'sidebar',
    elementId: pane.id,
    elementRef,
    cssVarName: '--sidebar-size',
    orientation: 'vertical',
    edge: 'end',
    growth: startAnchoredGrowth,
    expandedSize,
    minSize,
    maxSize,
    resizable,
    collapsible,
    size,
    defaultSize,
    onSizeChange,
    sizeUpdate,
    sizeUpdateMs,
    onResize,
    onResizeStart,
    onResizeEnd,
    snapPoints,
    snapTolerance,
    collapseThreshold,
    paneId,
    persistence,
    overlaying: pane.overlaying,
    overlayingNow: () => table[readBreakpoint()] === 'overlay',
    requestCollapse: () => pane.setValue('closed', 'toggle'),
    requestToggle: () => pane.toggle('toggle'),
  });

  const { handles, content } = splitHandles(children, SidebarHandle);
  // A thin sidebar has no handle: the thin width is a mode, not a size.
  const handle =
    resizable && pane.value !== 'closed' && pane.value !== 'thin' && !pane.overlaying ? (
      <PaneResizeContext.Provider value={resize}>{handles.length > 0 ? handles : <PaneHandle />}</PaneResizeContext.Provider>
    ) : null;

  // A peek previews the width the next toggle would open to.
  const peekWidth = pane.peeking
    ? (toggleModes === 'single' ? toggleSingle : toggleBoth)('closed', pane.defaultHereNow()) === 'thin'
      ? `${thinSize}px`
      : `var(--sidebar-size, ${expandedSize}px)`
    : undefined;

  return (
    <div
      {...withoutRemovedPaneProps(domProps)}
      id={pane.id}
      ref={composedRef}
      className={classNames('rt-ShellPane', 'rt-ShellSidebar', className)}
      {...paneAttributes(pane, attributes)}
      data-inset={inset || undefined}
      tabIndex={pane.overlaying ? -1 : domProps.tabIndex}
      style={
        {
          ...style,
          '--sidebar-expanded-size': `${expandedSize}px`,
          '--sidebar-thin-size': `${thinSize}px`,
          '--sidebar-min-size': `${minSize}px`,
          '--sidebar-max-size': `${maxSize}px`,
          ...(peekWidth ? { '--peek-sidebar-width': peekWidth } : {}),
        } as CSSPropertiesWithVars
      }
    >
      <div className="rt-ShellSidebarContent">{content}</div>
      {handle}
    </div>
  );
}) as SidebarComponent;

Sidebar.displayName = 'Shell.Sidebar';
Sidebar.Handle = SidebarHandle;
