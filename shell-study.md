# Shell: v1 vs v2 study

Scope:
- **v1:** `packages/kookie-ui/src/components/shell*.{tsx,ts,css}` and `_internal/shell-*`, about 4,450 lines of TS/CSS.
- **v2:** `kookie-ui-v2/packages/ui/src/components/shell/shell.{tsx,css}`, about 5,260 lines, plus §27 in `docs/DECISIONS.md`.

Citations:
- `v1:` means `packages/kookie-ui/src/components/`.
- `v2:` means `kookie-ui-v2/packages/ui/src/components/shell/`.
- `D:` means `kookie-ui-v2/docs/DECISIONS.md`.

Nothing was built or changed.

---

## 1. Verdict

- **The two Shells agree on the frame and disagree on almost everything else.** Both have a full-width header, navigation columns, a content area, an inspector and a bottom pane, with the same landmark roles and similar default widths. v2 calls v1's landmarks "v1's one unambiguously right call" (D:1938) and inherits v1's widths: sidebar 288, inspector 320, bottom 200.
- **v2 is v1 with its state machine deleted.** In v1, the Root owns every pane's state, scans its children to find the panes, and decides presentation in JavaScript. In v2, each pane owns its own `open` state, the parts find each other through a small registry, and CSS decides presentation.
- **v1 breaks several principles that the LOG says both systems share:**
  - Callbacks fire on mount.
  - The first paint is wrong on the server and on desktop.
  - Crossing a breakpoint unmounts the pane's subtree.
  - Controlled mode flickers.
  - Under the rule that v1 and v2 must not disagree on what is right, these are real conflicts, not differences of style.
- **v1 has open bugs that are independent of any redesign.** Ten are confirmed in code; see §11. Four are cheap to fix now.
- **Recommendation:** do not port v2's Shell into v1 in one step. Fix v1's correctness bugs first, then move v1 toward v2's state model while keeping the v1 API with deprecation warnings. §12 gives the order.

---

## 2. Anatomy

| | v1 | v2 |
|---|---|---|
| Export style | Namespace: `Shell.Root`, `Shell.Sidebar`, … (`v1:index.tsx:80`) | Flat: `Shell`, `ShellSidebar`, … (17 components) |
| Frame | `Root` (a `div`) containing `Body`, a flex row | `Shell` (a `div`), a CSS grid with named areas |
| Header | `Header` (`<header>`), sticky, `height` prop | `ShellHeader` (`<header>`), always full-width, height taken from the size step |
| Narrow icon column | `Rail`, whose props actually configure a hidden `Left` wrapper | `ShellRail` (`<nav>`), an independent column |
| Wide nav column | `Panel` (tied to the rail) **or** `Sidebar` with a `thin` mode; one excludes the other | `ShellSidebar` (`<nav>`), independent of the rail |
| Main area | `Content` (`<main>`) | `ShellContent` (`<main>`) |
| End column | `Inspector` (`div`) | `ShellInspector` (`<aside>`) |
| Bottom | `Bottom` (`div`), outside `Body` | `ShellBottom` (`<aside>`), a grid row |
| Toggle | `Trigger` (`<button>`) | `ShellTrigger` (`<button>`, or `render`) |
| Resize handle | `Panel.Handle`, `Sidebar.Handle`, … (optional children) | Built in, rendered next to the pane |
| Nav parts | None | `ShellNavGroup`, `ShellNavItem`, `ShellRailItem`, `ShellRailList`, `ShellRailAction` |
| Pane chrome | None | `ShellScroll`, `ShellPaneHeader`, `ShellPaneFooter` |
| Mobile tab bar | None | `ShellTabBar` (= `ShellRail presentation="bar"`) |
| Hooks | `useShell` (marked `@internal` but documented), `useSidebarMode`, `useResponsivePresentation` | None |

### How the parts find each other

