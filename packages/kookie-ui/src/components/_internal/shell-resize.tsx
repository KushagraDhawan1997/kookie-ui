import * as React from 'react';

export interface PaneResizeContextValue {
  containerRef: React.RefObject<HTMLDivElement | null>;
  cssVarName: string;
  minSize: number;
  maxSize: number;
  defaultSize: number;
  /** The pane's current size in px. Renders the handle's `aria-valuenow`. */
  currentSize: number;
  orientation: 'vertical' | 'horizontal';
  edge: 'start' | 'end';
  computeNext: (clientPos: number, startClientPos: number, startSize: number) => number;
  onResize?: (size: number) => void;
  onResizeStart?: (size: number) => void;
  onResizeEnd?: (size: number) => void;
  target: 'left' | 'rail' | 'panel' | 'sidebar' | 'inspector' | 'bottom';
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
