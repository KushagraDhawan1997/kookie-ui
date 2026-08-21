# Shell Audit — Simplified Technical English

**Date:** 2026-08-21 · **Version:** 0.3.22 · **Branch:** `claude/shell-code-audit-iewfp8`

This report gives the results of the audit in ASD-STE100 Simplified Technical English.
Technical names keep their source form. These names include file paths, prop names, CSS classes and CSS variables.
The full report in standard English is in `SHELL_AUDIT_REPORT.md`.

Each item has this structure:

- **Fault** — the condition in the code.
- **Effect** — the result for the user or for the application.
- **Action** — the correction.

---

> **Status. All the faults in this report now have a correction.**
> The corrections are in commit `a7f1a92` (the components) and commit `06bbcf9` (the CSS, the
> schemas and the documentation). The tests give 149 correct results in 48 files. `tsc`, ESLint and
> Stylelint find no error. Two items stay as they are. The different default presentation (item 23)
> is a decision about the product, not a fault. A change of presentation removes the pane from the
> tree, thus the size is lost. The `paneId` prop prevents this loss. Five CSS items (10, 13 to 17)
> have no test: jsdom does not apply CSS files.

## Scope

| Item | Data |
| ---- | ---- |
| Source files | `shell.tsx`, `shell.context.tsx`, `shell.hooks.ts`, `shell.types.ts`, `shell.css`, six `_internal/shell-*` files, `schemas/shell.schema.ts` |
| Size | 4,247 lines |
| Related files | `hooks/use-breakpoint.ts`, `helpers/normalize-to-px.ts`, `schemas/shell-*.json`, `apps/docs/app/docs/shell/content.mdx` |
| Tests | 46 files and 132 tests. All tests are correct. |
| Type check | `tsc --noEmit` finds no error. |
| Lint | ESLint finds no error in the shell files. |

**Result of the audit.** The structure of the component is correct.
But the tests do not examine the styles, the focus or the ARIA attributes.
The audit found 4 P0 faults, 8 P1 faults and 11 P2 or P3 faults.
Items 1 to 8 are small and independent.

The word **verified** shows that a test or a type probe during this audit made the fault again.

---

## P0 — Correctness

### 1. The pane replaces the new size with the old size — verified

**Files:** `shell.tsx:1295-1308`, `shell-sidebar.tsx:314-327`, `shell-inspector.tsx:290-311`, `shell-bottom.tsx:292-313`

**Fault.** The effect that reads the size from `localStorage` has the `onResize` callback in its dependency list.
Applications supply a new callback at each render.

**Effect.** The effect operates again at each render.
The effect reads the old size and writes it to the CSS variable.
The pane loses the size that the user selected.
If the application changes state in `onResize`, the pane moves to the old size continuously.

**Test.** The stored size is 333 px.
Set the live size to 250 px.
Click a different button in `Shell.Content`.
The pane size becomes 333 px.

**Action.** Put the `onResize` callback in a ref.
Remove the callback from the dependency list.
Add a flag that permits only one read of the storage for each adapter.

### 2. `Shell.Root` has the type of the Panel component — verified

**File:** `shell.tsx:724`

**Fault.** The code applies the cast `as PanelComponent` to `Root`.
This cast is correct for `Panel` at line 1465 only.

**Effect.** `Root` accepts all Panel props, for example `snapPoints` and `sizeUpdate`.
`Root` sends these unknown props to the `div` element.
`Shell.Root.Handle` has a type, but its value is `undefined`.
TypeScript does not use `ShellRootProps`.
A type probe shows that `<Shell.Root snapPoints={[1,2]}>` and `Shell.Root.Handle` cause no error.

**Action.** Remove the cast.

### 3. The schemas show an interface that does not exist — verified

**Files:** `schemas/shell.schema.ts:90-235`, `schemas/shell-*.json`

