# Menu Family Audit: DropdownMenu, ContextMenu, Combobox

Paths are relative to `packages/kookie-ui/src/components/` unless marked otherwise. Duplicate findings are merged. Items marked "(plausible)" were not fully confirmed. Severities are the verifier-adjusted values.

## 1. Executive summary

- **Combobox search does not work in its default setup (critical).** The search value reaches `Combobox.Input` only through a ref. The input is always controlled, so the text snaps back to `''`. The bug is reproduced in jsdom. Every uncontrolled docs example is affected, and no test types into the input.
- **Combobox search matches the hidden `value`, not the visible text (high).** Typing "United" does not find `<Item value="uk">United Kingdom</Item>`.
- **Drill-down mode cannot be used from the keyboard (high ×2).** Arrow keys skip the SubTrigger and Back item because they are plain divs. After push or pop, focus drops to `<body>`. Escape closes the whole menu.
- **Drill-down mounts every submenu level on open and hides the extra levels with CSS.** This costs open time. Typeahead also targets hidden items, and panels inside non-Group wrappers never show.
- **Combobox re-renders O(n) items per interaction.** It re-renders every item on select and on open/close, and on every keystroke when `searchValue` is controlled. The header's claim that `disablePointerSelection` is on is false.
- **Responsive `size` breaks the whole family.** It produces a NaN `alignOffset` (menu jumps to the viewport origin), the class `rt-r-size-[object Object]` in Combobox, and wrong VirtualMenu row heights.
- **Combobox ARIA is wrong in several places.** `aria-controls` points to nothing, `aria-selected` follows the highlight instead of the chosen value, the trigger's role does not match the dialog popup, and forced-colors mode shows no active option.
- **The tests miss all of the above.** The drill-down tests pass even when navigation is broken, the Combobox suite has no interaction tests, and ContextMenu has no tests and no docs page.

## 2. Performance (ranked)

### P1. Critical: uncontrolled Combobox search cannot be typed into
`combobox.tsx:429` (with 214-215 and 210)
- **What:** Root keeps `searchValue` in state but passes it to Input only through `cmdkConfigRef`. The ref context never changes and `contextValue` leaves `searchValue` out, so Input never re-renders. Input always passes a non-null `value`, which makes cmdk treat it as controlled (`c = r.value != null`), so cmdk skips `store.setState('search')`. React then puts the DOM value back to `''`.
- **Scenario:** Uncontrolled Root with `defaultOpen`: after `fireEvent.change(input,'ban')`, `input.value === ''` and every item still renders. `onSearchValueChange` does fire. Affected: the uncontrolled docs examples (`apps/docs/app/docs/combobox/content.mdx:48, 70, 177…`) and `apps/docs/app/playground/combobox-playground.tsx:209`. Search works only when the parent controls `searchValue` and re-renders the whole tree.
- **Fix:** Put `searchValue` and `setSearchValue` in a small SearchContext that only Input reads. Or pass `value` to cmdk only when Root's search is controlled, and let cmdk own the search otherwise. Keep the ref for callbacks only. Add RTL tests for uncontrolled typing, controlled typing, and `resetSearchOnSelect`.

### P2. Medium: controlled `searchValue` re-renders every Item on every keystroke
`combobox.tsx:183`
- **What:** `onSelect` depends on the radix `useControllableState` setters. In controlled mode those setters get a new identity whenever the prop changes. That makes a new `onSelect`, then a new `contextValue`, so every consumer re-renders. Each item's `handleSelect` (567) also changes, so cmdk removes and re-adds its `cmdk-item-select` listener on all N items.
- **Scenario:** Measured with 200 memoized items and `searchValue={q}`: one keystroke gave 200 Item renders plus Trigger and Input. This defeats the consumer's memoization. Uncontrolled mode is not affected.
- **Fix:** Make `onSelect` stable by reading the setters and `resetSearchOnSelect` through a ref (or `useEffectEvent`). Keep the item's user `onSelect` in a ref.

### P3. Medium: every Combobox.Item re-renders on each select and each open/close
`combobox.tsx:556` (duplicate merged)
- **What:** Each Item reads the whole Root context (`value`, `open`, `displayValue`…) but only needs `isSelected` and a stable `onSelect`. Each re-render also runs cmdk's dependency-less `useValue` layout effect, which calls `setAttribute`. `searchKeywords` is rebuilt on every render (575).
- **Scenario:** With 200 items, one select gave 200 Item renders, and Escape gave 200 renders on content that is about to unmount. The cost is highest when `open` is controlled or the content stays mounted.
- **Fix:** Split out a stable ItemContext without `value` or `open`. Give items a selection store read through `useSyncExternalStore(v => v === itemValue)`, so only the old and new selected items re-render.

