import type * as React from 'react';

export type PresentationValue = 'fixed' | 'overlay' | 'stacked';

export type ResponsivePresentation = PresentationValue | Partial<Record<'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', PresentationValue>>;

export type PaneMode = 'expanded' | 'collapsed';
export type SidebarMode = 'collapsed' | 'thin' | 'expanded';

export type ResponsiveMode = PaneMode | Partial<Record<'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', PaneMode>>;

export type ResponsiveSidebarMode = SidebarMode | Partial<Record<'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', SidebarMode>>;

export type Responsive<T> = T | Partial<Record<'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', T>>;

export type PaneSizePersistence = {
  load?: () => number | Promise<number | undefined> | undefined;
  save?: (size: number) => void | Promise<void>;
};

/**
 * Why a pane's open state changed. Since 0.8.0 only a user action is reported:
 * `toggle` for a Trigger, a handle double-click or a drag past
 * `collapseThreshold`, and `dismiss` for Escape or a press on the scrim.
 * `init`, `responsive`, `panel` and `left` are kept in the types for
 * compatibility and are never sent.
 */
export type PaneOpenChangeReason = 'toggle' | 'dismiss' | 'init' | 'responsive';

export interface PaneBaseProps extends React.ComponentPropsWithoutRef<'div'> {
  presentation?: ResponsivePresentation;
  expandedSize?: number;
  minSize?: number;
  maxSize?: number;
  resizable?: boolean;
  collapsible?: boolean;
  /** @deprecated Use `onOpenChange`. Still called on every change to whether the pane is shown. */
  onExpand?: () => void;
  /** @deprecated Use `onOpenChange`. Still called on every change to whether the pane is shown. */
  onCollapse?: () => void;
  onResize?: (size: number) => void;
  onResizeStart?: (size: number) => void;
  onResizeEnd?: (size: number) => void;
  /** @deprecated Removed in 1.0. Snap in your own `onSizeChange` and pass `size`. */
  snapPoints?: number[];
  /** @deprecated Removed in 1.0, with `snapPoints`. */
  snapTolerance?: number;
  /** @deprecated Removed in 1.0. Close the pane from your own `onResizeEnd`. */
  collapseThreshold?: number;
  /** @deprecated Removed in 1.0. Keep the size in your own state with `size`/`onSizeChange`. */
  paneId?: string;
  /** @deprecated Removed in 1.0. Keep the size in your own state with `size`/`onSizeChange`. */
  persistence?: PaneSizePersistence;
}

export const _BREAKPOINTS = {
  xs: '(min-width: 520px)',
  sm: '(min-width: 768px)',
  md: '(min-width: 1024px)',
  lg: '(min-width: 1280px)',
  xl: '(min-width: 1640px)',
} as const;

export type Breakpoint = 'initial' | keyof typeof _BREAKPOINTS;

/** Every breakpoint, smallest first. The stylesheet's @media blocks follow this order. */
export const SHELL_BREAKPOINTS: readonly Breakpoint[] = ['initial', 'xs', 'sm', 'md', 'lg', 'xl'];

export type PaneTarget = 'left' | 'rail' | 'panel' | 'sidebar' | 'inspector' | 'bottom';

/** The panes a Trigger can drive. `left` is the deprecated name for `rail`. */
export type PaneName = Exclude<PaneTarget, 'left'>;

/**
 * CSS custom property key type for type-safe style objects.
 * Allows any string prefixed with '--'.
 */
export type CSSCustomProperty = `--${string}`;

/**
 * Style object that supports CSS custom properties.
 */
export type CSSPropertiesWithVars = React.CSSProperties & {
  [key: CSSCustomProperty]: string | number | undefined;
};
