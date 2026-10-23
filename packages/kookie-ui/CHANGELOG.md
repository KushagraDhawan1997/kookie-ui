## [0.21.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.20.0...v0.21.0) (2026-10-23)

The component list and composition rules become v2's. Release 5a. See MIGRATION.md.

### Breaking changes

* **button:** IconButton is removed; use `Button iconOnly` (it needs an `aria-label`).
* **toggle:** ToggleButton and ToggleIconButton become one `Toggle`, with `iconOnly` for an icon.
* **chip:** Badge is renamed Chip (`rt-Badge` → `rt-Chip`).
* **removed:** CheckboxCards, RadioCards, HoverCard, DataList, Section, Container, TabNav, Skeleton, AspectRatio, Image, ThemePanel, Quote, Em and Strong.
* **composition:** only Box, Flex and Grid take margin props. A component's parts space themselves with gap, and Accordion loses `flush`.
* **codemod:** `codemods/components-0.21.py` renames IconButton, ToggleButton, ToggleIconButton and Badge in an app.

## [0.20.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.19.0...v0.20.0) (2026-10-23)

Type and rows take v2's scale. Release 4 of 5. See MIGRATION.md.

### Breaking changes

* **type:** nine sizes (12 to 64px) and three weights (regular, medium, semibold). Text, Heading, Link, Code, Kbd and Blockquote take sizes 1 to 9; size 0 and 10 to 12, and the thin, light, bold and extrabold weights are gone. Heading rests at medium and shares Text's line heights. `codemods/type-0.20.py` rewrites an app.
* **rows:** menus, Select and Combobox lists take sizes 1 to 4. A panel pads `--panel-p-N`; a row hugs its line (30px at size 2) with pill padding at radius full. Sidebar rows stay at control height. Table cells pad 8 by 12 at size 2 and Table takes size 4.
* **notice:** Notice pads and rounds like a Card of the same size (24px at size 2).

### Fixes

* **bench:** timing checks allow one frame (16ms) above 1.5 times the baseline, so CI no longer fails on sub-frame noise.

## [0.19.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.18.0...v0.19.0) (2026-10-23)

Surfaces and corners take v2's structure. Release 3 of 5. See MIGRATION.md.

### Breaking changes

* **radius:** the palette is steps 0 to 10 plus full; `--radius-11`, `--radius-12` and `--radius-pill-N` are gone. Corners come in three roles of four steps: `--radius-control-N`, `--radius-surface-N` and `--radius-overlay-N`. v1 keeps its own roundness per step. A surface inside a surface takes the outer corner less the outer padding.
* **card:** sizes 1 to 4, resting at 2 and following Theme size; padding is `--surface-p-N` (24px at size 2). `flush`, `inset` and size 5 are gone. CheckboxCards and RadioCards follow the same ladder.
* **inset:** the Inset component is removed. Margin props take `"bleed"`, which pulls a child out to the edge of the surface around it.
* **overlays:** Dialog, AlertDialog and Sheet rest at size 2, pad one step above their size (32px at 2), take `--radius-overlay-N` corners and `--overlay-w-N` widths. The 600px default `maxWidth` is gone.
* **popover and notice:** Popover and HoverCard pad like a card (24px at 2); Notice pads like a panel (12px at 2). All take sizes 1 to 4.

## [0.18.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.17.0...v0.18.0) (2026-10-23)

Controls take v2's ladder. Release 2 of 5. See MIGRATION.md.

### Breaking changes

* **theme:** `Theme size` (1 to 4, default 2) sizes every control that sets no `size` of its own.
* **controls:** Button, IconButton, the Toggles, TextField, TextArea, Select, Combobox, SegmentedControl and Tabs share one ladder: heights 28/32/40/48 as a minimum, side padding 8/10/13/16, 12/14/17/20 on a bare edge at radius `full`, gap 4/8/8/12, icons 16/16/20/24. Icon-only buttons are square. A button in a TextField slot is the field's height less the slot inset.
* **marks:** Checkbox and Radio are 16/20/24/26px at sizes 1 to 4; Switch and Slider follow v2's tracks. Checkbox, Radio, RadioGroup and Table accept size 4.
* **sizes:** Spinner, ScrollArea, Separator and Progress take no `size`. Separator fills its container. Badge rests at size 2. Avatar follows v2's 1 to 9 ladder.
* **states:** disabled is colour only, with the arrow cursor; loading buttons stay focusable with `aria-disabled`; invalid fields key on `aria-invalid`; every button variant has one focus ring.

## [0.17.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.16.0...v0.17.0) (2026-10-23)

v1's scale becomes v2's. The first of five releases that make v1's core match v2. See MIGRATION.md.

### Breaking changes

* **space:** the palette has v2's twelve steps (2 to 128px). Every old step N is now N+1; 80px and 112px move to 64px and 96px. Layout props and `var(--space-N)` shift by one. `codemods/space-0.17.py` rewrites an app.
* **scale:** `Theme scaling` is removed and `--scaling` is `--scale`, fixed at 1.
* **material:** `material` and `panelBackground` are removed from every component and from `Theme`. Everything is solid. The `--opacity-N` and `--blur-N` tokens and the Materials page are gone.
* **controls:** `--control-height-1` is 28px (was 24).
* **shell:** Shell panes and their header, footer and scroll region pad by `--surface-p-N`, 24px at size 2 (was 12). A Toolbar in a pane row rests one size above the Shell unless it states its own.

### Features

* **tokens:** `--layout-space-N`, `--surface-p-N`, `--panel-p-N`, `--control-px-N`, `--control-px-pill-N`, `--control-gap-N`, `--icon-size-N`, `--row-inset-N`, `--slot-inset-N` and `--overlay-w-N`.

## [0.16.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.15.1...v0.16.0) (2026-10-22)

A pane's header and footer can float over its list, as in v2.

### Features

* **shell:** `float` on `Shell.PaneHeader` and `Shell.PaneFooter` puts the row over `Shell.Scroll`. The list runs the pane's full height, starts and ends clear of the rows, and keeps its scrollbar between them. The row lets clicks through between its controls.
* **shell:** `fade` on `Shell.Scroll` fades the list toward an edge with more past it, and across a floating row.
* **toolbar:** `backdrop` gives each control a surface of its own for a row that content passes behind. Buttons rest `raised` and a group's well is raised.

## [0.15.1](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.15.0...v0.15.1) (2026-10-22)

### Bug Fixes

* **scroll-area:** the scrollbar thumb follows the scroll in production builds. Next's minifier removed the loop Radix moves the thumb with, so the thumb moved once per scroll and jumped at the next one. ScrollArea and Select now move it on every scroll.

## [0.15.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.14.4...v0.15.0) (2026-10-18)

The breaking release. Everything 0.14 deprecated is removed, and so is motion. There is one way to do each thing.

### Breaking changes

* **variants:** `variant="classic"` and the `--classic-*` tokens are gone; use `raised`. Button's `variant="override"` and `overrideStyles` are gone; style it with `className`, `style` or its CSS variables.
* **menus:** `variant` is gone from DropdownMenu, ContextMenu, Select and Combobox content, and from SegmentedControl. Menus use the soft highlight, and the solid one under `prefers-contrast: more`.
* **material:** `panelBackground` is gone everywhere, including `Theme` and `ThemePanel`; use `material`. Stylesheets read `data-material` only. Checkbox, Radio, Switch, Badge and Avatar take no `material`.
* **fields:** `isInvalid` is gone from TextField and TextArea; use `error`.
* **button:** an icon-only button ignores `fullWidth`, and IconButton's type has no `fullWidth`.
* **components:** `Callout` (use `Notice`), `AppBar` (use `Toolbar`, in `Shell.Header` for an app header) and the `UserCard` export (copy the User Card docs block) are deleted.
* **sidebar:** `Sidebar.Root`, `Sidebar.Content`, `Sidebar.Header`, `Sidebar.Footer`, `menuVariant` and thin mode are deleted. Put the rows in `Shell.Sidebar` between `Shell.PaneHeader`, `Shell.Scroll` and `Shell.PaneFooter`, or in `Shell.Rail` for tiles. `Shell.Sidebar` has no thin state, `thinSize` or `toggleModes`; its toggle goes between collapsed and expanded.
* **motion:** every transition, entry and exit animation, and press and hover scale is gone, with the `--duration-*`, `--ease-*`, `--motion-*` and `--transition-*` tokens and the `motion` dependency. State changes are instant. Spinner, Skeleton, the indeterminate Progress bar and Select's loading spinner still move; the Spinner slows under reduced motion instead of stopping. Image has no `fadeIn`; it shows once loaded.
* **tokens:** 38 internal tokens nothing read are removed: the progress shine, timing and gradient steps, progress and slider heights and radii 5–9, the raised shadow factors, size multipliers, surface opacities, `--opacity-disabled`, `--opacity-soft-variant`, `--position-zero`, `--position-negative-full` and `--color-transparent`.
* **sizes:** every declared size is styled. Checkbox offers 1–3, Avatar 1–9, CheckboxCards and RadioCards 1–5. Code, Kbd, Link and Blockquote take Text's sizes 0–12 at Text's font steps, so a Kbd is one step larger at the same `size`.

### How to adopt

