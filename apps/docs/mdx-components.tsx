import type { MDXComponents } from 'mdx/types';
import NextLink from 'next/link';
import { CodeBlock } from '@/components/blocks/code-block/code-block';
import { MarkdownContent, createMarkdownComponents } from '@/components/blocks/markdown/markdown';
import { SpecsBlock } from './components/specs-block';

// Built once: renderers created during render would remount the whole page on every update.
const markdownComponents = createMarkdownComponents({ linkComponent: NextLink });

const siteComponents: MDXComponents = {
  ...(markdownComponents as MDXComponents),
  // Every MDX page renders inside this, so the markdown rhythm applies to all of them.
  wrapper: ({ children }) => <MarkdownContent>{children}</MarkdownContent>,
  CodeBlock,
  SpecsBlock,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...siteComponents, ...components };
}
