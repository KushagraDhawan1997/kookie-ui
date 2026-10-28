# Log

Decisions about Kookie UI v1 and why they were made. Newest first. The docs site is the source of truth for what the system says. This file records how it got there.

## 2026-10-27: pane chrome pads like a panel

Since 0.17 a Shell pane counted as a surface: its header, footer and list padded by `--surface-p-N`, 24px at size 2, Card's padding. In Womp's app that read as too much (Kushagra): a header row of 32px controls sat in 24px on every side, and the app's own label inset stacked on top. A pane is chrome that holds rows, like a menu, not a card that holds content, so it now pads by `--panel-p-N` (8/12/16 at sizes 1 to 3), the padding menus already use. The rule that rows start on the header's inset is kept; only the inset is smaller.

## 2026-10-27: rounder surfaces, and nested surfaces keep a corner

0.22.1 made surfaces less rounded while controls stayed pills (cards 8/12/16/20px at `full`), on the idea that v1's look is flat surfaces and round controls. In Womp's app that look did not work, and Kushagra dropped it.

**What broke.** The concentric rule came from v2: a surface inside a surface draws the outer corner less the outer padding, never below 0. v1 took v2's padding (16/24/32/40px) and v2's rule, but kept corners smaller than that padding at every size, so the rule always came out at 0. Every Card in a Card rendered square: a choice card holding an outlined box, with pill fields and round radios inside it. The rule was right; v1's numbers gave it nothing to work with. At a 24px inset from a 12px corner the eye does not read two shapes as one family, it reads an independent box, and in this system an independent box is rounded. So the square read as a missing corner, not as concentric geometry.

**What was tried.** v2's own bands (24/32/40/48px at `full`) give nested surfaces a real concentric corner, but read too round. 4px under them (28px at size 2, 4px nested) is the lowest a band can go and stay concentric, and was still a little round. Kushagra picked 20px at size 2 with a floor on nesting.

**What v1 does now.**

- At `large` and `full`, surfaces are 16/20/24/28px and overlays 20/24/28/32px. `medium` (12/18/24/30), `small` (5/6/8/10) and `none` take v2's sets. Each level sets its corners directly, as in v2, so `--radius-surface-factor` is gone.
- Nesting keeps v2's rule with a floor: the inner corner is the outer corner less the outer padding, at least 8px, never more than its own corner. v1's corners sit at or under their padding, where the rule alone gives 0. This is where v1 and v2 differ. v2 notes that a tighter inner corner reads fine; here a square one read as a missing corner. At `small` and `none` the inner corner's own size caps it.
- v1 draws plain arcs. v2 draws squircles where the engine supports them, which is part of why its rule has room to work.
- A panel that hugs rows (menus, Select, Combobox) takes v2's corner: its row's corner plus its padding (`--radius-panel-N`, 27px at size 2). At the old 12px the panel was squarer than the 15px pill rows inside it, which v2 calls inside-out.

## 2026-10-16: removable items in the composer

Womp's chat needed a pill in the composer for what a message is about (a picked mode, a scene object) next to the files it carries, and Kushagra wanted attachments to look the same. v2 has no such part: its `Chip` refuses dismissal because a removable chip is a control, not an inert atom. So `Chatbar.Item` is a control in the chatbar, not a Chip: a list item in the attachments row with a lead tile, a truncating label and a × named after the label. The app owns the list, so the item only reports removal. Attachments take the same pill so a file and a reference read as one kind of thing. v2 should gain the same contract in its Composer so the two do not disagree.

## 2026-10-15: the scroll fade

Womp's chat floats its toolbar and goal tray over the transcript, and content cut hard at their edges. Kushagra asked for a fade native to the scroller, as v2 does. It is a mask on the viewport, so it fades the content and lets whatever is behind show through; a painted gradient would have to fade toward a colour that differs on every surface. v2 reads Base UI's per-edge overflow variables; Radix's ScrollArea publishes none, so a small hook (`use-scroll-edges`) writes `--scroll-overflow-start/-end` on scroll and resize, at most once a frame, with no re-render. Bands publish their reach through `--scroll-fade-start/-end`, and a nested scroller stands those down, the rule v2 learned from a band reaching every scroller inside its pane.

## 2026-10-15: components are tested in a real browser

