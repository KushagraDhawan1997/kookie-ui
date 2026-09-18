'use client';

import * as React from 'react';
import { SegmentedControl, Theme } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Moon02Icon, Sun01Icon } from '@hugeicons/core-free-icons';
import { CodeBlock, type CodeBlockProps } from '../code-block/code-block';
import './preview-block.css';

type Appearance = 'light' | 'dark';

export interface PreviewBlockProps {
  children: React.ReactNode;
  /** Stage background: a preset pattern, or your own CSS. @default "dots" */
  background?: 'none' | 'dots' | 'grid' | React.CSSProperties;
  /** Spacing of the dots or grid lines, in pixels. @default 20 */
  patternSize?: number;
  /** Pattern color. Defaults to `--gray-a5` for dots and `--gray-a3` for grid. */
  patternColor?: string;
  /** Fixed stage height, e.g. `"24rem"` for demos that open menus. Without it the stage fits its content. */
  height?: string;
  /** Starting appearance. Defaults to the page's. */
  appearance?: Appearance;
  /** Show the light/dark switch. @default true */
  showThemeToggle?: boolean;
  /** Label in the toolbar, e.g. the example's name. */
  label?: React.ReactNode;
  /** @default "sans" */
  fontFamily?: 'sans' | 'mono' | 'serif';
  /** Source shown under the stage, in the same frame. */
  code?: string;
  /** Language for `code`. @default "tsx" */
  language?: string;
  /** Extra `CodeBlock` options for `code`. */
  codeProps?: Omit<CodeBlockProps, 'code' | 'language' | 'children'>;
  className?: string;
}

function getBackgroundStyle(
  background: PreviewBlockProps['background'],
  patternSize: number,
  patternColor: string | undefined,
): React.CSSProperties | undefined {
  if (typeof background === 'object') return background;

  const size = `${patternSize}px ${patternSize}px`;
  if (background === 'dots') {
    const color = patternColor ?? 'var(--gray-a5)';
    return { backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`, backgroundSize: size, backgroundPosition: 'center' };
  }
  if (background === 'grid') {
    const color = patternColor ?? 'var(--gray-a3)';
    return {
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: size,
      backgroundPosition: 'center',
    };
  }
  return undefined;
}

/**
 * A framed stage for a live demo: a toolbar with a light/dark switch, a padded stage, and
 * optionally the demo's source attached underneath.
 */
export function PreviewBlock({
  children,
  background = 'dots',
  patternSize = 20,
  patternColor,
  height,
  appearance,
  showThemeToggle = true,
  label,
  fontFamily = 'sans',
  code,
  language = 'tsx',
  codeProps,
  className,
}: PreviewBlockProps) {
  const [chosenAppearance, setChosenAppearance] = React.useState<Appearance | undefined>(appearance);
  const hasToolbar = showThemeToggle || label !== undefined;

  return (
    <div className={className ? `preview-block ${className}` : 'preview-block'}>
      {hasToolbar && (
        <div className="preview-block-toolbar">
          {label !== undefined && <span className="preview-block-label">{label}</span>}
          {showThemeToggle && (
            <SegmentedControl.Root
              size="1"
              value={chosenAppearance ?? 'light'}
              onValueChange={(value) => setChosenAppearance(value === 'dark' ? 'dark' : 'light')}
              className="preview-block-theme-toggle"
            >
              <SegmentedControl.Item value="light" iconOnly aria-label="Light preview">
                <HugeiconsIcon icon={Sun01Icon} strokeWidth={1.75} />
              </SegmentedControl.Item>
              <SegmentedControl.Item value="dark" iconOnly aria-label="Dark preview">
                <HugeiconsIcon icon={Moon02Icon} strokeWidth={1.75} />
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          )}
        </div>
      )}

      {/* Its own Theme, so switching the preview leaves the page alone. */}
      <Theme appearance={chosenAppearance ?? 'inherit'} fontFamily={fontFamily} hasBackground className="preview-block-theme">
        <div className="preview-block-stage" style={{ ...getBackgroundStyle(background, patternSize, patternColor), height }}>
          {children}
        </div>
      </Theme>

      {code !== undefined && <CodeBlock {...codeProps} code={code} language={language} />}
    </div>
  );
}
