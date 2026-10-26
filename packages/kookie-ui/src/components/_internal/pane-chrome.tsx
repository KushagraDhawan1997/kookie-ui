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
import { ShellStoreContext } from './shell-store.js';
import { PaneBandSizeContext, type BandSize } from './pane-band-context.js';
import { usePageScrollMedia } from './shell-page-scroll.js';

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
 * True inside `Shell.Content`. `Shell.Root` sets it back to false, so a Shell nested in the
 * content gets pane chrome in its own panes. Read by `Shell.Scroll`: in the content it holds a
 * page, not a menu, so it takes none of the menu's padding, gap or layering.
 */
const ShellContentContext = React.createContext(false);

/**
 * True inside a window Shell: one with no `contained` and no `height`, which lets the page scroll
 * on a narrow touch screen. Each `Shell.Root` sets its own, so a Shell nested in another answers
 * for itself.
 */
const ShellWindowContext = React.createContext(false);

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
  return ['kui-ShellPaneChrome', `kui-r-size-${size}`, `kui-menu-variant-${menuVariant}`];
}

/**
 * The index a Toolbar in a pane's header or footer rests at when it states none: one step above
 * the Shell's, so the band reads as chrome over the rows (v2 BAND_STEP). 4 has no step above.
 */
const BAND_STEP = { '1': '2', '2': '3', '3': '4', '4': '4' } as const satisfies Record<BandSize, BandSize>;

function useBandSize(): BandSize {
  const visual = useSidebarVisual();
  const shellSize = React.useContext(ShellSizeContext);
  return BAND_STEP[visual?.size ?? shellSize];
}

/**
 * The size a Toolbar with no `size` of its own rests at, or null for none.
 *
 * In a pane's header or footer it is that band's size. Anywhere else inside a Shell, such as
 * `Shell.Content` or a pane's body, it is the same step: one above the Shell's index, so a
 * toolbar in the content area matches the ones in the pane headers beside it (v2 sizes every
 * toolbar this way). A pane's scrolling list, and anything outside a Shell, has none.
 */
function usePaneBandSize(): BandSize | null {
  const band = React.useContext(PaneBandSizeContext);
  const inShell = React.useContext(ShellStoreContext) !== null;
  const step = useBandSize();
  if (band !== undefined) return band;
  return inShell ? step : null;
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
      className={classNames('kui-ShellPaneHeader', 'kui-SidebarHeader', 'kui-SidebarHeader--container', ...chrome, className)}
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
      className={classNames('kui-ShellPaneFooter', 'kui-SidebarFooter', 'kui-SidebarFooter--container', ...chrome, className)}
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
 * In `Shell.Content` it is the page's scroller, and a `Shell.PaneHeader float` beside it pins
 * the page's toolbar over it. The ref, events and ARIA props land on the element that scrolls;
 * `className`, `style` and `dir` apply to the content inside it. In a Rail, Panel or Sidebar the pane is
 * already a navigation landmark, so it needs no role of its own.
 */
const Scroll = React.forwardRef<HTMLDivElement, ScrollProps>(({ className, style, dir, children, fade = false, ...props }, forwardedRef) => {
  const chrome = useChromeClasses();
  // A Sidebar.Root inside the content still gets a menu.
  const contentPane = React.useContext(ShellContentContext);
  const visual = useSidebarVisual();
  const inContent = contentPane && visual === null;
  // While the page scrolls, the content's viewport scrolls nothing: as a tab stop it would take a
  // Tab, ring the whole page and move nothing. Resolved after mount; a `tabIndex` of the caller's wins.
  const windowShell = React.useContext(ShellWindowContext);
  const pageScrolls = usePageScrollMedia();
  if (inContent) {
    const tabIndex = props.tabIndex ?? (windowShell && pageScrolls ? -1 : undefined);
    return (
      <ScrollArea {...props} tabIndex={tabIndex} ref={forwardedRef} type="hover" fade={fade} className="kui-ShellScroll">
        <div style={style} dir={dir} className={classNames('kui-ShellScrollContent', className)}>
          {children}
        </div>
      </ScrollArea>
    );
  }
  return (
    <ScrollArea {...props} ref={forwardedRef} type="hover" fade={fade} className="kui-ShellScroll">
      <div style={style} dir={dir} className={classNames('kui-BaseMenuContent', 'kui-SidebarContent', ...chrome, className)}>
        {/* A header's band does not reach a Toolbar in the scrolling list. */}
        <PaneBandSizeContext.Provider value={null}>
          <div className="kui-BaseMenuViewport">{children}</div>
        </PaneBandSizeContext.Provider>
      </div>
    </ScrollArea>
  );
});
Scroll.displayName = 'Shell.Scroll';

export { SidebarVisualContext, useSidebarVisual, ShellSizeContext, ShellContentContext, ShellWindowContext, PaneChromeScope, PaneHeader, PaneFooter, Scroll, BAND_STEP, usePaneBandSize };
export type { SidebarVisualContextValue, PaneSize, BandSize, PaneHeaderProps, PaneFooterProps, ScrollProps };
