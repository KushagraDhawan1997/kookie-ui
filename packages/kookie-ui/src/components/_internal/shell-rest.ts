import type { Breakpoint, PresentationValue } from '../shell.types.js';
import type { PaneValue } from './shell-store.js';

type ResponsiveBoolean = boolean | Partial<Record<Breakpoint, boolean>>;

/** `open`/`defaultOpen` as the pane's own value type. */
export function toPaneValue(value: ResponsiveBoolean | undefined): PaneValue | Partial<Record<Breakpoint, PaneValue>> | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value ? 'open' : 'closed';
  const map: Partial<Record<Breakpoint, PaneValue>> = {};
  for (const [bp, open] of Object.entries(value) as Array<[Breakpoint, boolean | undefined]>) {
    if (typeof open === 'boolean') map[bp] = open ? 'open' : 'closed';
  }
  return map;
}

/**
 * Where an untouched navigation column rests: open where it sits in the
 * frame, closed where it would cover it. An overlay is summoned, never
 * ambient.
 */
export const navigationRest = (presentation: PresentationValue): PaneValue => (presentation === 'overlay' ? 'closed' : 'open');

/** Where an untouched detail pane rests: closed. Detail is asked for. */
export const detailRest = (): PaneValue => 'closed';

/** A pane anchored at the inline start grows as its end edge moves toward the inline end. */
export const startAnchoredGrowth = (isRtl: boolean): 1 | -1 => (isRtl ? -1 : 1);

/** A pane anchored at the inline end grows as its start edge moves toward the inline start. */
export const endAnchoredGrowth = (isRtl: boolean): 1 | -1 => (isRtl ? 1 : -1);

/** A pane anchored at the block end grows as its top edge moves up. */
export const bottomAnchoredGrowth = (): 1 | -1 => -1;

/**
 * `height` and `resizer` left PaneBaseProps in 0.8.0: no pane ever read them.
 * A call site written against 0.7 can still pass them, so they are dropped
 * here rather than reaching the DOM as invalid attributes.
 */
export function withoutRemovedPaneProps<T extends object>(props: T): T {
  if (!('height' in props) && !('resizer' in props)) return props;
  const { height: _height, resizer: _resizer, ...rest } = props as T & { height?: unknown; resizer?: unknown };
  return rest as T;
}
