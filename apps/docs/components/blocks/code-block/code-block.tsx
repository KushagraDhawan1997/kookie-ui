'use client';

import * as React from 'react';
import { Box, Button, Card, Code, Flex, IconButton, ScrollArea, Text, Theme } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Copy01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import type { BundledLanguage, BundledTheme, ShikiTransformer } from 'shiki';
import './code-block.css';

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export interface ShikiConfig {
  /** Light and dark themes. Defaults to `one-light` and `one-dark-pro`. */
  themes?: { light?: string; dark?: string };
  /** Language aliases, e.g. `{ js: 'javascript' }`. */
  langAlias?: Record<string, string>;
  /** Shiki transformers for line highlighting, diffs and similar. */
  transformers?: ShikiTransformer[];
  /** Meta string passed to transformers, e.g. `{1,3-5}`. */
  meta?: string;
}

export interface PreviewBackgroundProps {
  /** Dot size in pixels for the dots background. */
  dotSize?: number;
  /** Dot color. */
  color?: string;
  /** Background color behind the dots. */
  backgroundColor?: string;
  height?: string;
  width?: string;
  /** Radius token, e.g. `"3"` for `var(--radius-3)`. */
  radius?: string;
}

export interface CodeBlockProps {
  /** Raw code, highlighted at runtime with Shiki. Use instead of `children`. */
  code?: string;
  /** Language for `code`, e.g. `tsx` or `bash`. */
  language?: string;
  /** Pre-highlighted markup, e.g. from rehype-pretty-code. Use instead of `code`. */
  children?: React.ReactNode;
  /** Shiki options. Only applies to `code`. */
  shikiConfig?: ShikiConfig;
  /** @default true */
  showCopy?: boolean;
  /** @default true */
  showLanguage?: boolean;
  /** @default true */
  showLineNumbers?: boolean;
  /** File path shown in the header. */
  file?: string;
  /** Collapse long code behind an expand toggle. @default true */
  collapsible?: boolean;
  /** Height in pixels before the code collapses. @default 360 */
  collapsedHeight?: number;
  /** Live preview rendered above the code. */
  preview?: React.ReactNode;
  /** Preview background: `none`, `dots`, or an image URL. @default "none" */
  background?: 'none' | 'dots' | string;
  backgroundProps?: PreviewBackgroundProps;
}

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/

const DEFAULT_COLLAPSED_HEIGHT = 360;
const DEFAULT_LIGHT_THEME = 'one-light';
const DEFAULT_DARK_THEME = 'one-dark-pro';
const COPY_FEEDBACK_MS = 2000;

const LANGUAGE_LABELS: Record<string, string> = {
  js: 'JS',
  javascript: 'JS',
  jsx: 'JSX',
  ts: 'TS',
  typescript: 'TS',
  tsx: 'TSX',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  ruby: 'Ruby',
  sh: 'Shell',
  bash: 'Shell',
  shell: 'Shell',
  zsh: 'Shell',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  html: 'HTML',
  xml: 'XML',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  markdown: 'Markdown',
  mdx: 'MDX',
  sql: 'SQL',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  go: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  swift: 'Swift',
  kotlin: 'Kotlin',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  csharp: 'C#',
  php: 'PHP',
  vue: 'Vue',
  svelte: 'Svelte',
  astro: 'Astro',
  dockerfile: 'Docker',
  docker: 'Docker',
  text: 'Text',
  plaintext: 'Text',
  txt: 'Text',
};

function formatLanguage(language: string): string {
  return LANGUAGE_LABELS[language.toLowerCase().trim()] ?? language.toUpperCase();
}

type ElementWithProps = React.ReactElement<{
  children?: React.ReactNode;
  className?: string;
  class?: string;
  'data-language'?: string;
}>;

function isElementWithProps(node: unknown): node is ElementWithProps {
  return React.isValidElement(node) && typeof node.props === 'object' && node.props !== null;
}

/** Plain text of pre-highlighted children, used for copying. */
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isElementWithProps(node)) return extractText(node.props.children);
  return '';
}

/** Language from `data-language` (rehype-pretty-code) or a `language-xxx` class. */
function extractLanguage(node: React.ReactNode): string | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const language = extractLanguage(child);
      if (language) return language;
    }
    return null;
  }
  if (!isElementWithProps(node)) return null;

  const { props } = node;
  if (props['data-language']) return props['data-language'];

  const className = props.className ?? props.class ?? '';
  const match = className.match(/language-([\w-]+)/i);
  if (match) return match[1];

  return extractLanguage(props.children);
}