Fix every 0.14 deprecation warning first. Then search your code for what never warned: `material` on Checkbox, Radio, Switch, Badge or Avatar; Avatar sizes 10–12, Checkbox sizes 4 and up, CheckboxCards and RadioCards sizes 6 and up; `fadeIn` on Image; `transition` and `--motion-`, `--duration-`, `--ease-` tokens; and any `Kbd size`.

## [0.14.4](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.14.3...v0.14.4) (2026-10-19)

Two fixes from the 0.15.0 audit, for apps still on 0.14.

### Bug Fixes

* **button:** `emphasis` and `variant` are mutually exclusive on every button type: ToggleButton, ToggleIconButton, IconButton, Toolbar.Button, MessageScroller.Button and Chatbar.Send. Passing both is a type error instead of a render-time crash, and ToggleButton no longer accepts any prop. MessageScroller.Button and Chatbar.Send take `emphasis` without throwing.
* **sidebar:** under `prefers-contrast: more`, the active, highlighted or hovered Rail tile is solid with solid ink. Before, its icon took the solid ink on a pale tile and nearly vanished.

## [0.14.3](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.14.2...v0.14.3) (2026-10-18)

### Features

* **button:** `emphasis` on Button, IconButton, ToggleButton, ToggleIconButton and Toolbar.Button states a button's rank: `loud` is `solid`, `medium` is `raised` (the default) and `quiet` is `ghost`. `variant` keeps all its values, so `outline` and `surface` stay available. Passing both is a type error and throws.

## [0.14.2](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.14.1...v0.14.2) (2026-10-18)

### Visual changes

* **notice:** Notice takes Callout's look: an even inset on every side (12, 16 or 24px by size), wider gaps, the icon and actions on the first line so a long message wraps under itself, and a tinted alpha fill. Notices above the Chatbar are taller.

## [0.14.1](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.14.0...v0.14.1) (2026-10-18)

Sidebar rows live in the Shell. Nothing that worked before changes; the old Sidebar frame and thin mode warn once in development and are removed in 0.15.0.

### Features

* **shell:** `Shell.PaneHeader`, `Shell.Scroll` and `Shell.PaneFooter` hold a pane's chrome. `Shell.Root size` (1–3) sets their index.
* **sidebar:** Sidebar's menu parts work directly inside `Shell.Sidebar` and `Shell.Panel`, sized by the Shell, with no `Sidebar.Root`. In `Shell.Rail` the same rows draw as tiles: an icon with a small label, sub-menus as dropdowns. This replaces thin mode.
* **sidebar:** rows use the soft highlight, and the solid one under `prefers-contrast: more`.

### Deprecated (removed in 0.15.0)

* `Sidebar.Root`, `Sidebar.Content`, `Sidebar.Header`, `Sidebar.Footer`: use `Shell.Sidebar` with `Shell.PaneHeader`, `Shell.Scroll` and `Shell.PaneFooter`.
* `menuVariant` on Sidebar.
* Sidebar thin mode (`presentation="thin"`, `layout="rail"`) and Shell.Sidebar's thin state and `thinSize`: put the rows in `Shell.Rail`.

### How to adopt

Replace `Sidebar.Root` with `Shell.Sidebar`, `Sidebar.Header` with `Shell.PaneHeader`, `Sidebar.Content` with `Shell.Scroll role="navigation" aria-label="…"`, and `Sidebar.Footer` with `Shell.PaneFooter`. Move `size` to `Shell.Root`. A `variant="soft"` sidebar's gray fill is not drawn by the pane; set `style={{ backgroundColor: 'var(--gray-2)' }}` on `Shell.Sidebar` to keep it.

## [0.14.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.13.3...v0.14.0) (2026-10-18)

New defaults and new names. Everything that is going away still works, warns once in development, and is removed in 0.15.0.

### Visual changes

* **variants:** `raised` (renamed from `classic`) is the default wherever it exists: Button, IconButton, the toggle buttons, Checkbox, Radio, RadioGroup, Avatar, Badge, Card, CheckboxCards, RadioCards, Accordion, Callout, TextField, TextArea, the Select and Combobox triggers, UserCard and the Chatbar box. Kbd was already raised.
* **colour:** Badge, Avatar, Code, Callout and UserCard rest gray. `color` picks a category when it means something. Button and Link keep the accent.
* **theme:** `Theme` defaults to a gray accent, gray grays and solid material. Radius is unchanged.
* **menus:** DropdownMenu, ContextMenu, Select and Combobox lists use the soft highlight, and the solid one under `prefers-contrast: more`.

### Features

* **button:** `iconOnly` on Button and ToggleButton draws the square icon button and requires an accessible name. IconButton and ToggleIconButton are those two with `iconOnly` set.
* **sizes:** TextField, TextArea, Select and the Combobox field take size 4, the same height as Button size 4. Tabs and TabNav take 1–4, and Navbar 1–4. A Combobox list stops at size 3.
* **material:** Tabs, TabNav, Popover, SegmentedControl, the Select trigger, CheckboxCards and RadioCards take `material`.
* **menus:** `DropdownMenu.Virtual` and `ContextMenu.Virtual`, a virtualised list that keeps its menu's size, highlight and material.
* **variants:** RadioGroup takes Radio's variants, UserCard's `avatarVariant` takes Avatar's, and CheckboxCards and RadioCards take Card's.
* **tokens:** `--heading-font-weight` (bold by default) sets every Heading's weight. `--raised-*` replaces `--classic-*`.

### Bug Fixes

* **segmented control:** `panelBackground` reaches the stylesheet. Before, it set a class nothing read.
* **fields:** error messages drop `aria-live`, which conflicted with `role="alert"`.

### Deprecated (removed in 0.15.0)

* `variant="classic"`: use `variant="raised"`. `--classic-*` tokens: use `--raised-*`.
* `variant="override"` on Button: style it with `className`, `style` or its CSS variables.
* `variant` on DropdownMenu, ContextMenu, Select and Combobox content, and on SegmentedControl.
* `panelBackground`: use `material`.
* `isInvalid` on TextField and TextArea: use `error`.
* `fullWidth` on IconButton.
* `Callout`: use `Notice`.
* `AppBar`: use `Toolbar`, in `Shell.Header` for an app header.
* The `UserCard` export: the pattern moves to a docs block.

### How to adopt

Search for `classic`, `panelBackground`, `isInvalid`, `Callout`, `AppBar` and `UserCard`, and replace each as listed above. To keep the old look while you do, set `accentColor`, `grayColor` and `material` on your root `Theme`, and `color` or `variant` where a component should not rest gray or raised.

## [0.13.3](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.13.2...v0.13.3) (2026-10-18)

Fixes only. Nothing to change in your code. The one visible difference: disabled tabs and accordion triggers now look disabled.

### Bug Fixes

* **touch:** hover effects apply only where the pointer can hover. On touch screens, Accordion, Sidebar, the Button and Card press scale, the Shell resizer and Slider ticks no longer stay hovered after a tap.
* **disabled:** a disabled Tabs trigger or Accordion trigger reads like a disabled menu item: `--gray-a8` text, a default cursor and no hover fill. A disabled interactive Card stops reacting to the pointer.
* **theme:** the root `Theme` inherits text direction from a Radix `DirectionProvider` above it instead of forcing left-to-right. Left-to-right stays the default.
* **peer dependencies:** React `^18.0 || ^19.0`. The package already needed React 18 (`useId`, `useSyncExternalStore`); the range now says so.

### Internal

* **tokens:** `--radius-pill-1`…`--radius-pill-12`, the radius step or a pill when the theme radius is `full`, replace 54 copies of `max(var(--radius-N), var(--radius-full))`. Same computed values.
* **css:** blur, opacity and transition tokens are imported once, and styles for sizes no prop offers (Callout 4–5, Table 4–5, Progress 5–9) are gone.
* **release:** publishing requires a git tag, a matching `package.json` and CHANGELOG entry, and a version above npm's latest, and runs the tests first.

## [0.13.2](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.13.1...v0.13.2) (2026-10-17)

### Bug Fixes

* **sidebar:** in thin mode, the icon tile behind each item and the search trigger takes `--radius-full`, so it is a pill when the theme's `radius` is `full`, as buttons are. Size 3 uses `--radius-3` instead of `--radius-2`.

## [0.13.1](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.13.0...v0.13.1) (2026-10-17)

### Changes

* **tokens:** one control height ladder, `--control-height-1`…`--control-height-4`. Button, the menus, TextField, Select, SegmentedControl, Toolbar and Tabs read it, so a size means the same height on each of them.
* **sidebar:** drops its own size ladder, which ran one step taller, and takes the menus'. Sidebar rows are one step shorter.
* **tabs:** one step shorter, to match the ladder.
* **select:** items at size 3 are 40px tall.

## [0.13.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.12.0...v0.13.0) (2026-10-16)

Light and dark mode are decided before the first paint and kept on `<html>`.

### Features

* **appearance:** `appearanceScript`, a string to inline in `<head>`. It reads the stored choice, falls back to `prefers-color-scheme`, and writes the `light` or `dark` class, `data-appearance` and `color-scheme` on `<html>` before anything paints, so a dark visitor never sees a light flash. Import it from `@kushagradhawan/kookie-ui/appearance-script` in a server component such as a Next.js root layout, and add `suppressHydrationWarning` to `<html>`.
* **appearance:** `useAppearance()` returns `{ choice, appearance, setAppearance }`. `choice` is `system`, `light` or `dark`; `appearance` is what is showing. `setAppearance` writes `<html>` and stores the choice, and still changes the mode when storage is blocked. With no stored choice, the page follows the system as it changes. `setAppearance` is also exported on its own.

