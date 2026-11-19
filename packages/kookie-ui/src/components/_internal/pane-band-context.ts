import * as React from 'react';

type BandSize = '1' | '2' | '3' | '4';

/**
 * Set by `Shell.PaneHeader` and `Shell.PaneFooter` to their band size, and by `Shell.Scroll` to
 * null (a scrolling list has no band). `PortalTheme`, the root of every portalled surface
 * (Popover, Dialog, Sheet, menus), sets null too, so a Toolbar in one does not take the Shell's
 * step; a `Theme asChild` an app nests in a pane leaves it alone. `Shell.Root` clears it again.
 * A Dialog or Sheet panel sets it to one step above the panel's own size, so its top row and any
 * toolbar in it rest there, as a pane's do.
 * Unset (`undefined`) everywhere else.
 *
 * Its own module so PortalTheme can reset it without bringing the Shell.
 */
const PaneBandSizeContext = React.createContext<BandSize | null | undefined>(undefined);

/**
 * The index a Toolbar in a band rests at when it states none: one step above the surface it sits
 * in (a Shell, a Dialog, a Sheet), so the band reads as chrome over the rows (v2 BAND_STEP). 4 has
 * no step above.
 */
const BAND_STEP = { '1': '2', '2': '3', '3': '4', '4': '4' } as const satisfies Record<BandSize, BandSize>;

/** The band step for a panel of this size; none for a responsive size. */
function panelBandSize(size: unknown): BandSize | null {
  return typeof size === 'string' && size in BAND_STEP ? BAND_STEP[size as BandSize] : null;
}

export { PaneBandSizeContext, BAND_STEP, panelBandSize };
export type { BandSize };