Womp's copy has no docs site, so the public repo's Playwright suite (`apps/e2e`), which drives the docs pages, cannot test a component that ships here. Kushagra: anything shipped on Womp's Kookie has to be testable in this repo. The answer is v2's: a second Vitest project in browser mode, mounting each component directly in Chromium through Playwright. A component gets one `*.browser.test.tsx` beside its jsdom tests, with no page or app to maintain, so it scales with the component count. jsdom stays for behaviour that needs no layout, because it is fast. Every new browser test was checked against a broken version of the code it guards (autoScroll off, a strip that cannot wrap) and failed.

## 2026-10-15: the chat pieces (0.9.0)

Womp's chat was being redesigned as one screen rather than as an input: a transcript, a column of messages that wait above the input, the input, and quiet facts below it. Kookie gained the parts of that screen that are system decisions. The arrangement of a conversation (turns, replies, folded tool steps, the goal tray) stays in the app, as v2 keeps it in a block.

- **`MessageScroller` takes shadcn/ui's primitive rather than writing one.** Following a streamed reply, anchoring a new turn, keeping the reader's place when history loads above and jumping back are a body of edge cases; `@shadcn/react` (MIT) is the second runtime dependency of its kind after Radix, credited in AUTHORS. v2 makes its `ScrollArea` render as the primitive's viewport so there is one scroller. v1 cannot: Radix's `ScrollArea.Viewport` wraps its children in its own element and cannot be replaced, so the transcript scrolls natively with a thin scrollbar. Womp's chat already hides its scrollbar. The jump button is centred by margins, never by `translate`, because a button's own press motion may use it.
- **Notice and Confirmation, not Callout.** A notice is a condition that is true now and that nobody just caused. It takes layout space and never floats, has at most one action that fixes the condition, and its dismissal only acknowledges it, with the state in the app because a component cannot remember a dismissal across a reload. A confirmation is a question: a quiet no before a loud yes and no dismiss button, because closing a question does not answer it. Callout stays for authored asides.
- **Notices sit outside the chatbar's box.** A button in a notice must not submit the message, and a question may need to be a form of its own. They are inside `Chatbar.Root`, so pressing one does not collapse the bar, but outside the drop area and the click-to-focus area. They take the bar's size through context. The order is the app's; the last is nearest the text.
- **Send means more than send.** `sendMode` decides whether the button shows, never what it does, so a person could not stop a reply. `status` makes the empty-box button stop a running reply or retry after an error. With a draft, it still sends and the app decides whether that interrupts.
- **Context is quiet text, not a ground.** A ground tucked behind the box's bottom edge showed through the box's translucent fill, so it became text below the box, inset to the text inside it.

## 2026-10-14: the Shell audit

A multi-agent audit of the 0.8.0 branch confirmed 49 defects, each reproduced and argued against independently. Four exist only in the 0.7.1 code (fixed in 0.8.0 already), so the recommendation is to publish 0.8.0 and not 0.7.1 on its own. The rest are fixed in 0.8.0. The ones that changed a decision:

- **Escape is handled as it bubbles to the Root**, after the panes' own handlers, not by a native listener on the Root. The native listener ran before every React handler inside the panes and stopped the event, so an input that answers Escape itself (Kookie's own `Sidebar.Search`) could never keep its pane open. With focus on the document, a document listener answers instead.
- **The page lock belongs to a full-page Shell.** A Shell given its own height covers only its box and leaves the page alone. An `auto`-height Shell grows with its page, so its overlays and scrim are placed on the window.
- **The Root marks what it inerts**, and clears only that. Snapshotting the app's own `inert` and restoring it overwrote changes the app made while the overlay was open.
- **Focus return follows the pane, not only the element.** A pane that stops being an overlay at a breakpoint keeps focus; a pane closed from a menu gets focus back once the menu lets go; a pane that became an overlay with focus inside returns focus to its Trigger.
- **A responsive controlled `open` is folded into the untouched table.** It is deprecated; this way it is right in the server HTML and fires nothing on a breakpoint crossing.
- **`expandedSize` is the size only until something else sets one.** The React-owned default moved to `--<pane>-expanded-size`, so a re-render no longer overwrites a size the user dragged or the app set.
- **A part must be a direct child of `Shell.Root`** (or sit in a `display: contents` wrapper) to take its place on the grid. The docs had said any wrapper was fine.

## 2026-10-12: the Shell rebuild (0.7.1 and 0.8.0)

