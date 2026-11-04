'use client';

import * as React from 'react';
import { Avatar, Flex, Shell, Sidebar, Toolbar } from '@kushagradhawan/kookie-ui';
import { Logo } from '@/components/logo';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { DocsSearch } from './docs-search';
import type { DocsLinkComponent, DocsLinkProps, DocsLogoConfig, DocsNavigationConfig, DocsNavigationItem } from './types';

export interface DocsSidebarProps {
  navigation: DocsNavigationConfig;
  logo?: DocsLogoConfig;
  /** Beside the logo, e.g. a version badge. */
  headerActions?: React.ReactNode;
  /** The footer toolbar's contents: toolbar buttons and groups. */
  footer?: React.ReactNode;
  /** Current path, used to mark the active item. */
  pathname?: string;
  /** Your router's link, e.g. `next/link`. Defaults to a plain anchor. */
  linkComponent?: DocsLinkComponent;
}

function Anchor(props: DocsLinkProps) {
  return <a {...props} />;
}

function isIconSvgElement(icon: unknown): icon is IconSvgElement {
  return Array.isArray(icon) && icon.length > 0 && Array.isArray(icon[0]);
}

function renderIcon(icon: DocsNavigationItem['icon']) {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  if (isIconSvgElement(icon)) return <HugeiconsIcon icon={icon} strokeWidth={1.75} />;
  if (typeof icon === 'function') {
    const Icon = icon;
    return <Icon />;
  }
  return null;
}

export function DocsSidebar({ navigation, logo, headerActions, footer, pathname = '', linkComponent: LinkComponent = Anchor }: DocsSidebarProps) {
  const renderItem = (item: DocsNavigationItem, withBadge: boolean) => (
    <Sidebar.MenuItem key={item.href}>
      <Sidebar.MenuButton asChild isActive={pathname === item.href} badge={withBadge ? item.badge : undefined}>
        <LinkComponent href={item.href}>
          {renderIcon(item.icon)}
          <span className="kui-SidebarMenuLabel">{item.title}</span>
        </LinkComponent>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );

  const renderGroupItem = (item: DocsNavigationItem) => {
    if (!item.items?.length) return renderItem(item, true);

    const isNestedActive = item.items.some((subItem) => pathname === subItem.href);
    return (
      <Sidebar.MenuItem key={item.href}>
        <Sidebar.MenuSub defaultOpen={isNestedActive}>
          <Sidebar.MenuSubTrigger>
            {renderIcon(item.icon)}
            {item.title}
          </Sidebar.MenuSubTrigger>
          <Sidebar.MenuSubContent>
            {item.items.map((subItem) => (
              <Sidebar.MenuItem key={subItem.href}>
                <Sidebar.MenuButton asChild isActive={pathname === subItem.href}>
                  <LinkComponent href={subItem.href}>
                    {renderIcon(subItem.icon)}
                    <span className="kui-SidebarMenuLabel">{subItem.title}</span>
                  </LinkComponent>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.MenuSubContent>
        </Sidebar.MenuSub>
      </Sidebar.MenuItem>
    );
  };

  return (
    <>
      {/* The rows float over the list, as in v2: the list runs the pane's full height, starts
          clear of them, and fades out as it passes under them. */}
      <Shell.PaneHeader float>
        <Toolbar backdrop size="3" aria-label="Site">
          <Flex align="center" gap="4">
            {logo && (
              <LinkComponent href={logo.href ?? '/'} aria-label={logo.alt ?? 'Home'}>
                {logo.label ? (
                  /* THE MARK ALONE (2026-09-27, Kushagra): the word said the name a second time
                   in a row that is only ever glanced at. `label` stays the accessible name. */
                  <Logo height="var(--line-height-7)" />
                ) : (
                  <Avatar fallback={logo.alt?.[0] ?? 'K'} size={logo.size ?? '3'} src={logo.src} />
                )}
              </LinkComponent>
            )}
            {headerActions}
          </Flex>
          {/* Search opens the package's Command, as v2's docs do (2026-11-03). */}
          <DocsSearch navigation={navigation} linkComponent={LinkComponent} />
        </Toolbar>
      </Shell.PaneHeader>

      <Shell.Scroll fade>
        {navigation.groups.map((group) => (
          <Sidebar.Group key={group.label}>
            <Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
              <Sidebar.Menu>{group.items.map(renderGroupItem)}</Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        ))}
      </Shell.Scroll>

      {footer && (
        <Shell.PaneFooter float>
          <Toolbar backdrop size="3" aria-label="Site settings">
            {footer}
          </Toolbar>
        </Shell.PaneFooter>
      )}
    </>
  );
}