**Fault.** `PanePropsSchema` is strict.
It contains `mode`, `defaultMode` and `onModeChange`.
The components do not have these props.
The schemas do not contain `open`, `defaultOpen`, `onOpenChange`, `state`, `defaultState`, `onStateChange`, `size`, `defaultSize`, `onSizeChange`, `sizeUpdate`, `sizeUpdateMs` and `inset`.

**Effect.** The `parseShell*Props()` functions make an error in development mode when the props are correct:

```
ShellSidebarSchema.safeParse({ state: 'expanded', onStateChange(){} })
→ success: false — unrecognized_keys: state, onStateChange

ShellInspectorSchema.safeParse({ open: true, defaultSize: 300, inset: true })
→ success: false
```

External tools read the JSON schemas.
Thus these tools receive incorrect data.
The MDX documentation is correct.

**Action.** Make the schemas again from the current prop types.
Add a test that sends the real props of each component through its schema.

### 4. The arrow keys move the Bottom pane in the wrong direction — verified

**Files:** `shell-handles.tsx:171-174` and `:198`, `shell-bottom.tsx:326-329`

**Fault.** The drag function subtracts the delta.
The key function adds the delta.
The code applies the correction for the `start` edge to the vertical direction only.

**Effect.** The pointer makes the pane smaller.
The ArrowDown key makes the pane larger.
The measurement shows 200 px before the key and 208 px after the key.

**Action.** Apply the same edge correction to the horizontal direction.
Add a Bottom pane test to `rtl.resizer-keys.test.tsx`.

---

## P1 — Performance

### 5. Each pointer movement operates the resize function 3 to 5 times

**File:** `shell-handles.tsx:135-148`

**Fault.** The code adds `handleMove` to `window`, to `document` and to the handle element for the `pointermove` event.
The code also adds `handleMove` to `window` and to `document` for the `mousemove` event.

**Effect.** One movement of the mouse operates the function 3 times for the `pointermove` event.
The browser also sends a `mousemove` event.
This event operates the function 2 more times.
Each operation writes a CSS variable and calls the `onResize` callback of the application.
This is the function that operates most frequently in the component.

**Note.** The test environment sends the event to `window` only.
Thus the test shows one call.

**Action.** Use `setPointerCapture`.
Then add `pointermove`, `pointerup` and `pointercancel` to `window` only.
Remove the other listeners.

### 6. Three components use the root context and thus render too frequently

**Files:** `shell.tsx:799` (Left), `shell.tsx:1009` (Rail), `shell.tsx:1181` (Panel), context value at `shell.tsx:641`

**Fault.** The root context value changes when any pane mode changes.
`Left`, `Rail` and `Panel` do not use the sliced contexts.
Three effects have the full context object in their dependency lists.

**Effect.** A change to the Inspector renders `Left`, `Rail` and `Panel`.
These three effects operate at each change of state:

- `shell.tsx:806-808` — the effect calls `onLeftPres()` and then sets state.
- `shell.tsx:1033-1035` — the effect calls `onRailDefaults()`.
- `shell.tsx:1242-1244` — the effect calls `onPanelDefaults()`.

The test `perf.selector-hooks.test.tsx` examines the components in `Content` only.
Thus the test does not find this fault.

**Action.** Change `Left`, `Rail` and `Panel` to the sliced hooks.
Put the individual callbacks in the dependency lists.

### 7. Each arrow key writes to `localStorage`

**File:** `shell-handles.tsx:195-204`

**Fault.** One key press calls `onResizeStart`, `onResize` and `onResizeEnd`.
Each pane saves the size in `onResizeEnd`.

**Effect.** When the user holds a key, the component makes one write to the storage for each repetition of the key.

**Action.** Save the size at the `keyup` event, or after a short delay.

### 8. The throttle function can remove the last size message

**Files:** `shell.tsx:1169-1178`, `shell-sidebar.tsx:147-156`, `shell-inspector.tsx:160-169`, `shell-bottom.tsx:160-169`

