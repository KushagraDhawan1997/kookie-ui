# @kushagradhawan/kookie-ui

> A modern React component library with beautiful design tokens, flexible theming, and comprehensive documentation.

[![npm version](https://img.shields.io/npm/v/@kushagradhawan/kookie-ui)](https://www.npmjs.com/package/@kushagradhawan/kookie-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Alpha](https://img.shields.io/badge/alpha-blue)](https://github.com/KushagraDhawan1997/kookie-ui)

## Installation

```bash
npm install @kushagradhawan/kookie-ui
# or
pnpm add @kushagradhawan/kookie-ui
# or
yarn add @kushagradhawan/kookie-ui
```

## Quick Start

```tsx
import '@kushagradhawan/kookie-ui/styles.css';
import { Theme, Button, Card, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function App() {
  return (
    <Theme accentColor="blue" grayColor="gray">
      <Card size="3" variant="soft">
        <Flex direction="column" gap="3" p="4">
          <Text size="3">Welcome to Kookie UI</Text>
          <Button size="3" variant="solid">
            Get Started
          </Button>
        </Flex>
      </Card>
    </Theme>
  );
}
```

Kookie ships no webfonts: `styles.css` defaults to system stacks so the install costs zero font
requests. Add `import '@kushagradhawan/kookie-ui/fonts.css';` for Kookie's own typefaces (Inter, Inter
Tight, JetBrains Mono, Playfair Display), or point `--font-sans` / `--font-mono` / `--font-serif` at fonts you
already load.

## What is Kookie UI?

Kookie UI is a fork of [Radix Themes](https://radix-ui.com/themes) that extends it into a full design system. While Radix provided excellent building blocks, Kookie UI codifies the patterns and rules that make interfaces feel consistent and systematic.

`MessageScroller` is Kookie's surface over shadcn/ui's [Message Scroller](https://ui.shadcn.com) primitive (`@shadcn/react`, MIT); the scrolling behaviour is shadcn's.

Everything it borrows and builds on is named in [CREDITS.md](./CREDITS.md).

### Key Features

- **Systematic Design Tokens** - A twelve-step spacing scale, with corners and shadows set by role (control, surface, overlay)
- **Solid surfaces** - Every surface is solid; there is no translucency or backdrop blur
- **Shared Size Steps** - Controls share one set of size steps
- **No motion** - State changes are instant; only busy indicators move
- **Enhanced Accessibility** - Native tooltip support, stricter aria-label enforcement, and improved keyboard navigation
- **Layout Patterns** - Shells, sidebars, panels, and toolbars that work together predictably

## Framework Support

### Next.js (App Router)

Next.js 15 or later, the first version that supports React 19. `Theme` is already a Client Component, so the layout can stay a Server Component.

```tsx
// app/layout.tsx
import '@kushagradhawan/kookie-ui/styles.css';
import { Theme } from '@kushagradhawan/kookie-ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Theme accentColor="blue" grayColor="gray">
          {children}
        </Theme>
      </body>
    </html>
  );
}
```

### Next.js (Pages Router)

```tsx
// pages/_app.tsx
import '@kushagradhawan/kookie-ui/styles.css';
import { Theme } from '@kushagradhawan/kookie-ui';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Theme accentColor="blue" grayColor="gray">
      <Component {...pageProps} />
    </Theme>
  );
}
```

### Vite + React

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@kushagradhawan/kookie-ui/styles.css';
import { Theme } from '@kushagradhawan/kookie-ui';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Theme accentColor="blue" grayColor="gray">
      <App />
    </Theme>
  </React.StrictMode>,
);
```

### Remix

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts } from '@remix-run/react';
import { LinksFunction } from '@remix-run/node';
import { Theme } from '@kushagradhawan/kookie-ui';
import styles from '@kushagradhawan/kookie-ui/styles.css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export default function App() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Theme accentColor="blue" grayColor="gray">
          <Outlet />
        </Theme>
        <Scripts />
      </body>
    </html>
  );
}
```

### Gatsby

```tsx
// gatsby-browser.js and gatsby-ssr.js
import '@kushagradhawan/kookie-ui/styles.css';
import { Theme } from '@kushagradhawan/kookie-ui';

export const wrapRootElement = ({ element }) => (
  <Theme accentColor="blue" grayColor="gray">
    {element}
  </Theme>
);
```

## CSS Imports

### Complete Stylesheet

```tsx
import '@kushagradhawan/kookie-ui/styles.css';
```

### Modular Imports

```tsx
import '@kushagradhawan/kookie-ui/tokens.css'; // Design tokens
import '@kushagradhawan/kookie-ui/components.css'; // Component styles
import '@kushagradhawan/kookie-ui/utilities.css'; // Utility classes
import '@kushagradhawan/kookie-ui/layout.css'; // Layout utilities
```

## Requirements

- React 19
- Node.js 22+ (for development)
- TypeScript support built-in

```json
{
  "peerDependencies": {
    "react": "^19.0",
    "react-dom": "^19.0"
  }
}
```

## Components

Each has a page at [womp-ui.kookie.design/docs](https://womp-ui.kookie.design/docs).

### App frame and navigation

- `Shell` - The app frame: header, rail, panel, sidebar, content, inspector and bottom pane
- `Sidebar` - The rows, groups and search inside a Shell pane
- `Navbar` - A bar across the top of a site
- `Page` - A screen's large title, which moves into the pane's band on scroll
- `Navigator` - A stack of screens with a way back
- `Tabs` - Switch between sibling views
- `Link` - A link

### Actions

- `Button` - Starts an action; `iconOnly` for an icon
- `Toggle` - Pressed or not
- `Toolbar` - A row of actions with one tab stop
- `DropdownMenu` - A menu from a button
- `ContextMenu` - A menu from a right-click
- `Command` - A command palette

### Choosing and entering

- `TextField`, `TextArea` - Text input
- `Select` - Pick one from a list
- `Combobox` - Pick one from a list you can search
- `Checkbox`, `CheckboxGroup` - Pick any
- `Radio`, `RadioGroup` - Pick one
- `SegmentedControl` - Pick one of a few, all in view
- `Switch` - On or off
- `Slider` - A value in a range

### Showing

- `Card` - A surface that holds content
- `Table` - Rows and columns
- `VirtualMenu` - A long list that draws only the rows in view
- `Accordion` - Sections that open and close
- `Avatar` - A person or thing, as a picture or initials
- `Image` - A picture
- `Chip` - A short label
- `Text`, `Heading`, `Code`, `Kbd`, `Blockquote` - Type

### Status

- `Notice`, `Confirmation` - A message about a condition, or a question that waits
- `Progress` - How far along something is
- `Spinner` - Something is happening
- `Tooltip` - A label on hover or focus

### Over the page

- `Dialog` - A panel over a dimmed app
- `AlertDialog` - A choice that must be made first
- `Sheet` - A panel from an edge
- `Popover` - A small panel anchored to a control

### Chat

- `Chatbar` - The composer: text, attachments and actions
- `MessageScroller` - A transcript that follows the newest message

### Layout

- `Box`, `Flex`, `Grid` - Layout primitives
- `ScrollArea` - A scroller with styled scrollbars
- `Separator` - A line between things

## Theming

Kookie UI uses a comprehensive theming system with:

- **Accent Colors** - Primary brand colors (blue, green, orange, etc.)
- **Gray Colors** - Neutral color scales (gray, mauve, slate, etc.)
- **Size Scales** - Consistent sizing across components
- **Spacing System** - A twelve-step spacing scale
- **Typography** - Font scales and weights
- **Dark Mode** - Light and dark, with a script that follows the system setting before the first paint

## Status

⚠️ **Alpha** - Kookie UI is in alpha. Components and APIs are still evolving, and breaking changes may happen. Check changelogs carefully before upgrading.

> Note: This package uses npm Trusted Publishing with OIDC for secure CI/CD deployments.

## License

MIT © [Kushagra Dhawan](https://github.com/KushagraDhawan1997)

## Links

- [Documentation](https://womp-ui.kookie.design)
- [GitHub Repository](https://github.com/KushagraDhawan1997/kookie-ui)
- [Issue Tracker](https://github.com/KushagraDhawan1997/kookie-ui/issues)

---
