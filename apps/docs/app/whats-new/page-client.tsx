'use client';

import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Chip } from '@kushagradhawan/kookie-ui';
import { SiteDocsPage } from '@/components/site-docs-page';
import { createMarkdownComponents } from '@/components/blocks/markdown/markdown';
import ContentMDX from './content.mdx';
import type { DocMetadata } from '@/lib/frontmatter';

interface PageClientProps {
  metadata?: DocMetadata;
}

// Built once, like the site's own renderers, so the page does not remount on every update.
const { code: MarkdownCode } = createMarkdownComponents();
const TIERS = new Set(['Major', 'Minor', 'Quiet']);

/** rehype-pretty-code wraps inline code in line spans, so the word is read from the whole tree. */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

/** The tier words before each item render as a chip; any other inline code renders as usual. */
function TierCode(props: ComponentPropsWithoutRef<'code'>) {
  const text = textOf(props.children).trim();
  if (TIERS.has(text)) {
    return (
      <Chip size="1" variant="soft" color="gray">
        {text}
      </Chip>
    );
  }
  if (!MarkdownCode || typeof MarkdownCode === 'string') return <code {...props} />;
  return <MarkdownCode {...props} />;
}

const components = { code: TierCode };

export default function PageClient({ metadata }: PageClientProps) {
  return (
    <SiteDocsPage meta={metadata}>
      <ContentMDX components={components} />
    </SiteDocsPage>
  );
}
