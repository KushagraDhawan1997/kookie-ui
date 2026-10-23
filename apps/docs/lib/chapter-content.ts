'use client';

/**
 * Each chapter's compiled MDX, keyed by slug. Client-side because v1's components are not safe
 * to render in a server component. Each entry is its own dynamic import, so a page loads only
 * its own chapter and the rest stay out of its bundle. Server rendering still happens.
 */
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

export const CHAPTER_CONTENT: Record<string, ComponentType> = {
  'start/principles': dynamic(() => import('@/content/start/principles.mdx')),
  'start/vocabulary': dynamic(() => import('@/content/start/vocabulary.mdx')),
  'start/installation': dynamic(() => import('@/content/start/installation.mdx')),
  'start/theming': dynamic(() => import('@/content/start/theming.mdx')),
  'foundations/color': dynamic(() => import('@/content/foundations/color.mdx')),
  'foundations/typography': dynamic(() => import('@/content/foundations/typography.mdx')),
  'foundations/radius': dynamic(() => import('@/content/foundations/radius.mdx')),
  'foundations/depth': dynamic(() => import('@/content/foundations/depth.mdx')),
  'foundations/constants': dynamic(() => import('@/content/foundations/constants.mdx')),
};
