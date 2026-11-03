import * as React from 'react';

/**
 * The overlay a Navigator screen sits in: a Dialog, a Sheet or a Popover. Its `Title` wraps the
 * screen's title so it names the panel, and its `Close` wraps the band's close button. Set by
 * each overlay's Content, which also tells the Navigator it is not in a Shell pane, even when
 * the overlay was opened from one.
 */
type NavigatorHost = {
  Title: React.ComponentType<{ children: React.ReactElement<{ id?: string }> }>;
  Close: React.ComponentType<{ children: React.ReactElement }>;
};

const NavigatorHostContext = React.createContext<NavigatorHost | null>(null);

export { NavigatorHostContext };
export type { NavigatorHost };
