# Shell update plan

Status: proposed. Not started. Input: `shell-study.md`.

Goal: rebuild v1 Shell's core on v2's model while keeping the `Shell.*` API and v1's responsive prop objects. Consumers change nothing to upgrade. Deprecated props warn in development and are removed at the next major.

Blocked on: an audit of Womp's Shell usage (checklist in §8).

---

## 1. Principles the rebuild must satisfy

These are the points where v1 disagrees with v2 today. After the rebuild both give the same answer.

| Question | Answer (both systems) |
|---|---|
| When does `onOpenChange` fire? | Only on a user action: trigger, Escape, scrim press, drag-collapse. Never on mount, never on window resize. |
| What happens when the window crosses a breakpoint? | The same element stays mounted. Only CSS changes. An untouched pane follows the window; a touched pane keeps its state. |
| What decides the first paint? | CSS. The server and the client render identical markup. No attribute waits for a breakpoint hook. |
| Who owns pane state? | The pane. The Root holds no state. |
| How do parts find each other? | A registry keyed by pane name. No child scanning, no `displayName` checks. |
| Does the library link panes to each other? | No. Linkage is written at the call site. |
| How many controlled channels per pane? | One for open state (`open`/`defaultOpen`/`onOpenChange`). Size is separate and stays as is. |

---

## 2. What stays

Same name, same type, same meaning.

- Namespace export `Shell` with `Root`, `Header`, `Rail`, `Panel`, `Sidebar`, `Content`, `Inspector`, `Bottom`, `Trigger`.
- `Root.height`, `Header.height`.
- `presentation` on every pane, including responsive objects and the values `fixed | overlay | stacked`.
- `defaultOpen` on Rail, Panel, Inspector, Bottom, including responsive objects. Bottom gains the responsive form; the docs already claim it.
- `open` as a boolean.
- `onOpenChange(open, meta)`. The signature is kept; see §4 for what `meta` becomes.
- Resize: `resizable`, `expandedSize`, `minSize`, `maxSize`, `size`, `defaultSize`, `onSizeChange`, `sizeUpdate`, `sizeUpdateMs`, `onResize`, `onResizeStart`, `onResizeEnd`, `snapPoints`, `snapTolerance`, `collapseThreshold`, `paneId`, `persistence`, `collapsible`, and the `*.Handle` parts.
- `inset`.
- `Trigger.target`, `Trigger.action`, `Trigger.peekOnHover`.
- Sidebar `thinSize`, `toggleModes`.
- `useSidebarMode`.
- Class names `rt-Shell*` on the panes.

Items marked in §8 may be cut after the audit.

---

## 3. What changes underneath (same props, new behaviour)

### 3.1 State on the pane

- Each pane holds `'auto' | 'open' | 'closed'`. `auto` means untouched.
- `defaultOpen` undefined → `auto`. A boolean → `open`/`closed`. A responsive object → `auto`, with the object written as attributes (§3.3).
- `open` (controlled) sets the effective state directly. Partial control works: removing `open` returns the pane to its last uncontrolled state.
- Sidebar's three-value `state` is stored as open/closed plus a `thin` flag (see §7, decision 1).
- The Root reducer, `readPaneStateFromChildren`, the family re-read, the sequence counters and `useResponsiveInitialState` are deleted.

### 3.2 Registry replaces child scanning

- Root provides a store: `Map<PaneTarget, { id, expanded, overlayLive, el, toggle, open, close }>` with a version counter, read through `useSyncExternalStore`.
- Each pane registers on mount and removes itself on unmount. A pane mounted later works.
- Root renders its `children` as given. Any child renders, in JSX order. `Left` is no longer created.
- Rail and Panel read their own props. Rail props no longer route through `Left`.
- The 11 context providers become two: the store and the inset set.

### 3.3 Presentation and responsive defaults resolved in CSS

