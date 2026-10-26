import * as React from 'react';

import { Theme } from '../theme.js';
import { PaneBandSizeContext } from './pane-band-context.js';

/**
 * The Theme at the root of a portalled surface (Popover, Dialog, Sheet, menus, Tooltip). The
 * surface renders outside any Shell pane even though context flows into it, so a Toolbar in it
 * does not take the pane's band size. A `Theme asChild` an app nests in a pane keeps the band.
 */
const PortalTheme = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Theme>>((props, forwardedRef) => (
  <PaneBandSizeContext.Provider value={null}>
    <Theme {...props} ref={forwardedRef} />
  </PaneBandSizeContext.Provider>
));
PortalTheme.displayName = 'PortalTheme';

export { PortalTheme };
