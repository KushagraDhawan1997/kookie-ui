'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Flex, ToolbarButton, ToolbarGroup, useToolbarOverflow } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { ChatGptIcon, ClaudeIcon, Copy01Icon, DocumentCodeIcon, Link02Icon } from '@hugeicons/core-free-icons';
import { DOC_PATHS, twinOf } from '@/lib/pages';
import { ToolbarLinkButton } from './toolbar-link';

/**
 * What you can do with this page. Ported from Kookie UI v2's `app/(docs)/page-actions.tsx`.
 *
 * Two groups: the destinations (the Markdown twin, then ChatGPT and Claude, each handed one
 * sentence naming the twin's URL) and the copies (the page as Markdown, the link as a URL). Every
 * control is icon-only, with its name in a tooltip. A page with no twin draws nothing.
 *
 * In the toolbar's More menu the two groups stack as menu groups, without the `Flex` between
 * them, and each control's name is the row's text.
 */

/** The one sentence each chat destination is handed. It names the twin and says nothing else. */
export const askAbout = (markdownUrl: string) =>
  encodeURIComponent(`Read ${markdownUrl} so I can ask you questions about it. It is a page of the Womp Design documentation.`);

export const DESTINATIONS: { label: string; icon: IconSvgElement; href: (markdownUrl: string) => string }[] = [
  { label: 'View as Markdown', icon: DocumentCodeIcon, href: (url) => url },
  // `hints=search` asks for the browsing tool up front, so the model opens the URL.
  { label: 'Open in ChatGPT', icon: ChatGptIcon, href: (url) => `https://chatgpt.com/?hints=search&q=${askAbout(url)}` },
  { label: 'Open in Claude', icon: ClaudeIcon, href: (url) => `https://claude.ai/new?q=${askAbout(url)}` },
];

type CopyId = 'page' | 'link';

export const COPIES: { id: CopyId; label: string; done: string; icon: IconSvgElement }[] = [
  { id: 'page', label: 'Copy page as Markdown', done: 'Page copied', icon: Copy01Icon },
  { id: 'link', label: 'Copy link to this page', done: 'Link copied', icon: Link02Icon },
];

export function PageActions() {
  const pathname = usePathname();
  const overflow = useToolbarOverflow();
  // One flag naming which copy just happened, so a second press retires the first one's tick.
  const [copied, setCopied] = React.useState<CopyId | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // The origin after mount: `""` on both sides of hydration, then the browser's own.
  const [origin, setOrigin] = React.useState('');
  React.useEffect(() => setOrigin(window.location.origin), []);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (pathname === null || !DOC_PATHS.has(pathname)) return null;
  const markdownPath = twinOf(pathname);

  const copy = async (what: CopyId) => {
    if (timer.current) clearTimeout(timer.current);
    try {
      let text = `${origin}${pathname}`;
      if (what === 'page') {
        const response = await fetch(markdownPath);
        if (!response.ok) throw new Error(`GET ${markdownPath}: ${response.status}`);
        text = await response.text();
      }
      await navigator.clipboard.writeText(text);
      setCopied(what);
      timer.current = setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      // The control not turning into a tick is the report; there is no repair the reader can make.
      setCopied(null);
      if (process.env.NODE_ENV === 'development') console.error('[PageActions] Copy failed:', error);
    }
  };

  const destinations = (
    <ToolbarGroup>
      {DESTINATIONS.map(({ label, icon, href }) => (
        <ToolbarLinkButton
          key={label}
          label={label}
          icon={icon}
          link={<a href={href(`${origin}${markdownPath}`)} target="_blank" rel="noreferrer" />}
        />
      ))}
    </ToolbarGroup>
  );

  const copies = (
    <ToolbarGroup>
      {COPIES.map(({ id, label, done, icon }) => {
        const isDone = copied === id;
        return (
          <ToolbarButton
            key={id}
            iconOnly
            done={isDone}
            aria-label={isDone ? done : label}
            tooltip={isDone ? done : label}
            tooltipSide="bottom"
            onClick={() => void copy(id)}
          >
            <HugeiconsIcon icon={icon} strokeWidth={1.75} />
          </ToolbarButton>
        );
      })}
    </ToolbarGroup>
  );

  if (overflow) {
    return (
      <>
        {destinations}
        {copies}
      </>
    );
  }

  return (
    <Flex align="center" gap="3">
      {destinations}
      {copies}
    </Flex>
  );
}
