import type * as React from 'react';

export type PresentationValue = 'fixed' | 'overlay' | 'stacked';

export type ResponsivePresentation = PresentationValue | Partial<Record<'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', PresentationValue>>;

export type PaneMode = 'expanded' | 'collapsed';
export type SidebarMode = 'collapsed' | 'expanded';

export type ResponsiveMode = PaneMode | Partial<Record<'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', PaneMode>>;

export type ResponsiveSidebarMode = SidebarMode | Partial<Record<'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', SidebarMode>>;

export type Responsive<T> = T | Partial<Record<'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', T>>;

/**
 * Why a pane's open state changed. Only a user action is reported: `toggle` for a Trigger or a
 * handle double-click, and `dismiss` for Escape or a press on the scrim.
 */
export type PaneOpenChangeReason = 'toggle' | 'dismiss';

export interface PaneBaseProps extends React.ComponentPropsWithoutRef<'div'> {
  presentation?: ResponsivePresentation;
  expandedSize?: number;
  minSize?: number;
  maxSize?: number;
  resizable?: boolean;
  collapsible?: boolean;
  onResize?: (size: number) => void;
  onResizeStart?: (size: number) => void;
  onResizeEnd?: (size: number) => void;
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

/** The panes a Trigger can drive. */
export type PaneTarget = 'rail' | 'panel' | 'sidebar' | 'inspector' | 'bottom';

export type PaneName = PaneTarget;

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
