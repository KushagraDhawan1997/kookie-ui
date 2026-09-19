'use client';

import * as React from 'react';
import { Button, IconButton, ScrollArea, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import type { BundledLanguage, BundledTheme, ShikiTransformer } from 'shiki';
import './code-block.css';

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export interface ShikiConfig {
  /** Light and dark themes. Defaults to `github-light` and `github-dark`. */
  themes?: { light?: string; dark?: string };
  /** Language aliases, e.g. `{ vue3: 'vue' }`. */
  langAlias?: Record<string, string>;
  /** Shiki transformers for line highlighting, diffs and similar. */
  transformers?: ShikiTransformer[];
  /** Meta string passed to transformers, e.g. `{1,3-5}`. */
  meta?: string;
}

export interface CodeBlockProps {
  /** Raw code, highlighted at runtime with Shiki. Use instead of `children`. */
  code?: string;
  /** Language for `code`, e.g. `tsx` or `bash`. @default "tsx" */
  language?: string;
  /** Pre-highlighted markup, e.g. a `<pre>` from rehype-pretty-code. Use instead of `code`. */
  children?: React.ReactNode;
  /** Shiki options. Only applies to `code`. */
  shikiConfig?: ShikiConfig;
  /** File path shown in a header above the code. */
  file?: string;
  /** Show the language in the header. @default false */
  showLanguage?: boolean;
  /**
   * Number the lines. By default, runtime code is numbered past five lines and pre-highlighted
   * code follows its markup (rehype-pretty-code's `showLineNumbers`).
   */
  showLineNumbers?: boolean;
  /** @default true */
  showCopy?: boolean;
  /** Cap long code at `collapsedHeight` with a "Show more" button. @default true */
  collapsible?: boolean;
  /** Height in pixels before code collapses. @default 400 */
  collapsedHeight?: number;
  className?: string;
}

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/

const DEFAULT_COLLAPSED_HEIGHT = 400;
const DEFAULT_LIGHT_THEME = 'github-light';
const DEFAULT_DARK_THEME = 'github-dark';
const AUTO_LINE_NUMBERS_AFTER = 5;
const COPY_FEEDBACK_MS = 2000;

const LANGUAGE_LABELS: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  sh: 'Shell',
  bash: 'Shell',
  shell: 'Shell',
  zsh: 'Shell',
  css: 'CSS',
  scss: 'SCSS',
  html: 'HTML',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  markdown: 'Markdown',
  mdx: 'MDX',
  py: 'Python',
  python: 'Python',
  sql: 'SQL',
  graphql: 'GraphQL',
  text: 'Text',
  plaintext: 'Text',
  txt: 'Text',
};

function formatLanguage(language: string): string {
  return LANGUAGE_LABELS[language.toLowerCase()] ?? language;
}

type ElementWithProps = React.ReactElement<{
  children?: React.ReactNode;
  'data-language'?: string;
  'data-line-numbers'?: string | boolean;
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

/** First value of a prop found walking down pre-highlighted children. */
function findProp(node: React.ReactNode, key: 'data-language' | 'data-line-numbers'): string | boolean | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const value = findProp(child, key);
      if (value !== undefined) return value;
    }
    return undefined;
  }
  if (!isElementWithProps(node)) return undefined;
  return node.props[key] ?? findProp(node.props.children, key);
}

/* -------------------------------------------------------------------------------------------------
 * Context — lets markdown renderers tell block code from inline code
 * -----------------------------------------------------------------------------------------------*/

const CodeBlockContext = React.createContext(false);

/** `true` inside a `CodeBlock`. */
export function useCodeBlockContext() {
  return React.useContext(CodeBlockContext);
}

/* -------------------------------------------------------------------------------------------------
 * Behaviour
 * -----------------------------------------------------------------------------------------------*/

function useCopy(text: string) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copy = React.useCallback(async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[CodeBlock] Failed to copy to clipboard:', error);
      }
    }
  }, [text]);

  return { copied, copy };
}

/** Whether the content is taller than `limit`, re-measured as it resizes. */
function useOverflow(ref: React.RefObject<HTMLElement | null>, limit: number) {
  const [overflows, setOverflows] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setOverflows(element.scrollHeight > limit + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, limit]);

  return overflows;
}

/* -------------------------------------------------------------------------------------------------
 * Runtime highlighting
 * -----------------------------------------------------------------------------------------------*/

