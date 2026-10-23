# Migrating to v1's new core

v1's core is becoming the same as v2's: the spacing scale, sizes, corners, type steps, token names, states and composition rules. Colours, fonts, roundness, shadows and variants stay v1's own. This guide lists every change an app has to make, release by release. Each release ships its section here.

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

This applies to every layout prop that reads the scale: `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl`, `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`, `gap`, `gapX`, `gapY`, `inset`, `top`, `right`, `bottom`, `left`, including negative margins (`"-3"` becomes `"-4"`) and responsive objects. It also applies to `var(--space-N)` in your own CSS.

`"10"` and `"12"` had no exact match and moved to the nearest smaller step, so layouts that used them get tighter.

A codemod does all of it. Run it from the app's root, pointing at your source folders:

```sh
python3 node_modules/@kushagradhawan/kookie-ui/codemods/space-0.17.py src
```

### New tokens

These are new and safe to use: `--layout-space-1..12`, `--surface-p-1..4`, `--panel-p-1..4`, `--control-px-1..4`, `--control-px-pill-1..4`, `--control-gap-1..4`, `--icon-size-1..4`, `--row-inset-1..4`, `--slot-inset-1..4`, `--overlay-w-1..4`.

`--control-height-1` is now 28px (was 24). Size-1 controls are 4px taller.

### Scaling is gone

`<Theme scaling>` is removed and the `--scaling` variable is now `--scale`, fixed at 1. Delete `scaling` from every `Theme`. In your CSS, replace `var(--scaling)` with `var(--scale)`.

### Solid only

`material` and `panelBackground` are removed from every component and from `Theme`. Everything is solid. Delete both props wherever you pass them, and any CSS keyed on `[data-material]`. The `--opacity-N` and `--blur-N` tokens are removed too.

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

Avatar sizes follow v2's ladder: 1–4 are 28/32/40/48px (size 1 was 24) and 5–9 are 56/64/80/96/128px (were 64/80/96/128/160). Size 3, the default, stays 40px. To keep an old size, raise sizes 5–8 by one. Old sizes 1 (24px) and 9 (160px) have no match.

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