- A responsive `presentation` is written as `data-presentation-initial`, `data-presentation-sm`, … A plain value is `data-presentation`.
- A responsive `defaultOpen` is written as `data-open-initial`, `data-open-sm`, …
- `shell.css` gains one `@media (min-width: …)` block per v1 breakpoint (520, 768, 1024, 1280, 1640), in ascending order, so the largest matching key wins. That is the same fallback `useResponsiveValue` does today.
- Inside each block, `[data-state="auto"]` resolves to in-flow, hidden, or parked-overlay from those attributes.
- `useBreakpoint` is kept for one purpose: the JS mirror that sets `aria-expanded` and picks the toggle direction after mount. A test asserts that the mirror and the stylesheet agree at every breakpoint, as v2's does.
- `currentBreakpointReady` gating on `data-visible`, `data-open`, `data-presentation` and `data-peek` is removed. Nothing waits for hydration.

### 3.4 One element per pane

- The `Sheet` branch is deleted. An overlay pane is the same `div`, with `position: absolute`, a `z-index` above the content, a parked position when closed, and a transition.
- `stacked` stays a CSS posture on the same element, as it already is.
- Root renders one scrim, always mounted, shown with `:has()` when any pane is a live overlay. A press closes every live overlay.
- Root owns containment: while an overlay is live, every Root child that does not contain a live overlay gets `inert`, with each element's previous value saved and restored.
- Focus: captured before inerting; moved into the pane on open; returned to the captured element on close.
- Escape: a listener on the Root while an overlay is live. It respects `defaultPrevented`.
- Scroll lock: an attribute on `<html>` counted across Shells; CSS locks scroll. No inline `overflow`.
- Accessible names come from the author's `aria-label` on the pane. The hard-coded "Navigation", "Inspector" and "Bottom panel" go.

### 3.5 Layout

- Root becomes a CSS grid: `"header header header header" / "rail sidebar content inspector" / "bottom bottom bottom bottom"`. Panel and Sidebar share the `sidebar` area.
- Pane widths stay as CSS variables set from `expandedSize`, on the pane, registered `inherits: false`.
- Content takes `minmax(0, 1fr)`. Panel no longer mutates its parent's inline width.
- `height="full"` maps to `100dvh` with a `100vh` fallback in CSS. No inline height is written for the default.
- Inset: the gap is split so two adjacent inset panes do not double it. Collapsed inset panes drop their margin. `--shell-inset-gap` is read from `.rt-ShellRoot` so the documented override works.
- Stacked and peek shadows use `--shadow-*` tokens.

### 3.6 Trigger

- Renders `type="button"`.
- Sets `aria-controls` to the pane id.
- Subscribes to its target's registry entry only.
- The consumer's `onClick` runs first; `preventDefault()` cancels the action.
- `target="left"` maps to `rail` with a warning.

### 3.7 Resize

- Handle: `role="separator"`, `aria-controls`, `aria-valuenow` seeded from the real size, a visible line on hover, on focus-visible and while dragging. The hit area stays as today.
- Drag: the pointer writes the CSS variable directly; `onResize` is called per move through `requestAnimationFrame`; direction is read once at pointer-down. No `getComputedStyle` per move.
- Keyboard: Bottom's arrow keys match its drag direction.
- `collapseThreshold` is compared before clamping to `minSize`, so a threshold below `minSize` works. After a collapse, no size is persisted.
- Persistence: the loaded value is clamped and applied in a layout effect.
- `size` (controlled): a drag stands until the app passes a different value, as in v2.
- The default `maxSize` is the frame minus the handle's hit area, so the handle stays reachable.

### 3.8 Callbacks

- `onOpenChange` fires only from a user action. `meta.reason` is `'toggle'` for a trigger and `'dismiss'` for Escape or the scrim. `'init'`, `'responsive'`, `'panel'` and `'left'` are never sent.
- Panel's `onExpand`/`onCollapse` fire, matching the other panes.
- `onSizeChange` with `reason: 'controlled'` fires only when `size`, `minSize` or `maxSize` change, not when the callback identity changes.
- The development `console.error` for mixed controlled and default props runs once per mount, not per render.

---

## 4. Deprecated (warn now, remove at the next major)

