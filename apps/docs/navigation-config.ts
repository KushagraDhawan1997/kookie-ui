import type { DocsNavigationConfig } from '@/components/blocks/docs-shell/types';
import { blocksRegistry } from '@/lib/blocks-registry';
import { SECTIONS, chaptersIn } from '@/lib/chapters';

/** Chapters come from the registry in `lib/chapters.ts`. Components and Blocks are listed here. */
export const docsNavigation: DocsNavigationConfig = {
  groups: [
    ...SECTIONS.map((section) => ({
      label: section.title,
      items: chaptersIn(section.id).map((chapter) => ({ href: `/${chapter.slug}`, title: chapter.title })),
    })),
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
          href: '/docs/context-menu',
          title: 'Context Menu',
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