**Fault.** The throttle function has no trailing call.
The code calls `emitSizeChange` at the end of the resize operation.

**Effect.** If two resize operations end in the same time interval, the application receives the first size only.
Thus the size in the application is not correct.

**Action.** Add a trailing call.
As an alternative, send the terminal `resize` and `controlled` messages directly.

---

## P1 — Accessibility

### 9. The user cannot see the focus on the resize handle

**Files:** `shell-handles.tsx:57`, `shell.css:502-512`

**Fault.** The handle has `tabIndex={0}`.
The CSS has no `:focus-visible` rule.
The handle is transparent and has no default content.

**Effect.** Keyboard users move the focus to the handle, but they cannot see its position.
This condition is a failure of WCAG 2.4.7.

**Action.** Add a `:focus-visible` indicator to `.rt-ShellResizer`.

### 10. The reduced-motion rule does not stop the stacked and peek movements

**Files:** `shell.css:484-497` against `shell.css:249`, `:417`, `:440`, `:462` and `:572-580`

**Fault.** The reduced-motion rule uses class selectors.
The rules with the `transform` transitions use attribute selectors.
The attribute selectors have more specificity.
A media query does not add specificity.

**Effect.** Users who select reduced motion see all the slide movements of the panes.

**Action.** Add `!important` to the reduced-motion rule.
The `[data-resizing]` rule at line 379 shows this method.

### 11. The `aria-valuenow` value is not correct

**File:** `shell-handles.tsx:51-57`. The code writes the attribute at `:84`, `:117`, `:130`, `:180`, `:190` and `:201`.

**Fault.** The code sets `aria-valuenow` to `expandedSize`.
This value is not the true size of the pane.
The code changes the attribute with `setAttribute` outside of React.

**Effect.** A screen reader speaks the wrong size when the pane uses `defaultSize`, `size` or a stored size.
A subsequent render can remove the value of the attribute.
The correct ARIA pattern for a splitter is `role="separator"`.

**Action.** Keep the size in state.
Render `aria-valuenow` from the state.
Change the role to `separator`.

### 12. The Trigger has `aria-expanded`, but it has no `aria-controls`

**File:** `shell.tsx:1584-1594`

**Fault.** No pane has an `id` attribute.
The Rail and the Sidebar are `div` elements.
The Inspector has no role.
The Content is the only landmark.

**Effect.** A screen reader tells the user that the control is open, but it cannot tell the user which pane is open.

**Action.** Make an id with `React.useId`.
Put the id in a context slice.
Then set `aria-controls` on the Trigger.
Add roles and labels to the Rail, the Sidebar, the Inspector and the Bottom pane.

---

## P2 — CSS

### 13. The `100dvh` rule never operates

**Files:** `shell.css:23-31`, `shell.tsx:592-598`

**Fault.** The rule uses the selector `.rt-ShellRoot:not([style*='height'])`.
But `Root` always writes an inline height.
The value for `height="full"` is `100vh`.

**Effect.** Mobile browsers use `100vh`.
The address bar makes the shell too high.

**Action.** Write `100dvh` from `heightStyle`.
Put a `100vh` declaration before it.

### 14. Users cannot change the `--shell-inset-gap` variable

**Files:** `shell.css:631-643`, `content.mdx:604-610`

**Fault.** The CSS sets the variable on each inset pane.
A value from a parent element cannot replace a value on the element.

**Effect.** The instruction in the documentation has no result.

**Action.** Set the default value on `.rt-ShellBody`.
Use the variable in the pane rules only.

### 15. The gray background is not behind an inset Bottom pane

**Files:** `shell.tsx:694-710`, `shell.css:626-628`

**Fault.** The Bottom pane is not in the `.rt-ShellBody` element.
The gray background is on `.rt-ShellBody[data-has-inset]`.

**Effect.** The Bottom pane has a margin, but the space around it shows the root background.

