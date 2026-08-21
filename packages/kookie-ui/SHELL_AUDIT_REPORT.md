# Shell — Code Audit

**Date:** 2026-08-21 · **Version audited:** 0.3.22 · **Branch:** `claude/shell-code-audit-iewfp8`

> **Status — all findings resolved.** Fixed in `a7f1a92` (component layer) and `06bbcf9` (CSS,
> schemas, docs) on this branch. The suite now runs **48 files / 149 tests** for Shell, all green,
> with `tsc --noEmit`, ESLint and Stylelint clean. Two items were deliberately left as they are:
> the asymmetric default presentation (item 23, last bullet) is a product decision rather than a
> defect, and a fixed ↔ overlay switch still remounts the pane, so a DOM-only size is lost unless
> `paneId` persistence is configured — the size now lives in React state, which fixes re-renders
> but not remounts. Five CSS items (10, 13–17) are verified by reading, not by CI: jsdom does not
> apply stylesheets, so no test can assert them.

## Scope & method

| Area | Detail |
| ---- | ------ |
| Sources | `shell.tsx` (1621), `shell.context.tsx` (154), `shell.hooks.ts` (178), `shell.types.ts` (65), `shell.css` (643), `_internal/shell-{sidebar,inspector,bottom,handles,resize,prop-helpers}` (1206), `schemas/shell.schema.ts` (380) — **4,247 LOC** |
| Adjacent | `hooks/use-breakpoint.ts`, `helpers/normalize-to-px.ts`, generated `schemas/shell-*.json`, `apps/docs/app/docs/shell/content.mdx` |
| Verification | `vitest run tests/components/shell` → **46 files / 132 tests pass**; `tsc --noEmit` → clean; `eslint` on shell sources → clean |
| Evidence | Findings marked **[verified]** were reproduced with throwaway tests or a `tsc` probe during this audit; the rest are read from source with the mechanism stated. |

**Verdict:** architecture is sound and well tested for state transitions, but there is one data-loss-class bug in resize persistence, a fully stale public schema surface, and a set of a11y/CSS defects that the current test suite cannot see (it never asserts styles, focus, or ARIA values).

The previous version of this file (Dec 2024) is superseded. Three of its open items are now fixed in `main` — `Panel._wasControlled` uses a `useRef` (`shell.tsx:1229`), resize handles have `aria-label` (`shell-handles.tsx:52`), `Trigger` has `aria-expanded` (`shell.tsx:1593`), and `normalizeToPx` is deduplicated into `helpers/normalize-to-px.ts`.

---

## P0 — Correctness

### 1. Persisted size overwrites the live size on any re-render `[verified]`

`shell.tsx:1295-1308` (Panel), `shell-sidebar.tsx:314-327`, `shell-inspector.tsx:290-311`, `shell-bottom.tsx:292-313`

```ts
}, [resizable, persistenceAdapter, onResize, isOverlay]);
//                                  ^^^^^^^^ inline callbacks change identity every render
```

The load-persisted-size effect lists `onResize` as a dependency. Consumers pass `onResize` inline (as every doc example does), so the effect re-runs on **every render** of the host, re-reads `localStorage`, and writes the stored value back into `--panel-size` — discarding the size the user is currently dragging to. Resizing itself calls `onResize`, so a consumer that does anything stateful in that callback creates a fight loop: drag → setState → re-render → snap back to the last saved size.

Reproduction (throwaway test, panel with `paneId="p1"`, stored size `333`): set the live size to `250px`, click an unrelated button in `Shell.Content`, read the var back → **`333px`**.

**Fix:** keep `onResize` in a ref (the file already uses that pattern for `onOpenChange`) and gate the load on a `didLoadRef` so it runs once per `persistenceAdapter`.

### 2. `Shell.Root` is typed as `PanelComponent` `[verified]`

`shell.tsx:724`

```ts
const Root = React.forwardRef<HTMLDivElement, ShellRootProps>((props, ref) => { … }) as PanelComponent;
```

The cast almost certainly belongs to `Panel` (which does its own cast at `:1465`). Consequences: `Shell.Root` publicly accepts every Panel prop (`snapPoints`, `sizeUpdate`, `collapseThreshold`, …) and silently spreads the unknown ones onto the root `<div>`; `Shell.Root.Handle` type-checks but is `undefined` at runtime; `ShellRootProps` is never enforced. A `tsc` probe confirms `<Shell.Root snapPoints={[1,2]} sizeUpdate="throttle">` and `Shell.Root.Handle` both compile clean.

