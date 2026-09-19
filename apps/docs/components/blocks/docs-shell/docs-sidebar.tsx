'use client';

import * as React from 'react';
import { Avatar, Flex, Sidebar, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import type {
  DocsLinkComponent,
  DocsLinkProps,
  DocsLogoConfig,
  DocsNavigationConfig,
  DocsNavigationItem,
} from './types';

export interface DocsSidebarProps {
  navigation: DocsNavigationConfig;
  logo?: DocsLogoConfig;
  /** Set by `DocsShell` from the sidebar state. @default "expanded" */
  presentation?: 'thin' | 'expanded';
  /** Rendered next to the logo, e.g. a GitHub link. */
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  /** @default "2" */
  size?: '1' | '2';
  /** @default "soft" */
  variant?: 'soft' | 'outline' | 'surface' | 'ghost';
  /** @default "soft" */
  menuVariant?: 'solid' | 'soft';
  /** @default "gray" */
  color?: React.ComponentProps<typeof Sidebar.Root>['color'];
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

export function DocsSidebar({
  navigation,
  logo,
  presentation = 'expanded',
  headerActions,
  footer,
  size = '2',
  variant = 'soft',
  menuVariant = 'soft',
  color = 'gray',
  pathname = '',
  linkComponent: LinkComponent = Anchor,
}: DocsSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  const filteredGroups = React.useMemo(() => {
    if (!query) return navigation.groups;
    return navigation.groups
      .map((group) => ({ ...group, items: group.items.filter((item) => item.title.toLowerCase().includes(query)) }))
      .filter((group) => group.items.length > 0);
  }, [navigation.groups, query]);

  const renderItem = (item: DocsNavigationItem, withBadge: boolean) => (
    <Sidebar.MenuItem key={item.href}>
      <Sidebar.MenuButton asChild isActive={pathname === item.href} badge={withBadge ? item.badge : undefined}>
        <LinkComponent href={item.href}>
          {renderIcon(item.icon)}
          <span className="rt-SidebarMenuLabel">{item.title}</span>
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
                  <span className="rt-SidebarMenuLabel">{subItem.title}</span>
                </LinkComponent>
              </Sidebar.MenuButton>
            ))}
          </Sidebar.MenuSubContent>
        </Sidebar.MenuSub>
      </Sidebar.MenuItem>
    );
  };

  const flatResults = filteredGroups.flatMap((group) => group.items);

  return (
    <Sidebar.Root size={size} variant={variant} color={color} menuVariant={menuVariant} presentation={presentation}>
      {(logo || headerActions) && (
        <Sidebar.Header>
          <Flex justify="between" align="center" width="100%">
            {logo && (
              <LinkComponent href={logo.href ?? '/'} aria-label={logo.alt ?? 'Home'}>
                {logo.label ? (
                  <Text size="7" className="kd-wordmark">
                    {presentation === 'thin' ? logo.label[0] : logo.label}
                  </Text>
                ) : (
                  <Avatar fallback={logo.alt?.[0] ?? 'K'} size={logo.size ?? '3'} src={logo.src} />
                )}
              </LinkComponent>
            )}
            {headerActions && <Flex align="center">{headerActions}</Flex>}
          </Flex>
        </Sidebar.Header>
      )}

      <Sidebar.Search value={searchQuery} onValueChange={setSearchQuery} placeholder="Search...">
        {/* In thin mode, results render inside the search popover. */}
        {presentation === 'thin' && isSearching && (
          <Sidebar.Menu>{flatResults.map((item) => renderItem(item, false))}</Sidebar.Menu>
        )}
      </Sidebar.Search>

      <Sidebar.Content>
        <Sidebar.Menu>
          {isSearching
            ? flatResults.map((item) => renderItem(item, true))
            : filteredGroups.map((group) => (
                <Sidebar.Group key={group.label}>
                  <Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
                  <Sidebar.GroupContent>{group.items.map(renderGroupItem)}</Sidebar.GroupContent>
                </Sidebar.Group>
              ))}
        </Sidebar.Menu>
      </Sidebar.Content>

      {footer && <Sidebar.Footer>{footer}</Sidebar.Footer>}
    </Sidebar.Root>
  );
}