**v1** scans the Root's direct children once per render. It sorts them into seven buckets by matching the component type or its `displayName` (`v1:shell.tsx:542-562`), then renders them in a fixed order: header, left or sidebar, content, inspector, bottom. As a result:
- **Children that match no bucket are silently dropped.** That includes wrapper components, plain divs, Fragments, and a `Shell.Trigger` placed directly in Root, which is exactly what the docs' anatomy example shows (`apps/docs/app/docs/shell/content.mdx:47`).
- The order of children in JSX has no effect on the output.
- The initial state is also read from children's props by `displayName` (`v1:shell.tsx:249-348`).
- A symbol tag, `SHELL_SLOT`, is assigned everywhere but never read. It is dead code.
- There are 11 nested context providers (`v1:shell.tsx:753-792`).

**v2** does no scanning. Each pane claims a named grid area in CSS (`v2:shell.css:221-245`), so DOM order is free and follows reading order. The only thing that crosses the Shell is a registry, a Map from pane name to an entry. The entry carries the pane's id, its effective open state, whether it is currently an overlay, its element, and `toggle`/`open`/`close`. Triggers read it with `useSyncExternalStore` (`v2:shell.tsx:63-129`, `989-1007`). The registry carries no layout state. A part used outside `<Shell>` throws an error.

Both versions allow **one pane per target per Shell**. v1 has one reducer slot per pane type. v2 keys its Map by pane name.

---

## 3. State model

| | v1 | v2 |
|---|---|---|
| Where state lives | One reducer on Root: `{leftMode, panelMode, sidebarMode, inspectorMode, bottomMode}` (`v1:shell.tsx:86-218`) | On each pane: `"auto" \| "open" \| "closed"` (`v2:shell.tsx:915-919`) |
| Values | `expanded \| collapsed`; the Sidebar adds `thin` | Open or closed; `auto` means untouched and is resolved by CSS |
| Prop names | Rail, Panel, Inspector and Bottom use `open`/`defaultOpen`/`onOpenChange`. Sidebar uses `state`/`defaultState`/`onStateChange`. | `open`/`defaultOpen`/`onOpenChange` on every pane, the same as Dialog |
| Responsive state props | `open` and `defaultOpen` accept breakpoint objects | Plain booleans only; the window decides the default |
| Callback shape | `(open, { reason })`. The reason sets differ per pane: `init`, `toggle`, `responsive`, `panel`, `left` | `(open)` |
| Fires on mount | Yes: `reason: 'init'` when a default is passed | Never, by construction |
| Fires on breakpoint change | Yes: `reason: 'responsive'`, and see the bug below | Never; CSS handles it |
| Cross-pane rules | Collapsing the rail collapses the panel; opening the panel opens the rail; Sidebar and Rail/Panel exclude each other | None. An app that wants panes linked writes it at the call site (D:1940). |
| Partial control | Not supported | `{...(preview ? {open:false} : {})}` works; the pane returns to its last state when control is removed |

### v1's controlled mode

The internal state is authoritative. When a trigger fires in controlled mode, the internal mode changes first. Then the callback runs. If the parent does not accept the change, a `setTimeout(0)` snaps the state back (`v1:shell.hooks.ts:141-150`). The UI flickers between those two steps.

The Rail and the Panel each have their own controlled sync, and the Root duplicates it. The Root also uses sequence counters to break ties when they conflict (`v1:shell.tsx:601-659`).

### v1 state bugs (verified)

