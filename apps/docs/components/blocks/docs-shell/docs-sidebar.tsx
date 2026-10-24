'use client';

import * as React from 'react';
import { Avatar, Flex, Shell, Sidebar, TextField, Toolbar, ToolbarButton } from '@kushagradhawan/kookie-ui';
import { Logo } from '@/components/logo';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons';
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
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  const filteredGroups = React.useMemo(() => {
    if (!query) return navigation.groups;
    return navigation.groups.map((group) => ({ ...group, items: group.items.filter((item) => item.title.toLowerCase().includes(query)) })).filter((group) => group.items.length > 0);
  }, [navigation.groups, query]);

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
              <Sidebar.MenuButton asChild key={subItem.href} isActive={pathname === subItem.href}>
                <LinkComponent href={subItem.href}>
                  {renderIcon(subItem.icon)}
                  <span className="kui-SidebarMenuLabel">{subItem.title}</span>
                </LinkComponent>
              </Sidebar.MenuButton>
            ))}
          </Sidebar.MenuSubContent>
        </Sidebar.MenuSub>
      </Sidebar.MenuItem>
    );
  };

  const flatResults = filteredGroups.flatMap((group) => group.items);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* The rows float over the list, as in v2: the list runs the pane's full height, starts
          clear of them, and fades out as it passes under them. */}
      <Shell.PaneHeader float>
        <Toolbar backdrop size="3" aria-label="Site" style={{ flex: 1 }}>
          {searchOpen ? (
            <>
              <TextField.Root
                size="3"
                autoFocus
                placeholder="Search..."
                aria-label="Search the documentation"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') closeSearch();
                }}
                style={{ flex: 1 }}
              >
                <TextField.Slot>
                  <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
                </TextField.Slot>
              </TextField.Root>
              <ToolbarButton iconOnly aria-label="Close search" onClick={closeSearch}>
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.75} />
              </ToolbarButton>
            </>
          ) : (
            <>
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
              <ToolbarButton iconOnly aria-label="Search" onClick={() => setSearchOpen(true)}>
                <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
              </ToolbarButton>
            </>
          )}
        </Toolbar>
      </Shell.PaneHeader>

      <Shell.Scroll fade>
        {isSearching ? (
          <Sidebar.Menu>{flatResults.map((item) => renderItem(item, true))}</Sidebar.Menu>
        ) : (
          filteredGroups.map((group) => (
            <Sidebar.Group key={group.label}>
              <Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>{group.items.map(renderGroupItem)}</Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          ))
        )}
      </Shell.Scroll>

      {footer && (
        <Shell.PaneFooter float>
          <Toolbar backdrop size="3" aria-label="Site settings" style={{ flex: 1 }}>
            {footer}
          </Toolbar>
        </Shell.PaneFooter>
      )}
    </>
  );
}
