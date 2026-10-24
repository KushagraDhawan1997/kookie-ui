# Migrating to v1's new core

v1's core is becoming the same as v2's: the spacing scale, sizes, corners, type steps, token names, states and composition rules. Colours, fonts, roundness, shadows and variants stay v1's own. This guide lists every change an app has to make, release by release. Each release ships its section here.

### Codemods

Each codemod takes folders or single files. It skips `node_modules` and `.next` at any depth, and `build` and `dist` only directly inside a folder you name, where they are build output. A source folder deeper down, like `src/app/build`, is rewritten. They read `.ts`, `.tsx`, `.js`, `.jsx`, `.mdx`, `.css` and `.scss`; the space, type and names codemods also read `.mjs` and `.cjs`.

No codemod can read a value that is not written out: a ternary (`mt={isMobile ? '2' : '4'}`), a variable, a spread (`{...props}`), a computed prop, or a template string (`` `var(--space-${n})` ``), also as one entry of a responsive object (`m={{ initial: '2', md: wide ? '3' : '4' }}`). Those keep their old value and still type-check. The space and type codemods print each prop they could not read, with its file and line. Check those by hand, then search for spreads into Kookie components and for `--space-${`, `--font-size-${` and `--font-weight-${`.

## 0.17.0: the scale, solid only, Shell panes

### Spacing scale

The space palette now has v2's twelve steps: 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 96, 128px. Every old step moves up by one.

| Before | px | After |
| --- | --- | --- |
| `"1"` … `"9"` | 4 … 64 | `"2"` … `"10"` |
| `"10"` | 80 | `"10"` (64) |
| `"11"` | 96 | `"11"` |
| `"12"` | 112 | `"11"` (96) |
| `"0"` | 0 | `"0"` |

This applies to every layout prop that reads the scale: `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl`, `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`, `gap`, `gapX`, `gapY`, `inset`, `top`, `right`, `bottom`, `left`, including negative margins (`"-3"` becomes `"-4"`) and responsive objects. It also applies to `var(--space-N)` in your own CSS. `inset`, `top`, `right`, `bottom` and `left` now take steps `"10"` to `"12"` like padding, so an old `top="9"` (64px) becomes `top="10"` and keeps its 64px.

`"10"` and `"12"` had no exact match and moved to the nearest smaller step, so layouts that used them get tighter.

A codemod rewrites every value written out as a literal, and `var(--scaling)` (with or without a fallback). Run it once from the app's root, pointing at your source folders:

```sh
python3 node_modules/@kushagradhawan/kookie-ui/codemods/space-0.17.py src
```

