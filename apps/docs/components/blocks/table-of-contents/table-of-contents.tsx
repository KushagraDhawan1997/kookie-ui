'use client';

import * as React from 'react';
import { Flex, Link, Text } from '@kushagradhawan/kookie-ui';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface TableOfContentsProps {
  className?: string;
  /** Heading levels to list. @default [2] */
  levels?: number[];
  /** @default "On this page" */
  title?: string;
  /** Wrap the rendered list, e.g. in a card. Not called when there are no headings. */
  renderContainer?: (content: React.ReactNode) => React.ReactNode;
  /** Where to look for headings. @default "[data-content-area]" */
  contentSelector?: string;
}

const DEFAULT_LEVELS = [2];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

/**
 * Lists the headings inside the content area and highlights the one in view. Headings without
 * an id get one from their text.
 */
export const TableOfContents = React.memo(function TableOfContents({
  className,
  levels = DEFAULT_LEVELS,
  title = 'On this page',
  renderContainer,
  contentSelector = '[data-content-area]',
}: TableOfContentsProps) {
  const [toc, setToc] = React.useState<TocItem[]>([]);
  const [activeId, setActiveId] = React.useState('');
  const levelsKey = levels.join(',');

  React.useEffect(() => {
    const contentArea = document.querySelector(contentSelector);
    if (!contentArea) return;

    const selector = levelsKey
      .split(',')
      .map((level) => `h${level}`)
      .join(', ');
    let intersectionObserver: IntersectionObserver | null = null;
    let frame = 0;
    let signature: string | null = null;

    const scan = () => {
      const headings = Array.from(contentArea.querySelectorAll<HTMLElement>(selector))
        .map((heading) => {
          const text = heading.textContent ?? '';
          if (!heading.id && text) heading.id = slugify(text);
          return { id: heading.id, text, level: Number(heading.tagName.charAt(1)) };
        })
        .filter((item) => item.id && item.text);

      // Live previews mutate the DOM constantly; only act when the headings themselves change.
      const nextSignature = headings.map((heading) => `${heading.level}:${heading.id}:${heading.text}`).join('|');
      if (nextSignature === signature) return;
      signature = nextSignature;

      setToc(headings);
      intersectionObserver?.disconnect();
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActiveId(entry.target.id);
          }
        },
        { rootMargin: '-20% 0% -35% 0%' },
      );
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element) intersectionObserver.observe(element);
      }
    };

    // Rescan when the content changes, e.g. switching tabs. One scan per frame at most.
    const scheduleScan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };
    const mutationObserver = new MutationObserver(scheduleScan);
    mutationObserver.observe(contentArea, { childList: true, subtree: true });
    scheduleScan();

    return () => {
      cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [levelsKey, contentSelector]);

  if (toc.length === 0) return null;

  const content = (
    <Flex direction="column" gap="3" className={className}>
      <Text size="1" weight="medium" color="gray">
        {title}
      </Text>
      <Flex direction="column" gap="2">
        {toc.map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            size="1"
            color="gray"
            highContrast={activeId === item.id}
            truncate
            style={{ display: 'block', paddingLeft: item.level > 2 ? (item.level - 2) * 12 : 0 }}
          >
            {item.text}
          </Link>
        ))}
      </Flex>
    </Flex>
  );

  return renderContainer ? renderContainer(content) : content;
});
