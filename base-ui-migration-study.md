# Kookie UI v1: Radix to Base UI migration study

Scope: `packages/kookie-ui/src` (v1, Radix Themes fork on `radix-ui`) moving to `@base-ui/react` 1.7.0, using `kookie-ui-v2` as reference. Base UI claims were checked against the installed `.d.ts`/`.js` at
`/Users/kushagradhawan/Code/kookie-ui-v2/node_modules/.pnpm/@base-ui+react@1.7.0_.../node_modules/@base-ui/react` (written below as `<BaseUI>`). Nothing was built or changed.

---

## 1. Verdict

- **Does the API have to change?** No. Nearly every public v1 prop can survive behind Kookie wrappers. The hard breaks are few and narrow: `Slottable`, `Select.Value` label display, and a small set of positioning and focus props with no Base UI counterpart.
- **Consumer-visible change you cannot fully hide:** DOM and CSS state attributes (`data-state` becomes `data-open`, `data-checked`, `data-pressed`, `data-popup-open`), `--radix-*` CSS variables, one extra `Positioner` DOM layer, and some focus and keyboard behaviour.
- **Effort:** about 6 to 9 engineer-weeks for the full swap with shims, tests and docs. The overlay + menu + select + combobox wave alone is about 3 to 4 weeks.
- **Recommendation:** Option A. Swap primitives internally and keep the v1 API through shims, shipping as v1.x minors in waves. Add `render` alongside `asChild` and deprecate `asChild` softly. Leave the v2-style API redesign (variant/color/tone) to v2 and a v1-to-v2 codemod.
- **Main constraint:** overlays and popups (Dialog, AlertDialog, Sheet, Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu, Select, Combobox) must move in one coordinated wave. When Radix and Base UI dismiss layers are mixed, outside clicks close the wrong layer.

---

## 2. What changes for consumers (cross-cutting)