### P4. Medium: drill-down mounts every submenu's content when the menu opens
`dropdown-menu.tsx:594`
- **What:** In drill-down mode, SubContent always renders its children inline. Inactive panels are hidden only with `display:none !important` (`dropdown-menu.css:85-101`). All nested items register in the root Radix collection. `extractProps` (588) also runs even though drill-down never uses its output.
- **Scenario:** 6 submenus of 30 items each mounts 180+ hidden items (with Kbd and icons) on every open, instead of about 10. Roving focus and typeahead walk the hidden items (see D5).
- **Fix:** Render panel children only when the panel's id is in the stack, so ancestors stay mounted. Move `extractProps` into the cascade branch.

### P5. Medium: `disablePointerSelection` is claimed but never passed; hover drives React state and double-highlights
`combobox.tsx:391` (merges 5 findings; comments at `combobox.tsx:10` and `combobox.css:3, 88`)
- **What:** CommandPrimitive receives only `loop`, `shouldFilter` and `filter`. cmdk therefore calls `setState('value')` each time the pointer enters a new item. That runs N selectors and re-renders two items plus Input/List (`aria-activedescendant`). The `:hover` CSS block (`combobox.css:93-137`) repeats the `[data-selected]` colors.
- **Scenario:** Rest the mouse on "Vue" and press ArrowDown twice: "Vue" (`:hover`) and "Svelte" (`data-selected`) are both painted accent-9, and Enter picks "Svelte". On a 500-item list, each item crossed costs about 1000 selector calls.
- **Fix:** Choose one highlight source. Either pass `disablePointerSelection` and keep `:hover` (this is a design decision, because hover and keyboard highlight then separate), or delete the `:hover` rules and the false comments.

### P6. Low: ContextMenu has no `virtualized` path and no MenuProvider
`context-menu.tsx:116`. See C2 (merged there).

### P7. Low: every menu surface mounts a Radix ScrollArea with both scrollbars (plausible)
`dropdown-menu.tsx:198, 640`, `context-menu.tsx:116, 381`
- **What:** `scrollbars` defaults to `'both'`, which sets up 4 ResizeObservers per surface. Mounting the vertical scrollbar flips a `:has()` padding rule, which causes another resize.
- **Scenario:** A menu with 3 open cascade submenus runs 16 observers during the open animation. The cost is small.
- **Fix:** Pass `scrollbars="vertical"`. Longer term, use a native `overflow-y: auto` viewport.

### P8. Low: the `:has(scrollbar)` padding rule reflows after open (plausible)
`_internal/base-menu.css:61`
- **What:** The padding changes only after the ScrollArea detects overflow. In practice only size 1 shifts (4px), and Combobox never matches because it has no ScrollArea.
- **Fix:** Use `scrollbar-gutter: stable` or fixed padding, or a data attribute set from ScrollArea state.

### P9. Low: Combobox Trigger defeats the compiled prop-def cache (plausible)
`combobox.tsx:252`
- **What:** An inline `{ size, highContrast }` object is passed to `extractProps`. The WeakMap cache misses, so every Trigger render recompiles about 20 prop defs.
- **Fix:** Hoist the object to module scope.

### P10. Low: redundant inner `<Theme asChild>` wraps a Context.Provider
`combobox.tsx:389` (merges 5 findings)
- **What:** Popover.Content already applies Theme (`popover.tsx:103`). The inner Theme slots onto `ComboboxContentContext.Provider`, so its class, `data-*` attributes and ref are dropped. It only adds a ThemeImpl render and a ThemeContext with the root accent.
- **Fix:** Remove it.

### P11. Low: cmdk config is read from a ref during render; contentContext fields are dead
`combobox.tsx:360, 367-371` (plausible for the staleness part; dead fields confirmed)
- **What:** `loop`, `shouldFilter` and `filter` are passed to cmdk from the ref and copied into `contentContextValue`, whose memo deps exclude them. They go stale only if the Content element is referentially stable. The context fields are never read.
- **Fix:** Pass the config as props through a real memoized value. Delete the unused context fields.

### P12. Low: the drill-down behavior switch remounts the whole menu subtree (plausible)
`dropdown-menu.tsx:63` (and 399-412)
- **What:** DrillDownRoot switches between a Fragment and a `<div>`. Sub switches between rendering children directly and wrapping them in Radix Sub. Crossing the breakpoint while the menu is open remounts every item, loses focus and resets any open submenu.
- **Fix:** Always render the same wrapper element and toggle attributes only. Keep Radix Sub mounted in both modes.

