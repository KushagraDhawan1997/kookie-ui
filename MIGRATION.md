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
