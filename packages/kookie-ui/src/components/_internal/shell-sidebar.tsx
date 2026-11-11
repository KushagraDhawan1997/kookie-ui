'use client';

import * as React from 'react';
import classNames from 'classnames';
import { useComposedRefs } from 'radix-ui/internal';
import { PaneResizeContext } from './shell-resize.js';
import { PaneHandle, SidebarHandle } from './shell-handles.js';
import { usePane, paneAttributes, usePresentationTable } from './shell-pane.js';
import { splitHandles, useInitialPaneSize, useResizablePane, type SizeChangeMeta } from './shell-resizable.js';
import { useFrameRegistration, type PaneValue } from './shell-store.js';
import { navigationRest, startAnchoredGrowth } from './shell-rest.js';
import { readBreakpoint } from '../../hooks/use-breakpoint.js';
import { PaneChromeScope } from './pane-chrome.js';
import { PageScope } from './page-scope.js';
import type { Breakpoint, CSSPropertiesWithVars, PaneBaseProps, PaneOpenChangeReason, Responsive, SidebarMode } from '../shell.types.js';

type SidebarStateChangeMeta = { reason: PaneOpenChangeReason };
type SidebarControlledProps = { state: SidebarMode; onStateChange?: (state: SidebarMode, meta: SidebarStateChangeMeta) => void; defaultState?: never };
type SidebarUncontrolledProps = { defaultState?: SidebarMode | Partial<Record<Breakpoint, SidebarMode>>; onStateChange?: (state: SidebarMode, meta: SidebarStateChangeMeta) => void; state?: never };
type SidebarPublicProps = PaneBaseProps & {
  size?: number | string;
  defaultSize?: number | string;
  onSizeChange?: (size: number, meta: SizeChangeMeta) => void;
  sizeUpdate?: 'throttle' | 'debounce';
  sizeUpdateMs?: number;
  /**
   * Sets whether this pane joins the app frame. The default is `true`: the pane sits against its
   * neighbours with one hairline between them. Set `flush={false}` to pull it off the frame as a
   * card. It then floats over the content if the content is flush, and otherwise sits on the
   * Shell's background beside a card content.
   */
  flush?: boolean;
} & (SidebarControlledProps | SidebarUncontrolledProps);

type SidebarComponent = React.ForwardRefExoticComponent<SidebarPublicProps & React.RefAttributes<HTMLDivElement>> & { Handle: typeof SidebarHandle };

const toValue = (mode: SidebarMode): PaneValue => (mode === 'collapsed' ? 'closed' : 'open');
const toMode = (value: PaneValue): SidebarMode => (value === 'closed' ? 'collapsed' : 'expanded');

function modeToValue(state: SidebarMode | undefined): PaneValue | undefined;
function modeToValue(state: Responsive<SidebarMode> | undefined): PaneValue | Partial<Record<Breakpoint, PaneValue>> | undefined;
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


export const Sidebar = React.forwardRef<HTMLDivElement, SidebarPublicProps>((props, ref) => {
  const {
    className,
    presentation = SIDEBAR_DEFAULT_PRESENTATION,
    expandedSize = 288,
    minSize = 200,
    maxSize = 400,
    resizable = false,
    collapsible = true,
    onResize,
    onResizeStart,
    onResizeEnd,
    children,
    style,
    state,
    defaultState,
    onStateChange,
    size,
    defaultSize,
    onSizeChange,
    sizeUpdate,
    sizeUpdateMs = 50,
    flush = true,
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
    size: expandedSize,
  });
  useFrameRegistration('sidebar', flush);


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
    overlaying: pane.overlaying,
    overlayingNow: () => table[readBreakpoint()] === 'overlay',
    requestToggle: () => pane.toggle('toggle'),
  });

  const { handles, content } = splitHandles(children, SidebarHandle);
  const handle =
    resizable && pane.value !== 'closed' && !pane.overlaying ? (
      <PaneResizeContext.Provider value={resize}>{handles.length > 0 ? handles : <PaneHandle />}</PaneResizeContext.Provider>
    ) : null;

  const initialSize = useInitialPaneSize(size, defaultSize, minSize, maxSize);
  return (
    <div
      {...domProps}
      role={domProps.role ?? 'navigation'}
      id={pane.id}
      ref={composedRef}
      className={classNames('kui-ShellPane', 'kui-ShellSidebar', className)}
      {...paneAttributes(pane, attributes)}
      data-flush={flush || undefined}
      tabIndex={pane.overlaying ? -1 : domProps.tabIndex}
      style={
        {
          ...style,
          '--sidebar-expanded-size': `${expandedSize}px`,
          ...(initialSize ? { '--sidebar-size': initialSize } : {}),
          '--sidebar-min-size': `${minSize}px`,
          '--sidebar-max-size': `${maxSize}px`,
        } as CSSPropertiesWithVars
      }
    >
      <div className="kui-ShellSidebarContent">
        <PaneChromeScope>
          <PageScope>{content}</PageScope>
        </PaneChromeScope>
      </div>
      {handle}
    </div>
  );
}) as SidebarComponent;

Sidebar.displayName = 'Shell.Sidebar';
Sidebar.Handle = SidebarHandle;

export type { SidebarPublicProps };