### P13. Low: drill-down state context re-renders every Sub wrapper on push/pop (plausible)
`_internal/dropdown-menu-drill-down.tsx:151`
- **What:** `stateValue` changes on every navigation step, so every Sub, SubTrigger, SubContent and DrillDownRoot re-renders. An inline JSX `label` also invalidates SubTrigger's callbacks. Leaf items do not re-render, so the cost is small.
- **Fix (optional):** Store stack and direction in one `useReducer`. Add a per-id selector only if measurement shows a need.

### P14. Low: the drill-down animation runs on each item instead of one container (plausible)
`dropdown-menu.css:195`
- **What:** Panels are `display:contents`, so every direct child gets its own opacity/transform animation.
- **Fix:** Animate one real wrapper element, or `.rt-BaseMenuViewport`.

### P15. Low: `will-change` is held for the whole time the menu is open (plausible)
`_internal/base-menu.css:30`
- **What:** `will-change` stays on after the ~150ms open animation. It adds a layer only in solid mode, because `backdrop-filter` already creates one in translucent mode.
- **Fix:** Remove it.

### P16. Low: `forceMount` keeps closed Combobox content fully live (plausible)
`combobox.css:17`
- **What:** With the opt-in `forceMount`, floating-ui `autoUpdate` and the DismissableLayer listeners keep running while the content is only visually hidden. The "label registration" comment is stale.
- **Fix:** Document `forceMount` as a last resort and delete the stale comment.

### P17. Low: CSS bundle and selector cost (plausible, all minor)
- `_internal/base-menu.css:207`: `@breakpoints` expands the full size blocks, including 2 `:has()` rules per size, into 42 `:has` occurrences (about 10KB unminified). The `:not(:has())` "fallback" does nothing inside `:where`. Fix: make only the custom properties responsive, and replace the `:has` pair with a data attribute set from React.
- `_internal/base-menu.css:38`: the reduced-motion `backdrop-filter:none` is always overridden by the translucent rule. The item-level backdrop and `[data-panel-background]` branches never match (lines 98, 343, 377-386, 456-488). Fix: delete them.
- `dropdown-menu.css:105`: the drill-down Back item re-declares the whole `.rt-BaseMenuItem` block. Fix: keep only `font-weight` and `:focus-visible`.
- `combobox.tsx:28`: `textFieldRootPropDefs` is a value import used only as a type. `sideEffects` config drops it in production. Fix: `import type`.

### P18. Low: a function `displayValue` runs on every Root render (plausible)
`combobox.tsx:174`
- **What:** An inline function breaks the memo. The O(n) find cost is negligible.
- **Fix:** Add a docs note to pass a stable callback. Do not memoize on `value` alone, because that shows stale labels.

## 3. Combobox

### X1. High: search matches the hidden value, not the visible item text
`combobox.tsx:575, 580`
- **What:** cmdk's `useValue` uses the `value` prop first and never reads children text. Keywords are set only when `label` or `keywords` is passed. The JSDoc ("falls back to children text") is false.
- **Scenario:** In the playground, `<Item value="uk">United Kingdom</Item>`: typing "United" shows Empty, typing "uk" matches.
- **Fix:** When `label` is missing, use the children text as a keyword, or require `label`. Update the docs and playground.

### X2. Medium: on open, the highlight starts at the first item, not the current value
`combobox.tsx:391`
- **What:** cmdk gets no `value` or `defaultValue`, so it selects the first item on mount.
- **Scenario:** With `value='zucchini'`, open the combobox and press Enter: the selection is replaced with "apple".
- **Fix:** Pass `defaultValue={ctx.value}` to CommandPrimitive. The content remounts on each open, so this resets every time.

### X3. Medium: cmdk overwrites `aria-selected`, so the chosen option is never exposed
`combobox.tsx:583` (merges 3 findings)
- **What:** cmdk sets `aria-selected` to the highlighted item after spreading props. The chosen value is shown only by ThickCheckIcon, which has no text alternative. The docs (`content.mdx:764`) overstate what is announced.
- **Fix:** Expose the chosen state with `aria-checked` or visually hidden text. Remove the dead `role` and `aria-selected` props.