| Prop or export | Replacement | Shim behaviour until removal |
|---|---|---|
| `Shell.Left` | none | Renders its children; warns once |
| Responsive `open` (controlled) | boolean `open`, or responsive `defaultOpen` | Resolves the `initial` key; warns |
| `meta.reason` values `init`, `responsive`, `panel`, `left` | none | Never sent |
| `onExpand`/`onCollapse` | `onOpenChange` | Still fire |
| `Trigger target="left"` | `target="rail"` | Maps; warns |
| `useShell` | none | Returns the store; warns |
| `useResponsivePresentation` | none | Still works; warns |
| `PaneBaseProps.height`, `resizer` | none | Removed from the type; ignored at runtime |
| Root typed as `PanelComponent` | `ShellRootProps` | Type fix only, no runtime |

Sidebar `state`/`defaultState`/`onStateChange` wait on decision 1 in §7.

---

## 5. Breaking now (no shim possible)

Listed so the changelog is honest.

- CSS that selects `.rt-Sheet*` inside a Shell no longer matches. Overlay panes keep `.rt-ShellSidebar` etc.
- A sidebar that was open on desktop closes when the window shrinks to an overlay breakpoint. Before, it became an open drawer.
- Collapsing the Rail no longer collapses the Panel, and opening the Panel no longer opens the Rail. Apps that want the cascade write it:
  ```tsx
  <Shell.Rail open={railOpen} onOpenChange={(o) => { setRailOpen(o); if (!o) setPanelOpen(false); }} />
  ```
- A Sidebar and a Rail+Panel in the same Shell both render. Before, the Rail and Panel were dropped.
- Children of `Root` that are not Shell parts render. Before, they were dropped.
- `onOpenChange` no longer fires on mount. Code that read the initial state from `reason: 'init'` reads its own prop instead.
- Overlay panes are no longer portalled. Anything that assumed portal placement (a `Theme` wrapper, `z-index` against other portals) may change.

---

## 6. Bugs closed by this plan

From `shell-study.md` §11. "By construction" means the rebuilt code cannot have the bug. "Fix" means a targeted change.

| # | Bug | How |
|---|---|---|
| 1 | Root typed as Panel | Fix (§4) |
| 2 | Responsive `defaultOpen` coerced with `Boolean()` | By construction (§3.3) |
| 3 | `reason: 'responsive'` on every render | By construction (§3.8) |
| 4 | Panel `onExpand`/`onCollapse` never fire | Fix (§3.8) |
| 5 | Trigger `type`, `aria-controls` | Fix (§3.6) |
| 6 | Responsive Rail `open` coerced | By construction (§3.1, §4) |
| 7 | Bottom keys inverted | Fix (§3.7) |
| 8 | `dvh` never applies | Fix (§3.5) |
| 9 | Non-Shell children dropped | By construction (§3.2) |
| 10 | Sidebar + Rail/Panel dropped | By construction (§3.2) |
| 11 | Late-mounted pane ignores defaults | By construction (§3.2) |
| 12 | Handle has no focus style | Fix (§3.7) |
| 13 | `getComputedStyle` per pointermove | Fix (§3.7) |
| 14 | Focus not returned after overlay close | By construction (§3.4) |
| 15 | `height` leaks to the DOM | Fix (§4) |

Also removed: the `SHELL_SLOT` tag, the `_Sidebar/Inspector/BottomComponent` types, the reducer's dead sidebar case, `onLeftDefaults`, `panelDefaultSizeRef`, the `data-phase` CSS, the `[data-presentation='overlay']` rule, and the "moved to" comment stubs.

---

## 7. Decisions needed

Each blocks part of the work. None blocks §3.1–3.6.