- **Responsive `defaultOpen` is coerced with `Boolean()` on Panel and Inspector** (`v1:shell.tsx:253-255`, `272-274`). An object is always truthy, so `{ initial: false, lg: true }` starts open on every screen. On a phone, where the pane is an overlay, the Sheet opens for one commit and takes focus, then closes. The `ui-test/shell-inset` page hits this.
- **`reason: 'responsive'` fires on every render** when the value is controlled and responsive. The "already equal" branch calls `onResponsiveChange` (`v1:shell.hooks.ts:123-125`), and the effect depends on inline arrow functions, so it runs on every render.
- **A responsive `open` on the Rail is coerced to `'expanded'`** in Left (`v1:shell.tsx:897-900`). That fights the Root's per-breakpoint value, which is correct.
- **Panel's `onExpand` and `onCollapse` are never called.** They are destructured as `_onExpand` and `_onCollapse` (`v1:shell.tsx:1199-1200`). The docs say they work.
- **Combining a Sidebar with Rail/Panel silently drops the Rail and Panel** (`v1:shell.tsx:726`). The warning is meant to fire only once Left has mounted, and Left never mounts in this case, so the warning never fires. The docs say it does.
- **Collapsing the rail collapses the panel, but re-expanding the rail does not restore the panel** (`v1:shell.tsx:153`).
- **An Inspector or Bottom mounted after the Root never has its defaults read.** kookie-ai mounts its Inspector conditionally, so it is affected.

---

## 4. Responsiveness

This section holds the deepest difference, and the one that matters most under the LOG's rule that v1 and v2 must never disagree.

| | v1 | v2 |
|---|---|---|
| Breakpoints | xs 520, sm 768, md 1024, lg 1280, xl 1640 (`v1:shell.types.ts:42-48`) | One boundary: narrow is at most 48rem (768px) (`cfg:386-430`) |
| Who decides presentation | JavaScript: `matchMedia` through `useBreakpoint`, then `useResponsivePresentation` | CSS: an untouched pane renders `data-state="auto"`, and `@media (max-width: 48rem)` resolves it |
| Presentations | `fixed`, `stacked` (absolute, over the content), `overlay` (a Sheet) | `auto`, `fixed`, `overlay`; the rail adds `bar` and `rail` |
| Defaults | Sidebar: `{initial:'overlay', md:'fixed'}`. Inspector: `{initial:'overlay', lg:'fixed'}`. Bottom: `fixed`. | `auto`: in the layout on a wide window, a drawer on a narrow one. Inspector and bottom stay closed until opened. |
| Crossing into overlay | **Swaps the component**: the pane div becomes a `Sheet`, so its subtree unmounts and remounts and loses local state | **The same element stays mounted**; only the CSS changes |
| After crossing | The mode is kept, so a sidebar that was open on desktop becomes an **open modal Sheet** when the window shrinks | An untouched pane follows the window. Once the user has toggled it, that choice holds at every width. |
| Server render | The breakpoint is `'initial'`, so the Sidebar's default renders a closed Sheet. A closed portal outputs nothing, so **the server HTML has no sidebar on desktop**, and it appears after hydration. | The server and the client render the same `data-state="auto"`. The first paint is right with no script, and hydration cannot mismatch. |
| First client paint | Many attributes wait for `breakpointReady`. The Panel is 0px wide until hydration finishes, and rail content is hidden until then. A `defaultState` of `{initial:'collapsed', sm:'expanded'}`, the pattern the docs shell uses, paints collapsed and expands after paint. | Correct on the first paint |
| Narrow touch | Nothing special | The page scrolls instead of the content, so mobile Safari can collapse its toolbars. The header is sticky. The scroll position carries across the boundary. `contained` opts out (`v2:shell.css:2364-2552`, `v2:shell.tsx:374-415`). |
| Mobile tab bar | None | `ShellRail` with `presentation="auto"` becomes a floating tab bar at narrow. `ShellTabBar` is a tab bar only. |

v2 records v1's component swap as its founding criticism: "v1's Sidebar early-returned a Sheet on the overlay branch, so crossing a breakpoint unmounted the nav and half the props silently died" (`v2:shell.tsx:11-13`).

**What v2 gives up.** v2 has no per-breakpoint control of state. An inspector that should be "open when there is room" has to be written by the app. The builder app does this by hand (`builder-app.tsx:286-299`), and D:1968 records it as an open decision. v1 lets you write `defaultOpen={{ initial:false, lg:true }}`, but that is exactly the prop the `Boolean()` bug breaks.

