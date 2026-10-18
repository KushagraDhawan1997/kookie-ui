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
  const size = visual?.size ?? '2';
  const menuVariant = visual?.menuVariant ?? 'soft';
  return ['rt-ShellPaneChrome', `rt-r-size-${size}`, `rt-menu-variant-${menuVariant}`];
}

interface PaneHeaderProps extends React.ComponentPropsWithoutRef<'div'> {}

/** A pane's header row, pinned above its scrolling region. */
const PaneHeader = React.forwardRef<HTMLDivElement, PaneHeaderProps>(({ className, ...props }, forwardedRef) => {
  const chrome = useChromeClasses();
  return <div {...props} ref={forwardedRef} className={classNames('rt-ShellPaneHeader', 'rt-SidebarHeader', 'rt-SidebarHeader--container', ...chrome, className)} />;
});
PaneHeader.displayName = 'Shell.PaneHeader';

interface PaneFooterProps extends React.ComponentPropsWithoutRef<'div'> {}

/** A pane's footer row, pinned below its scrolling region. */
const PaneFooter = React.forwardRef<HTMLDivElement, PaneFooterProps>(({ className, ...props }, forwardedRef) => {
  const chrome = useChromeClasses();
  return <div {...props} ref={forwardedRef} className={classNames('rt-ShellPaneFooter', 'rt-SidebarFooter', 'rt-SidebarFooter--container', ...chrome, className)} />;
});
PaneFooter.displayName = 'Shell.PaneFooter';

interface ScrollProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * The one region of a pane that scrolls; it takes the room the header and footer leave.
 * It is not a landmark: for navigation, pass `role="navigation"` and an `aria-label`.
 */
const Scroll = React.forwardRef<HTMLDivElement, ScrollProps>(({ className, children, ...props }, forwardedRef) => {
  const chrome = useChromeClasses();
  return (
    <ScrollArea type="hover" className="rt-ShellScroll">
      <div {...props} ref={forwardedRef} className={classNames('rt-BaseMenuContent', 'rt-SidebarContent', ...chrome, className)}>
        <div className="rt-BaseMenuViewport">{children}</div>
      </div>
    </ScrollArea>
  );
});
Scroll.displayName = 'Shell.Scroll';

export { SidebarVisualContext, useSidebarVisual, ShellSizeContext, PaneChromeScope, PaneHeader, PaneFooter, Scroll };
export type { SidebarVisualContextValue, PaneSize, PaneHeaderProps, PaneFooterProps, ScrollProps };