1. **Sidebar `thin`.** v2 refuses it. Options: (a) keep `state`/`defaultState`/`onStateChange` as the Sidebar's API and store `thin` as a flag on an open pane; (b) deprecate the three-value API in favour of `open` plus a `thin` boolean; (c) remove it and let apps render a Rail. Womp's usage decides. Blocks §3.1 for Sidebar and §4.
2. **Rail + Panel.** Keep as two parts sharing nothing (this plan), or make `Panel` an alias of `Sidebar` with a warning. Alias is simpler; keeping both costs one extra grid area name. Blocks §3.5.
3. **`peek`.** v2 deferred it. Keep as today (mouse only), improve (keyboard, delay, stays while the pointer is over the pane), or remove. Blocks §3.6.
4. **Snap points, `collapseThreshold`, persistence.** Keep if Womp uses them. Otherwise remove and let apps do it, as v2 does. Blocks §3.7.
5. **Default overlay boundary.** v1's Sidebar goes overlay below `md` (1024) and Inspector below `lg` (1280). v2 uses 768 for everything. The LOG says both must agree on what responds to what. Either v1 moves to 768, or v2 records why Shell differs. Blocks the CSS defaults in §3.3.
6. **Page-scroll mode on narrow touch.** Adopt v2's (the page scrolls, header sticky, toolbars collapse) or keep the inner scroller. Adopting changes scroll behaviour for every consumer. Not in this plan unless chosen.
7. **Inspector "open when there is room".** v1 answers with `defaultOpen={{ initial: false, lg: true }}`. v2 has no answer yet (D:1968). Record the shared answer in both LOGs.

---

## 8. Womp usage audit

Run before starting. Grep Womp's app for each and record the count.

- `Shell.Left`, `Shell.Panel`, `Shell.Rail`
- Sidebar `state`, `defaultState`, `onStateChange`, `thinSize`, `toggleModes`, `useSidebarMode`
- `presentation="stacked"` or a responsive object containing it
- Responsive `open` (controlled) on any pane
- `onOpenChange` handlers that read `meta.reason`
- `onExpand`, `onCollapse`
- `peekOnHover`
- `snapPoints`, `collapseThreshold`, `paneId`, `persistence`, `onResizeStart`, `onResizeEnd`
- `sizeUpdate`, `sizeUpdateMs`
- `inset`
- `useShell`, `useResponsivePresentation`
- CSS selecting `.rt-Sheet`, `.rt-ShellLeft`, `data-mode`, `data-visible`, `data-phase`
- Panes mounted conditionally after the Root

---

## 9. Releases

Following the LOG rule: internals and API changes ship apart.

**0.7.1 — bug fixes on the current code.** §6 items 1, 4, 5, 7, 8, 12, 13, 15. One line each. Ships value while the rebuild is in progress. Skip if the rebuild lands within the month.

**0.8.0 — the rebuild.** §3 in full. §4 warnings added. No prop removed. Changelog lists §5.

**1.0.0 — removals.** §4 removed. Codemod for `Trigger target="left"` and, if decision 1 goes to (b), for `state` → `open`.

---

## 10. Tests

Delete: every test that asserts `reason: 'init'`, `reason: 'responsive'`, the Rail/Panel cascade, the controlled conflict, hydration gating and the mixed-composition warning.

Add, in a real browser:
- Server HTML contains the sidebar on a wide window.
- The pane element identity survives a breakpoint crossing.
- A touched pane keeps its state across a crossing; an untouched pane follows the window.
- The JS mirror agrees with the stylesheet at every breakpoint.
- Responsive `defaultOpen` resolves per breakpoint with no script.
- `onOpenChange` does not fire on mount or on resize.
- Trigger: `aria-expanded`, `aria-controls`, `type`, cancel with `preventDefault`.
- Overlay: scrim press, Escape, focus moves in, focus returns, siblings are inert.
- Resize: separator semantics, drag writes, keyboard on every pane including Bottom's direction, clamp, controlled width stands.
- Root children render in JSX order; a wrapped pane works.

Keep: type tests (`shell-props.test-d.ts`), size normalization, throttle.

---

## 11. Docs

- Rewrite `apps/docs/app/docs/shell/content.mdx`: anatomy (Root children in any order), state (`open`/`defaultOpen`, responsive `defaultOpen`), presentation (CSS-resolved), overlay (no Sheet), triggers, resize, accessibility. Fix the seven mismatches in `shell-study.md` §11.
- A `GapNote` on the Shell page until 0.8.0 ships, stating what is wrong today.
- A LOG entry recording the decisions in §7 once made.
- Update `packages/kookie-ui/schemas/shell-*.json` and `examples/shell-schema-usage.ts`.
- Delete `SHELL_AUDIT_REPORT.md` and `.cursor/plans/shell-33da4bc7.plan.md`; the study and this plan replace them.