/* -------------------------------------------------------------------------------------------------
 * Context — lets MDX `pre` overrides skip double-wrapping
 * -----------------------------------------------------------------------------------------------*/

const CodeBlockContext = React.createContext(false);

export function useCodeBlockContext() {
  return React.useContext(CodeBlockContext);
}

/* -------------------------------------------------------------------------------------------------
 * Code card
 * -----------------------------------------------------------------------------------------------*/

function useCodeCard(code: string, collapsedHeight: number) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [contentHeight, setContentHeight] = React.useState(collapsedHeight);
  const [copied, setCopied] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const resetTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // ResizeObserver only fires on real size changes, so highlighting finishing re-measures once.
  React.useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    setContentHeight(element.scrollHeight);
    const observer = new ResizeObserver(() => setContentHeight(element.scrollHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, [code]);

  React.useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const handleCopy = React.useCallback(async () => {
    if (!code.trim()) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[CodeBlock] Failed to copy to clipboard:', error);
      }
    }
  }, [code]);

  return {
    isExpanded,
    shouldShowToggle: contentHeight > collapsedHeight,
    contentMaxHeight: isExpanded ? contentHeight : collapsedHeight,
    copied,
    contentRef,
    toggle: () => setIsExpanded((previous) => !previous),
    handleCopy,
  };
}

const SKELETON_LINE_WIDTHS = ['85%', '70%', '90%', '60%', '75%', '80%'];

function CodeSkeleton() {
  return (
    <Box className="code-block-skeleton">
      {SKELETON_LINE_WIDTHS.map((width, index) => (
        <Box key={index} className="code-block-skeleton-line" width={width} />
      ))}
    </Box>
  );
}