### How to adopt

Keep the root `<Theme>` at `appearance="inherit"` (the default) so `<html>` is the one source of truth. Nested themes and portalled menus and dialogs then inherit the mode without being patched. Stop calling `onAppearanceChange` or toggling classes on `.radix-themes` elements to switch modes. An explicit `appearance="light"` or `"dark"` on a nested `<Theme>` still fixes that region. Nothing that worked before changes.

## [0.12.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.11.0...v0.12.0) (2026-10-16)

The composer can show what a message refers to, not only the files it carries.

### Features

* **chatbar:** `Chatbar.Item`, a removable pill for something the message refers to that is not a file: a scene object, a picked mode, a selection. It takes a label (`children`, a string), a lead tile (`icon`, tinted with `color`, default gray; or an `image` thumbnail) and `onRemove`. Without `onRemove` it has no ×. The × is labelled "Remove {label}" (`removeLabel` overrides it), and removing one moves focus to the next pill's ×, the previous one's, or the text. Place items as children of `Chatbar.AttachmentsRow`; the row now shows when it has items and no attachments, and items follow the attachments. The app owns the list.
* **chatbar:** the default attachment is the same pill: a thumbnail (or file icon, or a spinner while uploading), the file name and ×. The size and upload status are read to screen readers after the name instead of shown. A failed upload has a red edge. A custom `renderAttachment` is unchanged.

### Tests

* Browser tests for `Chatbar.Item` (layout, removal and focus, no × without `onRemove`, size, truncation) and for attachments and items sharing one pill.

## [0.11.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.10.0...v0.11.0) (2026-10-16)

Not published on its own. These changes shipped in 0.12.0.

`Toolbar` is now a row of controls with one tab stop. The band it used to name is `AppBar`.

### ⚠ BREAKING CHANGES

* **toolbar:** the old `Toolbar` (`Toolbar`, `Toolbar.Left`, `Toolbar.Center`, `Toolbar.Right`, `Toolbar.Title`, with `anchor`, `floating` and `offset`) is renamed `AppBar` (`AppBar` / `AppBar.Root`, `AppBar.Left`, `AppBar.Center`, `AppBar.Right`, `AppBar.Title`). Its behaviour is unchanged. Its classes are renamed `.rt-Toolbar*` → `.rt-AppBar*`. It publishes its size to its parent as `--rt-app-bar-height` / `--rt-app-bar-width`; the old `--rt-toolbar-height` / `--rt-toolbar-width` are still written with the same value so existing layouts keep their offset. To migrate, rename `Toolbar` to `AppBar` at every call site.
* **toolbar:** `Toolbar` is a new component with a different API (below). Code that still renders `<Toolbar>` with `Toolbar.Left` / `Center` / `Right` no longer type-checks.

### Features

* **toolbar:** new `Toolbar`, `ToolbarGroup`, `ToolbarButton`, `ToolbarSeparator` and `ToolbarTitle`, also reachable as `Toolbar.Root`, `Toolbar.Group`, `Toolbar.Button`, `Toolbar.Separator` and `Toolbar.Title`. Built on Radix Toolbar:
  * `Toolbar` is `role="toolbar"` with one tab stop; the arrow keys move focus between its controls and wrap at the ends. `orientation` is `horizontal` (Left/Right) or `vertical` (Up/Down, the row stacks). `size` `1`–`4` (default `2`) sets the row's height and the size of every control inside it that does not set its own. `aria-label` / `aria-labelledby` pass through. The row paints nothing and spaces its clusters with `space-between`; cluster controls with a `Flex`.
  * `ToolbarButton` takes every `Button` prop and joins the toolbar's keyboard. `iconOnly` renders an `IconButton` and requires an `aria-label`. `aria-pressed` announces a toggle and wears Button's pressed look. It rests as a gray `soft` button (gray `ghost` inside a group); a stated `size`, `variant` or `color` wins. It throws outside a `Toolbar`.
  * `ToolbarGroup` is a `role="group"` drawn as a quiet gray well, level with a button beside it, hosting its buttons inside it with a concentric corner. `disabled` turns every control in it off.
  * `ToolbarSeparator` is a gray hairline across the row's direction, in the gray `Separator` draws, at half the row's height.
  * `ToolbarTitle` is one truncating line at the row's leading edge, one text step above a button label at the same size, with more air beside it than between two controls. With no children it renders nothing.
* **tokens:** `--color-page` (`--color-background`), `--color-text` (`--gray-12`) and `--neutral-1`…`--neutral-12` (`--gray-N`) resolve as aliases that follow the appearance.

### Tests

* Browser tests for `Toolbar` (role and name, one tab stop, arrow-key focus, orientation, `aria-pressed`, icon-only buttons, size inheritance, groups, separator, title) and for `AppBar` (layout, published height and width under both names).

## [0.10.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.9.1...v0.10.0) (2026-10-15)

### Features

* **scroll-area:** `fade` fades the content toward the top and bottom edges while there is more content past them. An edge with nothing hidden past it does not fade, and the fade ramps in over the first pixels of scrolling. It is a mask, not a painted gradient, so it works on any background. A floating band over an edge can set `--scroll-fade-start` or `--scroll-fade-end` to its height so content fades as it passes under it. A scroller nested inside another takes the default fade length, not its ancestor's band. `--scroll-fade-size` sets the length (default `var(--space-6)`).
* **message-scroller:** `MessageScroller.Viewport` fades by default, with the same reach hooks. Pass `fade={false}` to turn it off.

## [0.9.1](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.9.0...v0.9.1) (2026-10-15)

### Tests

* Components are now tested in a real browser as well as in jsdom. A second Vitest project, `browser`, mounts components in Chromium through Playwright (`@vitest/browser-playwright`) and checks what jsdom cannot: layout, scrolling, focus and computed CSS. Browser tests are named `*.browser.test.tsx` and live beside a component's jsdom tests. `pnpm test` runs both; `pnpm test:browser` runs the browser project in watch mode, and `pnpm test:browser --ui` shows each fixture rendered. CI installs Chromium and runs both.
* Browser tests for 0.9.0: `MessageScroller` opens at its end, follows new messages, leaves a reader who scrolled up alone, wakes and centres its jump button, and jumps back. `Notice` takes layout space, keeps its buttons inside a narrow strip and grows with `size`; `Confirmation` puts its answers under the words when narrow; `Chatbar` stacks notices above the box and context below it, and stays open when a notice's button is pressed.

No runtime code changed.

## [0.9.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.8.1...v0.9.0) (2026-10-15)

Not published on its own. These changes shipped in 0.9.1.

The pieces a chat screen needs around its input: a transcript that follows the conversation, messages that wait above the input, and a send button that can stop a reply.

### Features

* **message-scroller:** new `MessageScroller` (`Root`, `Viewport`, `Content`, `Item`, `Button`, plus `useMessageScroller`, `useMessageScrollerScrollable` and `useMessageScrollerVisibility`). The transcript opens at its end, follows a streamed reply while the reader is at the end, leaves them alone once they scroll up, anchors a new message near the top with `scrollAnchor`, keeps their place when older messages load above, and shows a jump-to-latest button only while they are away from the end. The behaviour is shadcn/ui's Message Scroller primitive (`@shadcn/react`, MIT), credited in AUTHORS. It needs React 19. The viewport scrolls natively with a thin scrollbar, because Radix's `ScrollArea` cannot hand its viewport element to another library.
* **notice:** new `Notice`, for a condition that is true now. It takes space and never floats, announces politely, and has at most one `action` that fixes the condition. `onDismiss` shows a dismiss button that only acknowledges the message; the app removes the notice and remembers the choice. `color` is the category (default `gray`), `size` is `1`–`3`.
* **notice:** new `Confirmation`, for a question that waits for an answer: a quiet `cancelLabel` before a loud `confirmLabel`, no dismiss button, and `busy` while the yes runs. It never takes focus, so a person can answer by typing instead.
* **chatbar:** `Chatbar.Root` takes `notices`, a column of `Notice` and `Confirmation` above the box (in the order given, the last nearest the text), and `context`, quiet text below the box for facts that stay true, such as the model or the credits left. Notices take the chatbar's `size` unless they set their own, sit outside the box so their buttons never submit the message, and do not collapse the chatbar when pressed.
* **chatbar:** `Chatbar.Send` takes `status` (`ready`, `submitted`, `streaming`, `error`). While a reply runs and the box is empty it stops the reply through `onStop`; after an error it retries through `onRetry`. With a draft in the box it still sends. `stopLabel`, `retryLabel`, `stopIcon` and `retryIcon` set the words and glyphs.

### Changes

* **chatbar:** `.rt-ChatbarRoot` is a flex column, and the drop area fills it with `flex: 1` instead of `height: 100%`. A root given a height still fills it with the box.

## [0.8.1](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.8.0...v0.8.1) (2026-10-15)

### Bug Fixes

