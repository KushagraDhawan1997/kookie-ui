import * as React from 'react';

type BandSize = '1' | '2' | '3' | '4';

/**
 * Set by `Shell.PaneHeader` and `Shell.PaneFooter` to their band size, and by `Shell.Scroll` to
 * null (a scrolling list has no band). A `Theme asChild`, the root of every portalled surface
 * (Popover, Dialog, Sheet, menus), sets null too, so a Toolbar in one does not take the Shell's
 * step. `Shell.Root` clears it again. Unset (`undefined`) everywhere else.
 *
 * Its own module so Theme can reset it without bringing the Shell.
 */
const PaneBandSizeContext = React.createContext<BandSize | null | undefined>(undefined);

export { PaneBandSizeContext };
export type { BandSize };
