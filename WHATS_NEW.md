# What's new in Womp's Design System

## 0.15.0 (October 18)

1. **The cleanup (breaking).** Everything 0.14 warned about is gone: `classic`, `panelBackground`, `isInvalid`, the menu variants, Callout, AppBar, the UserCard export, `Sidebar.Root` and thin mode.
2. **No motion.** State changes are instant. Only spinners, skeletons and loading bars still move.
3. **Sizes match.** Every size a component offers is styled, and Code, Kbd, Link and Blockquote share Text's scale.

## 0.14.4 (October 19)

1. **Two fixes for 0.14.** Buttons reject `emphasis` and `variant` together at compile time instead of crashing, and Rail icons stay visible when the system asks for more contrast.

## 0.14.3 (October 18)

1. **Button emphasis.** `emphasis="loud"`, `"medium"` or `"quiet"` sets a button's rank: solid, raised or ghost. Use it or `variant`, not both.

## 0.14.2 (October 18)

1. **Notice looks like Callout.** Even padding, the icon on the first line, and a lighter fill.

## 0.14.1 (October 18)

1. **Sidebar lives in the Shell.** Sidebar rows go straight into `Shell.Sidebar`, between `Shell.PaneHeader`, `Shell.Scroll` and `Shell.PaneFooter`. In `Shell.Rail` the same rows are tiles, which replaces thin mode. `Sidebar.Root` and thin mode still work, warn in development, and go in 0.15.0.

## 0.14.0 (October 18)

1. **New defaults.** Controls rest raised, badges and avatars rest gray, and the theme is gray and solid unless you set it. Menus use a soft highlight, and a solid one when the system asks for more contrast.
2. **One button.** `Button iconOnly` is the icon button. Fields, Select, Tabs and Navbar gain size 4.
3. **Notice replaces Callout.** Callout, AppBar, the UserCard export, `classic`, `panelBackground` and `isInvalid` still work, warn in development, and go in 0.15.0.

## 0.13.1 (October 17)

1. **One height for every control.** A control of a given size is now the same height everywhere. Sidebar rows and Tabs are a step shorter, and Select items at size 3 are a step taller.

## 0.13.0 (October 16)

1. **No flash of the wrong theme.** Light or dark is set before the page first paints. A new `useAppearance` hook reads and changes it.

## 0.12.0 (October 16)

1. **Toolbar becomes AppBar (breaking).** The old Toolbar is now AppBar. Toolbar is a new row of controls, with its own page.
2. **Chatbar.Item.** A removable pill for what a message refers to, like a picked mode or a scene object. Attachments use the same pill.

## 0.10.0 (October 15)

1. **Scroll fade.** ScrollArea and MessageScroller fade their edges when there is more to scroll.

## 0.9.1 (October 15)

1. **MessageScroller and Notice.** Two new components, and Chatbar can show notices.
2. **New docs address.** The docs live at womp-ui.kookie.design.

## 0.8.1 (October 15)

1. **Sidebar accessibility.** The Sidebar works better with keyboards and screen readers.

## 0.8.0 (October 14)

1. **New Shell.** The Shell is rebuilt with no motion, and its docs are rewritten.

## 0.7.0 (September 20)

1. **highContrast is gone (breaking).** Use the new `emphasis` prop and the ink and solid color tokens instead.

## 0.6.0 (September 19)

1. **Blocks in the docs.** Kookie Blocks are now copy-paste blocks inside the docs.
2. **New docs structure.** The docs are organised into chapters, starting with Principles and Vocabulary.
3. **Lighter scrollbars.** The scroll thumb is lighter and the track is gone.

## 0.5.0 sync (September 18)

1. **Parity with Womp.** The repo catches up with wompxyz/kookie-ui 0.5.0.

## 0.3.23 (September 10)

1. **Faster rendering.** Components do less work per render, and blur is skipped inside surfaces that already blur.
2. **Steadier Shell.** Shell panes and the progress bar stop animating layout, and the sidebar width steps instead of sliding.