* **sidebar:** the sidebar is a navigation list, not an application menu. `Sidebar.Menu`, `Sidebar.MenuButton` and `Sidebar.MenuSubTrigger` no longer set `role="menu"` or `role="menuitem"`, and `Sidebar.GroupLabel` no longer sets `role="group"`. Screen readers now read a list of links, and axe no longer reports missing menu parents and children.
* **sidebar:** Enter on a `Sidebar.MenuButton` rendered `asChild` as a link follows the link. It used to be swallowed when no `onClick` was given.
* **sidebar:** ArrowUp and ArrowDown move focus between the visible menu buttons of the same sidebar or search popover. They used to do nothing.
* **sidebar:** group labels use `--gray-a11` instead of `--gray-a10`, to pass WCAG AA contrast.

## [0.8.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.7.0...v0.8.0) (2026-10-14)

The Shell is rebuilt behind 0.7's API. Every prop and export from 0.7 still exists. What changes is behaviour, listed in full below, because each item is something an app could have depended on.

### ⚠ BREAKING CHANGES

* **shell:** `onOpenChange` and `onStateChange` report what a user did, and nothing else. They, and the deprecated `onExpand` and `onCollapse`, no longer fire on mount or when the window crosses a breakpoint. `onExpand` and `onCollapse` still fire when a controlled `open` or `state` changes whether the pane is shown. `meta.reason` is `'toggle'` (a Trigger, a handle double-click, a drag past `collapseThreshold`) or the new `'dismiss'` (Escape, the scrim). `'init'`, `'responsive'`, `'panel'` and `'left'` stay in the types and are never sent. Code that read the starting state from `reason: 'init'` reads its own prop instead.
* **shell:** a pane nobody has touched follows the window by itself. It renders `data-state="auto"` and the stylesheet shows or hides it at each breakpoint. Once a user opens or closes it, it keeps that state at every width.
* **shell:** Sidebar and Inspector are overlays below 768px and in the frame from 768px. In 0.7 the Sidebar changed at 1024px and the Inspector at 1280px. To keep the old boundary, pass `presentation={{ initial: 'overlay', md: 'fixed' }}` (Sidebar) or `presentation={{ initial: 'overlay', lg: 'fixed' }}` (Inspector).
* **shell:** an untouched Sidebar that is open on a wide window closes when the window narrows to an overlay, and opens again when it widens. In 0.7 it became an open drawer. A Sidebar the user opened stays open, as an overlay.
* **shell:** the Rail and the Panel no longer drive each other. Closing the Rail leaves the Panel open, and opening the Panel leaves the Rail as it is. An app that wants the old behaviour writes it:
  ```tsx
  <Shell.Rail open={railOpen} onOpenChange={(open) => { setRailOpen(open); if (!open) setPanelOpen(false); }} />
  ```
  A Panel with no `presentation` of its own takes the Rail's.
* **shell:** a pane is one element at every width. An overlay pane is no longer a Sheet in a portal: `.rt-Sheet*` selectors no longer match inside a Shell, overlay panes stay inside `Shell.Root`, and `Shell.Root` is its own stacking context (`isolation: isolate`), so a `z-index` inside the frame no longer competes with portals outside it. Crossing a breakpoint keeps a pane's children mounted, with their state and scroll position.
* **shell:** `Shell.Root` renders its children as given, in JSX order. Children that are not Shell parts render (0.7 dropped them), a pane mounted later works, and a Sidebar renders beside a Rail and a Panel (0.7 dropped the Rail and the Panel). Each part takes its own place on the Root's grid, so a part must be a direct child of `Shell.Root` or sit in a `display: contents` wrapper, and any other child takes the first free grid cell unless it is given a place. The `.rt-ShellLeft` and `.rt-ShellBody` wrappers are gone, and `data-has-inset` is on `.rt-ShellRoot`.
* **shell:** while an overlay is open, `Shell.Root` contains it. The Root's other children are `inert`, focus moves into the overlay and goes back where it was when the overlay closes, and Escape and a press on the scrim close every open overlay. A full-height Shell (the default `height="full"`) also stops the page scrolling (`data-rt-shell-lock` on `<html>`); with `height="auto"` the overlay and scrim are placed on the window; a Shell given its own height covers only its own box and leaves the page alone. Escape is handled as it bubbles up to the Root, after the panes' own handlers, so a component inside a pane that answers Escape itself keeps the pane open.
* **shell:** the resize handle is `role="separator"` (it was `slider`) and names its pane with `aria-controls`. During a drag `onResize` is called at most once per animation frame, and once more with the final size when the drag ends.
* **shell:** the Shell has no motion. A pane opens, closes and changes presentation in one frame. Every transition and animation in the Shell's stylesheet is removed.
* **shell:** `data-visible` and `data-phase` are gone, and CSS written against them no longer matches. `data-mode`, `data-presentation` and the stacked `data-open` remain.
* **shell:** the `meta.reason` union in the callback types gains `'dismiss'`. A handler whose parameter is annotated with the 0.7 union no longer type-checks; widen the annotation or drop it.
* **shell:** a pane's size is written to `--<pane>-size` by the Shell, and the React-owned default moved to `--<pane>-expanded-size`. A changed `expandedSize` no longer overwrites a size the user dragged or the app set.

### Features

* **shell:** the first paint needs no script. A pane's presentation and its responsive defaults are written as data attributes (`data-presentation-<bp>`, `data-auto-<bp>`), and `@media` blocks at the same widths as `useBreakpoint` resolve them. The server HTML is the right layout, and nothing waits for hydration. Two things do wait: a floating Panel takes its place beside an open Rail, and the scrim, containment and page lock of an overlay that is open in the server HTML begin, once the page is hydrated.
* **shell:** a pane re-renders when its own state changes, and a Trigger when the pane it names changes. Nothing else re-renders. The eleven contexts are now one registry.
* **shell:** `Shell.Trigger` sets `aria-expanded`, and the consumer's `onClick` runs first: `event.preventDefault()` there cancels the trigger's action.

### Bug Fixes

* **shell:** a responsive `defaultOpen` on the Panel and the Inspector is honoured at each breakpoint. 0.7 coerced the object with `Boolean()`, so `{ initial: false, lg: true }` started open on every screen, and on a phone the overlay opened for one commit and took focus.
* **shell:** a controlled, responsive value no longer fires `reason: 'responsive'` on every render.
* **shell:** a responsive `open` on the Rail is resolved at the current breakpoint. 0.7 coerced it to open.
* **shell:** a pane mounted after `Shell.Root` registers and honours its `defaultOpen`.
* **shell:** focus returns to the trigger after an overlay closes.
* **shell:** `collapseThreshold` is compared before the size is clamped to `minSize`, so a threshold below `minSize` collapses the pane.
* **shell:** a drag stops before the pane's own handle leaves the frame, whatever `maxSize` allows.

### Deprecations

These are removed in 1.0. Each one in the first group warns once in development.

| Deprecated | Use instead |
| --- | --- |
| `Shell.Left` | Render `Shell.Rail` and `Shell.Panel` directly in `Shell.Root` |
| `<Shell.Trigger target="left">` | `target="rail"` |
| `<Shell.Trigger peekOnHover>` | Open the pane |
| A responsive object on a controlled `open` or `state` | A boolean from your own state, or a responsive `defaultOpen` / `defaultState` |
| `snapPoints`, `collapseThreshold`, `paneId`, `persistence` | `size` and `onSizeChange`, kept in your own state |
| `useShell()` | `Shell.Trigger`, or each pane's `open` / `onOpenChange` |
| `useResponsivePresentation()` | Your own `presentation` value |

Marked `@deprecated` in the types only, with no warning: `onExpand` and `onCollapse` (use `onOpenChange`; both still fire) and `snapTolerance`.

`height` and `resizer` are removed from the pane props. No pane ever read them; a call site that still passes them compiles with an error and has them dropped at runtime, so they no longer reach the DOM.

### Shell bug fixes

No API change and no behaviour a consumer relied on changes; each item is something that was documented or implied and did not work.

### Bug Fixes

* **shell:** `Shell.Root` is typed as itself. It was cast to the Panel's component type, so TypeScript offered Panel's props on Root.
* **shell:** `Shell.Panel` fires `onExpand` and `onCollapse`. The props were accepted and dropped; the panel now fires them on the same terms as the other panes, on any change to whether it is shown and never on mount.
* **shell:** `Shell.Trigger` renders `type="button"`, so it no longer submits a form it sits in, and sets `aria-controls` to the id of the pane it controls. Panes render an id when given none; a pane's own `id` is honoured and the trigger follows it.
* **shell:** the arrow keys on `Shell.Bottom`'s resize handle move the same way as a drag. ArrowUp grows the pane and ArrowDown shrinks it; they were inverted.
* **shell:** the `100dvh` default height applies. Root wrote an inline `100vh` for `height="full"`, which beat the stylesheet's `100dvh` override, so mobile browsers sized the shell to the larger viewport. The default is now stated only in the stylesheet.
* **shell:** the resize handle shows keyboard focus, as a 2px line in the focus colour along the pane edge. It took focus and drew nothing.
* **shell:** a resize drag reads the text direction once, when it starts, instead of calling `getComputedStyle` on every pointer move.
* **shell:** the `height` prop on a pane no longer reaches the DOM as an invalid attribute.

## [0.7.0](https://github.com/KushagraDhawan1997/kookie-ui/compare/v0.6.2...v0.7.0) (2026-09-20)