**Fix:** drop the cast (`ShellRootProps` already carries the right shape).

### 3. Zod schemas and the generated JSON schemas describe an API that no longer exists `[verified]`

`schemas/shell.schema.ts:90-116, 154-235`; generated `schemas/shell-{sidebar,inspector,panel,rail,bottom}.json`

`PanePropsSchema` is `.strict()` and still models the removed `mode` / `defaultMode` / `onModeChange` API. It documents none of the shipping API: `open`/`defaultOpen`/`onOpenChange`, `state`/`defaultState`/`onStateChange`, `size`/`defaultSize`/`onSizeChange`, `sizeUpdate`, `sizeUpdateMs`, `inset`, `height`.

Because the schemas are strict, the exported `parseShell*Props()` helpers **throw on valid props in development**:

```
ShellSidebarSchema.safeParse({ state: 'expanded', onStateChange(){} })
→ success: false, issues: [ unrecognized_keys: state, onStateChange ]
ShellInspectorSchema.safeParse({ open: true, defaultSize: 300, inset: true })
→ success: false
```

The published `schemas/*.json` (consumed by tooling/AI integrations) carry the same wrong shape: `['…','defaultMode','…','mode','…']`, no `open`, no `state`, no `inset`. `content.mdx` is correct and current — the drift is confined to the schema layer.

**Fix:** regenerate `PanePropsSchema` from the current prop types and add a test that round-trips each component's real prop set through its schema, so drift fails CI.

### 4. Keyboard resize moves `Shell.Bottom` the opposite way from dragging `[verified]`

`shell-handles.tsx:171-174` and `:198` vs `shell-bottom.tsx:326-329`

Drag: `computeNext = startSize - delta`, so pulling the top edge **down shrinks** the pane. Keyboard: for `orientation: 'horizontal'`, `ArrowDown → delta = +step` and the `edge === 'start'` inversion is only applied to the vertical branch, so `next = current + step` — **ArrowDown grows** it. Measured: 200px → 208px on `ArrowDown`.

**Fix:** apply the same `edge === 'start' ? -delta : delta` inversion for the horizontal orientation (`rtl.resizer-keys.test.tsx` covers the vertical case only; add the Bottom case).

---

## P1 — Performance

### 5. Every pointer move runs the resize handler 3–5 times

`shell-handles.tsx:135-148`

`handleMove` is registered on `window`, `document` **and** the handle element for `pointermove`, plus `window` and `document` for `mousemove`. One physical mouse move dispatches `pointermove` (target → document → window = 3 listener invocations) and its compatibility `mousemove` (2 more). Each invocation does a `style.setProperty` and calls the consumer's `onResize`. With `CLAUDE.md`'s "performance is the best UX" bar, this is the hottest path in the component running at 3–5× cost, and it makes consumer `onResize` handlers fire 3–5× per frame.