**Where the principles conflict.** The LOG says v1 may keep responsive prop objects as long as both systems agree on what responds to what. v1's current Shell disagrees on the substance:
- Callbacks fire when the window resizes.
- The subtree unmounts when the window resizes.
- The first paint depends on JavaScript.

Keeping responsive objects is fine. Resolving them in JavaScript after paint is the conflict.

---

## 5. Layout

| | v1 | v2 |
|---|---|---|
| Mechanism | Flexbox: a Root column containing a `Body` row (`v1:shell.css:11-55`) | A grid: `"header×4" / "rail sidebar content inspector" / "bottom×4"` (`v2:shell.css:230-277`) |
| Pane widths | Inline CSS variables per pane (`--sidebar-size`, …), overwritten with `style.setProperty` | `--kui-shell-w` on the pane, falling back to `--shell-sidebar-w` on the root. Registered with `inherits: false`. |
| Content width | `flex: 1` | The `minmax(0, 1fr)` column; no JS arithmetic |
| Collapse | Width steps to 0 after the content slides out (`v1:shell.css:79-190`) | `display: none`, or a parked drawer |
| Height | `height='full'` writes inline `100vh`. The CSS `100dvh` fallback applies only when there is no inline height, so it never applies. | `100dvh` by default; `contained` fills the parent instead |
| Bottom pane | Full width, under the sidebar | Full width (a grid row) |
| DOM side effect | Panel removes the inline width from its parent node (`v1:shell.tsx:1422-1494`) | None |

### Detaching panes: v1's `inset` vs v2's `flush`

**v1 `inset`** is a boolean on each pane.
- Panes register in a Set on the Root. `Body` then turns gray (`--gray-2`), and each inset pane gets a margin, a radius, a background and `--shadow-2` (`v1:shell.css:663-680`).
- Adjacent margins stack, making a 16px gutter instead of 8.
- Collapsed inset panes keep their margins.
- The docs tell users to override `--shell-inset-gap` on `.rt-ShellBody`, but the variable is declared on the pane, so the override does nothing.

**v2 `flush`** defaults to `true`.
- A flush pane sits against its neighbours with one hairline between them.
- `flush={false}` pulls a pane off the frame. CSS then derives the posture: the pane floats over the content if the content is flush, and otherwise sits on the app background as a separate card (`v2:shell.css:923-1340`).
- The gap is split so that two cards never double it.
- Content under a floating pane gets safe-area inset variables so it is not hidden, and a development-only guard warns when they go stale.

---

## 6. Resize

| | v1 | v2 |
|---|---|---|
| Panes | Panel, Sidebar, Inspector, Bottom | Sidebar, Inspector, Bottom. The Rail is refused in the type. |
| Props | `resizable`, `expandedSize`, `minSize`, `maxSize`, `size`/`defaultSize`, `onSizeChange` (with reason), `onResize`, `onResizeStart`, `onResizeEnd`, `snapPoints`, `snapTolerance`, `collapseThreshold`, `sizeUpdate` (throttle/debounce), `sizeUpdateMs`, `paneId`, `persistence` | `resizable`, `width`/`height`, `minWidth`/`maxWidth` (or height), `onResize`, `resizeLabel` |
| Units | px, rem, or % of the **viewport**, through `normalizeToPx` | px |
| Persistence | Built in: localStorage keyed by `paneId`, or custom `load`/`save`. Applied after paint. The loaded value is not clamped. | None; the app does it |
| Snap and collapse | Snap points on release; `collapseThreshold`; double-click toggles | None |
| Handle role | `role="slider"` (`v1:_internal/shell-handles.tsx:45-57`) | `role="separator"` with `aria-controls` (`v2:shell.tsx:1328-1362`). This is the correct pattern for a splitter. |
| Handle visibility | Transparent, with no hover or focus style, so keyboard focus is invisible | A 2px line on hover (only on devices with hover), on focus-visible, and while dragging. The hit area is 44px and straddles the seam. |
| Keyboard | Arrows ±8, Shift ±32, Home, End. **Bottom's arrow keys are inverted** compared with dragging. | Arrows ±16, Home, End. `onResize` fires on every keypress. |
| Drag cost | `getComputedStyle` on **every pointermove**; `onResize` on every move; no rAF | Writes a CSS variable per move with no React state; `onResize` once at the end |
| Controlled width | Only half controlled: a drag moves the pane whatever the prop says | A drag stands until the app passes a *different* width |
| Pane size cap | `maxSize`, falling back to 800 | By default, the frame minus 44px, so the handle always stays reachable |

