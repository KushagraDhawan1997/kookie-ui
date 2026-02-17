# AGENTS.md — Kookie UI

> Context file for AI agents working in this repository.

## Project Overview

**Kookie UI** (`@kushagradhawan/kookie-ui`) is a modern React component library built as a fork of [Radix Themes](https://www.radix-ui.com/themes). It extends Radix with a complete layout engine, universal material system, enhanced design tokens, and specialized components not available in upstream Radix.

- **Package name:** `@kushagradhawan/kookie-ui`
- **Current version:** 0.x (check `packages/kookie-ui/package.json` for exact version)
- **License:** MIT
- **Status:** Alpha — breaking changes may occur
- **Documentation:** https://kookie-ui.vercel.app

## Documentation

The docs site is part of this monorepo at `apps/docs/` (Next.js App Router + MDX). Key sections:

- **Component docs:** `/docs/<component-name>` (e.g., `/docs/button`, `/docs/shell`)
- **Theming:** `/docs/theme`, `/docs/colors`, `/docs/radius`, `/docs/shadows`
- **Tokens:** `/docs/constants`, `/docs/typography`

When you need to understand a component's API or usage patterns, **read the MDX content files** at `apps/docs/app/docs/<component>/content.mdx` rather than guessing.

## Repository Structure

This is a **pnpm monorepo** managed with **Turborepo**.

```
kookie-ui/
├── packages/
│   └── kookie-ui/                     # The core library (published as @kushagradhawan/kookie-ui)
│       ├── src/
│       │   ├── components/            # All component source files
│       │   │   ├── _internal/         # Shared base components (not exported)
│       │   │   ├── *.tsx              # Component implementations
│       │   │   ├── *.props.tsx        # Component prop definitions
│       │   │   ├── *.css              # Component styles
│       │   │   └── index.tsx          # Public component exports
│       │   ├── helpers/               # Utility functions (prop extraction, responsive styles, etc.)
│       │   ├── hooks/                 # Custom React hooks (useBreakpoint, useToggleState, etc.)
│       │   ├── props/                 # Shared prop definitions (color, margin, layout, radius, etc.)
│       │   ├── styles/
│       │   │   ├── tokens/            # Design tokens (colors, typography, radius, shadow, blur, opacity)
│       │   │   └── utilities/         # CSS utility classes (layout, typography)
│       │   └── index.ts               # Package entry point
│       ├── schemas/                   # Generated JSON schemas (Zod → JSON Schema)
│       ├── scripts/                   # Build scripts (esbuild CJS/ESM, schema generation, release)
│       ├── tests/                     # Vitest tests (component + CSS)
│       ├── postcss.config.cjs         # PostCSS config with custom plugins
│       ├── vitest.config.ts
│       ├── tsconfig.json
│       └── package.json
├── apps/
│   └── docs/                          # Next.js documentation site
│       ├── app/docs/                  # MDX content pages
│       ├── app/playground/            # Interactive component playgrounds
│       ├── app/ui-test/               # UI test pages
│       ├── components/                # Reusable doc components
│       ├── lib/                       # Doc utilities (SEO, OG images, structured data)
│       └── navigation-config.ts       # Sidebar navigation structure
├── .github/
│   └── workflows/
│       └── publish.yml                # Auto-publish to npm on release or main push
├── CLAUDE.md                          # Coding conventions and guidelines
├── package.json                       # Root monorepo config
├── pnpm-workspace.yaml
└── turbo.json
```

## Tech Stack

| Concern                | Tool                                                       |
| ---------------------- | ---------------------------------------------------------- |
| Package manager        | pnpm 10 (see `package.json` `packageManager` field)        |
| Node version           | 22 (see `.nvmrc`)                                          |
| Monorepo orchestration | Turborepo                                                  |
| Language               | TypeScript (strict)                                        |
| Framework              | React 19 (peer deps support 16.8+, 17, 18, 19)            |
| JS bundler             | esbuild (dual CJS + ESM output)                            |
| CSS processing         | PostCSS (nesting, custom-media, breakpoints, autoprefixer) |
| Linting                | ESLint 9 (flat config), Stylelint                          |
| Formatting             | Prettier (single quotes, 200 print width)                  |
| Testing                | Vitest + React Testing Library                             |
| Docs site              | Next.js 15 (App Router) + MDX                              |
| Deployment             | Vercel                                                     |

## Key Commands

Run all commands from the **repository root** unless stated otherwise:

```bash
# Install dependencies
pnpm install

# Start development (library watch + docs site)
pnpm dev

# Run only the docs site
pnpm docs

# Build the library
pnpm build

# Build only the kookie-ui package
pnpm build:pkg

# Lint everything
pnpm lint

# Clean all build artifacts
pnpm clean
```

**Inside `packages/kookie-ui/`:**

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate JSON schemas from Zod definitions
pnpm build:schemas

# Release (patch/minor/major)
pnpm release:patch
pnpm release:minor
pnpm release:major
```

## Component Architecture

### File Convention

Each component typically consists of three co-located files:

- **`component-name.tsx`** — React component implementation
- **`component-name.props.tsx`** — Prop type definitions and default values
- **`component-name.css`** — Component styles using CSS custom properties and data attributes

Internal/shared base components live in `src/components/_internal/` and are not publicly exported.

### Styling Approach

- Components use **CSS custom properties** (CSS variables) for theming
- Design tokens are defined in `src/styles/tokens/` (colors, typography, radius, shadow, blur, opacity, space)
- Responsive props use breakpoint-based classes generated via a custom PostCSS plugin (`postcss-breakpoints.cjs`)
- Layout utility classes are generated from `src/styles/utilities/`
- The `Theme` component wraps the app and provides theming context (appearance, accent color, gray color, radius, scaling, material)

### Prop System

- Components use a typed prop definition system in `src/props/prop-def.ts`
- Most visual props support **responsive objects** (e.g., `size={{ initial: '1', md: '3' }}`)
- Breakpoints: `initial`, `xs` (520px), `sm` (768px), `md` (1024px), `lg` (1280px), `xl` (1640px)
- Common shared props: `color`, `highContrast`, `radius`, `variant`, `size`, `weight`, `material`, `asChild`
- Margin props (`m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`) are extracted via `extractMarginProps()`
- Layout props (`p`, `width`, `height`, `position`, etc.) are extracted via `extractProps()`

## Build System

The package produces:

1. **CJS output** → `dist/cjs/` (via esbuild)
2. **ESM output** → `dist/esm/` (via esbuild)
3. **Type declarations** → `dist/cjs/` and `dist/esm/` (via tsc)
4. **JSON schemas** → `schemas/` (via Zod → JSON Schema generation)
5. **CSS output** → multiple CSS files at package root:
   - `styles.css` — Full styles (tokens + components + utilities)
   - `components.css` — Component styles only
   - `utilities.css` — Utility classes only
   - `tokens.css` — Design tokens only
   - `tokens/base.css`, `tokens/colors/*.css` — Granular token files
   - `layout.css`, `layout/*.css` — Layout-only subset

## Features Beyond Radix Themes

### Shell Layout Engine

A 7-slot layout system: Header, Rail, Panel, Sidebar, Content, Inspector, Bottom. Supports responsive presentation modes (`fixed`, `overlay`, `stacked`), pane modes (`expanded`, `collapsed`, `thin`), resize handles with localStorage persistence, and context API for layout state.

### Material System

Theme-level `material` prop for surfaces: `solid`, `translucent` (with backdrop blur), `ghost`. Replaces Radix's limited `panelBackground`. Backed by a 12-step blur token scale.

### Extended Token Systems

- **12-step blur scale** (`--blur-1` through `--blur-12`)
- **9-step opacity scale** (extended from Radix)
- **3D button effects** (shadow depth for button variants)

### Specialized Components

- **Navbar** — Semantic navigation with logo, nav, and action slots
- **Chatbar** — Chat UI input pattern
- **Sidebar** — Alternative layout component with `thin` mode
- **Shell** — Full layout engine (not a simple component)

### Built-in Tooltip Support

Native `tooltip` prop on Button and IconButton eliminates the need for wrapper components.

### JSON Schema Exports

Component prop schemas are auto-generated from Zod definitions and published as JSON Schema files for tooling integration.

## Development Workflow

1. Run `pnpm dev` to start the library in watch mode and the docs site
2. The docs site runs on `http://localhost:2509`
3. **Do NOT run build commands manually** — watchers handle rebuilds automatically
4. Test pages are at `/ui-test/*` and playgrounds at `/playground/*`

## Coding Conventions

- **Prettier** for formatting (single quotes, 200 char width)
- **ESLint** with TypeScript, React Hooks, and jsx-a11y rules
- **Stylelint** for CSS (enforces selector specificity, class naming patterns)
- CSS class names follow the pattern `.rt-ComponentName` (e.g., `.rt-Button`, `.rt-DialogContent`)
- CSS custom properties use `--` prefix namespacing
- Component files use kebab-case naming (e.g., `alert-dialog.tsx`)
- Props files export a `*PropDefs` object defining allowed values and defaults
- Use `classnames` library for conditional class merging
- **No Tailwind** in the component library (docs site uses Tailwind separately)
- **HugeIcons only** — never use other icon libraries in components

See `CLAUDE.md` at the repository root for the full coding conventions and guidelines.

## Release Process

1. Releases are published to npm as `@kushagradhawan/kookie-ui`
2. The `publish.yml` workflow auto-publishes on GitHub release creation or pushes to `main` that touch `packages/kookie-ui/**`
3. On non-release pushes, the version is auto-incremented (patch) before publishing
4. Authentication uses GitHub OIDC for npm registry access

## Important Notes for Agents

- **Do NOT run build commands** — development watchers are already running in the background
- The **docs site** is part of this monorepo at `apps/docs/`, not a separate repository
- Built CSS files at the package root (e.g., `styles.css`, `components.css`) are **gitignored** — they are build artifacts
- The `dist/`, `tokens/`, and `layout/` directories are also gitignored build artifacts
- When modifying a component, update all three files (`.tsx`, `.props.tsx`, `.css`) as needed
- The `Theme` component (`theme.tsx`) is the root provider — all other components must be used within it
- Read `CLAUDE.md` for detailed coding standards including prop usage, component composition, accessibility, and documentation formatting rules
