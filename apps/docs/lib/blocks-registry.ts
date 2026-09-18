/**
 * Every block in `components/blocks`. Drives the sidebar group and the installation section on
 * each block page. Kookie UI is implied and not listed.
 */
export interface BlockEntry {
  slug: string;
  title: string;
  /** npm packages the block imports directly. */
  dependencies: string[];
  /** Other blocks it imports from. */
  blocks: string[];
}

const HUGEICONS = ['@hugeicons/react', '@hugeicons/core-free-icons'];

export const blocksRegistry: BlockEntry[] = [
  { slug: 'code-block', title: 'Code Block', dependencies: ['shiki', ...HUGEICONS], blocks: [] },
  { slug: 'preview-block', title: 'Preview Block', dependencies: HUGEICONS, blocks: ['code-block'] },
  { slug: 'markdown', title: 'Markdown', dependencies: ['react-markdown'], blocks: ['code-block'] },
  {
    slug: 'streaming-markdown',
    title: 'Streaming Markdown',
    dependencies: ['react-markdown', 'remark-gfm', 'rehype-raw', 'harden-react-markdown'],
    blocks: ['markdown'],
  },
  { slug: 'docs-shell', title: 'Docs Shell', dependencies: HUGEICONS, blocks: [] },
  { slug: 'docs-page', title: 'Docs Page', dependencies: HUGEICONS, blocks: ['page-header'] },
  { slug: 'table-of-contents', title: 'Table of Contents', dependencies: [], blocks: [] },
  { slug: 'page-header', title: 'Page Header', dependencies: [], blocks: [] },
  { slug: 'section-header', title: 'Section Header', dependencies: [], blocks: [] },
  { slug: 'hero', title: 'Hero', dependencies: [], blocks: [] },
  { slug: 'footer', title: 'Footer', dependencies: [], blocks: [] },
  { slug: 'testimonial', title: 'Testimonial', dependencies: [], blocks: [] },
  { slug: 'empty-state', title: 'Empty State', dependencies: [], blocks: [] },
];

export function getBlockEntry(slug: string): BlockEntry | undefined {
  return blocksRegistry.find((entry) => entry.slug === slug);
}

/** The block's required blocks, including their requirements, nearest first. */
export function getRequiredBlocks(slug: string): BlockEntry[] {
  const seen = new Set<string>();
  const result: BlockEntry[] = [];
  const visit = (current: string) => {
    for (const required of getBlockEntry(current)?.blocks ?? []) {
      if (seen.has(required)) continue;
      seen.add(required);
      const entry = getBlockEntry(required);
      if (entry) result.push(entry);
      visit(required);
    }
  };
  visit(slug);
  return result;
}

/** npm packages for the block and everything it requires. */
export function getAllDependencies(slug: string): string[] {
  const entries = [getBlockEntry(slug), ...getRequiredBlocks(slug)];
  return [...new Set(entries.flatMap((entry) => entry?.dependencies ?? []))];
}
