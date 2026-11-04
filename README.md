# Womp UI

[![Alpha](https://img.shields.io/badge/alpha-blue)](https://github.com/KushagraDhawan1997/kookie-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@kushagradhawan/kookie-ui)](https://www.npmjs.com/package/@kushagradhawan/kookie-ui)

Womp UI is the design system for the Womp 3D interface, and I maintain it. Every
screen in Womp comes from it. When the interface must change, I change the design system and release a
new version, and the app then moves to that version. Because of this, consistency is in the
design system and not in the memory of each engineer. The documentation is at
[womp-ui.kookie.design](https://womp-ui.kookie.design).

It started as a fork of Radix Themes, and it now moves to Base UI one component at a time.

## What's Different from Radix Themes

Womp UI extends Radix Themes with:

- **Shell architecture** — Complete layout engine with 7 slots (Header, Rail, Panel, Sidebar, Content, Inspector, Bottom), responsive presentation modes, and resize handles
- **Navbar component** — Semantic slots for logo, navigation, and actions with fixed/sticky/static positioning
- **Built-in tooltip support** — Native `tooltip` prop on Button, including `iconOnly` eliminates wrapper components
- **Enhanced accessibility** — RTL layout support, Windows High Contrast mode, and no motion beyond busy indicators
- **Raised effects** — 3D depth on raised buttons

Womp UI started from Radix Themes, and its API has since diverged. Check the changelog before moving code across.

## Philosophy

Womp UI is intentionally boring. It doesn't try to reinvent interface design or compete with design trends. Instead, it codifies the non-negotiables: spacing systems, semantic colors, accessible defaults, and interaction rules that behave consistently.

The idea is simple: once the basics are solid, teams can focus on the parts of the product that actually make it unique. Patterns handle the baseline, components enforce the patterns, and the rest of your product can grow without carrying that overhead.

The result isn't magic or perfection. It's a foundation you can trust just enough to spend your energy on higher-level problems.

## What's Included

Womp UI includes the same foundations you'd expect — spacing tokens and color tokens — but rebuilt systematically. On top of that, it ships with components that apply those rules consistently, so teams don't have to remember them case by case.

- **Size steps** shared by controls, so `size="2"` means the same height across them
- **Shell architecture** with structural patterns for sidebars, panels, and toolbars that actually work together
- **Solid surfaces** everywhere: no translucency or backdrop blur
- **Consistent sizing** where cards, buttons, dropdowns, selects, and avatars all follow the same scale
- **Enhanced accessibility** with native tooltip support and stricter aria-label enforcement

## Components

Each documented component has a page at [womp-ui.kookie.design/docs](https://womp-ui.kookie.design/docs), with chapters on colour, typography, radius and depth.

For larger patterns such as code blocks, documentation layouts, and marketing sections, see [Blocks](https://womp-ui.kookie.design/docs/blocks). Blocks are copy-paste source, not a package: copy the files into your project and change them freely.

## Quick Start

```bash
npm install @kushagradhawan/kookie-ui
```

```tsx
import '@kushagradhawan/kookie-ui/styles.css';
import { Theme, Button, Card, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function App() {
  return (
    <Theme accentColor="blue" grayColor="gray">
      <Card size="3" variant="soft">
        <Flex direction="column" gap="3" p="4">
          <Text size="3">Welcome to Womp UI</Text>
          <Button size="3" variant="solid">
            Get Started
          </Button>
        </Flex>
      </Card>
    </Theme>
  );
}
```

## Documentation

Visit [womp-ui.kookie.design](https://womp-ui.kookie.design) for full documentation, including installation guides, component APIs, and theming.

## Requirements

- React 19
- Node.js 16+ (for development)
- TypeScript support built-in

## Development

This is a monorepo managed with [Turbo](https://turbo.build/) and [pnpm](https://pnpm.io/).

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build all packages
pnpm build

# Run documentation site
pnpm docs
```

## License

MIT © [Kushagra Dhawan](https://github.com/KushagraDhawan1997)

## Status

⚠️ **Alpha** - Womp UI is in alpha. Components and APIs are still evolving, and breaking changes may happen. Check changelogs carefully before upgrading.
