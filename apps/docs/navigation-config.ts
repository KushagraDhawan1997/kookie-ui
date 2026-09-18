import type { DocsNavigationConfig } from '@/components/blocks/docs-shell/types';
import { blocksRegistry } from '@/lib/blocks-registry';

export const docsNavigation: DocsNavigationConfig = {
  groups: [
    {
      label: 'Get Started',
      items: [{ href: '/docs/installation', title: 'Installation' }],
    },
    {
      label: 'Theme',
      items: [
        { href: '/docs/theme', title: 'Theme' },
        { href: '/docs/colors', title: 'Colors' },
        { href: '/docs/constants', title: 'Constants' },
        { href: '/docs/shadows', title: 'Shadows' },
        { href: '/docs/material', title: 'Material' },
        { href: '/docs/radius', title: 'Radius' },
        { href: '/docs/typography', title: 'Typography' },
      ],
    },
    {
      label: 'Components',
      items: [
        {
          href: '/docs/avatar',
          title: 'Avatar',
        },
        {
          href: '/docs/badge',
          title: 'Badge',
        },
        {
          href: '/docs/button',
          title: 'Button',
        },
        {
          href: '/docs/callout',
          title: 'Callout',
        },
        {
          href: '/docs/card',
          title: 'Card',
        },
        {
          href: '/docs/chatbar',
          title: 'Chatbar',
        },
        {
          href: '/docs/combobox',
          title: 'Combobox',
        },
        {
          href: '/docs/dropdown-menu',
          title: 'Dropdown Menu',
        },
        {
          href: '/docs/heading',
          title: 'Heading',
        },
        {
          href: '/docs/icon-button',
          title: 'Icon Button',
        },
        {
          href: '/docs/image',
          title: 'Image',
        },
        {
          href: '/docs/navbar',
          title: 'Navbar',
        },
        {
          href: '/docs/segmented-control',
          title: 'Segmented Control',
        },
        {
          href: '/docs/shell',
          title: 'Shell',
        },
        {
          href: '/docs/sheet',
          title: 'Sheet',
        },
        {
          href: '/docs/sidebar',
          title: 'Sidebar (Presentation)',
        },
        {
          href: '/docs/text',
          title: 'Text',
        },
        {
          href: '/docs/text-area',
          title: 'Text Area',
        },
        {
          href: '/docs/text-field',
          title: 'Text Field',
        },
        {
          href: '/docs/toggle-button',
          title: 'Toggle Button',
        },
        {
          href: '/docs/toggle-icon-button',
          title: 'Toggle Icon Button',
        },
        {
          href: '/docs/toolbar',
          title: 'Toolbar',
        },
      ],
    },
    {
      label: 'Blocks',
      items: [
        { href: '/docs/blocks', title: 'Overview' },
        ...blocksRegistry.map((block) => ({ href: `/docs/blocks/${block.slug}`, title: block.title })),
      ],
    },
  ],
};