interface CodeCardProps {
  code: string;
  language: string;
  showCopy: boolean;
  showLanguage: boolean;
  showLineNumbers: boolean;
  collapsible: boolean;
  collapsedHeight: number;
  file?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

const CodeCard = React.memo(function CodeCard({
  code,
  language,
  showCopy,
  showLanguage,
  showLineNumbers,
  collapsible,
  collapsedHeight,
  file,
  isLoading = false,
  children,
}: CodeCardProps) {
  const { isExpanded, shouldShowToggle, contentMaxHeight, copied, contentRef, toggle, handleCopy } = useCodeCard(
    code,
    collapsedHeight,
  );

  const showToggle = collapsible && shouldShowToggle;
  const contentClassName = showLineNumbers ? 'code-block-content' : 'code-block-content hide-line-numbers';

  return (
    <Box position="relative">
      <Card size="1" variant="soft" inset>
        <Flex direction="column">
          <Flex justify="between" align="start" gap="2" p="2">
            <Flex align="center" gap="2">
              {showLanguage && (
                <Code size="1" color="gray" variant="ghost">
                  {formatLanguage(language).toLowerCase()}
                </Code>
              )}
              {file && (
                <Text size="1" color="gray" highContrast>
                  {file}
                </Text>
              )}
            </Flex>

            <Flex align="center" flexShrink="0">
              {showToggle && (
                <IconButton
                  size="2"
                  variant="ghost"
                  color="gray"
                  onClick={toggle}
                  tooltip={isExpanded ? 'Collapse' : 'Expand'}
                  aria-label={isExpanded ? 'Collapse code' : 'Expand code'}
                >
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className="code-block-chevron"
                    data-expanded={isExpanded || undefined}
                    strokeWidth={1.75}
                  />
                </IconButton>
              )}
              {showCopy && (
                <Button
                  size="2"
                  variant="ghost"
                  color="gray"
                  onClick={handleCopy}
                  tooltip={copied ? 'Copied!' : 'Copy'}
                  aria-label={copied ? 'Copied!' : 'Copy code'}
                >
                  <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} strokeWidth={1.75} />
                  Copy
                </Button>
              )}
            </Flex>
          </Flex>

          <ScrollArea type="hover" scrollbars="horizontal" style={{ maxHeight: collapsible ? contentMaxHeight : undefined }}>
            <Box ref={contentRef} className={contentClassName} p="2">
              {isLoading ? <CodeSkeleton /> : children}
            </Box>
          </ScrollArea>

          {showToggle && !isExpanded && <Box className="code-block-shadow" />}
        </Flex>
      </Card>
    </Box>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Runtime highlighting
 * -----------------------------------------------------------------------------------------------*/

type RuntimeCodeProps = Omit<CodeCardProps, 'children' | 'isLoading'> & { shikiConfig?: ShikiConfig };

const RuntimeCode = React.memo(function RuntimeCode({ shikiConfig, ...cardProps }: RuntimeCodeProps) {
  const { code, language } = cardProps;
  const [highlighted, setHighlighted] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);

  const lightTheme = shikiConfig?.themes?.light ?? DEFAULT_LIGHT_THEME;
  const darkTheme = shikiConfig?.themes?.dark ?? DEFAULT_DARK_THEME;
  const { langAlias, transformers, meta } = shikiConfig ?? {};

  React.useEffect(() => {
    let cancelled = false;

    // Shiki is large; load it only once a code block actually renders.
    import('shiki')
      .then(({ codeToHtml }) =>
        codeToHtml(code, {
          lang: (langAlias?.[language] ?? language) as BundledLanguage,
          themes: { light: lightTheme as BundledTheme, dark: darkTheme as BundledTheme },
          defaultColor: false,
          transformers,
          meta: meta ? { __raw: meta } : undefined,
        }),
      )
      .then((html) => {
        if (cancelled) return;
        setHighlighted(html);
        setFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        // Keep the last good highlight while editing; fall back to plain text only if there is none.
        setFailed(true);
        if (process.env.NODE_ENV === 'development') {
          console.error('[CodeBlock] Shiki highlighting failed:', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, language, lightTheme, darkTheme, langAlias, transformers, meta]);

  let content: React.ReactNode = null;
  if (highlighted) {
    content = <Box dangerouslySetInnerHTML={{ __html: highlighted }} />;
  } else if (failed) {
    content = (
      <pre>
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <CodeCard {...cardProps} isLoading={!highlighted && !failed}>
      {content}
    </CodeCard>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Preview
 * -----------------------------------------------------------------------------------------------*/

const EMPTY_BACKGROUND_PROPS: PreviewBackgroundProps = {};

function PreviewSection({
  children,
  background = 'none',
  backgroundProps = EMPTY_BACKGROUND_PROPS,
}: {
  children: React.ReactNode;
  background?: CodeBlockProps['background'];
  backgroundProps?: PreviewBackgroundProps;
}) {
  const {
    dotSize = 24,
    color = 'var(--gray-10)',
    backgroundColor = 'var(--gray-2)',
    height,
    width = '100%',
    radius = '3',
  } = backgroundProps;

  let backgroundStyle: React.CSSProperties | undefined;
  if (background === 'dots') {
    backgroundStyle = {
      backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
      backgroundSize: `${dotSize}px ${dotSize}px`,
      backgroundPosition: 'center',
      backgroundColor,
      borderRadius: `var(--radius-${radius})`,
    };
  } else if (background !== 'none') {
    backgroundStyle = {
      backgroundImage: `url(${background})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: `var(--radius-${radius})`,
    };
  }
  const hasBackground = backgroundStyle !== undefined;

  return (
    <Card size="1" variant="soft">
      <Flex
        justify="center"
        align="center"
        py="4"
        width={hasBackground ? width : undefined}
        height={hasBackground ? height : undefined}
        style={backgroundStyle}
      >
        <Theme fontFamily="sans">{children}</Theme>
      </Flex>
    </Card>
  );
}

/* -------------------------------------------------------------------------------------------------
 * CodeBlock
 * -----------------------------------------------------------------------------------------------*/

export function CodeBlock({
  children,
  code,
  language,
  preview,
  showCopy = true,
  showLanguage = true,
  showLineNumbers = true,
  shikiConfig,
  background,
  backgroundProps,
  collapsible = true,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
  file,
}: CodeBlockProps) {
  const cardProps = { showCopy, showLanguage, showLineNumbers, collapsible, collapsedHeight, file };

  return (
    <CodeBlockContext.Provider value={true}>
      <Box className="code-block" my="3">
        <Flex direction="column" gap="2">
          {preview && (
            <PreviewSection background={background} backgroundProps={backgroundProps}>
              {preview}
            </PreviewSection>
          )}

          {code ? (
            <RuntimeCode
              {...cardProps}
              code={code}
              language={language ?? 'text'}
              shikiConfig={shikiConfig}
            />
          ) : (
            children && (
              <CodeCard
                {...cardProps}
                code={extractText(children)}
                language={language ?? extractLanguage(children) ?? 'text'}
              >
                {children}
              </CodeCard>
            )
          )}
        </Flex>
      </Box>
    </CodeBlockContext.Provider>
  );
}