### X4. Medium: Trigger `aria-controls` points to an id that does not exist; the list label is dead
`combobox.tsx:478, 481, 296` (merges 3 findings)
- **What:** cmdk List sets its own `id` and `aria-label` (default "Suggestions") after the spread. The trigger's `aria-controls={listboxId}` references nothing. The explicit `undefined` also replaces Radix's content id.
- **Scenario:** axe reports `aria-valid-attr-value` whenever the popup is open.
- **Fix:** Let Radix supply `aria-controls`. Use cmdk's `label` prop. Remove the dead `id` and `aria-label`.

### X5. Medium: Trigger ARIA does not match the actual popup
`combobox.tsx:295`
- **What:** The trigger is a button with `role=combobox`, `aria-haspopup="listbox"` and `aria-autocomplete="list"`, but the popup is an unnamed Popover dialog containing a second `role=combobox` (the cmdk Input).
- **Fix:** Use `aria-haspopup="dialog"` (APG dialog-popup pattern), drop `aria-autocomplete`, and label Popover.Content.

### X6. Medium: no trigger labelling guidance
`combobox.tsx:294`
- **What:** The combobox role does not take its name from content. Native `aria-label`, `aria-labelledby` and `<label for>` already pass through, but no docs or playground example uses them.
- **Fix:** Document labelling, add a dev warning when no label is set, and forward the label to cmdk's `label`.

### X7. Medium: filter result count and the empty state are never announced
`combobox.tsx:499`
- **Fix:** Add a debounced `role="status"` live region that announces the filtered count or the Empty text.

### X8. Medium: active option invisible in forced-colors mode
`combobox.css:146` (merges 2 findings)
- **What:** Combobox items never get DOM focus, so the only forced-colors rule (`base-menu.css:499`, `:focus-visible`) never matches.
- **Fix:** Add `@media (forced-colors: active) { .rt-ComboboxItem[data-selected='true'] { outline: 2px solid Highlight; outline-offset: -2px } }`.

### X9. Medium: `highContrast` never applies to the list
`combobox.css:130` (and 135, 175, 180)
- **What:** The "reset" rules check `[data-accent-color]` on the Content, which always has it (`combobox.tsx:358, 377`). They come later with equal specificity, so they always win.
- **Fix:** Delete the four reset rules (129-137 and 174-182).

### X10. Medium: responsive `size` produces `rt-r-size-[object Object]`
`combobox.tsx:363` (merges 3 findings)
- **What:** `String(sizeProp)` is stored in context, and Input (433) and Item (561) build the class from it. The search field loses its height and padding. The docs Responsive example (`content.mdx:706`) triggers this.
- **Fix:** Build the class with `extractProps` or `getResponsiveClassNames`. Never call `String()` on a responsive object.

### X11. Medium: `readOnly` and `loading` do not block interaction as the docs promise
`combobox.tsx:258, 292` and `apps/docs/app/docs/combobox/content.mdx:121, 123, 439-455` (merges 4 findings)
- **What:** `isDisabled` ignores `loading`. `readOnly` only sets `data-read-only`, which nothing styles or reads. The popover still opens and the value can change.
- **Fix:** Block opening and selection on `readOnly` and set `aria-readonly`. Set `aria-busy` on `loading` and optionally disable. Otherwise, fix the docs.

### X12. Medium: the trigger never sets `data-placeholder`
`combobox.tsx:284`
- **What:** The select.css placeholder styles never apply, so an empty Combobox shows its placeholder in full-contrast, medium-weight text.
- **Fix:** `data-placeholder={ctx.value == null && ctx.displayValue == null ? '' : undefined}`.

### X13. Low: Trigger keyboard and state ARIA gaps
`combobox.tsx:283`
- **What:** ArrowDown and Alt+ArrowDown do not open the popup. `error` sets no `aria-invalid`. `loading` sets no `aria-busy`.
- **Fix:** Add an `onKeyDown` that opens on ArrowDown. Add the two ARIA attributes.

### X14. Low: Content without an Input has no keyboard navigation
`combobox.tsx:389`
- **What:** Focus lands on Popover.Content, which is an ancestor of the cmdk root, so cmdk's keydown handler never runs.
- **Fix:** Focus the cmdk root or List in `onOpenAutoFocus`, or make Input required.

### X15. Low: Combobox.Label is not associated, and groups have no name
`combobox.tsx:523`
- **Fix:** Map Label to cmdk Group's `heading` prop, or wire up `aria-labelledby`.

### X16. Low: search text and filter persist after closing without a selection
`combobox.tsx:183, 220`
- **Fix:** Wrap `setOpen` so that closing clears the search (behind `resetSearchOnSelect` or a new `resetSearchOnClose`).

### X17. Low: an Item with no `value` can be highlighted but selecting it does nothing
`combobox.tsx:567`
- **Fix:** Always call the item's `onSelect` with cmdk's resolved value, or make `value` required in the type.