v1 has more features. v2 is lighter and more accessible. Snap, persistence and collapse-on-drag are the v1 features that products most likely use, so check Womp's usage before removing them.

---

## 7. Overlay behaviour

| | v1 | v2 |
|---|---|---|
| Component | `Sheet`, which is a forced-modal Radix Dialog, in a portal | The same pane element, restyled: `position:absolute; z-index:2` |
| Scrim | Radix Overlay | One scrim owned by the Root, always mounted, shown with `:has()` |
| Push | None; the Sheet covers the content | The content slides aside by `--kui-shell-push-x/y`, capped so that a strip of scrim always shows |
| Focus trap | Radix FocusScope, plus a hand-written Tab loop and forced first focus | `inert` on every child of the Root except the live pane and the scrim, with each element's previous value saved and restored |
| Focus return | Probably to `<body>`: the Shell never uses `Sheet.Trigger`, so Radix has no trigger to return to. This is inferred from Radix source and not yet tested. | To the element that was focused before, captured before anything is made inert |
| Escape | Radix | A listener on the Root while an overlay is live; it respects `defaultPrevented` |
| Scroll lock | Radix | An attribute on `<html>`, counted across Shells, only on narrow touch windows |
| Accessible name | Hard-coded: "Navigation", "Inspector", "Bottom panel" | Comes from the landmark and the author |
| Callback reason on dismiss | `'toggle'`, so it cannot be told apart from a trigger | `onOpenChange(false)` |
| Reach | The whole page, because a portal is modal | Only the Shell. Nothing is contained before hydration, or outside the Shell root (D:2043). |

A correction to my first answer: v2 overlays are **not** forced to glass. Both callers pass `overlaying=false` (`v2:shell.tsx:1464`, `1870`), and D:2027 confirms that no Shell pane infers its material. The `backdrop` JSDoc and the `usePaneDress` comment still say otherwise, and they are stale.

---

## 8. Trigger

| | v1 | v2 |
|---|---|---|
| Targets | `left`, `rail`, `panel`, `sidebar`, `inspector`, `bottom` | `rail`, `sidebar`, `inspector`, `bottom` |
| Actions | `toggle`, `expand`, `collapse` | `toggle`, `open`, `close` |
| `aria-expanded` | Yes; `thin` counts as expanded | Yes; left off until the state is known |
| `aria-controls` | No, because panes have no ids | Yes |
| `type="button"` | **Missing**, so a Trigger inside a form submits the form | Yes |
| Cancelling the action | Not possible; `defaultPrevented` is ignored | `preventDefault()` in `onClick` cancels it |
| Composition | None; consumers wrap it in `IconButton asChild` | `render` |
| Re-renders | Subscribes to all five mode slices and the peek slice. A code comment claims otherwise. | Re-renders only when its target's entry changes |
| Peek | `peekOnHover`: mouse only, no keyboard equivalent, no delay, and the peek clears when the pointer moves into the pane | Deferred (D:2005) |

---

## 9. Styling

