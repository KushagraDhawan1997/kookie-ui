'use client';

/**
 * A pane's own chrome: a header row, a scrolling region and a footer row.
 *
 * Shell.Sidebar and Shell.Panel render these as `Shell.PaneHeader`, `Shell.Scroll` and
 * `Shell.PaneFooter`. The pane renders anything; with these parts it is the presentation, so
 * Sidebar's menu parts work inside it with no `Sidebar.Root`. The index comes from the nearest
 * Shell (`Shell.Root size`), or from a deprecated `Sidebar.Root` that still wraps them.
 */

import * as React from 'react';
import classNames from 'classnames';

import { ScrollArea } from '../scroll-area.js';

type PaneSize = '1' | '2' | '3';

type SidebarVisualContextValue = {
  size: PaneSize;
  menuVariant: 'solid' | 'soft';
  presentation?: 'thin' | 'expanded';
  color?: string;
};

/** Size, menu highlight and presentation for the Sidebar parts. Internal: not exported. */
const SidebarVisualContext = React.createContext<SidebarVisualContextValue | null>(null);

function useSidebarVisual() {
  return React.useContext(SidebarVisualContext);
}

/** The Shell's index. `Shell.Root size` sets it; panes hand it to their chrome. */
const ShellSizeContext = React.createContext<PaneSize>('2');

/**
 * Gives a Shell pane's children the Shell's index, so Sidebar parts size themselves. In a Rail
 * the rows are `thin`: icon tiles with a small label, sub-menus as dropdowns.
 */
function PaneChromeScope({ children, presentation }: { children: React.ReactNode; presentation?: 'thin' }) {
  const size = React.useContext(ShellSizeContext);
  const value = React.useMemo<SidebarVisualContextValue>(() => ({ size, menuVariant: 'soft', presentation }), [size, presentation]);
  return <SidebarVisualContext.Provider value={value}>{children}</SidebarVisualContext.Provider>;
}

function useChromeClasses() {
  const visual = useSidebarVisual();
  // A pane with no scope (Inspector, Bottom) still takes the Shell's index.
  const shellSize = React.useContext(ShellSizeContext);
  const size = visual?.size ?? shellSize;
  const menuVariant = visual?.menuVariant ?? 'soft';
  return ['rt-ShellPaneChrome', `rt-r-size-${size}`, `rt-menu-variant-${menuVariant}`];
}

type BandSize = '1' | '2' | '3' | '4';

/**
 * The index a Toolbar in a pane's header or footer rests at when it states none: one step above
 * the Shell's, so the band reads as chrome over the rows (v2 BAND_STEP). 4 has no step above.
 */
const BAND_STEP = { '1': '2', '2': '3', '3': '4', '4': '4' } as const satisfies Record<BandSize, BandSize>;

/** Set by `Shell.PaneHeader` and `Shell.PaneFooter`; read by Toolbar as its fallback size. Null elsewhere. */
const PaneBandSizeContext = React.createContext<BandSize | null>(null);

function usePaneBandSize() {
  return React.useContext(PaneBandSizeContext);
}

function useBandSize(): BandSize {
  const visual = useSidebarVisual();
  const shellSize = React.useContext(ShellSizeContext);
  return BAND_STEP[visual?.size ?? shellSize];
}

interface PaneHeaderProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Floats the row over the top of `Shell.Scroll`, so the list scrolls behind it. The list
   * starts below the row, and `Shell.Scroll fade` fades it out under the row. The row paints
   * nothing and lets clicks through between its controls; a `Toolbar backdrop` in it keeps
   * the controls readable.
   */
  float?: boolean;
}

/** A pane's header row, pinned above its scrolling region. */
const PaneHeader = React.forwardRef<HTMLDivElement, PaneHeaderProps>(({ className, float, children, ...props }, forwardedRef) => {
  const chrome = useChromeClasses();
  const band = useBandSize();
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-float={float || undefined}
      className={classNames('rt-ShellPaneHeader', 'rt-SidebarHeader', 'rt-SidebarHeader--container', ...chrome, className)}
    >
      <PaneBandSizeContext.Provider value={band}>{children}</PaneBandSizeContext.Provider>
    </div>
  );
});
PaneHeader.displayName = 'Shell.PaneHeader';

interface PaneFooterProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Floats the row over the bottom of `Shell.Scroll`, the way `Shell.PaneHeader float` does at the top. */
  float?: boolean;
}

/** A pane's footer row, pinned below its scrolling region. */
const PaneFooter = React.forwardRef<HTMLDivElement, PaneFooterProps>(({ className, float, children, ...props }, forwardedRef) => {
  const chrome = useChromeClasses();
  const band = useBandSize();
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-float={float || undefined}
      className={classNames('rt-ShellPaneFooter', 'rt-SidebarFooter', 'rt-SidebarFooter--container', ...chrome, className)}
    >
      <PaneBandSizeContext.Provider value={band}>{children}</PaneBandSizeContext.Provider>
    </div>
  );
});
PaneFooter.displayName = 'Shell.PaneFooter';

interface ScrollProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Fades the list out toward an edge with more past it, and under a floating header or footer. */
  fade?: boolean;
}

/**
 * The one region of a pane that scrolls; it takes the room the header and footer leave.
 * It is not a landmark: for navigation, pass `role="navigation"` and an `aria-label`.
 */
const Scroll = React.forwardRef<HTMLDivElement, ScrollProps>(({ className, children, fade = false, ...props }, forwardedRef) => {
  const chrome = useChromeClasses();
  return (
    <ScrollArea type="hover" fade={fade} className="rt-ShellScroll">
      <div {...props} ref={forwardedRef} className={classNames('rt-BaseMenuContent', 'rt-SidebarContent', ...chrome, className)}>
        {/* A header's band does not reach a Toolbar in the scrolling list. */}
        <PaneBandSizeContext.Provider value={null}>
          <div className="rt-BaseMenuViewport">{children}</div>
        </PaneBandSizeContext.Provider>
      </div>
    </ScrollArea>
  );
});
Scroll.displayName = 'Shell.Scroll';

export { SidebarVisualContext, useSidebarVisual, ShellSizeContext, PaneChromeScope, PaneHeader, PaneFooter, Scroll, BAND_STEP, usePaneBandSize };
export type { SidebarVisualContextValue, PaneSize, BandSize, PaneHeaderProps, PaneFooterProps, ScrollProps };
