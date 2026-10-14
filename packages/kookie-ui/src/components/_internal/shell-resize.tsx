import * as React from 'react';
import type { PaneName } from '../shell.types.js';

export interface PaneResizeContextValue {
  containerRef: React.RefObject<HTMLElement | null>;
  /** The pane the handle resizes, for `aria-controls`. */
  controls: string;
  cssVarName: string;
  minSize: number;
  maxSize: number;
  defaultSize: number;
  orientation: 'vertical' | 'horizontal';
  edge: 'start' | 'end';
  /**
   * +1 when moving the pointer toward the end of its axis grows the pane, -1
   * when it shrinks it. Read once when a drag starts, with the pane's
   * resolved direction, so no move pays for a style read.
   */
  growth: (isRtl: boolean) => 1 | -1;
  onResize?: (size: number) => void;
  onResizeStart?: (size: number) => void;
  onResizeEnd?: (size: number) => void;
  target: PaneName;
  collapsible: boolean;
  snapPoints?: number[];
  snapTolerance: number;
  collapseThreshold?: number;
  requestCollapse?: () => void;
  requestToggle?: () => void;
}

export const PaneResizeContext = React.createContext<PaneResizeContextValue | null>(null);

export function usePaneResize() {
  const ctx = React.useContext(PaneResizeContext);
  if (!ctx) throw new Error('Shell.Handle must be used within a resizable pane');
  return ctx;
}