| | v1 | v2 |
|---|---|---|
| Pane surface | None: no background, border or padding, except inset panes | Card's surface: neutral, quiet, bordered, with material, lens and depth from `surfaces.css` |
| Size | None | `size` on the Shell and on each pane. It sets padding, the row height and the rail width. |
| Material | None; the overlay Sheet uses its own default | `backdrop` per pane, or the nearest `<Box backdrop>` region. The content pane refuses `backdrop` in its type. |
| Shadows | Hard-coded `rgba(0,0,0,.2)` for the stacked and peek states, so they do not adapt to dark mode | Tokens only |
| Motion | `--motion-duration-small`; respects reduced motion | A `--motion-drawer` spring; respects reduced motion |
| Navigation rows | Left to the app (the docs shell builds its own) | `ShellNavItem`: its current state is shown by `aria-current` plus the accent label, and its height matches a Button |
| Dead CSS | The `data-phase` rules; the `[data-presentation='overlay']` rule, which never matches | Leftover recession machinery that is waiting for removal |

---

## 10. Performance

| | v1 | v2 |
|---|---|---|
| Re-render scope | Contexts are split, but Left, Rail and Panel read the full context, and the other panes reach it through the presentation hooks. **Every pane re-renders on any Shell change**, including peek hover and inset registration. | Only the Root and the Triggers subscribe to the registry. It notifies only when a pane's expanded or overlay state changes. |
| Effects | Panel 14, Sidebar 17, Inspector 14, Bottom 14, Left 11, Root 5. Several re-run every render because they depend on inline arrow functions. | Registry, attributes and containment, plus a resize observer on floating bands. Containment runs every render but does nothing when nothing has changed. |
| JavaScript needed for the first paint | Yes: breakpoint gating, and presentation chosen in JS | None |
| Layout reads during interaction | `getComputedStyle` on every pointermove, twice per resize keypress | `getBoundingClientRect` during a drag; `getComputedStyle` once when the pointer goes down |
| Per-render work | `Children.toArray` plus filtering in the Root and in every pane | None |
| Tests | 47 files, mostly about wiring the state together; breakpoints are effectively fixed at `'initial'` in jsdom | 164 browser tests, 20 resize tests, node tests on the CSS, and type tests |

Test gaps:
- **v1:** the Trigger, the overlay Sheet, breakpoint crossings, persistence, snapping, and the `responsive` reason.
- **v2:** the default window mode, page-scroll mode, the page lock, and carrying the scroll position across the boundary. Every browser test mounts `<Shell contained>`.

---

## 11. v1 bug list (fix regardless of direction)

Each item was confirmed in code unless it says otherwise.

| # | Bug | Where | Cost |
|---|---|---|---|
| 1 | Root is cast `as PanelComponent`, so TypeScript shows Panel's props on Root | `v1:shell.tsx:795` | S |
| 2 | A responsive `defaultOpen` on Panel or Inspector is coerced with `Boolean()` | `v1:shell.tsx:253-255`, `272-274` | S |
| 3 | `reason:'responsive'` fires on every render | `v1:shell.hooks.ts:123-125` | S |
| 4 | Panel's `onExpand`/`onCollapse` never fire | `v1:shell.tsx:1199-1200` | S |
| 5 | Trigger has no `type="button"` and no `aria-controls` | `v1:shell.tsx:1656-1667` | S |
| 6 | Left coerces a responsive Rail `open` to expanded | `v1:shell.tsx:897-900` | S |
| 7 | Bottom's arrow keys are inverted | `v1:_internal/shell-handles.tsx:199`, `225` | S |
| 8 | The `100dvh` fallback never applies | `v1:shell.tsx:663-666` | S |
| 9 | Children that are not Shell parts are silently dropped, including the docs' own Trigger example | `v1:shell.tsx:542-562`, `764-781` | M |
| 10 | Sidebar with Rail/Panel: the Rail and Panel are dropped and the warning never fires | `v1:shell.tsx:385-389`, `726` | S |
| 11 | An Inspector or Bottom mounted after the Root never reads its defaults | `v1:shell.tsx:428-453` | M |
| 12 | The resize handle has no visible focus style | `v1:shell.css:539-582` | S |
| 13 | `getComputedStyle` runs on every pointermove | Panel, Sidebar, Inspector | S |
| 14 | Focus does not return after an overlay closes (inferred; needs a test) | Sheet usage | M |
| 15 | `PaneBaseProps.height` leaks to the DOM | `v1:_internal/shell-prop-helpers.ts:16-35` | S |

