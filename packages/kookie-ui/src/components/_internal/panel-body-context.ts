import * as React from 'react';

/**
 * True inside a Dialog or Sheet panel. A ScrollArea there is the panel's body and fades its edges
 * by default, so rows ease out under the pinned top row instead of being cut. A ScrollArea sets it
 * back to false for its own children, so only the outermost one takes the default.
 */
const PanelBodyContext = React.createContext(false);

export { PanelBodyContext };
