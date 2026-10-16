# What's new in Womp's Design System

## 0.12.0 (October 16)

1. **Toolbar becomes AppBar.** The old Toolbar is now AppBar. Toolbar is a new row of controls, with its own page.
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

1. **highContrast is gone.** Use the new `emphasis` prop and the ink and solid color tokens instead.

## 0.6.0 (September 19)

1. **Blocks in the docs.** Kookie Blocks are now copy-paste blocks inside the docs.
2. **New docs structure.** The docs follow Kookie UI's structure, with Principles and Vocabulary chapters.
3. **Lighter scrollbars.** The scroll thumb is lighter and the track is gone.

## 0.5.0 sync (September 18)

1. **Parity with Womp.** The repo catches up with wompxyz/kookie-ui 0.5.0.

## 0.3.23 (September 10)

1. **Faster rendering.** Components do less work per render, and blur is skipped inside surfaces that already blur.
2. **Steadier Shell.** Shell panes and the progress bar stop animating layout, and the sidebar width steps instead of sliding.