### X18. Low: `label`/`keywords` changes are ignored while `value` stays the same
`combobox.tsx:575`
- **What:** cmdk writes keywords only when the value changes.
- **Fix:** Key the Item on its label, or put the label into `value`. Memoizing the keywords does not help, because cmdk's layout effect has no dependency array.

### X19. Low: Combobox.Content material is inconsistent
`combobox.tsx:342, 348`, `combobox.props.tsx:59` (merges 3 findings)
- **What:** There is no `material` prop. A passed `panelBackground` reaches Popover through the spread, but `data-material` and the Input stay on the theme value. The trigger's `material` does not reach the list.
- **Fix:** Add `material` and `panelBackground` to `comboboxContentPropDefs`, resolve them as DropdownMenu does, and pass the result to Popover and the context.

### X20. Low: Trigger `material` leaks onto the DOM `<button>`
`combobox.tsx:250, 257, 293` (merges 3 findings)
- **What:** The button renders `material="translucent"`. `data-panel-background` does not fall back to `material`.
- **Fix:** Destructure `material` out of the `extractProps` result.

### X21. Low: Combobox surface stacks the Popover and BaseMenu rule sets
`combobox.tsx:387` (plausible perf part; the radius mismatch is confirmed)
- **What:** popover.css wins on radius (12px vs 16px at size 2), `overflow` and the 480px max-width. The padding needs `!important`. Two nested `overflow:auto` containers exist, but in practice only one scrolls.
- **Fix:** Render PopoverPrimitive.Content directly with only the BaseMenu classes.

### X22. Low: the solid highlight forces `*` descendants to the contrast color with `!important`
`combobox.css:106` (and 125, 135, 151, 171, 181; merges the plausible perf finding)
- **What:** Badges and colored icons lose their colors, unlike in DropdownMenu. The selector cost is negligible.
- **Fix:** Use the base-menu selectors (`.rt-Text`, `[data-accent-color='gray']:not(.rt-Badge)`) and drop `!important`.

### X23. Low: fixed 300px list cap and native scrollbar
`combobox.css:39`
- **What:** The cap ignores `--scaling` and size, and the OS scrollbar differs from the rest of the family.
- **Fix:** Use a token or CSS variable for the cap, and align the scrollbar styling.

### X24. Low: the search row paints a second panel background
`combobox.css:76`
- **What:** On translucent material the search row looks more opaque. Its `position: sticky` does nothing.
- **Fix:** Remove the background and `sticky`.

### X25. Medium (tests): no interaction tests
`packages/kookie-ui/tests/components/combobox/combobox.test.tsx:6`
- **What:** All 25 tests are static. `fireEvent` is imported but never used. The type-export test is `expect(true).toBe(true)`.
- **Fix:** Add user-event tests for open, select, filter, keyboard, Escape and aria-controls. Move the type check into a tsd file under `tests/types/`.

### X26. Medium (docs): Value is described as showing the option label; removed label registration still documented
`apps/docs/app/docs/combobox/content.mdx:157, 801` (and 108)
- **What:** The Usage example shows "2" in the trigger after selecting "Option 2".
- **Fix:** Add `displayValue` to the examples, or state that the raw value is shown. Remove the stale changelog line.

### X27. Low (docs): wrong defaults and descriptions
`apps/docs/app/docs/combobox/content.mdx:89`
- **What:** Sizes are listed as 32/40/48px; the CSS gives 24/32/40px. The `searchPlaceholder` default is listed as "Search options…"; the code uses "Search...". List is said to have "ScrollArea support"; it has none. `container` is not documented.

### X28. Low (docs): examples break project rules
`apps/docs/app/docs/combobox/content.mdx:577`
- **What:** The async example fetches in `useEffect`. The adornment example imports a lucide icon. The playground uses `size={16}` icons, `color as any`, and generates code that calls hooks at module top level. The gray IconButton in dropdown `examples.tsx:128` lacks `highContrast`.

## 4. DropdownMenu

### D1. High: drill-down SubTrigger and Back item cannot be reached by keyboard
`dropdown-menu.tsx:455, 544` (merges 2 findings)
- **What:** They are plain `<div role=menuitem>`, not Radix Items, so they are outside the roving collection. Radix blocks Tab. The only test fires Enter directly on the trigger. The docs (`content.mdx:637`) say keyboard navigation works.
- **Fix:** Render both as `DropdownMenuPrimitive.Item` with `onSelect={e => { e.preventDefault(); push(id) }}`. Add ArrowUp/ArrowDown tests.