**Action.** Put the background on `.rt-ShellRoot[data-has-inset]`.
As an alternative, put the Bottom pane in the body element.

### 16. A CSS selector has too large a range

**File:** `shell.css:411-414`

**Fault.** The selector `[data-presentation='overlay']` finds all elements of the application that have this attribute.

**Effect.** The `contain: style` property applies to elements that are not part of the Shell.

**Action.** Add the shell class to the selector.

### 17. The `data-phase` rules are not necessary

**Files:** `shell.css:225-238`, `shell-sidebar.tsx:107`

**Fault.** No code sets the `data-phase` attribute.
The comment in the source says that the CSS controls the sequence.

**Action.** Remove the three rules.

---

## P2 — Structure

### 18. The four panes contain the same code

**Fault.** The Panel, the Sidebar, the Inspector and the Bottom pane contain the same blocks.
Only the name of the CSS variable is different.

| Block | Panel | Sidebar | Inspector | Bottom |
| ----- | ----- | ------- | --------- | ------ |
| Persistence adapter | 1264-1292 | 284-312 | 260-288 | 262-290 |
| Throttle and debounce function | 1146-1180 | 122-158 | 135-171 | 135-171 |
| Size effects | 1319-1349 | 406-434 | 353-381 | 355-383 |
| Ref function | 1245-1253 | 109-116 | 96-103 | 96-103 |
| Open and state messages | 1371-1392 | 217-233 | 197-214 | 199-216 |
| Expand and collapse messages | 893-917 | 246-278 | 227-256 | 229-258 |
| Controlled-mode warning | 1229-1240 | 181-191 | 182-192 | 184-194 |

**Effect.** The four panes contain approximately 500 lines of the same code.
Thus corrections are not the same in each pane.
The Inspector and the Bottom pane accept a promise from `persistence.load()`.
The Panel and the Sidebar use an async function that has no `catch` block.

**Action.** Make the hooks `usePaneSize` and `usePaneOpenState`.
Then use these hooks in the four panes.

### 19. Two components control the `open` prop of the Rail and the Panel

**Files:** `shell.tsx:495-588` (Root), `shell.tsx:840-879` (Left)

**Fault.** `Root` reads the `open` prop, sets `leftMode` and calls the `onOpenChange` callback of the application.
`Left` reads the same prop and also calls `onOpenChange`.
The code uses sequence numbers to prevent two calls.

**Effect.** A new reason code needs a change in two code paths.

**Action.** Give the control to `Left`.
`Root` must send the value to `Left`.

### 20. `Root` reads responsive props in the wrong sequence

**Files:** `shell.tsx:253`, `:277-279`, `:292`, `:299`, `:315`, `shell.hooks.ts:38-66`

**Fault.** Five positions use `Object.values(x)[0]` when the `initial` key is not present.
The other code uses the sequence `xl`, `lg`, `md`, `sm`, `xs`, `initial`.
`Root` also contains this sequence two times at `shell.tsx:495-528`.

**Effect.** The value `{ md: true }` becomes `true` on the server for all breakpoints.
Thus the first paint can show the wrong state.

**Action.** Use `useResponsiveValue` in `Root`.

### 21. The code sets `SHELL_SLOT`, but no code reads it

**Files:** `shell.tsx:103-120`, `shell.tsx:238-320`

**Fault.** The code applies the symbol to each slot component.
But `isShellComponentType` compares `displayName`.
The initializer of the reducer also compares `displayName`.
The comment says that the symbol keeps the identification correct after minification.
This statement is not correct.

**Action.** Read `SHELL_SLOT` in the two positions.
As an alternative, remove the symbol and the comment.

### 22. `shell.tsx` contains 32 `any` types

**Fault.** `shell.tsx` has 32 occurrences of `as any` or `: any`.
`shell-sidebar.tsx` has one occurrence.
The other internal files have none.
Most occurrences are `(el as any).props` in the child scan.