The docs page (`apps/docs/app/docs/shell/content.mdx`) has these mismatches:
- It claims the Shell uses `aria-hidden`, which it does not.
- It claims high-contrast focus indicators, which do not exist.
- It gives the wrong import path for `useShell`.
- The Trigger target list is missing `left`.
- It says Bottom's `defaultOpen` accepts breakpoint objects, which it does not.
- It says Panel's `onExpand` and `onCollapse` fire, which they do not.
- It says a warning fires for the Sidebar plus Rail/Panel combination, which it does not.

Several items in `SHELL_AUDIT_REPORT.md` are now fixed: the shared static, the handle labels, `aria-expanded`, the debounce cleanup and the `togglePane` ref. Items #8 (inconsistent callbacks), #9 (detection by `displayName`) and focus management are still open.

---

## 12. What v1 should take from v2, in order

This follows the LOG's migration rules: internals and API change in separate releases, and old props keep working with a warning until a major release.

1. **Bug release.** Fix §11 items 1–8, 10, 12, 13 and 15. There is no API change. These are the cheap fixes.
2. **Stop firing callbacks the user did not cause.** Remove the `init` and `responsive` reasons, keeping the argument in the signature for compatibility. This is where v1 disagrees with v2 on principle, not only in code.
3. **One element per pane.** Replace the Sheet swap with v2's approach: the same element, an overlay posture set in CSS, a scrim owned by the Root, `inert` containment and focus return. This fixes the lost state on resize, the missing server-rendered sidebar, and focus return. It is the largest change, and the one Womp would notice, so ship it on its own release.
4. **Resolve presentation in CSS.** v1 can keep its responsive `presentation` objects by writing data attributes that CSS media queries resolve, instead of resolving them with `matchMedia` after paint. This keeps v1's API while agreeing with v2's principle.
5. **Move state onto the panes.** Replace the Root reducer and child scanning with a registry like v2's. Then:
   - Unknown children render.
   - Order follows the JSX.
   - Panes that mount later work.
   - Controlled mode stops flickering.

   `Sidebar` `state`/`onStateChange` becomes `open`/`onOpenChange`, with a warning and a codemod.
6. **Decide `thin`, the Rail+Panel cascade, and `peek`.** v2 refuses `thin` and the cascade, and defers `peek`. v1 can keep them as product options, per the LOG's "Why v1 has options", but they should be written at the call site, not as rules inside the Shell. This needs a decision from Kushagra; Womp's usage should decide it.
7. **Resize.** Keep v1's snap points, persistence and `collapseThreshold` if Womp uses them. Take v2's `separator` role, `aria-controls`, visible handle, write-only drag and default cap to the frame.
8. **Optional additions.** `flush` and `backdrop` in place of `inset`, the nav parts, the tab bar and page-scroll mode. These are new features, not fixes. They wait until the component moves to Base UI.

### Open questions

- Which of `thin`, `peek`, snap points, persistence, `stacked` and a responsive `defaultOpen` does Womp use?
- Should v1 keep `Rail` and `Panel` as a linked pair, or split them the way v2 does?
- Should v1 adopt page-scroll mode on narrow touch windows? It changes scroll behaviour for every consumer.
- Does the inspector need an "open when there is room" default? v2 has not decided this either (D:1968). A shared answer would keep the two systems in agreement.