### D2. High: focus falls to `<body>` after push or pop
`_internal/dropdown-menu-drill-down.tsx:120`
- **What:** The focused element becomes `display:none`, and nothing moves focus. Arrow keys, typeahead and Escape stop working.
- **Fix:** After push, focus the first item of the active panel in a layout effect. On pop, focus the originating SubTrigger (keep a map from id to ref). Use `preventScroll`.

### D3. Medium: drill-down SubTrigger and SubContent drop their props; disabled submenus still open
`dropdown-menu.tsx:423, 453, 594-613` (merges 4 findings)
- **What:** `subTriggerProps` (`disabled`, `textValue`, `id`, `aria-*`, `data-*`, `style`, `onKeyDown`) are never spread. `push` does not check `disabled`. There is no `aria-haspopup`. SubContent drops `subContentProps` as well.
- **Fix:** Spread the rest props. Honor `disabled` (set `aria-disabled` and `data-disabled`, skip `push`). Compose the user's `onKeyDown`. Add `aria-haspopup="menu"`.

### D4. Medium: Escape and ArrowLeft/ArrowRight do not move between drill-down levels
`dropdown-menu.tsx:443`
- **What:** Escape closes the whole menu, and the arrow keys do nothing, unlike cascade mode.
- **Fix:** When the stack is not empty, Escape and ArrowLeft call `pop()`. ArrowRight on a SubTrigger calls `push()`. Guard `onEscapeKeyDown` on Content.

### D5. Medium: typeahead in drill-down panels targets hidden items
`dropdown-menu.css:60`
- **What:** Radix typeahead matches across the whole collection, and focusing a `display:none` match fails.
- **Scenario:** Inside "Share", typing "e" hits the hidden root item "Edit" instead of "Email".
- **Fix:** Fixed by rendering only active panels (P4).

### D6. Medium: drill-down panel is a nested `role=menu` named "Back"
`dropdown-menu.tsx:598`
- **What:** With `label="Settings"`, the Back item reads only "Settings". A ReactNode label gives the panel no name.
- **Fix:** Use `role="group"` named after the submenu, and give the back item `aria-label={`Back to ${parent}`}`.

### D7. Medium: drill-down keeps the old scroll position across levels
`_internal/dropdown-menu-drill-down.tsx:120`
- **Fix:** On push, scroll the viewport to the top. On pop, restore the scroll position saved with the stack entry.

### D8. Medium (tests): drill-down tests pass even when navigation is broken
`packages/kookie-ui/tests/components/dropdown-menu/drill-down.test.tsx:63`
- **What:** jsdom loads no CSS, so `toBeVisible` passes before any click. All 11 tests would pass if `push` did nothing.
- **Fix:** Assert `data-drill-down-active` and `data-animation-direction`. Mock `matchMedia` for the responsive cases.

### D9. Low: panels nested inside RadioGroup, nested Groups or wrappers stay hidden
`dropdown-menu.css:60`
- **What:** Only a direct `.rt-BaseMenuGroup` child is exempt from `display:none`.
- **Fix:** Fixed by conditional rendering (P4), or keep ancestors visible with `:has(...[data-drill-down-active])`.

### D10. Low: drill-down Sub ignores `open`, `defaultOpen` and `onOpenChange`
`dropdown-menu.tsx:399` (merges 2 findings)
- **Fix:** Sync these props with the drill-down stack.

### D11. Low: the drill-down stack is not reset on close; `reset` is unused
`_internal/dropdown-menu-drill-down.tsx:130`
- **What:** Only affects `forceMount`.
- **Fix:** Call `reset()` when the menu closes.

### D12. Low: drill-down rows look and behave differently from normal items
`dropdown-menu.css:146`
- **What:** No `highContrast` rule, a separate `:hover` highlight (two rows can be lit at once), an extra focus outline, a fixed icon size, and a hard-coded `font-weight` 500.
- **Fix:** Covered mostly by D1 (Radix Items get `data-highlighted`). Size the back icon from the per-size variables.

### D13. Low: TriggerIcon overwrites the user's className
`dropdown-menu.tsx:658`
- **Fix:** `classNames('rt-DropdownMenuTriggerIcon', props.className)`.

### D14. Low: SubContent types accept `virtualized`; prop declarations are duplicated
`dropdown-menu.tsx:93`
- **What:** `virtualized` passes type-checks on SubContent and then leaks to the DOM.
- **Fix:** Narrow the context type. Declare `submenuBehavior` and `virtualized` once.