**Effect.** `CLAUDE.md` does not permit the `any` type.

**Action.** Make a typed helper function for the child scan.

### 23. Small items

- **Peek stays on the screen.** The code clears `peekTarget` at the `mouseleave` event of the trigger only (`shell.tsx:1573-1582`). If the trigger goes out of the tree, the peek stays on the screen.
- **Non-null assertions.** The resize code uses `localRef.current!` at `shell.tsx:1407`, `shell-sidebar.tsx:378` and `shell-inspector.tsx:325`. `CLAUDE.md` does not permit this operator.
- **Two handles change the same styles.** Two drag operations at the same time replace the values of `cursor` and `userSelect` (`shell-handles.tsx:74-78`).
- **A change of presentation removes the size.** The value of `--panel-size` is in the DOM only. Thus a new mount removes it. The `paneId` prop prevents this loss.
- **Unused imports.** `_BREAKPOINTS` is not necessary in the three internal panes. The stacked branch of `Left` makes five values that no code uses (`shell.tsx:960-964`).
- **The initializer is not pure.** The code writes `hasPanelDefaultOpenRef.current` in the initializer of `useReducer` (`shell.tsx:241`).
- **The defaults are not the same.** `Left` uses `fixed` for all breakpoints. `Sidebar` uses `overlay` below `md`. Thus a Rail and Panel layout is never an overlay on a telephone.

---

## P3 — Production messages

**Files:** `shell.tsx:357`, `shell.tsx:1027`, `shell.tsx:1237`, `shell-sidebar.tsx:188`, `shell-inspector.tsx:189`, `shell-bottom.tsx:191`

**Fault.** Six `console.warn` calls are in effects that have no `NODE_ENV` condition.
The related `console.error` calls have this condition.

**Effect.** These six messages go to the console of the production application.
The minifier cannot remove the text.

**Action.** Put each call in a `process.env.NODE_ENV !== 'production'` condition.

---

## Test gaps

- **Styles.** No test reads a computed style. Thus the tests cannot find items 10, 13, 14, 15 and 17.
- **Persistence.** The tests examine the overlay mode only. No test examines a read and a subsequent render (item 1). No test examines the save operation at the end of a resize.
- **Pointer resize.** The tests use the keyboard only. Thus no test finds the listeners (item 5), the snap points, the `collapseThreshold` prop or the Escape key.
- **Bottom pane keys.** The RTL key test examines the Panel and the Inspector only.
- **Schemas.** No test sends the real props through the schemas.
- **ARIA.** No test reads `aria-valuenow` or `aria-expanded`. No test examines the focus sequence.

---

## Sequence of work

| # | Task | Severity | Effort |
| - | ---- | -------- | ------ |
| 1 | Correct the persistence effect | P0 | S |
| 2 | Remove the `as PanelComponent` cast | P0 | XS |
| 3 | Correct the Bottom pane key direction | P0 | XS |
| 4 | Make the schemas again and add a test | P0 | M |
| 5 | Use one `pointermove` listener | P1 | S |
| 6 | Add `:focus-visible` to the resizer | P1 | XS |
| 7 | Correct the reduced-motion specificity | P1 | XS |
| 8 | Put the six warnings in a condition | P1 | XS |
| 9 | Change Left, Rail and Panel to the sliced hooks | P1 | M |
| 10 | Correct `aria-valuenow`, the role and `aria-controls` | P1 | M |
| 11 | Correct `100dvh`, the gap variable and the Bottom background | P2 | S |
| 12 | Make the `usePaneSize` and `usePaneOpenState` hooks | P2 | L |
| 13 | Give the control of `open` to one component | P2 | L |
| 14 | Use `useResponsiveValue` in `Root` | P2 | S |
| 15 | Read or remove `SHELL_SLOT`. Remove the unused code. | P3 | S |

Do items 1 to 8 first.
Each item is small.
Each item permits a new test.
