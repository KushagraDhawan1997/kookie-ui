# AGENTS.md: Womp UI (Kookie UI v1)

Read `docs/LOG.md` first. It records the decisions behind v1 and why they were made. Where this file disagrees with it, the log wins.

## What this is

`@kushagradhawan/kookie-ui` is the React component library behind Womp's app. Its public name is Womp UI. The docs are at https://womp-ui.kookie.design.

A second copy, `@womp/kookie-ui` in `wompxyz/kookie-ui`, is kept identical to `packages/kookie-ui` here apart from the package name. Every release is ported there.

## Layout

```
packages/kookie-ui/     the library
  src/components/       one .tsx, one .css and often one .props.tsx per component
  src/components/_internal/   shared parts, not exported
  src/props/            shared prop definitions
  src/helpers/, hooks/  server-safe helpers, client hooks
  src/styles/tokens/    design tokens
  src/styles/utilities/ layout utility classes
  tests/                Vitest: jsdom, and real Chromium for *.browser.test.tsx
  schemas/              generated JSON schemas (scripts/generate-json-schemas.cjs)
apps/docs/              the docs site (Next.js, MDX), on port 2509
apps/bench/             performance bench with a budget CI enforces
apps/e2e/               Playwright tests against the docs site (not in CI)
docs/LOG.md             decisions
```

## Rules

- **Do not run build commands.** Watchers rebuild `dist` and `styles.css`.
- **Class names start with `kui-`.** Size and variant are classes (`kui-r-size-2`, `kui-variant-soft`); state is a data attribute, removed when off.
- **Components read role tokens** (`--control-height-2`, `--surface-p-2`, `--neutral-*`), not raw colour scales.
- **No motion.** Only the spinner and the progress bar move. A test fails on a transition in the Shell.
- **Every surface is solid.** There is no `material`, no translucency, no blur.
- **Sizes are 1 to 4.** A component with no `size` takes the Theme's. Type sizes are 1 to 9.
- **Spacing props take steps 0 to 12:** 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 96, 128px.
- **The default Button is `solid`.** `emphasis` (`loud`, `medium`, `quiet`) or `variant`, never both. An icon-only button is `<Button iconOnly aria-label="…">`.
- **Muted text uses `emphasis`,** not `color="gray"`.
- **Icons in docs and examples are HugeIcons.** The library itself ships a few inline SVGs and no icon set.
- **No Tailwind classes.** The docs load only its reset.
- **A prop definitions object passed to `extractProps` lives at module scope.** One built inside a component is recompiled on every render.

## Using the components (docs, examples, playgrounds)

- **Props over inline styles.** `<Flex p="4" mt="2">`, not `style={{ padding: 16 }}`. Use `style` only where no prop exists (`cursor`, `transform`, `objectFit`).
- **Primitives over raw HTML.** `Flex`, `Box`, `Grid`, `Text`, `Heading` in place of `div`, `p` and `h3`.
- **Let the component size its content.** No `size` on an icon inside a Button or a menu item, and no `Text` around a Button's label.
- **Never hardcode a colour.** Use `color` and the tokens.
- **`asChild` for a link that looks like a button:** `<Button asChild><Link href="/x">…</Link></Button>`. Never an interactive element inside another.
- **Every button pairing has a clear first and second:** one `solid`, the other `soft` or `ghost` in gray.

## Docs pages

- Frontmatter: a title of one or two words, a description of about 50 characters, no `h1` in the body.
- In MDX, keep simple text on the same line as its opening tag: `<Button>Text</Button>`. A line break turns the text into a paragraph.
- Section order: Usage, Anatomy, Props, Variants, Sizes, States, Examples, Accessibility.
- Examples show a real use, named for it ("Destructive confirmation", not "Red button"), and work when pasted into an app.
- Short pages. Less is more.

## Checks

Run from `packages/kookie-ui`:

- `pnpm lint` (eslint, stylelint, `tsc --noEmit`)
- `pnpm test` (about two minutes; needs Playwright's Chromium)
- `pnpm --filter bench bench` from the root. Sizes and counts fail on any increase. Re-record on purpose, from CI's numbers.

A fix that changes server markup gets a case in `tests/ssr/server-markup.test.tsx`.

## Releasing

1. A pull request with one commit per change, the version bumped in `packages/kookie-ui/package.json`, an entry in `packages/kookie-ui/CHANGELOG.md`, and an entry in `WHATS_NEW.md` and its copy at `apps/docs/app/whats-new/content.mdx`.
2. Merge, then push the tag `v<version>`. The publish workflow checks the tag, the version and the changelog, then publishes.
3. Port the same change to `wompxyz/kookie-ui`, merge, and tag it there.

Nothing publishes on a push to main.

## Writing

- The docs never name another design system to put it down.
- Womp's product decisions do not appear in this repo. It is public and Womp's app is not.
- A change to how docs pages render goes in `apps/docs/components/blocks/`, never in one page.