### ⚠ BREAKING CHANGES

* **color:** the per-component `highContrast` prop is removed. Its prop def (`highContrastPropDef`), the `rt-high-contrast` class, the `data-high-contrast` attribute, the `--opacity-high-contrast` token and every CSS rule keyed on them are gone. There is no deprecation period and no theme-level replacement.
* **color:** coloured text is stronger by default. Every coloured text role (Text, Heading, Code, Link, Callout, Badge, Button soft/surface/outline/ghost/classic, Select, Accordion, menus, Avatar fallback, checkbox and radio marks) now reads `--accent-ink`. Gray ink is step 12. Chromatic ink is step 11 mixed 45% toward step 12, so an error still reads red. `<Text color="gray">` now renders at step 12 instead of step 11.
* **color:** gray fills with step 12 automatically. Solid Button, Badge, Avatar, Code, Switch, Slider, Progress, Checkbox, Radio, RadioCards, the Tabs indicator and the solid menu, Select, Combobox and Sidebar highlight read `--accent-solid` and `--accent-solid-contrast`. Gray uses step 12 with inverted text; chromatic colours keep step 9. This is keyed on the colour being gray, not on a prop.


### Features

* **typography:** new `emphasis` prop (`'loud' | 'medium' | 'quiet'`) on Text, Heading, Blockquote, Code and `DataList.Label`. Loud reads the full ink, medium reads gray-a11 or the accent ink at 74%, quiet reads gray-a10 or the accent ink at 52%. Text and Heading with no `color` and no `emphasis` still inherit their colour. `DataList.Label` defaults to `medium`, which is its previous look.
* **tokens:** new accent role tokens `--accent-ink`, `--accent-ink-muted`, `--accent-ink-faint`, `--accent-solid(-a)`, `--accent-solid-hover(-a)`, `--accent-solid-active(-a)`, `--accent-solid-contrast`, `--accent-solid-selection(-contrast)`, `--accent-solid-indicator`, `--accent-solid-thumb`, `--accent-solid-badge(-contrast)` and `--accent-solid-{hover,active,open}-filter`, plus `--gray-ink`, `--gray-ink-muted` and `--gray-ink-faint`.


### Migration

| Before | After |
| --- | --- |
| `highContrast` on any component | Delete it |
| `<Text color="gray">` (muted copy) | `<Text emphasis="medium">` |
| `<Text color="gray" highContrast>` | `<Text>` |
| `<Text color="red" highContrast>` | `<Text color="red">` |
| `<Text color="red">` | Unchanged, now reads stronger |
| `<DataList.Label highContrast>` | `<DataList.Label emphasis="loud">` |
| `highContrastPropDef` import | Delete it; use `emphasisPropDef` for text-first components |
| `var(--opacity-high-contrast)` | `var(--opacity-8)` |

## Note on 1.0.0–1.0.3

These four releases were tagged in git in January 2026 and never published to npm. The package continued from 0.7.0, and every release since then goes up from there. The 1.0.x entries below are kept as history.

## [1.0.3](https://github.com/KushagraDhawan1997/kookie-ui/compare/v1.0.2...v1.0.3) (2026-01-12)


### Bug Fixes