### D15. Low: unused drill-down exports and state fields
`_internal/dropdown-menu-drill-down.tsx:229`
- **What:** The claimed performance effect is negligible.
- **Fix:** Delete the unused exports. Skip the breakpoint subscription when `submenuBehavior` is a plain string.

### D16. Low (docs): props tables are inaccurate
`apps/docs/app/docs/dropdown-menu/content.mdx:156`
- **What:** SubContent does not accept "the same props as Content". `onSelect` receives `(event: Event)`. The Sub table omits `open`, `defaultOpen` and `onOpenChange`, and the drill-down caveat for them.

### D17. Low (docs): snippets are not copy-paste ready
`apps/docs/app/docs/dropdown-menu/content.mdx:301`
- **What:** Content is shown without Root. CheckboxExample and RadioExample throw when pasted. `console.log` remains in examples.

## 5. ContextMenu

### C1. Medium: `submenuBehavior="cascade"` leaks to the DOM
`context-menu.tsx:80-90, 346-357` (merges 3 findings)
- **What:** The base prop defs fill in the default, and it is never removed, which gives a React unknown-prop warning and a stray attribute. The type also accepts `submenuBehavior`, which does nothing here.
- **Fix:** Use ContextMenu-specific prop defs (SubContent should use the SubContent defs), or destructure the prop out.

### C2. Medium: no MenuProvider and no `virtualized` option
`context-menu.tsx:116` (merges 3 findings)
- **What:** A VirtualMenu inside a ContextMenu renders a nested `role="menu"`, defaults to size 2 (32px rows), and sits inside the ScrollArea, so it scrolls twice.
- **Fix:** Mirror DropdownMenu: wrap in `<MenuProvider size>` and add a `virtualized` prop that skips ScrollArea.

### C3. Low: no tests and no docs page
`packages/kookie-ui/tests/`, `apps/docs/app/docs/`
- **What:** No test imports ContextMenu. The `ui-test/context-menu-search` folder is an untracked empty local directory.
- **Fix:** Add tests (open, onSelect, indicators, no unknown DOM props) and a `context-menu/content.mdx`.

## 6. Family-wide / shared

### S1. Medium: a responsive `size` gives a NaN `alignOffset`
`context-menu.tsx:104, 365`, `dropdown-menu.tsx:624` (merges 3 findings)
- **What:** `-Number(size) * 4` on an object is NaN. floating-ui produces `translate(NaN…)`, so the menu appears at the viewport origin.
- **Fix:** Resolve the size to a scalar first (`useBreakpoint` plus `resolveResponsiveValue`).

### S2. Medium: SubContent ignores its own `color`, `material` and `size` and leaks `color`
`dropdown-menu.tsx:573, 588`, `context-menu.tsx:344` (merges 2 findings)
- **What:** Context values drive the data attributes and `alignOffset`. The merged `color` is spread onto the DOM. `panelBackground` raises no deprecation warning.
- **Fix:** Resolve `props ?? ctx` for each value, remove `color` before spreading, and call the warning helper.

### S3. Medium: VirtualMenu row heights are wrong at non-default scaling or responsive sizes
`_internal/menu-context.tsx:32, 50` (merges 2 findings)
- **What:** Heights are hard-coded (24/32px) with no measurement, and `resolveSize` takes only `initial`. At scaling above 100% rows overlap; below it they are squeezed.
- **Fix:** Use `measureElement` or read `--base-menu-item-height`, and resolve the size by breakpoint.

### S4. Medium: menus ignore the Theme `material` and read only the deprecated `panelBackground`
`dropdown-menu.tsx:121`, `context-menu.tsx:64`, `combobox.tsx:348`
- **What:** A nested `<Theme material="solid">` still produces translucent menus.
- **Fix:** One shared resolver: `props.material ?? props.panelBackground ?? theme.material ?? theme.panelBackground`.

### S5. Medium: labels and gray secondary text fail AA contrast
`_internal/base-menu.css:141, 321-323`
- **What:** gray-a10 gives about 3.8:1.
- **Fix:** Use `--gray-a11`.

### S6. Low: the translucent transition override re-enables transitions for reduced-motion users
`_internal/base-menu.css:347-360`
- **What:** The override has the same specificity as the reduced-motion rule and comes later, so it wins on the default path.
- **Fix:** Delete both overrides.

### S7. Low: soft-variant focus highlight is very low contrast
`_internal/base-menu.css:470`
- **What:** accent-4 on the panel is about 1.2:1.
- **Fix:** Add an inset accent-a8 ring on `:focus-visible`, or use a stronger step.

