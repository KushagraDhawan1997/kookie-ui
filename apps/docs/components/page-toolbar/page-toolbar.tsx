'use client';

import { ToolbarGroup, ToolbarOverflow } from '@kushagradhawan/kookie-ui';
import { GithubIcon } from '@hugeicons/core-free-icons';
import { DocsPager } from './docs-pager';
import { PageActions } from './page-actions';
import { ToolbarLinkButton } from './toolbar-link';

const GITHUB = {
  label: 'GitHub',
  name: 'Kookie UI on GitHub',
  href: 'https://github.com/KushagraDhawan1997/kookie-ui',
} as const;

/**
 * The trailing end of the docs top bar, ported from Kookie UI v2's `docs-chrome.tsx`: the walk
 * (previous/next), what you can do with the page, then the repository.
 *
 * When the row runs out of room, `ToolbarOverflow` moves the clusters into a "More actions" menu
 * from the end: the repository first, then the page actions, and the walk last.
 */
export function PageToolbar() {
  return (
    <ToolbarOverflow label="More actions">
      <DocsPager />
      <PageActions />
      <ToolbarGroup>
        <ToolbarLinkButton
          label={GITHUB.name}
          tooltip={GITHUB.label}
          icon={GithubIcon}
          link={<a href={GITHUB.href} target="_blank" rel="noreferrer" />}
        />
      </ToolbarGroup>
    </ToolbarOverflow>
  );
}