* **ci:** move linting from prepublishOnly to CI workflow step ([5605080](https://github.com/KushagraDhawan1997/kookie-ui/commit/560508061df0a0f347644bb39c1498279bdf0e23))

## [1.0.2](https://github.com/KushagraDhawan1997/kookie-ui/compare/v1.0.1...v1.0.2) (2026-01-12)


### Bug Fixes

* **deps:** align TypeScript version to 5.9.3 across workspace ([a7541aa](https://github.com/KushagraDhawan1997/kookie-ui/commit/a7541aad15e071e2c983fe8d5ac5b1c35c795d1c))
* **deps:** downgrade TypeScript to 5.8.3 for typescript-eslint compatibility ([1b19793](https://github.com/KushagraDhawan1997/kookie-ui/commit/1b19793d9dbd2b816da0ba0360832ddc3496762a))

## [1.0.1](https://github.com/KushagraDhawan1997/kookie-ui/compare/v1.0.0...v1.0.1) (2026-01-12)


### Bug Fixes

* **dropdown:** reduce CSS specificity for drill-down animations ([45bb376](https://github.com/KushagraDhawan1997/kookie-ui/commit/45bb376c3ae440729e517c34c51a90d047ebafe9))

# 1.0.0 (2026-01-12)


### Bug Fixes

* add .js extensions to sidebar component imports for ESM compatibility ([be497d8](https://github.com/KushagraDhawan1997/kookie-ui/commit/be497d87d4c9a3f44bae866a8f3dde11fc83177a))
* add headerTabs prop to SiteDocsPage wrapper ([3f3d41e](https://github.com/KushagraDhawan1997/kookie-ui/commit/3f3d41e339cab7475b7fb703052c8d97935307f7))
* add Radix UI pointer-events cleanup fix for dialog components ([94fa95c](https://github.com/KushagraDhawan1997/kookie-ui/commit/94fa95c1133d9204f1ff46d9d2b5b45e9ffc0226)), closes [#1241](https://github.com/KushagraDhawan1997/kookie-ui/issues/1241)
* add stylelint disable comments for SVG selectors ([72159c0](https://github.com/KushagraDhawan1997/kookie-ui/commit/72159c079e8b7a75815f230bbba57a9b5d521336))
* add stylelint-disable for selector-max-specificity warnings ([fabe4b4](https://github.com/KushagraDhawan1997/kookie-ui/commit/fabe4b48e8399d148b6d08f8044669f42b51c098))
* add stylelint-disable for typography selector-max-specificity warning ([1fef124](https://github.com/KushagraDhawan1997/kookie-ui/commit/1fef12499666fdc15644559e83b09be6efc1f49b))
* add transpilePackages for local kookie-ui package ([a76b518](https://github.com/KushagraDhawan1997/kookie-ui/commit/a76b51895899c3df5ac484ea1efb7ce1b75b6fb5))
* build from workspace root using Turbo like local dev ([7fe0e02](https://github.com/KushagraDhawan1997/kookie-ui/commit/7fe0e02e6ebb8b54826abc1ad81eaa8a598c1dee))
* **chatbar:** remove Firefox focus outline and simplify examples ([ff3b7e7](https://github.com/KushagraDhawan1997/kookie-ui/commit/ff3b7e72f5bb28cd37f00481ff19b5cbe391420f))
* **chatbar:** type/export tidy for apiRef handle ([d219715](https://github.com/KushagraDhawan1997/kookie-ui/commit/d2197157fca5d4442bd648fd0192ba32640a7ce0))
* **combobox:** audit and fix component issues ([048422a](https://github.com/KushagraDhawan1997/kookie-ui/commit/048422a401923ffea4f372784424900a0da964ef))
* completely remove sidebar component files ([8e9e63e](https://github.com/KushagraDhawan1997/kookie-ui/commit/8e9e63e1a1057af3e75fcb870446fdde9e1f9076))
* correct GitHub profile links and documentation URL ([50b21ba](https://github.com/KushagraDhawan1997/kookie-ui/commit/50b21bab8bf64071353ef4873417ecb33cb77a24))
* correct outputDirectory path in vercel.json ([ff9d147](https://github.com/KushagraDhawan1997/kookie-ui/commit/ff9d14756a56e1f982b7cfcf5354564100ff79e7))
* css-loader can't resolve `@radix-ui/themes/styles.css` ([#101](https://github.com/KushagraDhawan1997/kookie-ui/issues/101)) ([69ddd0e](https://github.com/KushagraDhawan1997/kookie-ui/commit/69ddd0e685f61687a3517aa6ed1b2d1531bbbf02))
* disable stylelint selector-max-specificity for navbar CSS ([abe0467](https://github.com/KushagraDhawan1997/kookie-ui/commit/abe0467dc95e72bc09983644b3c3523535500c13))
* disable stylelint selector-max-specificity for segmented-control ([9054a0b](https://github.com/KushagraDhawan1997/kookie-ui/commit/9054a0ba7db577c5b1c3c7603fede437eaba3fac))
* **docs:** add dropdown-menu to nav and fix theme toggle in overlay ([1a3b4dc](https://github.com/KushagraDhawan1997/kookie-ui/commit/1a3b4dc333fb9abb7e9087d0dcd165f6d82cd0e7))
* **docs:** add missing page files and fix theme toggle for all portals ([5a407e9](https://github.com/KushagraDhawan1997/kookie-ui/commit/5a407e9980b46a4767f35419ab78fccf4fe7dee5))
* **docs:** improve Playground PropertyControl mobile layout ([4ab06d0](https://github.com/KushagraDhawan1997/kookie-ui/commit/4ab06d053962ccae0ecdbbd082f5d2bdde72b03b))
* **docs:** update opengraph tagline to differentiate from shadcn ([8d00817](https://github.com/KushagraDhawan1997/kookie-ui/commit/8d00817a19f66817e40ab1c11d3f9de30611fb4f))
* don't add position styles when fill prop is used ([861e6ea](https://github.com/KushagraDhawan1997/kookie-ui/commit/861e6ead00f8ac0a09b45a1f1ab03d2885c823ba))
* enhance pointer-events cleanup for nested Dialog + DropdownMenu interactions ([2886ed1](https://github.com/KushagraDhawan1997/kookie-ui/commit/2886ed100fe6f87ce39af476ada5a132e48b29d3))
* escape quotes in workflow version extraction command ([57aa48c](https://github.com/KushagraDhawan1997/kookie-ui/commit/57aa48cb7b19af692f5517bf478eab62f745f5e3))
* explicitly activate pnpm@10.15.1 in vercel install command ([8ebcc87](https://github.com/KushagraDhawan1997/kookie-ui/commit/8ebcc877fe68d09b3bd8c30adc86fae2c76241b4))
* force Node 20 with engines and use corepack for pnpm@10 ([34386da](https://github.com/KushagraDhawan1997/kookie-ui/commit/34386da0db097da6a12bfb65aeb17f4143e739dc))
* force pnpm usage in vercel.json with corepack ([c341308](https://github.com/KushagraDhawan1997/kookie-ui/commit/c34130801c300f5cf66a7396d6286b26fcf8226e))
* icon-only items now grow to fill available space while maintaining centering ([9429991](https://github.com/KushagraDhawan1997/kookie-ui/commit/9429991f227659dede70b9259ab8b86f632df52d))
* Image component consistent wrapper approach and AspectRatio compatibility ([b80163f](https://github.com/KushagraDhawan1997/kookie-ui/commit/b80163f9a1d4116c2d291ffd657f0b9622319416))
* **Image:** support Next.js Image fill prop ([631d875](https://github.com/KushagraDhawan1997/kookie-ui/commit/631d87549dc92ef237b9635f1b83db2e68128dd7))
* improve chatbar examples and add collapsed border-radius ([5a10fda](https://github.com/KushagraDhawan1997/kookie-ui/commit/5a10fdac0324fa75668caa511630351958efcf07))
* Make alt prop required for Image component accessibility - Add explicit alt prop requirement with JSDoc documentation - Fix jsx-a11y/alt-text linting error ([4b6e6aa](https://github.com/KushagraDhawan1997/kookie-ui/commit/4b6e6aa32fe2a2faefccbecc2907e9e0cfccc8a3))
* pass native width/height to custom components for Next.js Image compatibility ([9882bd0](https://github.com/KushagraDhawan1997/kookie-ui/commit/9882bd0104eb3c93b630df195afdd1cb33e80f85))
* prevent asChild prop from leaking to img DOM element ([0ea22e4](https://github.com/KushagraDhawan1997/kookie-ui/commit/0ea22e43c7bee6f58771c96dc55301bcb6e6adf1))
* prevent double CodeBlock wrapping + restore property-control and app-shell ([e3b1277](https://github.com/KushagraDhawan1997/kookie-ui/commit/e3b1277ffa2bdaf3f1711b02981d937cfc1a20ca))
* prevent double CodeBlock wrapping in MDX by excluding base code/pre components ([40c82ec](https://github.com/KushagraDhawan1997/kookie-ui/commit/40c82eceaaf73a1c05fb49059ff890ff418c2484))
* prevent loadingAriaLabel prop from being passed to DOM element ([e4af563](https://github.com/KushagraDhawan1997/kookie-ui/commit/e4af5634c2f352056b9d3395a82eeebd50331361))
* reduce CSS selector specificity in segmented-control ([4241d6f](https://github.com/KushagraDhawan1997/kookie-ui/commit/4241d6fd87a58a7d0d0c4ee6380938ec17be5ff1))
* remove focus-visible outline from menu items ([4eaf109](https://github.com/KushagraDhawan1997/kookie-ui/commit/4eaf10904fdb162199d731b048d7885186b1a486))
* remove sidebar.css import from components CSS index ([89e5e8c](https://github.com/KushagraDhawan1997/kookie-ui/commit/89e5e8c04efe791e66e807043aeb36b7224c93be))
* remove unsupported material prop from SegmentedControl playground ([e7b49e8](https://github.com/KushagraDhawan1997/kookie-ui/commit/e7b49e8f7ed23b33a1ae2147b48487c7cfc4f2bf))
* rename Button directory to button (case sensitivity fix) ([2317397](https://github.com/KushagraDhawan1997/kookie-ui/commit/231739751c04f04a824f999ba3d35e5ea3a6a1d1))
* resolve all linting errors in KookieUI package ([c368e53](https://github.com/KushagraDhawan1997/kookie-ui/commit/c368e53863f3b538b6ff57296eb9b4e6ff29222a))
* resolve CSS specificity errors in combobox and text-field ([ce1d405](https://github.com/KushagraDhawan1997/kookie-ui/commit/ce1d4051329125d22bd79990d96a63244f5f99d4)), closes [hi#contrast](https://github.com/hi/issues/contrast)
* resolve CSS specificity issues in dialog and sheet components ([00aa921](https://github.com/KushagraDhawan1997/kookie-ui/commit/00aa9217a0e541e6f2c0e352e48e3a26a9d1630e))
* resolve linting issues across components ([05a81dd](https://github.com/KushagraDhawan1997/kookie-ui/commit/05a81dd899c5c2576aea09103f74cfe4a60476cd))
* resolve React Hook and ESLint warnings across shell and chatbar components ([824349e](https://github.com/KushagraDhawan1997/kookie-ui/commit/824349e757abd99ba8d130f65078a62fe86cd18d))
* resolve React Hooks rules violations in Image component ([ea6fb07](https://github.com/KushagraDhawan1997/kookie-ui/commit/ea6fb070dec6db1e65e6aacfe1d8c5af8e9f4622))
* resolve TypeScript 5.8.3 compatibility issues - Add null coalescing fallbacks for defaultProp parameters in useControllableState calls - Fix checkbox-group.primitive.tsx: defaultValue ?? [] - Fix checkbox.tsx: defaultCheckedProp ?? false - Fix segmented-control.tsx: defaultValueProp ?? '' - Fix slot.tsx: add explicit type annotation for Slottable export - Ensures compatibility with stricter TypeScript 5.8.3 type checking ([fe71414](https://github.com/KushagraDhawan1997/kookie-ui/commit/fe714145e71e67691555292040496ee04fdf4e83))
* restore specificity for thin sidebar icon wrapper padding ([9de7d4a](https://github.com/KushagraDhawan1997/kookie-ui/commit/9de7d4ac31065855119b84ccfd1602da279b37b7))
* **sheet:** add iOS safe area padding and dynamic viewport height ([bb8f915](https://github.com/KushagraDhawan1997/kookie-ui/commit/bb8f91544250bbd7bcc374163f1db95f1da0869c))
* **sheet:** fix TypeScript error with TextProps union type ([6d0ed31](https://github.com/KushagraDhawan1997/kookie-ui/commit/6d0ed31970617237874457b088ba7d479230e2bd))
* **shell:** avoid mounting Sidebar.Handle in overlay by rendering content only ([7ac7a6a](https://github.com/KushagraDhawan1997/kookie-ui/commit/7ac7a6a7658df546ad561ffee3d7624d65617c49))
* **shell:** fix onExpand/onCollapse callback timing and consolidate collapsed layout CSS ([c6a5bf6](https://github.com/KushagraDhawan1997/kookie-ui/commit/c6a5bf6c3a0060814e732d11bf7bd1f5594c7443))
* **shell:** improve type safety by reducing as any usage ([142f08b](https://github.com/KushagraDhawan1997/kookie-ui/commit/142f08b4adc3ad947f4fc1ff498fda972331ff85))
* **shell:** move useEffect outside inline callback to comply with Hooks rules ([29cba1c](https://github.com/KushagraDhawan1997/kookie-ui/commit/29cba1c0933cfef3c58c707e66ff5aad815e0c75))
* **shell:** resolve iOS Safari scroll and safe area issues ([352763b](https://github.com/KushagraDhawan1997/kookie-ui/commit/352763b363cbecd552bbf3a7f24c2da225070caa))
* **shell:** resolve multiple bugs from audit ([d25405e](https://github.com/KushagraDhawan1997/kookie-ui/commit/d25405ee4949a2396df8efc750c4ac92c9454ed6))
* **shell:** satisfy switch fallthrough checks with default returns in nested reducers ([1adc8d9](https://github.com/KushagraDhawan1997/kookie-ui/commit/1adc8d9c505d158ef865b75c841aaf534c2dc4a4))
* **shell:** smooth inspector close transition ([74a50d7](https://github.com/KushagraDhawan1997/kookie-ui/commit/74a50d7f14933c154ddbac162f649d304773256c))
* **sidebar:** add size 3 to TypeScript types ([61427fa](https://github.com/KushagraDhawan1997/kookie-ui/commit/61427fa4bf2d51cef44b8b5c5cc4c385e7dbc09d))
* **sidebar:** truncate long menu labels in expanded mode ([31e589b](https://github.com/KushagraDhawan1997/kookie-ui/commit/31e589b16ddf617db6879e15e560f1e13560071f))
* temporarily disable sidebar component export ([e35b6c1](https://github.com/KushagraDhawan1997/kookie-ui/commit/e35b6c17303204b4a6da4b3174b4496b419147f6))
* temporarily disable sidebar component files ([2b57cc5](https://github.com/KushagraDhawan1997/kookie-ui/commit/2b57cc50dcb1b324f4169ad8efe1529fac1cc954))
* **toolbar:** disable stylelint selector-max-specificity ([39f4c70](https://github.com/KushagraDhawan1997/kookie-ui/commit/39f4c706f97b6e06a2565232121a627e2804b563))
* update GitHub workflow to use pnpm 10.0.0 to match package.json packageManager ([2f5f70b](https://github.com/KushagraDhawan1997/kookie-ui/commit/2f5f70b878ec86386fda0bd88d5b71f442c42c64))
* update Kookie Blocks URL to kookieblocks.com ([9a2eacf](https://github.com/KushagraDhawan1997/kookie-ui/commit/9a2eacf810c33d0028788cbbf8abc91d251afc83))
* update layout and demo images ([769f107](https://github.com/KushagraDhawan1997/kookie-ui/commit/769f1074ebce367b31e06be009fe5a4e4d56106e))
* update packageManager to pnpm@10.15.1 for Vercel corepack support ([4cea1e5](https://github.com/KushagraDhawan1997/kookie-ui/commit/4cea1e5a23c53e86d50a526f9c645b28f4bc4ab2))
* update pnpm lockfile to match new package structure ([e3fdc71](https://github.com/KushagraDhawan1997/kookie-ui/commit/e3fdc71594f00a8c94e5738e325a7e8958b00f5f))
* update repository URLs to match actual GitHub repository ([ca3e0f9](https://github.com/KushagraDhawan1997/kookie-ui/commit/ca3e0f957ad433a860740f33fff87bd0f8b78d4e))
* use --no-frozen-lockfile for Vercel compatibility ([6ba1734](https://github.com/KushagraDhawan1997/kookie-ui/commit/6ba17348b7e65c4f372caa626a124f2cffee267b))
* use Node 20 in docs deployment workflow ([8b31b84](https://github.com/KushagraDhawan1997/kookie-ui/commit/8b31b84418b0eaa5e4f0b89d631320b419b7b440))
* use pointer capture for scrubbing on Safari/Firefox ([3717968](https://github.com/KushagraDhawan1997/kookie-ui/commit/3717968539b719fb190f394664982edb4e2e7e86))
* use published kookie-blocks@0.1.14 from npm instead of local link ([19ad4ea](https://github.com/KushagraDhawan1997/kookie-ui/commit/19ad4ea769ebc3c14a503ee1b42d3c9b843adbed))
* use SmileIcon instead of non-existent SmilePlusIcon ([d7826ec](https://github.com/KushagraDhawan1997/kookie-ui/commit/d7826ecd1977786c9c542fcfc4d15d36608b122b))
* useThemeContext returns defaults instead of throwing when outside Theme ([aaffb65](https://github.com/KushagraDhawan1997/kookie-ui/commit/aaffb65eedb115c64c57b05c588201ddcab9bb0f))
* wrapper inherits parent dimensions when fill is used ([2dd6831](https://github.com/KushagraDhawan1997/kookie-ui/commit/2dd6831540b44742fa0dc644819c867b36f668eb))
* **z-index:** add layering system for floating UI components ([f9da6f3](https://github.com/KushagraDhawan1997/kookie-ui/commit/f9da6f3319eed5a66a7052d24ae1f5add0ec1794))


### Features

* **accordion:** add Accordion component with panel-aware styling, radius support, updated playground and faster animations ([70c5149](https://github.com/KushagraDhawan1997/kookie-ui/commit/70c51491f60a9c66f39432a5a97d9adb9031d518))
* add combobox component ([7655a67](https://github.com/KushagraDhawan1997/kookie-ui/commit/7655a675a819165dd8661f9e4084726dc1635ee4))
* add dynamic OG image generation ([1f60db8](https://github.com/KushagraDhawan1997/kookie-ui/commit/1f60db81be18d12ceaabdceffe616c90272a4b09))
* Add iconOnly prop to SegmentedControl and comprehensive documentation ([066c662](https://github.com/KushagraDhawan1997/kookie-ui/commit/066c662d946d73b65deeceb0d638e1a7d0317e57))
* Add Image component and fix Text font rendering (v0.1.8) - Add comprehensive Image component with object-fit, shadows, radius support - Fix Text component font inheritance for consistent Geist rendering - Add shadow props system and CSS utilities - Add playground exclusions to .gitignore ([18db8e9](https://github.com/KushagraDhawan1997/kookie-ui/commit/18db8e90cb1f371edb3a606509d67393d026e79d))
* add images to all docs pages and optimize icons ([7eff130](https://github.com/KushagraDhawan1997/kookie-ui/commit/7eff13023e5ebf286e7e19a337e4f857942c7a44))
* Add new grid layout props from upstream ([fcce6c4](https://github.com/KushagraDhawan1997/kookie-ui/commit/fcce6c4a02691b6ef62b43267ee532196a7f565d))
* add Node.js version requirement ([480aa78](https://github.com/KushagraDhawan1997/kookie-ui/commit/480aa785c17e4621361875062feb05be45c5d727))
* add playground app with component examples and documentation ([10fadd4](https://github.com/KushagraDhawan1997/kookie-ui/commit/10fadd410561c145959ec9431293babd5fde8636))
* add pointer-events cleanup hook and extend design tokens ([648f6c3](https://github.com/KushagraDhawan1997/kookie-ui/commit/648f6c351761e8617c01b019de3967c610ed5e5f))
* add pointer-events cleanup hook and extend design tokens ([903335a](https://github.com/KushagraDhawan1997/kookie-ui/commit/903335a50c63e3afc217b9eded1534c55a8beeb3))
* Add polymorphic buttons, toggle functionality, and fullWidth prop - Add fullWidth prop to buttons and icon buttons - Implement polymorphic 'as' prop alongside existing asChild pattern - Create ToggleButton and ToggleIconButton components with Radix Toggle - Add comprehensive test pages for new functionality - Ensure proper TypeScript support for polymorphic components ([9a2b439](https://github.com/KushagraDhawan1997/kookie-ui/commit/9a2b439f9761917e3c1e4014ef3dbebb99073046))
* add soft variant to Card component - subtle background styling for documentation previews ([01b1ca5](https://github.com/KushagraDhawan1997/kookie-ui/commit/01b1ca5c97956f55309b501f56b9c2ff3722aaa6))
* add testimonial section to homepage ([ebe33ac](https://github.com/KushagraDhawan1997/kookie-ui/commit/ebe33accfd55b681b58285caa2a25f4496975080))
* Add TextField component with interactive scrubbing ([2f8d167](https://github.com/KushagraDhawan1997/kookie-ui/commit/2f8d167efe84aa4abf5eba1041dc1ecbcf57dc3b))
* add theme toggle to Playground component ([8857bb6](https://github.com/KushagraDhawan1997/kookie-ui/commit/8857bb6a44759dfc591d964e8c00e7ad8c1820a2))
* Add toggle button pressed state styling - Add data-state='on' styling for all button variants - Ensure toggle buttons show visual feedback when pressed - Maintain consistency with existing hover states - Support high contrast mode and all accent colors ([dc7e740](https://github.com/KushagraDhawan1997/kookie-ui/commit/dc7e7407232a6169dd47b359089aaf8f883acf3a))
* add Toolbar component ([b7f1b3d](https://github.com/KushagraDhawan1997/kookie-ui/commit/b7f1b3d166ead0664f51811d8ae61aa322da71b2))
* Add UserCard component and update playground components ([0e608c2](https://github.com/KushagraDhawan1997/kookie-ui/commit/0e608c2be5752f297c0da523395347c59e6fa441))
* **card,toolbar:** add Card inset prop and Toolbar true-center layout ([39c47a9](https://github.com/KushagraDhawan1997/kookie-ui/commit/39c47a9338add95ca086ae1f1b9df54f54f014a0))
* **chatbar): audit fixes and docs\n- Consolidate to onChange-only\n- Remove MutationObserver\n- Narrow dependencies and use isomorphic layout effect\n- Cache measurements and observe responsive changes\n- Add a11y dev warning and optional submit-on-enter\n- Remove duplicate inline styles; add aria-expanded and JSDoc\n\nchore(docs): move docs files and update pages\nchore(tokens:** minor tokens updates\nchore: sync misc component/css changes ([e19d252](https://github.com/KushagraDhawan1997/kookie-ui/commit/e19d25263a63f4d0755a5dea04314f467098b6df))
* **chatbar:** add apiRef with focusTextarea/openFilePicker to control Chatbar imperatively ([e34543e](https://github.com/KushagraDhawan1997/kookie-ui/commit/e34543e8d61b700739be4b27d92bc2f4d276abe6))
* **chatbar:** add File object to attachments and improve send behavior ([51244d2](https://github.com/KushagraDhawan1997/kookie-ui/commit/51244d2ebcb34b9c1c2712cd5178dffb9b3a542f))
* clean up playground components ([6213f88](https://github.com/KushagraDhawan1997/kookie-ui/commit/6213f8868de4bacdd3299c7772f9bd675a9e0116))
* **combobox:** Move highContrast to Root, add error/loading states, add icons to playground ([553af98](https://github.com/KushagraDhawan1997/kookie-ui/commit/553af98b37787358619f04535fcfee9e32f85c7c))
* comprehensive button component production readiness improvements - BREAKING: IconButton now requires accessibility attributes - Fixed critical disabled state issues - Enhanced loading state accessibility - Fixed Toggle Button pressed/disabled states - Added transition token system - Improved CSS specificity - WCAG compliance improvements - Production readiness score: 92/100 ([dd4dd1c](https://github.com/KushagraDhawan1997/kookie-ui/commit/dd4dd1cc76338b627f492be91f9213e6824c8cb0))
* comprehensive KookieUI design system evolution ([6430523](https://github.com/KushagraDhawan1997/kookie-ui/commit/6430523cf4cd8b58baa893a10c49978e424edd4f))
* comprehensive UI improvements and new features - Fix Image component fadeIn behavior for cached images - Update SVG sizing: size 1 now uses calc(var(--space-3) * 1.175) across all components - Add collapsible sidebar with transform-based animations - Add SidebarTrigger with PanelLeft icon support - Fix sidebar padding consistency for size 1 - Add comprehensive sidebar playground with workspace dropdown - Update Image documentation with fadeIn prop - Improve button and menu styling consistency ([f4a2416](https://github.com/KushagraDhawan1997/kookie-ui/commit/f4a2416e080142f427ece73036a9f54db9d9a3e2))
* **docs:** add Vercel Analytics ([8de21b2](https://github.com/KushagraDhawan1997/kookie-ui/commit/8de21b2e3b591b06b12a931c0fc09834baa208db))
* **dropdown-menu:** add mobile drill-down submenu behavior ([8e6e6d3](https://github.com/KushagraDhawan1997/kookie-ui/commit/8e6e6d3aedb4a6fb4482490a7cb77d7d9896c576))
* **dropdown-menu:** fix drill-down mode bugs and code quality ([ed0b397](https://github.com/KushagraDhawan1997/kookie-ui/commit/ed0b397d6111042a59692398fa4615cfae3a70b8))
* **dropdown:** add drill-down submenu animations and semantic versioning ([3db0119](https://github.com/KushagraDhawan1997/kookie-ui/commit/3db011998b3c30fa0ac3a70ae1aacd2eb0537158))
* enhance Image component and add Card documentation - improve Image component with better loading states and accessibility, add comprehensive Card component documentation with new soft variant, update CodePreview component for better code formatting, add demo images utility and gradient assets, update Button documentation and layout improvements ([52a4681](https://github.com/KushagraDhawan1997/kookie-ui/commit/52a4681d137472c6ad38fc4d4c91844207aa6df1))
* Image component v0.1.9 - Revolutionary asChild API, blur variant, and enhanced transitions ([fedb18e](https://github.com/KushagraDhawan1997/kookie-ui/commit/fedb18e73657963f53829ac2cea8951483289b80))
* implement expand-then-fade animation sequencing for shell components ([e92b5ad](https://github.com/KushagraDhawan1997/kookie-ui/commit/e92b5ad0be0a2e0238de8bffb30716987b1a58bd))
* implement stacked presentation mode for Shell.Sidebar ([eb87ee5](https://github.com/KushagraDhawan1997/kookie-ui/commit/eb87ee55dd6eeba61dc573cdacce15eb836cc925))
* improve icon sizes across all button components - Increase icon sizes for better visibility: 16px, 18px, 20px, 22px - Unify sizing across Button, IconButton, and ToggleIconButton - Remove redundant manual sizing from examples - Icons now automatically inherit size from CSS ([99865e0](https://github.com/KushagraDhawan1997/kookie-ui/commit/99865e02fc902997ecb84128b7794254bdaf72d4))
* major design system transformation with universal variant architecture ([ffb8c2b](https://github.com/KushagraDhawan1997/kookie-ui/commit/ffb8c2b7c1cfd455cce98e64dd8ceb906159329c))
* modernize design system with elevation shadows and improved typography - Replace 3D inset shadows with modern elevation shadows for classic variants - Update buttons, selects, text fields, and text areas with consistent shadow system - Add gradients to classic variants using design tokens - Fix high contrast button styling (use solid colors for accents, gradients for gray) - Add missing icon sizing rules for Button and IconButton components (13px/15px/17px/19px) - Add new Typography size 0 (10px font, 12px line height) - Improve shadow consistency - no elevation on hover, Card-level shadows for inputs - Remove raised 3D effects throughout for cleaner, modern aesthetic ([eb515ac](https://github.com/KushagraDhawan1997/kookie-ui/commit/eb515ac6a2ec33694482e35732e2c1a01b694fe4))
* **navbar:** add documentation, playground, and fix centering ([3ed8ab9](https://github.com/KushagraDhawan1997/kookie-ui/commit/3ed8ab91bc63a8de323e7469891b5421fcfa3668))
* **Navbar:** add Hero-like examples and improve slot architecture ([840646d](https://github.com/KushagraDhawan1997/kookie-ui/commit/840646d3a88bca8312639c09128e6a8807ce6d79))
* rebrand from Radix Themes to Kookie UI - Update README.md with Kookie UI branding and proper fork attribution - Change package name from @radix-ui/themes to @kookie-ui/themes - Update repository URLs and homepage to point to HelloKookie repo - Maintain original MIT license and author attribution ([d771408](https://github.com/KushagraDhawan1997/kookie-ui/commit/d7714088a366848a899a8abdfd5df22be0fd6106))
* rebrand to Kookie UI and standardize shadows - Major rebrand from Radix UI Themes to @kushagradhawan/kookie-ui - Fix DropdownMenu.TriggerIcon sizing consistency - Standardize Card shadows using shadow tokens - Set up publishing automation and documentation ([1440cb2](https://github.com/KushagraDhawan1997/kookie-ui/commit/1440cb29eb630c2505a947ae42c3ee52b5df2295))
* reorganize docs structure and add dark mode ([c69f867](https://github.com/KushagraDhawan1997/kookie-ui/commit/c69f8678f6ee6ca5da4f663f985f1e48bc67ce97))
* restore sidebar component with proper ESM imports ([e5a6bbc](https://github.com/KushagraDhawan1997/kookie-ui/commit/e5a6bbc8f643786f2e2ce846450a4dabd8afae26))
* restructure landing page with Shell component and coming soon design ([9e9b7d4](https://github.com/KushagraDhawan1997/kookie-ui/commit/9e9b7d4a9a049062fc1f531eb73076d545e0cc0a))
* **segmented-control:** add vertical orientation support ([9be0f7d](https://github.com/KushagraDhawan1997/kookie-ui/commit/9be0f7d15ad96888903136aa31bdfc76344a72b5))
* **separator): add light prop (uses --accent-a3); docs: convert Enhancements to bullets in theme/radius/typography, add colgroups and tooltips, correct font stacks and split font variable sections; docs(button): add tooltip descriptions to props; docs(radius:** tidy tokens and comment syntax; code-block: minor fixes ([8acd92a](https://github.com/KushagraDhawan1997/kookie-ui/commit/8acd92a7707a36edc6ab8895ba379a6d3023686e))
* **sheet:** render Title as Heading, Description as Text ([24efdbd](https://github.com/KushagraDhawan1997/kookie-ui/commit/24efdbd5536b5558a7d7b1076baf1d301f8d70ab))
* **shell:** add inset prop, smooth animations, fix collapsed content blocking ([7489c96](https://github.com/KushagraDhawan1997/kookie-ui/commit/7489c9632cdfdfa9d66946093b2beed773798842))
* **sidebar:** improve collapsible behavior and add dialog examples ([e99309f](https://github.com/KushagraDhawan1997/kookie-ui/commit/e99309f5094d77b30acdb97ae1b66c277e74bb47))
* **sidebar:** thin mode icon wrapper styling + remove shadow-1 from all components ([f4d2396](https://github.com/KushagraDhawan1997/kookie-ui/commit/f4d23961bb9742af22c8e404c54e011a6cf7eb25))
* standardize icon sizes and improve menu styling ([2987292](https://github.com/KushagraDhawan1997/kookie-ui/commit/2987292a654d23c324e8eeedfc5154446d219f9e))
* **toolbar:** add inset mode as default for edge-to-edge layout ([c28dea3](https://github.com/KushagraDhawan1997/kookie-ui/commit/c28dea3a22cdb847fec474d18e6d55c01903502b))


### Performance Improvements

* **combobox:** optimize performance and enhance displayValue prop ([a2064ba](https://github.com/KushagraDhawan1997/kookie-ui/commit/a2064ba142d2fd7aafb483f9ee4be18ccf943aa6))
* **combobox:** split context and optimize re-renders ([8122524](https://github.com/KushagraDhawan1997/kookie-ui/commit/812252461bf1262e9955efe2d9d274121413e81c))
* **shell:** memoize ShellProvider context value to prevent unnecessary effect re-runs ([14f28eb](https://github.com/KushagraDhawan1997/kookie-ui/commit/14f28eba0bd38bd9fde7c879b92b46286981a4e5))


### Reverts

* Revert "Remove dot-notation support ([#346](https://github.com/KushagraDhawan1997/kookie-ui/issues/346))" ([#351](https://github.com/KushagraDhawan1997/kookie-ui/issues/351)) ([ae811b5](https://github.com/KushagraDhawan1997/kookie-ui/commit/ae811b5672bbdda1820e64b46fd5458fd0c21826))


### BREAKING CHANGES

* **segmented-control:** None (backward compatible - defaults to 'horizontal')
* **combobox:** forceMount now defaults to false. Use displayValue prop
for optimal performance, or set forceMount={true} on Content if you need
dynamic label resolution from mounted items.
