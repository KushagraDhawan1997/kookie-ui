# Bench

Five heavy screens built from Kookie UI, measured in Chromium. CI runs it and fails when a number in `budget.json` gets worse.

| Screen | What it holds |
| --- | --- |
| `table` | 500 rows, each with an avatar, a badge, a checkbox and a row menu |
| `form` | 40 groups of every field type |
| `menu` | a menu of 300 items in 10 groups |
| `dialogs` | a dialog with a form, a popover and a tooltip, opened and closed 100 times |
| `shell` | a sidebar of 200 rows with floating toolbars, beside 60 cards |

What it measures, per screen, as the median of five runs:

- **Size:** the CSS and JS a production bundle ships, gzipped.
- **Render:** time to the first painted commit, and to repaint after every row changes.
- **Response:** the slowest interaction, from the browser's own event timing (what INP reports).
- **Smoothness:** frames over 25ms while the screen scrolls top to bottom in two seconds.
- **Memory:** DOM nodes and heap after a forced collection, and what 100 open-close cycles leave behind.

```sh
pnpm --filter bench bench          # measure and compare with the budget
pnpm --filter bench bench:update   # re-record the budget on purpose
pnpm --filter bench bench:serve    # look at the screens: http://localhost:4173/?scene=table
```

Counts (bytes, DOM nodes, leftovers after the cycles) fail on any increase. Times and heap sizes depend on the machine, so they are copied in from a CI run and fail only past 1.5× plus 16ms (one frame).
