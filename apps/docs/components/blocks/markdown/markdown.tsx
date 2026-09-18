import * as React from 'react';
import type { Components } from 'react-markdown';
import { Blockquote, Box, Code, Heading, Separator, Table, Text } from '@kushagradhawan/kookie-ui';
import { CodeBlock } from '../code-block/code-block';

export interface MarkdownComponentOptions {
  /** Collapse long fenced code blocks. @default false */
  codeBlockCollapsible?: boolean;
  /** Render images with your own component, e.g. `next/image`. */
  imageComponent?: (props: { src: string; alt: string; width?: string; height?: string }) => React.ReactNode;
  /** High-contrast inline code. @default true */
  inlineCodeHighContrast?: boolean;
  /** `compact` for chat, `spacious` for articles and docs. @default "spacious" */
  spacing?: 'compact' | 'spacious';
}

type ChildrenProps = { children?: React.ReactNode };

function languageFromClassName(className?: string): string {
  return className?.match(/language-([\w-]+)/i)?.[1] ?? 'text';
}

function codeFromChildren(children?: React.ReactNode): string {
  let code = '';
  if (typeof children === 'string') {
    code = children;
  } else if (Array.isArray(children)) {
    code = children.map((child) => (typeof child === 'string' ? child : '')).join('');
  }
  return code.replace(/^\n+|\n+$/g, '');
}

const SPACING = {
  compact: {
    h1: ['1.5rem', '1rem'],
    h2: ['2rem', '0.375rem'],
    h3: ['1.5rem', '0.375rem'],
    h4: ['0.5rem', '0.25rem'],
    h5: ['0.375rem', '0.25rem'],
    h6: ['0.375rem', '0.25rem'],
    list: '0.25rem',
    listItem: '0.125rem',
    codeBlock: '1',
    hr: '0.375rem',
    paragraph: '0',
    blockquote: '0.5rem',
  },
  spacious: {
    h1: ['3rem', '1.5rem'],
    h2: ['3rem', '0.5rem'],
    h3: ['2rem', '0.5rem'],
    h4: ['0.625rem', '0.5rem'],
    h5: ['0.5rem', '0.5rem'],
    h6: ['0.5rem', '0.5rem'],
    list: '0.5rem',
    listItem: '0.25rem',
    codeBlock: '2',
    hr: '0.5rem',
    paragraph: '0.5rem',
    blockquote: '1rem',
  },
} as const;

/**
 * Maps markdown elements to Kookie UI components. Works with react-markdown's `components`
 * prop and with MDX's `useMDXComponents`.
 */
export function createMarkdownComponents(options: MarkdownComponentOptions = {}): Components {
  const { codeBlockCollapsible = false, imageComponent, inlineCodeHighContrast = true, spacing = 'spacious' } = options;
  const space = SPACING[spacing];

  const heading = (as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', size: '9' | '7' | '5' | '4' | '3' | '2') =>
    function MarkdownHeading({ children }: ChildrenProps) {
      const [top, bottom] = space[as];
      return (
        <Heading as={as} size={size} weight="medium" mt={top} mb={bottom}>
          {children}
        </Heading>
      );
    };

  return {
    h1: heading('h1', '9'),
    h2: heading('h2', '7'),
    h3: heading('h3', '5'),
    h4: heading('h4', '4'),
    h5: heading('h5', '3'),
    h6: heading('h6', '2'),

    p: ({ children }: ChildrenProps) => (
      <Text as="p" size="3" my={space.paragraph} style={{ lineHeight: 1.6 }}>
        {children}
      </Text>
    ),

    code: ({ className, children, inline }: { className?: string; children?: React.ReactNode; inline?: boolean }) => {
      const code = codeFromChildren(children);
      // react-markdown no longer passes `inline`, so short single-line code without a language counts as inline.
      const isInline =
        inline === true || (inline === undefined && !className && !code.includes('\n') && code.length < 100);

      if (isInline) {
        return (
          <Code size="3" highContrast={inlineCodeHighContrast}>
            {code}
          </Code>
        );
      }

      return (
        <Box my={space.codeBlock} minWidth="0">
          <CodeBlock code={code} language={languageFromClassName(className)} collapsible={codeBlockCollapsible} />
        </Box>
      );
    },

    // `code` renders the block, so `pre` only passes through.
    pre: ({ children }: ChildrenProps) => <>{children}</>,

    ul: ({ children }: ChildrenProps) => (
      <ul style={{ marginBlock: space.list, lineHeight: 1.6, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
        {children}
      </ul>
    ),
    ol: ({ children }: ChildrenProps) => (
      <ol style={{ marginBlock: space.list, lineHeight: 1.6, paddingLeft: '1.5rem', listStyleType: 'decimal' }}>
        {children}
      </ol>
    ),
    li: ({ children }: ChildrenProps) => (
      <li style={{ marginBottom: space.listItem, lineHeight: 1.6 }}>{children}</li>
    ),

    blockquote: ({ children }: ChildrenProps) => (
      <Blockquote size="1" my={space.blockquote}>
        {children}
      </Blockquote>
    ),

    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a href={href} style={{ color: 'var(--accent-9)', textDecoration: 'underline' }}>
        {children}
      </a>
    ),

    strong: ({ children }: ChildrenProps) => (
      <Text weight="medium" style={{ lineHeight: 1.6 }}>
        {children}
      </Text>
    ),
    em: ({ children }: ChildrenProps) => <Text style={{ lineHeight: 1.6, fontStyle: 'italic' }}>{children}</Text>,

    hr: () => (
      <Box my={space.hr}>
        <Separator orientation="horizontal" light />
      </Box>
    ),

    table: ({ children }: ChildrenProps) => (
      <Box my="2">
        <Table.Root size="2" variant="ghost">
          {children}
        </Table.Root>
      </Box>
    ),
    thead: ({ children }: ChildrenProps) => <Table.Header>{children}</Table.Header>,
    tbody: ({ children }: ChildrenProps) => <Table.Body>{children}</Table.Body>,
    tr: ({ children }: ChildrenProps) => <Table.Row>{children}</Table.Row>,
    th: ({ children }: ChildrenProps) => <Table.ColumnHeaderCell>{children}</Table.ColumnHeaderCell>,
    td: ({ children }: ChildrenProps) => <Table.Cell>{children}</Table.Cell>,

    sub: ({ children }: ChildrenProps) => <sub>{children}</sub>,
    sup: ({ children }: ChildrenProps) => <sup>{children}</sup>,
    br: () => <br />,

    img: imageComponent
      ? ({ src, alt, width, height }: React.ImgHTMLAttributes<HTMLImageElement>) => {
          if (typeof src !== 'string' || !src) return null;
          return imageComponent({
            src,
            alt: alt ?? 'Image',
            width: width ? String(width) : undefined,
            height: height ? String(height) : undefined,
          });
        }
      : undefined,

    details: ({ children }: ChildrenProps) => <details style={{ padding: '0.5rem 0' }}>{children}</details>,
    summary: ({ children }: ChildrenProps) => <summary style={{ cursor: 'pointer', fontWeight: 500 }}>{children}</summary>,
  };
}
