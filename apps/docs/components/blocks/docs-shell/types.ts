import type * as React from 'react';
import type { Sidebar } from '@kushagradhawan/kookie-ui';
import type { IconSvgElement } from '@hugeicons/react';

export interface DocsNavigationItem {
  href: string;
  title: string;
  /** A HugeIcons icon, a component, or any element. */
  icon?: IconSvgElement | React.ComponentType | React.ReactElement;
  /** Text badge, or a config object for color and variant. */
  badge?: string | Sidebar.BadgeConfig;
  /** Nested pages, shown in a collapsible sub-menu. */
  items?: DocsNavigationItem[];
}

export interface DocsNavigationGroup {
  label: string;
  items: DocsNavigationItem[];
}

export interface DocsNavigationConfig {
  groups: DocsNavigationGroup[];
}

export interface DocsLogoConfig {
  /** An image mark. Ignored when `label` is set. */
  src?: string;
  /** A text wordmark instead of an image. The thin sidebar shows its first letter. */
  label?: string;
  alt?: string;
  /** @default "/" */
  href?: string;
  /** @default "3" */
  size?: '1' | '2' | '3' | '4' | '5';
}

/** Props the shell passes to your link component, e.g. `next/link`. */
export interface DocsLinkProps {
  href: string;
  children: React.ReactNode;
  'aria-label'?: string;
}

export type DocsLinkComponent = React.ComponentType<DocsLinkProps>;