The Shell is rebuilt on v2's model behind v1's API, as `shell-plan.md` and the execution plan in Womp's app lay out. It ships in two releases, following the 2026-09-19 rule that internals and API changes ship apart: 0.7.1 fixes eight bugs on the old code, and 0.8.0 replaces the internals and adds the deprecation warnings. No working prop is removed until 1.0; only `height` and `resizer`, which no pane ever read, leave the pane types. Neither release is tagged or published yet.

**What v2 decided, and v1 now agrees with:**

- State lives on each pane: `auto` (untouched), `open` or `closed`. `auto` is resolved by the stylesheet, so the first paint is right without a script and no callback fires on mount or on a resize.
- Callbacks report what a user did. `reason` is `toggle` or `dismiss`.
- A pane is one element at every width. Overlay is how that element is placed, not a second component.
- The Root contains an open overlay: one scrim, `inert` on everything else, focus moved in and returned, Escape, and a page lock.
- Panes do not drive each other. The Rail/Panel cascade is gone; an app writes it in `onOpenChange` if it wants it.

**How v1 differs from v2, on purpose.** v1 keeps responsive prop objects. They are resolved into one value per breakpoint, written to the DOM as `data-presentation-<bp>` and `data-auto-<bp>`, and read by `@media` blocks at the same widths as `useBreakpoint`. A test holds the stylesheet's widths to `_BREAKPOINTS`, so the two readers cannot disagree.

**Motion is removed from the Shell** (Kushagra, 2026-10-12). This matches v2, which removed all motion on 2026-09-20. A test fails on any transition, animation or keyframes in `shell.css`.

**Decisions the plan left open, taken provisionally.** Kushagra said to build it without answering §7 decisions 1, 2 and 6. These are the choices made, each the smallest change, and each can still be reversed before the tag:

1. Sidebar `thin`: option (a). `state`/`defaultState`/`onStateChange` stay the Sidebar's API, and `thin` is a value the pane holds. Womp's app recommended (b), deprecating the three values for `open` plus a `thin` boolean. That is a deprecation, so it can follow in a later minor.
2. Rail and Panel: kept as two parts. A Panel with no `presentation` of its own follows the Rail's.
3. Peek: deprecated with a warning (§7 decision 3 closed as "remove").
4. Snap points, `collapseThreshold`, `paneId` and persistence: deprecated with a warning (decision 4 closed as "remove"). Womp uses none of them.
5. The overlay boundary is 768px for Sidebar and Inspector, as in v2 (decision 5).
6. Page-scroll on narrow touch: not adopted. The inner scroller stays.
7. "Open when there is room" stays app-owned: v1 answers it with a responsive `defaultOpen`.

**Found while checking it in a browser:** the inset backdrop waited for hydration, because the Root sets `data-has-inset` from an effect. A `:has(> [data-inset])` rule now paints it from the server markup. The scrim still appears only after hydration, since a correct CSS-only scrim would need a negation rule at every breakpoint.

## 2026-09-19: Principles and Vocabulary

The first two chapters are written. They follow v2's pages section by section, with two changes:

- In place of v2's "The trade", Principles closes with "Why v1 has options". A first draft said v1 leaves decisions to the product. Kushagra corrected it: v1 has raw props because many decisions are not made yet. The options are the building blocks that let a real product try the choices and settle on one. When a decision settles, it moves into v1 and its options narrow. v1 and v2 also differ in how they look, not only in where decisions live.
- Where v1 breaks a principle today, the page says so in a `GapNote` (`components/gap-note.tsx`, available in every chapter). The first notes, all confirmed by Kushagra as pending: `IconButton` split from `Button` by look; measured limits not enforced; no ground component; marks taking `material` and too many sizes (the fix is not decided yet). A gap note states the gap and does not prescribe a fix that has not been decided.

## 2026-09-19: the docs skeleton

The docs now have v2's structure. `apps/docs/lib/chapters.ts` lists the sections and chapters, and the sidebar, the homepage and the chapter route all read from it. Chapter files live in `apps/docs/content/`. One route, `app/[section]/[chapter]`, renders every chapter, so no chapter gets a page of its own.

