'use client';

import * as React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import hardenReactMarkdown from 'harden-react-markdown';
import { Box, Flex } from '@kushagradhawan/kookie-ui';
import { createMarkdownComponents, type MarkdownComponentOptions } from '../markdown/markdown';
import { completeUnterminatedMarkdown, parseMarkdownIntoBlocks } from './complete-markdown';

const HardenedMarkdown = hardenReactMarkdown(ReactMarkdown);

const LINK_PREFIXES = ['https://', 'http://', '/'];
const IMAGE_PREFIXES = ['https://', 'http://', '/', 'data:'];
const ALLOWED_PROTOCOLS = ['mailto:', 'tel:', 'data:', 'http:', 'https:'];
const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw];

export type StreamingMarkdownOptions = MarkdownComponentOptions & {
  /** Origin used to resolve and validate relative links and images. Defaults to the page origin. */
  defaultOrigin?: string;
  /** Memoize each top-level block so only the growing tail re-renders. Needs `blockParser`. @default true */
  enableBlockMemoization?: boolean;
  /** Splits content into blocks, e.g. `(md) => marked.lexer(md, { gfm: true })`. */
  blockParser?: (content: string) => Array<{ raw?: string }>;
  /** Override individual element renderers. */
  components?: Partial<Components>;
};

export interface StreamingMarkdownProps {
  /** Markdown so far. Incomplete syntax at the end is closed before parsing. */
  content: string;
  /** Stable id for this message, used in block keys. */
  id: string;
  options?: StreamingMarkdownOptions;
}

function resolveOrigin(customOrigin?: string): string {
  if (customOrigin) return customOrigin;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost';
}

type MarkdownBlockProps = {
  content: string;
  defaultOrigin: string;
  components: Components;
};

const MarkdownBlock = React.memo(function MarkdownBlock({ content, defaultOrigin, components }: MarkdownBlockProps) {
  return (
    <Box width="100%">
      <HardenedMarkdown
        defaultOrigin={defaultOrigin}
        allowedLinkPrefixes={LINK_PREFIXES}
        allowedImagePrefixes={IMAGE_PREFIXES}
        allowedProtocols={ALLOWED_PROTOCOLS}
        allowDataImages
        components={components}
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
      >
        {content}
      </HardenedMarkdown>
    </Box>
  );
});

const EMPTY_OPTIONS: StreamingMarkdownOptions = {};

/**
 * Markdown renderer for AI responses that arrive token by token. Closes unfinished syntax,
 * memoizes finished blocks, and only allows safe link and image targets.
 */
export function StreamingMarkdown({ content, id, options = EMPTY_OPTIONS }: StreamingMarkdownProps) {
  const {
    defaultOrigin: customOrigin,
    enableBlockMemoization = true,
    blockParser,
    components: customComponents,
    codeBlockCollapsible = false,
    imageComponent,
    inlineCodeHighContrast = true,
    spacing = 'spacious',
  } = options;

  const defaultOrigin = resolveOrigin(customOrigin);

  // Primitive deps, so an inline `options` object does not rebuild every renderer.
  const components = React.useMemo(
    () => ({
      ...createMarkdownComponents({ codeBlockCollapsible, imageComponent, inlineCodeHighContrast, spacing }),
      ...customComponents,
    }),
    [codeBlockCollapsible, imageComponent, inlineCodeHighContrast, spacing, customComponents],
  );

  const blocks = React.useMemo(() => {
    if (enableBlockMemoization && blockParser) return parseMarkdownIntoBlocks(content, blockParser);
    const completed = completeUnterminatedMarkdown(content);
    return completed.trim() ? [completed] : [];
  }, [content, enableBlockMemoization, blockParser]);

  if (blocks.length === 0) return null;

  if (blocks.length === 1) {
    return <MarkdownBlock content={blocks[0]} defaultOrigin={defaultOrigin} components={components} />;
  }

  return (
    <Flex direction="column" gap="2" width="100%">
      {blocks.map((block, index) => (
        <MarkdownBlock key={`${id}-${index}`} content={block} defaultOrigin={defaultOrigin} components={components} />
      ))}
    </Flex>
  );
}