(The jsdom test dispatches directly on `window`, so it reports 1 call and can't catch this.)

**Fix:** register `pointermove`/`pointerup`/`pointercancel` once on `window` after `setPointerCapture`; drop the `document`, element-level and `mousemove` duplicates (PointerEvent is baseline in every browser this library supports). `handleUp` is already effectively once-only because `cleanup()` removes the remaining listeners mid-dispatch.

### 6. `useShell()` defeats the slice contexts for `Left`, `Rail` and `Panel`

`shell.tsx:799, 1009, 1181` — `shellContextValue` (`:641`) changes identity whenever *any* pane mode changes, so opening the Inspector re-renders `Left`, `Rail` and `Panel`. The split contexts added for exactly this reason (`shell.context.tsx:63-140`) are used by `Sidebar`/`Inspector`/`Bottom`/`Trigger` but not by the three components that still read the root context. `perf.selector-hooks.test.tsx` only guards consumers inside `Content`, so the regression is invisible.

Worse, three effects take the whole context object as a dependency and therefore re-run on every unrelated state change:

- `shell.tsx:806-808` — `onLeftPres(resolvedPresentation)` → `setDevLeftPres` on every shell change (state bails out, but a render pass is still scheduled)
- `shell.tsx:1033-1035` — `onRailDefaults(expandedSize)`
- `shell.tsx:1242-1244` — `onPanelDefaults(expandedSize)`

**Fix:** migrate `Left`/`Rail`/`Panel` to the slice hooks, and depend on the individual callbacks (they are already `useCallback`-stable) instead of `shell`.

### 7. Keyboard resize writes `localStorage` on every arrow key

`shell-handles.tsx:195-204` calls `onResizeStart` → `onResize` → `onResizeEnd` for a single keypress; each pane's `onResizeEnd` runs `emitSizeChange(...)` **and** `persistenceAdapter.save()`. Holding an arrow key issues a synchronous storage write per repeat.

**Fix:** debounce the keyboard commit (fire `onResizeEnd`/save on `keyup` or after a short idle).

### 8. `throttle` can swallow the final `onSizeChange`

`shell.tsx:1169-1178`, `shell-sidebar.tsx:147-156`, `shell-inspector.tsx:160-169`, `shell-bottom.tsx:160-169` — the throttle has no trailing edge. `emitSizeChange` is called at resize **end**, so two resizes finishing inside `sizeUpdateMs` report only the first, and the consumer's stored size is stale.

**Fix:** add a trailing call, or bypass the throttle for the `'resize'`/`'controlled'` terminal emissions.

---

## P1 — Accessibility

### 9. The resize handle is focusable with no visible focus indicator

`shell-handles.tsx:57` sets `tabIndex={0}`; `shell.css:502-512` styles `.rt-ShellResizer` as a transparent hit area with **no `:focus-visible` rule** and no default children. Keyboard users can tab to it and cannot see where they are. WCAG 2.4.7.

**Fix:** add a `:focus-visible` outline/indicator bar to `.rt-ShellResizer`.

### 10. `prefers-reduced-motion` does not stop the stacked/peek animations

`shell.css:484-497` zeroes transitions with single-class selectors (specificity 0-1-0), but the stacked and peek rules that own the `transform` transitions are attribute-qualified (0-2-0) and declared later:

`.rt-ShellSidebar[data-presentation='stacked']` (`:249`), `.rt-ShellLeft[data-presentation='stacked']` (`:417`), `.rt-ShellInspector[data-presentation='stacked']` (`:440`), `.rt-ShellBottom[data-presentation='stacked']` (`:462`), and the peek content rules (`:572-580`).

Media queries do not add specificity, so users who asked for reduced motion still get every slide-in transform.

**Fix:** move the reduced-motion override to `transition: none !important` (matching the `[data-resizing]` rule at `:379-384`) or raise its specificity to cover the stacked/peek selectors.

### 11. `role="slider"` with a stale `aria-valuenow`

`shell-handles.tsx:51-57` — `aria-valuenow={defaultSize}` is the pane's `expandedSize`, not its actual size, so a pane sized via `defaultSize`, `size` or restored persistence announces the wrong number until the first drag. Live updates during drag are done with `setAttribute` outside React (`:84, :117, :130, :180, :190, :201`), which is fragile against any re-render that changes the `style`/props of the handle.

Also: the ARIA splitter pattern is `role="separator"` + `tabindex` + `aria-valuenow`; `role="slider"` additionally requires `aria-valuetext` for a meaningful announcement.

**Fix:** hold the current size in state (or a `useSyncExternalStore`-style subscription) and render `aria-valuenow` from it; switch to `role="separator"`.

### 12. `Trigger` has `aria-expanded` but nothing to point at

`shell.tsx:1584-1594` — no `aria-controls`, because no pane renders an `id`. Rail/Sidebar are plain `<div>`s (not `<nav>`), Inspector is not `complementary`. Only `Content` carries a landmark (`<main>`, `:1488`).

**Fix:** give each pane a generated id (`React.useId`) published on a context slice, and let `Trigger` consume it; add `role`/`aria-label` defaults for Rail, Sidebar, Inspector and Bottom.

---

## P2 — CSS / visual

### 13. The `100dvh` fallback is dead code

`shell.css:23-31` guards on `.rt-ShellRoot:not([style*='height'])`, but `Root` **always** writes an inline height (`shell.tsx:592-598` — `height="full"` → `{ height: '100vh' }`). The `@supports (height: 100dvh)` block therefore never applies, and mobile Safari/Chrome get the URL-bar-inflated `100vh`.

**Fix:** emit `100dvh` from `heightStyle` with a `100vh` declaration order fallback, or stop inlining the height for the `'full'` case.

### 14. Documented `--shell-inset-gap` override cannot work

`shell.css:631-643` defines `--shell-inset-gap` **on each inset pane**; a value inherited from an ancestor always loses to a declaration on the element itself. The docs (`content.mdx:604-610`) tell users to override it on `.rt-ShellBody[data-has-inset]`, which is a no-op.

**Fix:** declare the default on `.rt-ShellBody` (or `.rt-ShellRoot`) and only *consume* it in the pane rules.

### 15. An inset `Shell.Bottom` sits outside the gray backdrop

`shell.tsx:694-710` renders `bottomEls` as a sibling of `.rt-ShellBody`, but the backdrop lives on `.rt-ShellBody[data-has-inset]` (`shell.css:626-628`). An inset Bottom gets the margin and radius without the gray field behind it, so its gap shows the root background instead.

**Fix:** paint the backdrop on `.rt-ShellRoot[data-has-inset]`, or move Bottom inside the body wrapper.

### 16. Unscoped global selector

`shell.css:411-414` — `[data-presentation='overlay'] { contain: style; }` matches **any** element in the host app with that attribute. Scope it to the shell classes.

### 17. Dead `data-phase` rules

`shell.css:225-238` styles `.rt-ShellSidebarContent[data-phase='hiding'|'resizing'|'showing']`; nothing sets `data-phase` any more (`shell-sidebar.tsx:107` — "phase sequencing is now CSS-driven; no JS-managed phase").

---

## P2 — Architecture & maintainability

### 18. Four near-identical pane implementations

The same blocks are copy-pasted across `Panel`, `Sidebar`, `Inspector` and `Bottom` with only a CSS-var name changing:

| Block | Panel | Sidebar | Inspector | Bottom |
| ----- | ----- | ------- | --------- | ------ |
| `persistenceAdapter` (localStorage) | `1264-1292` | `284-312` | `260-288` | `262-290` |
| `emitSizeChange` throttle/debounce | `1146-1180` | `122-158` | `135-171` | `135-171` |
| `defaultSize` + controlled-size effects | `1319-1349` | `406-434` | `353-381` | `355-383` |
| `setRef` merge | `1245-1253` | `109-116` | `96-103` | `96-103` |
| open/state notify effect | `1371-1392` | `217-233` | `197-214` | `199-216` |
| `onExpand`/`onCollapse` effect | (in `Left`) `893-917` | `246-278` | `227-256` | `229-258` |
| controlled/uncontrolled dev warning | `1229-1240` | `181-191` | `182-192` | `184-194` |

That is roughly **500 lines of duplication**, and it is why fixes land unevenly — e.g. Inspector and Bottom handle a promise-returning `persistence.load()` explicitly (`shell-inspector.tsx:299-307`), while Panel and Sidebar use a floating `async` IIFE with no `.catch` (`shell.tsx:1295-1304`, `shell-sidebar.tsx:314-323`).

**Fix:** extract `usePaneSize({ cssVar, orientation, … })` and `usePaneOpenState(…)` hooks; each pane then becomes presentation + slot wiring.

### 19. Two owners for the Rail/Panel controlled `open`

`Root` resolves the first Rail's/Panel's `open` and syncs `leftMode` (`shell.tsx:495-559`) **and** runs a conflict resolver that calls the user's `onOpenChange` directly (`:569-588`); `Left` independently resolves the same prop through `useResponsiveInitialState` (`:840-847`) and emits its own `onOpenChange` (`:852-879`). Two code paths own one prop, with sequence-number bookkeeping (`controlSeqRef`, `lastConflictRef`) to keep them from double-firing. `rail-panel.controlled-conflict.test.tsx` pins current behaviour, but any new reason code has to be threaded through both.

**Fix:** make `Left` the single owner and let `Root` pass the resolved value down.

### 20. Root's initial-state scan resolves responsive props by object key order

`shell.tsx:253, 277-279, 292, 299, 315` all fall back to `Object.values(x)[0]` when `initial` is absent, e.g. `{ md: true }` resolves to `true` on the server regardless of breakpoint. Everywhere else the codebase walks the documented `xl → lg → md → sm → xs → initial` chain (`shell.hooks.ts:38-66`). The mismatch shows up as a first-paint flash before the breakpoint effect corrects it.

Root also re-implements that chain inline, twice (`shell.tsx:495-528`), instead of reusing `useResponsiveValue`.

### 21. Component identification is half-migrated

`SHELL_SLOT` (`shell.tsx:103-108`) is assigned to every slot component and **never read** — `isShellComponentType` (`:114`) still compares `displayName`, and Root's reducer initializer compares raw `displayName` strings (`:238-320`). The comment at `:117` ("so isType remains stable after minification") describes behaviour that does not exist.

**Fix:** read `SHELL_SLOT` in `isShellComponentType` and in the initializer scan, or delete the symbol.

### 22. `any` density in `shell.tsx`

32 `as any` / `: any` occurrences (vs 1 in `shell-sidebar.tsx`, 0 in the other internals), mostly `(el as any).props?.…` in the child scans and `<Left {...(passthroughProps as any)}>` (`:673`). `CLAUDE.md` treats `any` as a code smell. A typed `getSlotProps<T>()` helper over the child scan would remove most of them.

### 23. Smaller items

- **Stuck peek:** `peekTarget` is cleared only by the trigger's `mouseleave` (`shell.tsx:1573-1582`); if the trigger unmounts or the pointer leaves during a route change, the peek overlay stays open.
- **Non-null assertions in resize math:** `getComputedStyle(localRef.current!)` (`shell.tsx:1407`, `shell-sidebar.tsx:378`, `shell-inspector.tsx:325`) — `CLAUDE.md` bans `!` without justification.
- **Shared body style during multi-touch:** two simultaneous drags overwrite each other's saved `body.style.cursor`/`userSelect` (`shell-handles.tsx:75-78`).
- **Presentation switch drops DOM-only size:** `--panel-size` lives only in the DOM, so any remount (fixed ↔ overlay, `shell.tsx:923-951`) resets it unless `paneId` persistence is configured.
- **Dead imports:** `_BREAKPOINTS` is imported and unused in `shell-sidebar.tsx:11`, `shell-inspector.tsx:9`, `shell-bottom.tsx:9`; the stacked branch of `Left` computes five unused `_`-prefixed values (`shell.tsx:960-964`).
- **Impure reducer initializer:** `hasPanelDefaultOpenRef.current` is written inside the `useReducer` lazy init (`shell.tsx:241`).
- **`Left` default presentation is `fixed` at every breakpoint** (`shell.tsx:785`) while `Sidebar` defaults to `overlay` below `md` (`shell-sidebar.tsx:59`) — a Rail+Panel layout never becomes an overlay on phones unless the consumer opts in.

---

## P3 — Production noise

Six `console.warn` calls run in production builds — they sit inside effects with no `NODE_ENV` guard, unlike the sibling `console.error` guards:

`shell.tsx:357` (Sidebar/Rail composition), `shell.tsx:1027` (Rail), `shell.tsx:1237` (Panel), `shell-sidebar.tsx:188`, `shell-inspector.tsx:189`, `shell-bottom.tsx:191`.

`CLAUDE.md` requires environment-guarded logging. Wrapping them also lets minifiers drop the strings.

---

## Test gaps

The suite is strong on state transitions (132 tests) and blind everywhere else:

1. **Styles** — no test reads a computed style, so #10, #13, #14, #15 and #17 cannot fail CI.
2. **Persistence** — `*.overlay-persistence.test.tsx` only asserts that overlay ignores persistence; nothing covers load-then-re-render (#1) or save-on-resize-end.
3. **Pointer resize** — only keyboard paths are exercised; no `pointerdown → move → up` flow, so listener duplication (#5), snap points, `collapseThreshold` and the Escape restore are untested.
4. **Bottom keyboard resize** — `rtl.resizer-keys.test.tsx` covers Panel and Inspector only (#4).
5. **Schema round-trip** — nothing validates the real prop sets against the Zod schemas (#3).
6. **A11y assertions** — no test reads `aria-valuenow`, `aria-expanded` or focus order.

---

## Suggested order of work

| # | Item | Severity | Effort |
| - | ---- | -------- | ------ |
| 1 | Persistence effect overwrites live size | P0 | S |
| 2 | `Root as PanelComponent` cast | P0 | XS |
| 3 | Bottom keyboard resize direction | P0 | XS |
| 4 | Rebuild Zod + JSON schemas, add round-trip test | P0 | M |
| 5 | Collapse resize listeners to one `pointermove` | P1 | S |
| 6 | `:focus-visible` on the resizer | P1 | XS |
| 7 | `prefers-reduced-motion` specificity | P1 | XS |
| 8 | Guard the six production `console.warn`s | P1 | XS |
| 9 | `Left`/`Rail`/`Panel` → slice hooks; drop `shell` from effect deps | P1 | M |
| 10 | `aria-valuenow` from real size; `role="separator"`; `aria-controls` | P1 | M |
| 11 | `100dvh`, inset gap variable, inset Bottom backdrop | P2 | S |
| 12 | Extract `usePaneSize` / `usePaneOpenState` (~500 dup lines) | P2 | L |
| 13 | Single owner for Rail/Panel controlled `open` | P2 | L |
| 14 | Responsive resolution in Root via `useResponsiveValue` | P2 | S |
| 15 | Read `SHELL_SLOT` or delete it; clear dead imports/CSS | P3 | S |

Items 1–8 are small, independent, and each has a clear test to add alongside.