- The eight theme pages moved into chapters with their text unchanged: Installation, Theming (was Theme), Colour, Typography, Radius, Materials (was Material), Depth (was Shadows) and Constants. Their old `/docs/...` URLs redirect permanently to the new ones. Their text is rewritten in the Foundations step.
- The other fourteen chapters are one-line placeholders.
- Constants is temporary. v2 has no such chapter, and its sections move into Motion, Size, Layout and States when those are written.
- Chapter titles and blurbs live in the registry, not in frontmatter, as in v2.
- MDX renders on the client, through `components/chapter-page.tsx`. v1's components break in a server component (they depend on `flushSync`).
- The homepage renders through the same page block as the chapters, as v2's does, so its header, column and footer match theirs. Its separate Hero and big footer are gone. As in v2, only pages with a table of contents reserve its column. Chapters always do, and the homepage centres its column.
- The page layout follows v2's, with v1's components: a top bar holds the sidebar button and the page's actions ("Copy page", "Source"), so the header is only the title and the description. No section name over the title (the sidebar already shows it) and no rule under the header. The description is in the main text colour. The table of contents is a rail with the current section lit. All of it lives in the blocks (`docs-shell`, `docs-page`, `table-of-contents`), so every page gets it.
- The docs' own controls follow the size rule: size 1 only when nothing else fits. Every docs control and label is now size 2: page actions, the code block, the preview and playground toolbars, the property controls and the version badge. The component examples keep size 1 where they show sizes. "Show all N lines" is a ghost button, since it is a quiet action inside the code block.
- `/docs` is now the component index, the counterpart of v2's `/components`. Component pages keep their `/docs/<name>` URLs for now.

## 2026-09-19: v1 shares v2's principles, not its UI

**v1 and v2 must never disagree on what is right.** They are both Kushagra's systems. They may look different, and they may reach the same answer by different means, but a design question gets the same answer in both. The test for a real conflict: two approaches that give a different answer to the same question. Same answer by different code is fine. Responsiveness is the main example: v1 keeps responsive prop objects, v2 uses tiers, and both must agree on what responds to what.

**The core difference is how many decisions are made.** v2 is the system and its foundations in one package. Most decisions are made, and the package enforces them, which is why it refuses variants. In v1 many decisions are still open. v1 holds the foundations plus raw options, and a real product (Womp's app) is where the choices get tried until they settle. Settled decisions move into v1. The two also look different, and they differ in ambition: v1 is the simpler system, built for a product in daily use, and v2 is experimental, pushing how far modern design can go. So:

- v1 keeps variants. Their shape and names may change. They do not break "decide once", because the product decides once. They only break it if every screen picks freely.
- Shared principles say what gets decided, never where. v2's Principles page mixes in v2's enforcement ("no variant prop", "refusals"), so it cannot be copied word for word.
- The test for v1's API: does it let a product make each decision once, in one place?
- Womp's product decisions never appear in these docs. This repo is public and Womp's app is not.

**Docs come first, then code.** v1's docs take v2's structure: Getting started (Principles, Vocabulary, Installation, Theming, Quickstart, AI agents), Foundations (Colour, Typography, Layout, Size, Radius, Materials, Depth, Motion, States, Responsiveness), Patterns (Composition, Forms, Modality, Navigation, Feedback) and Components. The homepage matches v2's too: a title, one paragraph on what the system is, and the four sections. The Get Started and GitHub buttons, the latest-update link and the component grid go.

- Each page answers the same question as its v2 twin. The answer is written for v1.
- Principles and Foundations say what v1 should be. Component pages say what ships today. Where a component falls short of a principle, its page says so. Those notes are the migration backlog, and each one is removed when its component is fixed.
- The structure is shared. The UI is v1's own. Docs parts (shell, sidebar, code block, previews) do the same jobs as v2's and look like v1.
- A change to how pages render goes in the shared blocks in `apps/docs/components/blocks/`, never in a single page.

**kookie-blocks will be removed.** The blocks in `apps/docs/components/blocks/` are the source.

**v1 moves onto Base UI, one component at a time.** It leaves the Radix Themes fork network. Womp depends on v1, so the migration is slow:

- Swapping a component's internals and changing its API ship in separate releases, so a regression points at one cause.
- Old props keep working with a dev warning until a major release removes them. Each rename gets a codemod.
- Order follows Womp's usage: least-used components first, heavy ones like Button and Dialog last.
- As components move to Base UI, v1's API will drift toward v2's. That is expected.

**Agent setup comes last.** An AGENTS.md in each repo, plus skills for the shared principles, v1's API and v2's API, packaged as a plugin. kookie-standards, which held the old v1-era guidance, is retired.
