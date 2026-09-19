import * as React from 'react';
import type { Components } from 'react-markdown';
import { Blockquote, Code, Em, Heading, Link, Separator, Table, Text } from '@kushagradhawan/kookie-ui';
import { CodeBlock, useCodeBlockContext } from '../code-block/code-block';
import './markdown.css';

/* -------------------------------------------------------------------------------------------------
 * MarkdownContent — owns the vertical rhythm
 * -----------------------------------------------------------------------------------------------*/

export interface MarkdownContentProps extends React.ComponentPropsWithoutRef<'div'> {
  /** `spacious` for articles and docs, `compact` for chat. @default "spacious" */
  spacing?: 'compact' | 'spacious';
}

/**
 * Wrap rendered markdown in this. It sets the text size and every gap between blocks, so the
 * element renderers carry no margins and any component you drop into MDX spaces correctly.
 */
export function MarkdownContent({ spacing = 'spacious', className, ...props }: MarkdownContentProps) {
  return <div className={className ? `markdown ${className}` : 'markdown'} data-spacing={spacing} {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * Element renderers
 * -----------------------------------------------------------------------------------------------*/

export interface MarkdownComponentOptions {
  /** Collapse long fenced code behind "Show more". @default true */
  codeBlockCollapsible?: boolean;
  /** Render images with your own component, e.g. `next/image`. */
  imageComponent?: (props: { src: string; alt: string; width?: string; height?: string }) => React.ReactNode;
  /** Render links that start with `/` or `#` with your router's link, e.g. `next/link`. */
  linkComponent?: React.ComponentType<{ href: string; children?: React.ReactNode }>;
}

type ChildrenProps = { children?: React.ReactNode };
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const HEADING_SIZES: Record<HeadingLevel, '8' | '7' | '5' | '4' | '3' | '2'> = {
  h1: '8',
  h2: '7',
  h3: '5',
  h4: '4',
  h5: '3',
  h6: '2',
};

function languageFromClassName(className?: string): string | undefined {
  return className?.match(/language-([\w-]+)/i)?.[1];
}

function textFromChildren(children?: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map((child) => (typeof child === 'string' ? child : '')).join('');
  return '';
}

function createHeading(level: HeadingLevel) {
  function MarkdownHeading({ id, children }: { id?: string; children?: React.ReactNode }) {
    return (
      <Heading as={level} size={HEADING_SIZES[level]} weight="medium" id={id} className="markdown-heading">
        {children}
        {/* The "#" is drawn in CSS so it stays out of the heading's text. */}
        {id && <a className="markdown-heading-anchor" href={`#${id}`} aria-label="Link to this section" />}
      </Heading>
    );
  }
  MarkdownHeading.displayName = `Markdown.${level}`;
  return MarkdownHeading;
}

/**
 * Maps markdown elements to Kookie UI components. Works with react-markdown's `components` prop
 * and with MDX's `useMDXComponents`, including code highlighted at build time by
 * rehype-pretty-code. Render the output inside `MarkdownContent`.
 */
export function createMarkdownComponents(options: MarkdownComponentOptions = {}): Components {
  const { codeBlockCollapsible = true, imageComponent, linkComponent: RouterLink } = options;

  function MarkdownCode({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) {
    const isInsideCodeBlock = useCodeBlockContext();
    // Build-time highlighted: the code element already carries its markup, keep it intact.
    if (isInsideCodeBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    const language = languageFromClassName(className);
    const text = textFromChildren(children);
    // Fenced code has a language or spans lines; everything else is inline.
    if (language || text.includes('\n')) {
      return (
        <CodeBlock code={text.replace(/\n$/, '')} language={language ?? 'text'} collapsible={codeBlockCollapsible} />
      );
    }

    return <Code variant="soft">{children}</Code>;
  }

  function MarkdownPre({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) {
    const isHighlighted = 'data-language' in props || 'data-theme' in props;
    // react-markdown: `code` renders the whole block, so `pre` steps aside.
    if (!isHighlighted) return <>{children}</>;
    return (
      <CodeBlock collapsible={codeBlockCollapsible}>
        <pre {...props}>{children}</pre>
      </CodeBlock>
    );
  }

  function MarkdownLink({ href = '', children }: { href?: string; children?: React.ReactNode }) {
    const isInternal = href.startsWith('/') || href.startsWith('#');
    if (isInternal && RouterLink) {
      return (
        <Link asChild underline="always">
          <RouterLink href={href}>{children}</RouterLink>
        </Link>
      );
    }
    const external = /^https?:\/\//.test(href);
    return (
      <Link href={href} underline="always" {...(external && { target: '_blank', rel: 'noreferrer' })}>
        {children}
      </Link>
    );
  }

  return {
    h1: createHeading('h1'),
    h2: createHeading('h2'),
    h3: createHeading('h3'),
    h4: createHeading('h4'),
    h5: createHeading('h5'),
    h6: createHeading('h6'),

    p: ({ children }: ChildrenProps) => <Text as="p">{children}</Text>,
    a: MarkdownLink,
    // Medium, not bold: bold reads too heavy next to body text.
    strong: ({ children }: ChildrenProps) => <Text weight="medium">{children}</Text>,
    em: ({ children }: ChildrenProps) => <Em>{children}</Em>,

    code: MarkdownCode,
    pre: MarkdownPre,
    // rehype-pretty-code wraps each block in a figure; drop it so the block sits in the rhythm.
    figure: ({ children, ...props }: React.ComponentPropsWithoutRef<'figure'>) =>
      'data-rehype-pretty-code-figure' in props ? <>{children}</> : <figure {...props}>{children}</figure>,

    ul: ({ children }: ChildrenProps) => <ul>{children}</ul>,
    ol: ({ children }: ChildrenProps) => <ol>{children}</ol>,
    li: ({ children }: ChildrenProps) => <li>{children}</li>,

    blockquote: ({ children }: ChildrenProps) => <Blockquote>{children}</Blockquote>,
    hr: () => <Separator size="4" />,

    table: ({ children }: ChildrenProps) => (
      <Table.Root size="2" variant="ghost" className="markdown-table">
        {children}
      </Table.Root>
    ),
    thead: ({ children }: ChildrenProps) => <Table.Header>{children}</Table.Header>,
    tbody: ({ children }: ChildrenProps) => <Table.Body>{children}</Table.Body>,
    tr: ({ children }: ChildrenProps) => <Table.Row>{children}</Table.Row>,
    th: ({ children }: ChildrenProps) => <Table.ColumnHeaderCell>{children}</Table.ColumnHeaderCell>,
    td: ({ children }: ChildrenProps) => <Table.Cell>{children}</Table.Cell>,

    img: ({ src, alt, width, height }: React.ImgHTMLAttributes<HTMLImageElement>) => {
      if (typeof src !== 'string' || !src) return null;
      const image = { src, alt: alt ?? '', width: width ? String(width) : undefined, height: height ? String(height) : undefined };
      return imageComponent ? imageComponent(image) : <img {...image} />;
    },
  };
}
