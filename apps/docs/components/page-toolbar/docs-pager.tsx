'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ToolbarGroup } from '@kushagradhawan/kookie-ui';
import { ArrowLeft02Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { DOC_PAGES, type DocPage } from '@/lib/pages';
import { ToolbarLinkButton } from './toolbar-link';

/**
 * Previous and next page, as two arrows in one group. Ported from Kookie UI v2's
 * `app/(docs)/docs-pager.tsx`. The destination's title is the tooltip and the accessible name.
 * A route outside the walk draws nothing.
 */
export function DocsPager({ stops = DOC_PAGES }: { stops?: readonly DocPage[] }) {
  const pathname = usePathname();
  const index = stops.findIndex((stop) => stop.path === pathname);
  if (index === -1) return null;

  const prev = stops[index - 1];
  const next = stops[index + 1];
  if (!prev && !next) return null;

  return (
    <ToolbarGroup>
      {prev && (
        <ToolbarLinkButton label={`Previous: ${prev.title}`} tooltip={prev.title} icon={ArrowLeft02Icon} link={<Link href={prev.path} />} />
      )}
      {next && (
        <ToolbarLinkButton label={`Next: ${next.title}`} tooltip={next.title} icon={ArrowRight02Icon} link={<Link href={next.path} />} />
      )}
    </ToolbarGroup>
  );
}
