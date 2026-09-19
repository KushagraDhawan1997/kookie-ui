# Log

Decisions about Kookie UI v1 and why they were made. Newest first. The docs site is the source of truth for what the system says. This file records how it got there.

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

**The core difference is how many decisions are made.** v2 is the system and its foundations in one package. Most decisions are made, and the package enforces them, which is why it refuses variants. In v1 many decisions are still open. v1 holds the foundations plus raw options, and a real product (Womp's app) is where the choices get tried until they settle. Settled decisions move into v1. The two also look different. So:

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
