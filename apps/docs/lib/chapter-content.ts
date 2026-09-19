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
  'start/quickstart': dynamic(() => import('@/content/start/quickstart.mdx')),
  'start/agents': dynamic(() => import('@/content/start/agents.mdx')),
  'foundations/color': dynamic(() => import('@/content/foundations/color.mdx')),
  'foundations/typography': dynamic(() => import('@/content/foundations/typography.mdx')),
  'foundations/layout': dynamic(() => import('@/content/foundations/layout.mdx')),
  'foundations/size': dynamic(() => import('@/content/foundations/size.mdx')),
  'foundations/radius': dynamic(() => import('@/content/foundations/radius.mdx')),
  'foundations/materials': dynamic(() => import('@/content/foundations/materials.mdx')),
  'foundations/depth': dynamic(() => import('@/content/foundations/depth.mdx')),
  'foundations/motion': dynamic(() => import('@/content/foundations/motion.mdx')),
  'foundations/states': dynamic(() => import('@/content/foundations/states.mdx')),
  'foundations/responsiveness': dynamic(() => import('@/content/foundations/responsiveness.mdx')),
  'foundations/constants': dynamic(() => import('@/content/foundations/constants.mdx')),
  'patterns/composition': dynamic(() => import('@/content/patterns/composition.mdx')),
  'patterns/forms': dynamic(() => import('@/content/patterns/forms.mdx')),
  'patterns/modality': dynamic(() => import('@/content/patterns/modality.mdx')),
  'patterns/navigation': dynamic(() => import('@/content/patterns/navigation.mdx')),
  'patterns/feedback': dynamic(() => import('@/content/patterns/feedback.mdx')),
};