| Change | Where it shows | Shim can hide it? | Cost |
|---|---|---|---|
| **`asChild` becomes `render`** | 54 source files import `radix-ui`. Slot is imported directly in 17 files and via `./slot.js` in 6. `Slot` and `Slottable` are public exports (`components/index.tsx:55`). | **Yes.** Rewrite `components/slot.tsx` as a local Slot on `useRender` (`<BaseUI>/use-render/useRender.d.ts`) plus `mergeProps`, with a local `Slottable` marker. Every `asChild ? Slot : tag` site keeps working. Parts built on Base UI map `asChild` to `render={Children.only(children)}` and infer `nativeButton` (v2 `system/render.ts` `rootsInButton`). | S, about 40 LOC plus about 23 import swaps. className order flips (the child class comes first), which is harmless for CSS but breaks string-equality tests. Handler order is unchanged (`useRenderElement.js:113`). |
| **`data-state` attributes** | Open/closed becomes `data-open`/`data-closed` and `data-starting-style`/`data-ending-style` on popups, and `data-popup-open` on triggers. Checked becomes `data-checked`/`data-unchecked`/`data-indeterminate`. Toggle `on` becomes `data-pressed`. Tabs `active` becomes `data-active`. Accordion trigger becomes `data-panel-open`. Select item `checked` becomes `data-selected`. Progress becomes `data-indeterminate`. | **Partly.** Kookie CSS can use dual selectors, e.g. `:where([data-state='open'],[data-popup-open])`, during the transition. Consumer CSS and tests that select `data-state` break unless Kookie stamps legacy `data-state` through render-state functions. That is possible but costs per part and is not worth it long term. | M. About 150 selectors to rewrite: base-button.css (~20 `open`, ~7 `on`), segmented-control.css (26), base-checkbox.css (14), base-radio.css (10), switch.css (8), select.css (10), base-tab-list.css (6), base-menu.css (5), sheet, dialog, accordion, sidebar, card, kbd, link, animations.css. |
| **`--radix-*` CSS variables** | popover.css, combobox.css:15-17, dropdown-menu.css:4-5, context-menu.css:4-5, select.css:93-95, tooltip.css:8, hover-card.css:15, accordion.css:492,500, base-sidebar-menu.css:137,143. | **Yes.** Kookie CSS switches to `--anchor-width`, `--available-height`, `--transform-origin` and `--accordion-panel-height`. Kookie can also define aliases (`--radix-popover-trigger-width: var(--anchor-width)`) on the popup class so consumer CSS keeps working. | S |
| **Event handler signatures** | Base UI adds a second `eventDetails` argument to `onOpenChange`, `onValueChange`, `onCheckedChange` and `onPressedChange`. | **Yes, and additive.** One-argument handlers still compile. Kookie can drop the argument to keep v1 types exact. | S |
| **Value types that narrow** | Checkbox `'indeterminate'`. Tabs/RadioGroup/Select values become `any`/`null`. Accordion values become arrays. Slider values become number-or-array. | **Yes.** Wrappers convert (e.g. `'indeterminate'` to `indeterminate` + `checked=false`; a scalar accordion value to `[v]`). | S each |
| **Overlay dismiss/focus props** (`onEscapeKeyDown`, `onPointerDownOutside`, `onInteractOutside`, `onFocusOutside`, `onOpenAutoFocus`, `onCloseAutoFocus`) | Radix puts them on Content. Base UI has no such props; dismissal goes through Root `onOpenChange(open, details)` with `details.reason` + `details.cancel()` (`<BaseUI>/dialog/root/DialogRoot.d.ts:40,85`). Focus uses Popup `initialFocus`/`finalFocus` (`dialog/popup/DialogPopup.d.ts:12-34`). **Menu Popup has no `initialFocus`** (`menu/popup/MenuPopup.d.ts`). | **Mostly.** A shared bridge (~150 LOC): Content registers handlers in Root context, and Root `onOpenChange` dispatches by reason with a synthetic event whose `preventDefault()` calls `cancel()`. `onOpenAutoFocus` becomes an `initialFocus` function that must return `true` when not prevented. On menus `onOpenAutoFocus` can only be emulated with a layout effect. The sweep found **zero** consumer uses of these props. | M, built once |
| **Positioning props** | Move from Content to a new `Positioner`. `avoidCollisions` becomes the `collisionAvoidance` object; `sticky` becomes a boolean; `hideWhenDetached` becomes `[data-anchor-hidden]`; `updatePositionStrategy` has no real match. `collisionPadding` defaults to 5 (v1 uses 10). Sides can be `inline-start`/`inline-end` (`internals/useAnchorPositioning.d.ts`). | **Yes.** The Content wrapper splits props between Positioner and Popup and keeps v1 defaults explicitly. | S per component, shared helper |
| **`forceMount`** | Becomes Portal `keepMounted` (and Indicator/Panel `keepMounted`). | **Yes**, a rename in the wrapper. | S |
| **Menu `onSelect`** | Base UI Item has `onClick` + `closeOnClick` and no `onSelect` (`menu/item/MenuItem.d.ts`). | **Yes.** Call the user handler with a cancelable event; if it is not prevented, close through `actionsRef`. Also force `closeOnClick` to true on CheckboxItem/RadioItem (Base UI default is false, `MenuCheckboxItem.d.ts:60-64`), otherwise they silently stop closing the menu. | S |
| **DOM shape** | Base UI adds a `Positioner` wrapper for every popup. Portals render their own `<div>`. Dialog Backdrop becomes a sibling of Viewport > Popup, not a parent of Content. Slider thumb becomes a div wrapping `<input type=range>`. Checkbox/Radio/Switch roots become `<span>` + hidden input. | **Partly.** Controls can keep `<button>` with `render={<button/>} nativeButton`, which also keeps ref types. Popup wrapper layers cannot be removed. Consumer CSS that relies on Radix nesting breaks. | S to M |
| **Portal / Theme** | `Theme asChild` re-themes portalled content today. With Positioner/Backdrop as outer nodes, the theme must wrap the Portal: `Portal render={<Theme/>}` or v2 `PortalScope` (`system/floating.tsx:183`). Base UI has no standalone Portal export, so v1 `Portal` becomes a ~20-line local component. | **Yes.** Theme props are Kookie-owned. Keep the `.radix-themes` class (consumers query it: `kushagradhawan/components/webgl/webgl-canvas.tsx:59,77`). | S |
| **Direction** | `dir` props on Root parts are removed; Base UI uses `DirectionProvider direction` (not `dir`), and direction does not cross portals (v2 learned this). Theme hard-codes `ltr` today (`theme.tsx`). | **Yes.** Accept `dir` and wrap in a DirectionProvider, one per portal. | S |
| **Exported prop types** | Many v1 `*Props` types extend Radix `ComponentProps` (Dialog, Popover, Menu, Select, ScrollArea, Progress, Avatar, Sidebar sub-parts, ToggleIconButton, Reset, Portal, AspectRatio...). | **Yes,** but each must become an explicit Kookie interface. This is the largest hidden chore and should be done first, with type tests (`tests/types/*.test-d.ts`). | M in total |
| **Private selectors** | `[data-radix-scroll-area-viewport]` (kookie-ai `useAutoScroll.ts:53`), `data-radix-popper-content-wrapper` (v1's own `use-body-pointer-events-cleanup.ts`). | **Partly.** Kookie can add a stable `data-kookie-*` or class hook and document it. The Radix attribute itself disappears. | S |

---

## 3. Per-component table

Break: **none** = no public change; **shim** = kept by wrapper, with DOM/CSS/behaviour differences; **hard** = a visible API change is unavoidable or very costly to hide.

| Component | Base UI equivalent | API break | Effort | Key risk |
|---|---|---|---|---|
| Slot / Slottable | `use-render` + `merge-props` (no Slot/Slottable) | shim (local Slot + Slottable) | S | className order flips; keep the `Children.only` error; reuse v2 `unwrapLazy` for RSC |
| Box, Flex, Grid, Text, Heading, Link, Code, Em, Strong, Kbd, Quote, Blockquote, Card, Badge, Callout, Container, Section, Inset, Reset, Skeleton | none needed | none | S (import swap) | `getSubtree` must work with the new Slot; `ResetProps` type source changes |
| Button / IconButton | optional `@base-ui/react/button` | none (keep plain `<button>` + Slot) | S | ~20 `[data-state='open']` trigger selectors must also match `[data-popup-open]` |
| ToggleButton / ToggleIconButton | `toggle` with `render={<Button/>}` | shim (retype ToggleIconButton props) | S | `data-state='on'` becomes `data-pressed`, which collides with menu/popover trigger `data-pressed`; scope the selectors |
| Checkbox | `checkbox` | shim (`'indeterminate'` mapping) | S | root becomes `<span>` unless `render={<button/>}`; `:disabled` becomes `[data-disabled]`; form value/reset semantics differ |
| CheckboxGroup (custom primitive) | `checkbox-group` | shim; `orientation`/`loop`/`dir` no-op | M | arrow-key roving focus is lost unless Kookie keeps its own |
| CheckboxCards | `checkbox-group` + `checkbox` | shim | S | label around span: check for double toggle |
| Radio (native) | keep native input | none | S | swap `composeEventHandlers` only |
| RadioGroup | `radio-group` + `radio` | shim; `orientation`/`loop` no-op | S | arrow keys no longer limited to one axis |
| RadioCards | `radio-group` + `radio render={<button/>}` | shim | S | 2 `data-state` selectors |
| Switch | `switch` | shim | S | 8 selectors; form value `on` vs `uncheckedValue` |
| Slider | `slider` (Root > Control > Track > Indicator + Thumb) | shim, except `inverted` (hard: rebuild or deprecate) | M | root span becomes div (ref type); aria moves to per-thumb input; SSR prehydration output differs |
| SegmentedControl | `toggle-group` (keep v1 CSS indicator) | none | S | 26 selectors; guard against empty `[]` deselect |
| Tabs | `tabs` | shim | M | activation flips to manual unless `activateOnFocus`; auto-selects and fires `onValueChange` with no `defaultValue` (filter by reason) |
| TextField / TextArea | optional `input` | none | S | replace `composeRefs` only |
| Accordion | `accordion` (Panel) | shim | M | Base UI 1.7 has no arrow/Home/End navigation (v1's own handler is already dead code); `--radix-accordion-content-height` animation must be rebuilt |
| ScrollArea | `scroll-area` | shim (`type`/`scrollHideDelay` kept via CSS) | M | scrollbar visibility model differs; kookie-ai relies on `data-radix-scroll-area-viewport` |
| Progress | `progress` | shim (`value ?? null`) | S | inline `width%` on Indicator fights v1 transform animation |
| Avatar | `avatar` | shim | S | fallback flash timing |
| AspectRatio | none | none (local reimplementation) | S | DOM depth changes if native `aspect-ratio` is used |
| AccessibleIcon | none | none (local) | S | none |
| VisuallyHidden | none public | none (local) | S | keep the exact clip style set |
| Portal | none standalone | none (local `createPortal`) | S | keep client-only mount for SSR |
| Theme | `direction-provider`, `tooltip` Provider | none | S | during coexistence mount both tooltip and both direction providers; re-home `asChild` onto Portal render |
| Dialog | `dialog` (Root, Trigger, Portal, Backdrop, Viewport, Popup, Title, Description, Close) | shim | M | Backdrop is now a sibling, so the overlay/scroll DOM must be rebuilt; Base UI returns focus to the trigger (v1 did not); delete the dead `[]`-deps focus trap and duplicate live region |
| AlertDialog | `alert-dialog` (no Action/Cancel) | shim (Action/Cancel = Close) | S | keep Cancel-first initial focus via `initialFocus` |
| Sheet | `dialog` first; `drawer` later as opt-in | shim | M | staggered close animation must live on the popup element; Shell mobile nav (4 call sites) |
| Popover | `popover` (Positioner, no Anchor part) | shim (Anchor becomes a context ref) | M | collision defaults; Toolbar ResizeObserver must target Popup; combobox.css shares its variables |
| HoverCard | `preview-card` | shim (delays moved to Trigger) | S | re-apply 200/150 delays (Base UI 600/300); no v2 reference |
| Tooltip | `tooltip` | shim | M | **Base UI adds no `role="tooltip"`/`aria-describedby`**, so Kookie must add them; Provider delay 200; string/fragment children cannot be a `render` target; highest fan-out (Button/IconButton/Badge) |
| DropdownMenu | `menu` | shim (large) | L | `onSelect`, checkbox/radio `closeOnClick`, no `initialFocus`, `ItemIndicator` split, `Label` outside Group throws, drill-down coupling |
| Drill-down (internal) | none (keep the Kookie store) | none | M | Escape cancel only at depth > 0 via Root reason; list navigation vs panel swap; re-baseline `drill-down.test.tsx` |
| ContextMenu | `context-menu` | shim; `modal={false}` cannot be honoured | M | pointer virtual anchor, iOS long-press, Trigger `disabled` moves to Root |
| VirtualMenu | none | none | S | keydown bubbles into Base UI list navigation/typeahead: add `stopPropagation` |
| Select | `select` | **hard-ish**: `Select.Value` shows the raw value unless labels are registered; `Select.Label` meaning collides | L | item-aligned positioning only for mouse opens; Base UI writes inline sizes that fight animations; ScrollArea composition rebuilt around `Select.List` |
| Combobox | (a) keep cmdk + Base UI `popover`; (b) Base UI `combobox` | (a) shim; (b) hard (items API, no scoring) | (a) M, (b) XL | (a) rewrite `handleOpenAutoFocus` as `initialFocus`; replace 4 `radix-ui/internal` hooks |
| TabNav | `navigation-menu` | shim (`getSubtree` clone into render) | S | CompositeRoot Home/End/loop differences |
| Sidebar | `collapsible` + `menu` (thin mode) | shim (retype sub-part props) | M | coupled to DropdownMenu; removes the duplicate `@radix-ui/react-accordion` dependency (package.json:148) |
| Shell, Chatbar, Navbar, Toolbar | none (consume Sheet/ScrollArea/Slot) | none | S | Chatbar `useComposedRefs` must be replaced with a stable merged ref |

---

## 4. Strategy options

| | A: internal swap, keep v1 API (v1.x minors) | B: v2-style breaking major with codemods | C: freeze v1, move consumers to v2 |
|---|---|---|---|
| Public API | Kept; `render` added next to `asChild`; `asChild` deprecated later | `render` only, Base UI prop names, eventDetails exposed | v2 API: `emphasis`/`tone`/`bordered`, no `IconButton`, margin props only on layout primitives (`kookie-ui-v2/packages/ui/src/system/refused.ts`) |
| Consumer work | CSS/test selector updates only | ~180 `asChild` rewrites plus prop renames (codemod-able) | Full rewrite of every call site: variant, color, highContrast, IconButton, margins. Not codemod-complete. |
| Library work | ~6-9 weeks | ~6-9 weeks plus codemods and docs rewrite | Ongoing v2 work; v1 in maintenance |
| Risk | Behaviour drift hidden behind unchanged types; shims to maintain | Churn for the 4 consumers and kookie-blocks with little user value | Two libraries in use for a long time; v2 lacks HoverCard, Toast and others |

**Recommendation: A.**
- The consumer sweep shows almost nothing depends on Radix-specific props. `onOpenAutoFocus`, `onCloseAutoFocus`, `onEscapeKeyDown`, `onPointerDownOutside`, `onInteractOutside`, `avoidCollisions`, `delayDuration`, `skipDelayDuration` and `position="item-aligned"` have **zero** consumer uses. The only broad break is `asChild` (~180 uses), and the Slot shim hides it for about 40 LOC.
- The verified cards mark almost every component as "shim" with S/M effort. Only Select label display and Slider `inverted` are hard.
- v2 already owns the API redesign (`refused.ts`). Doing B would create a third API between v1 and v2. B's codemod work should instead go into a v1-to-v2 codemod later.
- C forces an unmechanical rewrite on kookie-ai (36 files), kushagradhawan (48 files) and kookie-blocks, and v2 is missing components v1 ships.

---

## 5. Phased plan

### Phase 0: foundations (about 1 week, no behaviour change)
1. **Own every exported type.** Replace `ComponentPropsWithout<typeof Radix.X>`-derived public types with explicit Kookie interfaces. Add `test-d.ts` coverage (existing pattern: `tests/types/combobox-props.test-d.ts`).
2. **Local Slot/Slottable** on `useRender`/`mergeProps` in `components/slot.tsx`. Swap the 17 direct `Slot.Root` imports. Port `composeRender`, `unwrapLazy`, `rootsInButton` and `useMergedRefs` from `kookie-ui-v2/packages/ui/src/system/render.ts`. Add `render` next to `asChild` on primitives.
3. **Replace `radix-ui/internal`** in 12 files (checkbox, checkbox-group(.primitive), checkbox-cards, radio, radio-group, segmented-control, text-field, chatbar, combobox, theme, theme-panel; plus dropdown-menu `useCallbackRef`) with local `useControllableState`, `useComposedRefs`, `composeEventHandlers`, `useCallbackRef`, `useLayoutEffect`.
4. **Local Portal, VisuallyHidden, AccessibleIcon, AspectRatio.**
5. **CSS prep:** convert state selectors to dual `:where(old, new)` form, and add `--radix-*` to Base UI variable aliases. Rewrite `animations.css` `.rt-PopperContent` rules for `[data-open]`/`[data-ending-style]` × `[data-side]`, including `inline-start`/`inline-end`.
6. Add `@base-ui/react@1.7.x` as a dependency and raise the React peer range to `^17 || ^18 || ^19` (v1 declares 16.8+).

Release: **1.x minor.** Nothing visible changes.

### Phase 1: leaf controls (about 1.5 weeks, lowest risk)
Order: Switch, Checkbox, RadioGroup, RadioCards, CheckboxGroup/CheckboxCards, ToggleButton/ToggleIconButton, SegmentedControl, Progress, Avatar, Tabs, Slider, Accordion, ScrollArea, TabNav.
- Use `render={<button/>} nativeButton` wherever v1 had a `<button>`, to keep ref types and `:disabled`.
- Accordion: decide whether to reimplement arrow/Home/End navigation (recommended; it is a keyboard regression otherwise).
- Sidebar's accordion goes to `collapsible`, dropping `@radix-ui/react-accordion`.

Release: **1.x minor per 2-4 components**, with a "DOM attribute changes" note.

### Phase 2: overlay + popup wave (about 3-4 weeks, one release)
Build shared infra first:
- Dismiss/focus bridge (Content handlers into Root `onOpenChange` reasons).
- Positioner/Popup prop splitter with v1 defaults (`align='start'`, `sideOffset`, `collisionPadding=10`).
- Theme-on-Portal (`Portal render={<Theme/>}` or v2 `PortalScope`) plus a DirectionProvider per portal.
- Legacy trigger `[data-popup-open]` selectors in base-button, base-card, card, kbd and link CSS.

Then, all on one branch: Tooltip, HoverCard, Popover, Dialog, AlertDialog, Sheet (on `dialog`), DropdownMenu + drill-down, ContextMenu, Select, Combobox (option a), Sidebar thin mode. Delete `use-body-pointer-events-cleanup.ts` and the dead focus traps.

Why one release: a Radix popup inside a Base UI Dialog counts as an outside press, and a Base UI popup inside a Radix modal is blocked by `pointer-events:none` and `aria-hidden`.

Release: **one 1.x minor behind a changelog "behaviour changes" section.** If you want to be strict, cut it as a **2.0 of the v1 line** that only covers DOM/behaviour, not props. A canary tag for kookie-ai and kushagradhawan should come first.

### Phase 3: cleanup
Remove `radix-ui`. Deprecate `asChild` in types (JSDoc) and docs. Drop dual CSS selectors and `--radix-*` aliases in the next major. Optionally add Drawer-based Sheet, Base UI Combobox, Toast, NumberField and Field as new opt-in components.

### Test strategy
- Existing suites are the regression net: `tests/components/*` (combobox, dropdown-menu, drill-down, context-menu, chatbar, theme, shell), `tests/perf/menu-renders.test.tsx`, `tests/components/combobox/combobox.perf.test.tsx`, `tests/ssr/menu-hydration.test.tsx`, `tests/ssr/hydration.test.tsx`, `tests/types/*.test-d.ts`, `tests/helpers/extract-props.test.ts`.
- Update assertions on `data-state` (e.g. `combobox.test.tsx:58`) and `forceMount` usage (`combobox.test.tsx:56-58`, `drill-down.test.tsx:368`) to Base UI names, while keeping public-prop tests unchanged. They prove the shim.
- Add behaviour tests for known drifts:
  - checkbox/radio menu items close the menu
  - AlertDialog focuses Cancel
  - Tabs do not fire `onValueChange` on mount
  - Tooltip has `role="tooltip"` and `aria-describedby`
  - Escape in drill-down pops one level
  - Select trigger shows the label, not the value
  - focus return after Dialog close
  - nested popup inside Dialog does not close the Dialog.
- Base UI sets `data-starting-style` for one frame, so animation tests must wait a frame (v2 LOG).
- Measure render counts and bundle size before and after each phase (perf tests already exist).

### Codemods needed (for Option A, all optional)
| Codemod | When | Reach |
|---|---|---|
| `asChild` + child to `render={<child/>}` | only when `asChild` is removed (next major) | ~180 uses across docs, blocks, kookie-ai, kushagradhawan |
| `forceMount` to `keepMounted` | if the alias is dropped | 3 docs, 2 tests |
| Menu `onSelect` to `onClick` | if the alias is dropped | 21 in kookie-ai, docs and tests |
| CSS `[data-state=...]` to Base UI attributes | consumer CSS | none found in docs/blocks CSS; docs text at `toggle-button/content.mdx:76`, `toggle-icon-button/content.mdx:117`, `button/content.mdx:255-261` |

---

## 6. Consumer impact (from the sweep)

| Consumer | Files importing kookie-ui | `asChild` | Radix-only props | Other breaks |
|---|---|---|---|---|
| v1 docs (`apps/docs`) | n/a | 99 lines / 32 files (~62 code) | positioning props 12× in `ui-test/dropdown-menu/page.tsx:470-521`; `forceMount` 3 in docs; `onSelect` 1 | direct `@radix-ui/react-label` in `components/property-control.tsx:4`; docs promising `data-state` |
| kookie-blocks | n/a | 22 lines / 8 files, inside the published library (`footer.tsx`, `docs-sidebar.tsx`, `docs-shell.tsx`) | none | must be re-released with kookie-ui |
| v1 tests | n/a | 2 | `forceMount` 2, `onSelect` 3 | `data-state` 1 (combobox); `.radix-themes` 11 (safe) |
| kookie-ai (kookie-ui ^0.2.3) | 36 | 14 lines / 10 files | `sideOffset` 5, `onSelect` 21 | `[data-radix-scroll-area-viewport]` in `components/chat/useAutoScroll.ts:53` breaks silently; imports `@radix-ui/react-visually-hidden` directly |
| kushagradhawan (^0.3.14) | 48 | 45 lines / 24 files | none | `.radix-themes` queried in `webgl-canvas.tsx:59,77` (keep the class) |

With Option A shims, the forced consumer changes are: kookie-ai's auto-scroll selector and any consumer CSS or tests reading `data-state`. Everything else keeps compiling and working. Unused: `onOpenAutoFocus`, `onCloseAutoFocus`, `onEscapeKeyDown`, `onPointerDownOutside`, `onInteractOutside`, `avoidCollisions`, `delayDuration`, `skipDelayDuration`, `position`.

---

## 7. What to reuse from v2

| Take | From | Notes |
|---|---|---|
| `composeRender`, `unwrapLazy`, `rootsInButton`, `useMergedRefs` | `kookie-ui-v2/packages/ui/src/system/render.ts` | React-only; fixes four already-shipped v2 bugs (anchor via render gets `type="button"`, RSC lazy elements, lost children/style/ref in cloneElement, ref churn) |
| `nativeButton` inference | `components/button/button.tsx:94-102` | needed wherever `asChild` maps to `render` |
| Dismiss/open-change helper, name warning | `system/floating.tsx:1956` (`overlayOpenChange`), `:2070` (`useNameWarning`) | replaces the Radix missing-Title warning and v1's shallow Title scan in Sheet |
| `PortalScope`, `useAmbientDirection` | `system/floating.tsx:110,183` | cut the v2 Theme dependency first |
| Menu `Label` outside Group fallback | `components/menu/menu.tsx:550-591` | avoids GroupLabel throwing |
| Context-menu `onContextMenu` preventDefault on popup | `menu.tsx:418` | |
| Select label strategy (optional `items`) and item-aligned decision | `components/select/select.tsx:54,290-300` | |
| Positioning/exit CSS patterns | `menu.css`, `recipes.css`, `accordion.css:203-214` | rename `kui-` tokens; use block-size transitions instead of height keyframes |
| Recorded pitfalls | `docs/DECISIONS.md`, `LOG.md` | one-frame `data-starting-style`; `role="presentation"` on popups; Select inline sizes vs animations; direction not crossing portals |
| **Do not take** | tokens, recipes/surfaces CSS, glass/motion system, the `emphasis`/`tone` API, `refused.ts` | tied to v2's design; would turn Option A into Option C |

---

## 8. Open questions

1. **Focus return after close:** adopt Base UI's return-to-trigger (better a11y, visible change) or pin `finalFocus={false}` for v1 parity?
2. **Accordion keyboard:** reimplement arrow/Home/End navigation that Radix gave for free, or accept the regression (Base UI 1.7 marks `orientation`/`loopFocus` deprecated)?
3. **Select labels:** register Items for `Select.Value` (first paint shows the raw value until open) or add an optional `items` prop as v2 does?
4. **Slider `inverted`:** rebuild it or deprecate it?
5. **CheckboxGroup roving focus:** keep Kookie's arrow-key navigation or follow APG (Tab between boxes)?
6. **ContextMenu `modal={false}`:** it cannot be honoured; document it or keep Radix for ContextMenu longer?
7. **Legacy `data-state`:** stamp it for one release for consumer CSS, or break it with a changelog note?
8. **Versioning of Phase 2:** a 1.x minor with behaviour notes, or a DOM-only major?
9. **Sheet on Drawer:** swipe-to-dismiss for Shell mobile nav now, or later as opt-in?
10. **Long-term:** is v1 heading toward v2 (then keep shims minimal and invest in a v1-to-v2 codemod), or staying as its own product (then `render` becomes a first-class v1 API)?
