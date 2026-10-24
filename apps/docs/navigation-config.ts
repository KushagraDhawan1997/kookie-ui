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
          href: '/docs/accordion',
          title: 'Accordion',
        },
        {
          href: '/docs/alert-dialog',
          title: 'Alert Dialog',
        },
        {
          href: '/docs/avatar',
          title: 'Avatar',
        },
        {
          href: '/docs/blockquote',
          title: 'Blockquote',
        },
        {
          href: '/docs/box',
          title: 'Box',
        },
        {
          href: '/docs/button',
          title: 'Button',
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
          href: '/docs/checkbox',
          title: 'Checkbox',
        },
        {
          href: '/docs/chip',
          title: 'Chip',
        },
        {
          href: '/docs/code',
          title: 'Code',
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
          href: '/docs/dialog',
          title: 'Dialog',
        },
        {
          href: '/docs/dropdown-menu',
          title: 'Dropdown Menu',
        },
        {
          href: '/docs/flex',
          title: 'Flex',
        },
        {
          href: '/docs/grid',
          title: 'Grid',
        },
        {
          href: '/docs/heading',
          title: 'Heading',
        },
        {
          href: '/docs/image',
          title: 'Image',
        },
        {
          href: '/docs/kbd',
          title: 'Kbd',
        },
        {
          href: '/docs/link',
          title: 'Link',
        },
        {
          href: '/docs/message-scroller',
          title: 'Message Scroller',
        },
        {
          href: '/docs/navbar',
          title: 'Navbar',
        },
        {
          href: '/docs/notice',
          title: 'Notice',
        },
        {
          href: '/docs/popover',
          title: 'Popover',
        },
        {
          href: '/docs/progress',
          title: 'Progress',
        },
        {
          href: '/docs/radio-group',
          title: 'Radio Group',
        },
        {
          href: '/docs/scroll-area',
          title: 'Scroll Area',
        },
        {
          href: '/docs/segmented-control',
          title: 'Segmented Control',
        },
        {
          href: '/docs/select',
          title: 'Select',
        },
        {
          href: '/docs/separator',
          title: 'Separator',
        },
        {
          href: '/docs/sheet',
          title: 'Sheet',
        },
        {
          href: '/docs/shell',
          title: 'Shell',
        },
        {
          href: '/docs/sidebar',
          title: 'Sidebar',
        },
        {
          href: '/docs/slider',
          title: 'Slider',
        },
        {
          href: '/docs/spinner',
          title: 'Spinner',
        },
        {
          href: '/docs/switch',
          title: 'Switch',
        },
        {
          href: '/docs/table',
          title: 'Table',
        },
        {
          href: '/docs/tabs',
          title: 'Tabs',
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
          href: '/docs/toggle',
          title: 'Toggle',
        },
        {
          href: '/docs/toolbar',
          title: 'Toolbar',
        },
        {
          href: '/docs/tooltip',
          title: 'Tooltip',
        },
        {
          href: '/docs/virtual-menu',
          title: 'Virtual Menu',
        },
        {
          href: '/docs/utilities',
          title: 'Utilities',
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