function useHighlightedHtml(code: string | undefined, language: string, shikiConfig?: ShikiConfig) {
  const [html, setHtml] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);

  const lightTheme = shikiConfig?.themes?.light ?? DEFAULT_LIGHT_THEME;
  const darkTheme = shikiConfig?.themes?.dark ?? DEFAULT_DARK_THEME;
  const { langAlias, transformers, meta } = shikiConfig ?? {};

  React.useEffect(() => {
    if (code === undefined) return;
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
      .then((result) => {
        if (cancelled) return;
        setHtml(result);
        setFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        // Keep the last good highlight while code changes; plain text only if there is none.
        setFailed(true);
        if (process.env.NODE_ENV === 'development') {
          console.error('[CodeBlock] Shiki highlighting failed:', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, language, lightTheme, darkTheme, langAlias, transformers, meta]);

  return { html, failed };
}

/* -------------------------------------------------------------------------------------------------
 * CodeBlock
 * -----------------------------------------------------------------------------------------------*/

/**
 * Code in a quiet frame with a copy button. Highlights `code` with Shiki at runtime, or frames
 * markup that was highlighted at build time. Long code collapses behind "Show more".
 */
export function CodeBlock({
  code,
  language: languageProp,
  children,
  shikiConfig,
  file,
  showLanguage = false,
  showLineNumbers,
  showCopy = true,
  collapsible = true,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
  className,
}: CodeBlockProps) {
  const isRuntime = code !== undefined;
  const text = isRuntime ? code : extractText(children);
  const detected = isRuntime ? undefined : findProp(children, 'data-language');
  const language = languageProp ?? (typeof detected === 'string' ? detected : isRuntime ? 'tsx' : 'text');
  const lineCount = text.replace(/\n$/, '').split('\n').length;

  const numbered = showLineNumbers ?? (isRuntime ? lineCount > AUTO_LINE_NUMBERS_AFTER : findProp(children, 'data-line-numbers') !== undefined);

  const { html, failed } = useHighlightedHtml(code, language, shikiConfig);
  const { copied, copy } = useCopy(text);

  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = React.useState(false);
  const overflows = useOverflow(contentRef, collapsedHeight);
  const collapsed = collapsible && overflows && !expanded;

  let content: React.ReactNode = children;
  if (isRuntime) {
    if (html) {
      content = <div dangerouslySetInnerHTML={{ __html: html }} />;
    } else {
      // Plain text while Shiki loads, so nothing jumps when colors arrive.
      content = (
        <pre data-pending={failed ? undefined : true}>
          <code>{code}</code>
        </pre>
      );
    }
  }

  const hasHeader = Boolean(file) || showLanguage;
  const copyLabel = copied ? 'Copied' : 'Copy code';

  return (
    <CodeBlockContext.Provider value={true}>
      <div
        className={className ? `code-block ${className}` : 'code-block'}
        data-line-numbers={numbered || undefined}
        data-collapsed={collapsed || undefined}
      >
        {hasHeader && (
          <div className="code-block-header">
            <Text size="2" emphasis={file ? 'loud' : 'medium'} truncate>
              {file ?? formatLanguage(language)}
            </Text>
            {file && showLanguage && (
              <Text size="2" emphasis="medium">
                {formatLanguage(language)}
              </Text>
            )}
            {showCopy && (
              <Button size="2" variant="ghost" color="gray" onClick={copy} aria-label={copyLabel} className="code-block-copy">
                <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} strokeWidth={1.75} />
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </div>
        )}

        <div className="code-block-body">
          {showCopy && !hasHeader && (
            <div className="code-block-floating-actions">
              <IconButton
                size="2"
                variant="ghost"
                color="gray"
                onClick={copy}
                aria-label={copyLabel}
                tooltip={copyLabel}
                className="code-block-copy"
              >
                <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} strokeWidth={1.75} />
              </IconButton>
            </div>
          )}
          <ScrollArea type="hover" scrollbars="horizontal" style={{ maxHeight: collapsed ? collapsedHeight : undefined }}>
            <div ref={contentRef} className="code-block-content">
              {content}
            </div>
          </ScrollArea>
        </div>

        {collapsible && overflows && (
          <div className="code-block-footer">
            <Button size="2" variant="ghost" color="gray" onClick={() => setExpanded((value) => !value)}>
              {expanded ? 'Show less' : `Show all ${lineCount} lines`}
            </Button>
          </div>
        )}
      </div>
    </CodeBlockContext.Provider>
  );
}