Run it exactly once. A second run shifts every step again, and nothing flags it. If a run stops partway, restore the files from git and run it again on the clean tree. Values it cannot read stay on the old scale: see [Codemods](#codemods).

### New tokens

These are new and safe to use: `--layout-space-1..12`, `--surface-p-1..4`, `--panel-p-1..4`, `--control-px-1..4`, `--control-px-pill-1..4`, `--control-gap-1..4`, `--icon-size-1..4`, `--row-inset-1..4`, `--slot-inset-1..4`, `--overlay-w-1..4`.

`--control-height-1` is now 28px (was 24). Size-1 controls are 4px taller.

### Scaling is gone

`<Theme scaling>` is removed and the `--scaling` variable is now `--scale`, fixed at 1. Delete `scaling` from every `Theme`. In your CSS, replace `var(--scaling)` with `var(--scale)`.

### Solid only

`material` and `panelBackground` are removed from every component and from `Theme`. Everything is solid. Delete both props wherever you pass them, and any CSS keyed on `[data-material]`. The `--opacity-N` and `--blur-N` tokens are removed too.

The translucent colour tokens are removed. A `var()` that reads one is undefined, so the background turns transparent with no warning. Use the solid token:

| Removed | Use |
| --- | --- |
| `--color-panel-translucent` | `--color-panel-solid` |
| `--color-surface-translucent` | `--color-surface-solid` |
| `--color-dialog-translucent` | `--color-dialog-solid` |

The 0.22 codemod moves all six to `--color-surface`, so a leftover is fixed there too.

### Shell panes pad like surfaces

A Shell pane and its header, footer and scroll region pad by the Shell's size: 24px at the default size 2 (was 12px). A Toolbar in a pane header or footer rests one size above the Shell unless you give it a `size`. Check screens with dense sidebars.

## 0.18.0: controls

### Theme size

`<Theme size="1" | "2" | "3" | "4">`, default `"2"`, sizes every control inside it that sets no `size` of its own. A control's own `size`, including a responsive object, still wins. A control with fewer sizes takes its nearest one: menus stop at 2; DataList, HoverCard, Shell, Notice and Chatbar at 3. Badge does not follow it. Nothing changes until you set it.

### One control ladder

Buttons, IconButton, both Toggles, TextField, TextArea, Select, Combobox, SegmentedControl and Tabs share one ladder.

| Size | Height | Padding | Pill padding | Gap | Icon |
| --- | --- | --- | --- | --- | --- |
| 1 | 28 | 8 | 12 | 4 | 16 |
| 2 | 32 | 10 | 14 | 8 | 16 |
| 3 | 40 | 13 | 17 | 8 | 20 |
| 4 | 48 | 16 | 20 | 12 | 24 |

Heights are now a minimum, not fixed: a label taller than the height grows the control. At radius `full`, a side with no icon takes the pill padding; a side with an icon, and every side below `full`, takes the plain padding. At size 2 a button's text edge goes 12 → 14px, its icon edge 12 → 10px, and its gap 4 → 8px. Ghost loses its tighter padding. TextArea's minimum height is now the control height (32px at size 2, was 64). An IconButton in a TextField slot is now 26px at size 2, inset 3px. Check dense toolbars and forms.

Checkbox, Radio, Switch and Slider moved to v2's sizes. At size 2 a Checkbox or Radio is 20px (was 16), a Switch 40×24 (was 42×24) and a Slider track 5px (was 6). Checkbox, Radio, RadioGroup and Table now accept size `"4"`.

### Sizes removed

`size` is gone from Spinner, ScrollArea, Separator and Progress. Delete it. Each keeps its old default: Spinner 16px, ScrollArea scrollbar 4px, Progress 6px tall. Separator now fills its container along its own axis, as in v2, so `size="4"` (full width) is the only look; a short separator needs a width. A spinner inside a button is 16px at every button size. `mapButtonSizeToSpinnerSize` is removed from `@kushagradhawan/kookie-ui/helpers`.

### Badge and Avatar

Badge now rests at size 2 (was 1): 4×8px padding and 12px text (was 2×6 and 10px). Pass `size="1"` to keep the old badge. Every Badge padding and gap is now 2, 4, 8 or 12px.

Avatar sizes follow v2's ladder: 1–4 are 28/32/40/48px (size 1 was 24) and 5–9 are 56/64/80/96/128px (were 64/80/96/128/160). (From 0.22.0 an Avatar with no `size` follows Theme size and rests at 2.) To keep an old size, raise sizes 5–8 by one. Old sizes 1 (24px) and 9 (160px) have no match.

### States

- **Disabled** is colour only: no opacity, no `pointer-events: none`, and the default arrow cursor instead of `not-allowed`.
- **Loading** buttons are no longer natively `disabled`. They stay focusable, set `aria-disabled`, and block their own clicks. Tests that check `toBeDisabled()` on a loading button need `aria-disabled` instead.
- **Invalid** fields key on `aria-invalid="true"`. `error` sets it, and your own `aria-invalid` now styles the field too. Only the border and ring turn red; soft and surface fields no longer fill red. A valid field no longer renders `aria-invalid="false"`. CSS keyed on `[data-error]` or `.rt-error` no longer matches anything the library styles.
- **Focus** is one ring on every button variant: 2px of `--focus-8`, 2px outside the edge. New tokens: `--focus-ring-width`, `--focus-ring-offset`.

## 0.19.0: surfaces and corners

### Radius tokens

Corners follow v2's structure: a palette and three roles, four steps each. Read a role, not a palette step.

- Palette: `--radius-0` (new, 0px) to `--radius-10`, plus `--radius-full`. `--radius-11` and `--radius-12` are gone; use `--radius-10`.
- `--radius-control-1..4`: palette steps 1 to 4, half the control height at `full`.
- `--radius-surface-1..4`: 10, 16, 22, 28px at `full`. These are new values, not the old `surface-1..4` (6/8/10/12).
- `--radius-overlay-1..4`: 14, 20, 24, 28px at `full`.

| Old | New |
| --- | --- |
| `--radius-surface-1..4` | `--radius-surface-1` |
| `--radius-surface-5` | `--radius-surface-2` |
| `--radius-surface-6`, `-7` | `--radius-overlay-2`, `--radius-overlay-3` |
| `--radius-surface-8` to `-12` | `--radius-surface-4` |
| `--radius-pill-*` | `--radius-control-N` at the matching size |

At `full`, Avatar sizes 5 to 9 and the Kbd sizes that used pills now draw a 24px corner, not a circle.

### Card

- Sizes are 1 to 4. Map old sizes 1, 2, 3 → 1, old 4 → 2, old 5 → 3.
- Padding is 16, 24, 32, 40px. Default size is 2 (was 1): 24px padding and a 16px corner. Unset, a Card follows Theme size.
- A Card inside a Card draws the outer corner minus the outer padding, never below 0. At the default sizes that is square.
- `flush` and `inset` are removed. `Inset` is removed. Put the content in a Box with `m="bleed"`, or `mx`, `mt`, `mb` set to `"bleed"`, to reach the Card's edge.

```tsx
// before
<Inset clip="padding-box" side="top" pb="current"><img /></Inset>
// after
<Box mx="bleed" mt="bleed" mb="5"><img /></Box>
```

CheckboxCards and RadioCards take sizes 1 to 4 on the same ladder: item padding 16, 24, 32, 40px, corners 10, 16, 22, 28px. Size 5 is gone. Items no longer use the control corner.

### Dialog, AlertDialog and Sheet

- Default size is 2 (was 3), and follows Theme size: 32px padding, 20px corner.
- Max width comes from the size: 360, 440, 560, 720px. The 600px default `maxWidth` is gone. Pass `maxWidth` to keep a wider dialog.
- Size 4 padding is 40px (was 48).
- Start and end sheets cap at the size's width, 440px by default (was 90vw). A `width` above the cap needs `maxWidth` too. Sheet padding at the default is 32px (was 40).

### Popover and HoverCard

Padding and corners follow the surface ladder. Default size 2: padding 24px (was 16), corner 16px (was 10).

| Size | Padding | Corner |
| --- | --- | --- |
| 1 | 16 | 10 |
| 2 | 24 | 16 |
| 3 | 32 | 22 |
| 4 | 40 | 28 |

HoverCard gains size 4.

### Notice

Notice takes sizes 1 to 4. Padding is 8, 12, 16, 24px (was 12, 16, 24). The corner is the control corner plus the padding, so it wraps its buttons: 22, 28, 36, 48px at `full`. The gap is 12px at every size. A Theme size of 4 now reaches Notice and Chatbar notices as 4.

## 0.20.0: type and rows

### Type scale

Type takes v2's nine steps. Sizes 0, 10, 11 and 12 are gone from Text, Heading, Link, Code, Kbd and Blockquote, and from the tokens.

| Size | Font size | Line height | Letter spacing |
| --- | --- | --- | --- |
| 1 | 12 | 16 | 0 |
| 2 | 14 | 20 | 0 |
| 3 | 16 | 24 | 0 |
| 4 | 18 | 26 | -0.005em |
| 5 | 20 | 28 | -0.0075em |
| 6 | 24 | 32 | -0.01em |
| 7 | 32 | 40 | -0.015em |
| 8 | 44 | 52 | -0.02em |
| 9 | 64 | 70 | -0.025em |

Old sizes move to the nearest step: `"0"` → `"1"`, `"8"` → `"7"`, `"10"`, `"11"`, `"12"` → `"9"`. Size 8 is a new 44px step, not the old one. Sizes 7 and 9 also change px, so check display text.

Heading uses Text's line heights. At the default size 6 a heading's line is 32px (was 30). The `--heading-line-height-N` tokens are gone.

### Three weights

`weight` takes `regular`, `medium` and `semibold`. `thin`, `extralight` and `light` become `regular`; `bold` and `extrabold` become `semibold`. Their `--font-weight-*` tokens are gone. Headings rest at `medium` (500).

### Code

Code shrinks by one factor, `--mono-scale: 0.925`, in every variant. `--code-font-size-adjust` is gone. At size 3, Code is 14.8px in every variant.

### Codemod

A codemod rewrites `size` and `weight` on Text, Heading, Link, Code, Kbd, Blockquote, Em, Strong and Quote, including responsive objects and tags that hold arrow functions or comparisons, and `var(--font-size-N)`, `var(--line-height-N)`, `var(--letter-spacing-N)` and `var(--font-weight-NAME)` in your CSS. Run it once from the app's root, pointing at your source folders:

```sh
python3 node_modules/@kushagradhawan/kookie-ui/codemods/type-0.20.py src
```

It maps `"8"` to `"7"`, so do not run it on code that already uses the new size 8. A `size` or `weight` it cannot read is printed: see [Codemods](#codemods).

### Menu rows

DropdownMenu, ContextMenu and VirtualMenu take sizes 1 to 4 (was 1 and 2). Select and Combobox lists draw the same rows. Under `<Theme size>`, menus now follow sizes 3 and 4 instead of stopping at 2.

| Size | Row | Panel padding | Side padding | Pill padding | Icon |
| --- | --- | --- | --- | --- | --- |
| 1 | 24 | 8 | 8 | 12 | 16 |
| 2 | 30 | 12 | 10 | 14 | 16 |
| 3 | 34 | 16 | 13 | 17 | 20 |
| 4 | 38 | 24 | 16 | 20 | 24 |

At the default size 2 a row is 30px (was 32) and the panel pads 12px (was 8). A checkable row's label starts after the padding, the mark and the gap: 34px at radius `full` (was 24). Separators take the panel padding above and below. A shortcut or submenu chevron sits one row inset from the far edge. `getMenuItemHeight` returns 24, 30, 34 and 38. If you pass `estimatedItemSize` to a VirtualMenu, check it against these.

`--radius-row-1..4` are new: the control corner, half the row height at `full`.

### Sidebar rows

Sidebar rows stay at control height. They take the pill padding, gap and icon of their size: at size 2 the side padding is 14px (was 12) and icons are 16px. Sub-rows are the normal row height (32px at size 2, was 40). Search results use size 2 menu rows.

### Table

Table takes size 4. Cell padding follows the layout scale and size N sets font size N, so size 1 is 12px text (was 14). The minimum cell height is gone.

| Size | Padding (top and bottom, sides) |
| --- | --- |
| 1 | 4, 8 |
| 2 | 8, 12 |
| 3 | 12, 16 |
| 4 | 16, 24 |

At the default size 2 a cell pads 8×12px (was 12 all round) and a one-line row is 36px (was 44).

### Notice pads like a card

A Notice pads and rounds like a Card of the same size: 24px and a 16px corner at size 2 (was 12px and a corner matched to its buttons). The gap stays 12px.

## 0.21.0: the component list and composition

### Merged components

Four components merge into others. A codemod renames them.

| Before | After |
| --- | --- |
| `IconButton` | `Button iconOnly` |
| `ToggleButton` | `Toggle` |
| `ToggleIconButton` | `Toggle iconOnly` |
| `Badge` | `Chip` |

Their types follow: `IconButtonProps` → `ButtonProps`, `ToggleButtonProps` and `ToggleIconButtonProps` → `ToggleProps`, `BadgeProps` → `ChipProps`, `badgePropDefs` → `chipPropDefs`. `iconButtonPropDefs` is gone. The zod schemas `IconButtonSchema`, `ToggleButtonSchema` and `ToggleIconButtonSchema` are now one `ToggleSchema`, with `parseToggleProps`.

An `iconOnly` button or toggle needs `aria-label` or `aria-labelledby`. Visible text no longer counts as its name, and in development a missing name throws. An `iconOnly` button never takes `fullWidth`.

The class names change. Move your selectors:

| Before | After |
| --- | --- |
| `.rt-IconButton` | `.rt-Button[data-icon-only]` |
| `.rt-Badge` | `.rt-Chip` |

`Toggle` also adds `rt-Toggle`. Sidebar's `badge` prop and `BadgeConfig` keep their names; the slot now renders a `Chip`.

### Dropped components

These have no v2 counterpart and are gone. Replace each by hand.

| Before | After |
| --- | --- |
| `Container` | `<Box maxWidth="688px" mx="auto">`. Sizes 1 to 4 were 448, 688, 880 and 1136px |
| `Section` | `<Box py>` with the padding you need |
| `Strong`, `Em`, `Quote` | Native `<strong>`, `<em>` and `<q>` inside `Text`. They lose their size and serif adjustments |
| `Skeleton` | Your own placeholder markup, or a `Spinner` |
| `HoverCard` | `Popover`, or `Tooltip` for a short label |
| `TabNav` | `Tabs`, or a row of links |
| `DataList` | `Table`, or a `Grid` of `Text` |
| `AspectRatio` | A `div` with `aspect-ratio` in its style |
| `Image` | Back in 0.23.0 as a slim `Image`; see 0.23.0 below |
| `CheckboxCards`, `RadioCards` | A `Card` holding a `Checkbox` or `Radio` |
| `ThemePanel` | None |

Their prop defs, props types and `rt-` classes are gone too.

### Margin props live on layout only

`m`, `mx`, `my`, `mt`, `mr`, `mb` and `ml` now work only on `Box`, `Flex` and `Grid`. Every other component drops them, including `Text`, `Heading`, `Button`, `Separator`, `Card` and Navbar's `Logo`, `Navigation` and `Actions`. Space components with the parent's `gap`, or wrap one in a `Box`:

```tsx
// Before
<Heading size="3" mb="4">Settings</Heading>

// After
<Box mb="4">
  <Heading size="3">Settings</Heading>
</Box>
```

`Dialog.Title` and `AlertDialog.Title` no longer add 16px below themselves. Put the title and what follows in a `Flex direction="column"` with a `gap`.

### Flush is gone

`flush` is removed from `Button` and `Accordion.Root`, along with `data-flush`. Ghost buttons and ghost accordions no longer pull themselves out by their own padding. Where you relied on that, wrap the button in `<Box m="bleed">` inside a surface, or give the parent a negative margin.

### Codemod

A codemod renames the four merged components: JSX tags (also under an import alias or `import * as`), the import from `@kushagradhawan/kookie-ui`, other code references to the imported name, and the Props types. Strings, comments and JSX text keep their words, so a label like `New Badge` stays. A reference to `IconButton` or `ToggleIconButton` outside a JSX tag, like `const Comp = IconButton`, is printed and left alone: rename it and add `iconOnly` where it renders. Under an alias (`const Comp = IB`) it is printed too, but it still type-checks, so the printed line is the only notice. It also moves `.rt-Badge` and `.rt-IconButton` selectors in your CSS. Run it from the app's root, pointing at your source folders:

```sh
python3 node_modules/@kushagradhawan/kookie-ui/codemods/components-0.21.py src
```

It only renames, and it is safe to run twice. Dropped components, margin props, `flush` and icon-only buttons without `aria-label` need a person; TypeScript flags each one. Dialog title gaps do not show up as type errors, so check your dialogs.

## 0.22.0: names

Class names, private variables and colour tokens take v2's names. Nothing moves on screen. A codemod does all of it:

```sh
python3 node_modules/@kushagradhawan/kookie-ui/codemods/names-0.22.py src
```

| Before | After |
| --- | --- |
| `rt-` classes and variables (`rt-Button`, `rt-r-size-2`, `--rt-shell-gap`) | `kui-` (`kui-Button`, `kui-r-size-2`, `--kui-shell-gap`) |
| the root class `radix-themes` | `kui-theme` |
| `--gray-1` … `--gray-12`, `--gray-a1` … `--gray-a12`, `--gray-contrast`, `--gray-surface`, `--gray-indicator`, `--gray-track` | `--neutral-…` |
| `--color-background` | `--color-page` |
| `--color-panel`, `--color-panel-solid`, `--color-surface-solid`, `--color-dialog`, `--color-dialog-solid` | `--color-surface` |
| `--color-panel-translucent`, `--color-surface-translucent`, `--color-dialog-translucent` (removed in 0.17) | `--color-surface` |

The `color="gray"` prop value does not change.

### Fixes from the 0.22 audit

- An `Avatar` with no `size` follows `Theme size` and rests at 2 (32px); it rested at 3 (40px). Pass `size="3"` to keep it.
- A disabled Button rendered as a link (`as="a"` or `asChild`) no longer navigates; it carries `aria-disabled`.
- A loading icon-only Button keeps its accessible name and sets `aria-busy`.
- `m="bleed"` now works inside Dialog, AlertDialog, Sheet, Popover and Notice, not only Card.
- With `class="dark"` on `<html>`, `--color-page` and `--color-surface` resolve outside a Theme again.

## 0.22.1: rounder controls, flatter surfaces

Nothing to change in an app. At the default full radius, surfaces are less rounded while controls stay pills:

| Role | Sizes 1–4 before | After |
| --- | --- | --- |
| `--radius-surface-N` (cards, popovers, menus, tables, panes, notices) | 10 / 16 / 22 / 28px | 8 / 12 / 16 / 20px |
| `--radius-overlay-N` (dialogs, sheets) | 14 / 20 / 24 / 28px | 12 / 16 / 20 / 24px |

## 0.23.0: performance, Image is back

### Removed focus aliases

Coloured components no longer declare 21 focus aliases nothing in the library read. These are gone: `--focus-1` to `--focus-7`, `--focus-9` to `--focus-12`, `--focus-a1`, `--focus-a3`, `--focus-a4`, and `--focus-a6` to `--focus-a12`. `--focus-8`, `--focus-a2` and `--focus-a5` stay. Where your own CSS reads a removed one, read the accent step instead: `--focus-3` becomes `--accent-3`, `--focus-a4` becomes `--accent-a4`.

### Image

`Image` returns as one `<img>` with no wrapper. It keeps `src`, `alt`, `fit` (default `cover`), `radius`, `width` and `height`, loads lazily with async decoding unless you say otherwise, and rests on a quiet neutral fill until it has loaded. Every other `<img>` attribute passes through.

Gone from the 0.15 Image, so a 0.15 call site needs a hand edit where it used them:

| Before | After |
| --- | --- |
| `showSkeleton` | Nothing: the neutral fill is always there while it loads |
| `placeholder` (blurred low-res image) | Layer your own low-res `<img>` behind it |
| `caption` | A `Text` under the image in a `Flex direction="column"` |
| `as={NextImage}`, `fill` | Use the framework's image component directly |
| `loadingAriaLabel`, `errorAriaLabel` | Nothing: `alt` is what a screen reader hears |
| responsive `fit`, margin and position props | A plain `fit` value; wrap the image in a `Box` for margin or position |
| the fade-in on load | None: v1 has had no motion since 0.15 |

`className`, `style`, `width` and `height` now land on the `<img>` itself, not a wrapping `div`.

### Nothing else to change

The rest of 0.23.0 is internal. Spinner rotates an inner wheel, so code that targeted the spinner root's animation should target `.kui-SpinnerWheel`. Accordion content no longer sets `will-change`.

## 0.24.0: fixes, toolbar parts, docs

Most of 0.24.0 fixes bugs and needs nothing from an app. These changes can need an edit.

### Changes that can need an edit

| Component | What changed | What to do |
| --- | --- | --- |
| `Avatar` | `ref`, `className` and `style` all go on the outer `span`. The ref was the `img` | Type the ref as `HTMLSpanElement` |
| `Accordion` | The trigger draws its own chevron | Remove a chevron you added yourself |
| `Chip` | It has no disabled look | Nothing, unless you relied on `data-disabled` styling it |
| `TextArea` | It resizes vertically by default | Set `resize="none"` to keep the old behaviour |
| `CheckboxGroup` | Each box is its own tab stop, like native checkboxes. `required` means at least one box is checked | Drop `orientation` and `loop`; they do nothing now |
| `Blockquote` | Text-only props (`align`, `trim`, `font`) no longer style it | Wrap it in a `Text` if you need them |
| `Code` | A ghost Code with no `color` takes the surrounding text colour | Set `color="gray"` to keep gray |
| `Toolbar` | In `Shell.Content` it is one size above the Shell's, like the pane headers | Set `size` to keep the old size |
| `Sheet` | The corners that face the page are rounded | Set `radius="none"` for square corners |

### Behaviour you may notice

- Closing a Dialog or AlertDialog returns focus to the button that opened it.
- Choosing a VirtualMenu row closes the menu it sits in.
- A ScrollArea whose content overflows is a tab stop, so keyboard users can scroll it.
- An inline Code, Link or span Text with `truncate` is `inline-block`, so the ellipsis works.
- A Slider's handles carry your `aria-label`. A Spinner is silent unless you name it.
- TextField no longer turns spell check off.
- A `ToolbarButton` outside a `Toolbar` renders as a plain button instead of throwing.

### New

- `Button done` shows a tick in place of the icon.
- `Shell.Trigger asChild`.
- `ToolbarButton asChild` for links, `ToolbarOverflow` with `useToolbarOverflow`, `ToolbarSlot` and `ToolbarFill`, and layout props on `Toolbar`.
- `Shell.PaneHeader float` and `Shell.Scroll` work in `Shell.Content`, for a page with a pinned toolbar.
- `Avatar statusLabel`, `SegmentedControl.Item disabled`, and `width` and `height` on `ScrollArea`.


## 0.25.0: v2's defaults

### Breaking changes for swan-frontend

| Component | What changed | What to do |
| --- | --- | --- |
| `Heading` | It renders an `h2` by default (was `h1`), as in v2. `Dialog.Title`, `AlertDialog.Title` and `Sheet.Title` are now `h2` too | Add `as="h1"` to each page title. Leave section headings as they are |
| `DropdownMenu`, `ContextMenu` | `DropdownMenu.Virtual` and `ContextMenu.Virtual` are gone. Importing a menu no longer ships the virtualizer | Import `VirtualMenu` and put it inside the menu's `Content`, which keeps `virtualized` |
| `Theme` | It no longer holds a tooltip provider. A `Tooltip`, and a Button or Chip `tooltip`, brings its own, still with the 200ms delay | Wrap the app once in `TooltipProvider`, inside `Theme`, so moving along a toolbar opens the next tooltip at once |
| React | The package needs React 19. The peer range is `^19.0` | Upgrade React and React DOM to 19. MessageScroller no longer warns on React 18 |
| `Sheet` | `Sheet.Content` takes no `align`. It had no effect | Remove `align` from each `Sheet.Content` |
| `TextField`, `TextArea` | The `errorMessage` renders after the field, outside its root, so the field keeps its height | Move styles that targeted the message inside the root |
| `Separator` | Screen readers announce it by default | Set `decorative` on a line that only draws a border |
| `Kbd` | A Kbd with no `size` follows the text around it, a little smaller, in place of one fixed size | Set `size` to keep a fixed size |
| `VirtualMenu` | Outside a menu, such as in a Popover, it draws menu rows and a highlight at its own `size` | Remove styles you added to make it look like a menu |
| `SegmentedControl` | Arrow keys select the segment they move to, as in a radio group. Tab only moves focus | Nothing, unless your code expected arrows to move focus without selecting |
| `Avatar` | `id`, `aria-*`, `title`, `data-*` and event handlers go on the root `span`, as `ref`, `className` and `style` already do | Update code or tests that looked for them on the `img` |
| `Button` | A button that ever loads keeps its content mounted only when it always gets a boolean | Pass `loading={saving}`, never `loading={saving \|\| undefined}` |
| `Link` | `underline="always"` keeps the underline under keyboard focus, with the focus outline | Remove a focus style that put the underline back |
| `Card` | A Card reads as chosen only when it is the `label` of a checked checkbox or radio. A plain Card that holds one stays plain | Make the chosen card `<Card asChild><label>...</label></Card>` |
| `Button` | It logs an error in place of throwing, for `emphasis` with `variant` and for an icon-only button with no name | Fix the errors the console now shows |

## 0.26.0: shadows by role, one look for marks

| Component or token | What changed | What to do |
| --- | --- | --- |
| `Switch`, `Slider`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup` | No `variant` prop | Remove `variant` from these |
| `--shadow-2-active` | Removed | Use `--control-chrome-active` |
| `--shadow-1..6` in your CSS | v2's values, no hairline ring | Use a role token (`--surface-chrome`, `--control-chrome`, `--floating-chrome`, `--dialog-chrome`, `--grip-chrome`) where you meant a card, a control, a popup, a dialog or a thumb |
| `TextField`, `TextArea`, `Select` | White with a hairline edge and a small shadow | Nothing |