### S8. Low: material overrides key on ancestors, not the menu surface
`_internal/base-menu.css:473`
- **What:** The verifiers disagreed on the base-menu nested rules. Confirmed real: `combobox.css:115, 160` and `dropdown-menu.css:171-174` need a translucent ancestor of portaled content. A solid menu inside a translucent container gets alpha colors. The item-level `[data-panel-background]` blocks are dead.
- **Fix:** Key the rules on `.rt-BaseMenuContent[data-material|data-panel-background]` itself.

### S9. Low: shortcut Kbd is read as part of the item name, and its color rules are dead
`dropdown-menu.tsx:249`, `context-menu.tsx:173`, `_internal/base-menu.css:316`
- **What:** There is no `aria-keyshortcuts`. `.rt-Kbd` sets its own gray-12 color, so disabled items show full-contrast shortcuts.
- **Fix:** Set `aria-hidden` on the Kbd and add `aria-keyshortcuts`. Add `.rt-BaseMenuShortcut :where(.rt-Kbd) { color: inherit }`.

### S10. Low: SubContent `alignOffset` formula does not match Kookie padding
`dropdown-menu.tsx:624`, `context-menu.tsx:365`
- **What:** The first submenu item sits 4px low at sizes 1 and 2, and the offset ignores `--scaling`.
- **Fix:** Derive the offset from the content padding.

### S11. Low: RTL problems
`_internal/base-menu.css:242, 286`
- **What:** Physical `padding-left` on size-2/3 labels. Chevrons and drill-down keyframes are not mirrored.
- **Fix:** Use logical properties and flip the icons and animations under `[dir=rtl]`.

### S12. Low: size 3 reuses size-2 tokens
`_internal/base-menu.css:275`
- **What:** Icon, indicator, label and line-height stay at size 2.
- **Fix:** Use the `-3` tokens.

### S13. Low: `highContrast` does nothing in the soft variant
`_internal/base-menu.css:444`
- **Fix:** Add soft high-contrast styling, or document that it applies only to solid.

### S14. Low: dead CSS, misnamed classes and indicator divergence
`_internal/base-menu.css:150`, `dropdown-menu.tsx:322, 361`, `context-menu.tsx:246`, `combobox.tsx:271`
- **What:** `.rt-BaseMenuArrow` is never rendered. DropdownMenu.CheckboxItem emits `rt-ContextMenuItemIndicatorIcon`. DropdownMenu uses `rt-DropdownMenuSubtriggerIcon` (lowercase t). Combobox's `rt-SelectLoadingSpinner` has no CSS, so it rotates but does not animate the dash like Select. RadioItem shows a dot in DropdownMenu and a check in ContextMenu.
- **Fix:** Delete or rename these, reuse Select's spinner, and pick one radio indicator.

### S15. Low (tests): wide coverage gaps
`packages/kookie-ui/tests/components/dropdown-menu/drill-down.test.tsx:8`
- **What:** No tests for cascade basics, shortcut, color, checkbox/radio, `virtualized`, MenuProvider, `resolveResponsiveValue`, or behavior switching. No perf or SSR tests for any menu.
- **Fix:** Add `dropdown-menu.test.tsx`, a `resolveResponsiveValue` unit test, and render-count tests under `tests/perf`.

## 7. Suggested fix order

1. **PR 1: Combobox search (release blocker).** P1, X1, X16, X17, X18, plus the typing and filter tests from X25. Fix the docs examples that depend on uncontrolled search.
2. **PR 2: Combobox render path.** P2, P3, P5 (decide the highlight model), P9, P10, P11, P18, plus the type-only import from P17.
3. **PR 3: Drill-down rework.** Radix Items for the trigger and Back (D1), focus management (D2), render only active panels (P4, D5, D9), prop forwarding and `disabled` (D3), Escape and arrow keys (D4), ARIA naming (D6), scroll reset (D7), stack reset (D11), stable tree shape (P12), D10, D12, D15, and real assertions in the tests (D8).
4. **PR 4: Shared prop resolution.** Responsive size resolution (S1, X10, S3), SubContent's own props (S2, D14), Theme `material` (S4), Combobox material (X19, X20), ContextMenu `submenuBehavior` and MenuProvider/`virtualized` (C1, C2), D13.
5. **PR 5: Combobox accessibility.** X2 to X9, X11 to X15.
6. **PR 6: CSS cleanup.** X9 if not already done, X12, X21 to X24, S5 to S14, P7, P8, P14, P15, P16, the CSS items in P17, P13 if measurement warrants it.
7. **PR 7: Tests and docs.** X25 remainder, X26 to X28, C3, D16, D17, S15.