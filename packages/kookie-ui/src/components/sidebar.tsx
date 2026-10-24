'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Slot } from './slot.js';
import * as Accordion from '@radix-ui/react-accordion';
import * as DropdownMenu from './dropdown-menu.js';
import * as Popover from './popover.js';

import { Separator } from './separator.js';
import { ThickChevronRightIcon } from './icons.js';
import { Kbd } from './kbd.js';
import { Chip } from './chip.js';
import { useSidebarVisual } from './_internal/pane-chrome.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { ChipProps } from './chip.js';

// Chip configuration for the `badge` slot of sidebar menu buttons
type BadgeConfig = {
  content: React.ReactNode;
  variant?: ChipProps['variant'];
  size?: ChipProps['size'];
  color?: ChipProps['color'];
  radius?: ChipProps['radius'];
};

// Sidebar separator
interface SidebarSeparatorProps extends ComponentPropsWithout<typeof Separator, RemovedProps> {}

const SidebarSeparator = React.forwardRef<React.ComponentRef<typeof Separator>, SidebarSeparatorProps>(({ className, ...props }, forwardedRef) => (
  <Separator {...props} ref={forwardedRef} className={classNames('kui-SidebarSeparator', className)} />
));
SidebarSeparator.displayName = 'Sidebar.Separator';

// Menu components - styled like dropdown menus, but semantically a navigation list.
// No menu/menuitem roles: those promise an application menu, which a list of links is not.
interface SidebarMenuProps extends React.ComponentPropsWithoutRef<'ul'> {}

const SidebarMenu = React.forwardRef<HTMLUListElement, SidebarMenuProps>(({ className, ...props }, forwardedRef) => (
  <ul {...props} ref={forwardedRef} className={classNames('kui-SidebarMenu', className)} />
));
SidebarMenu.displayName = 'Sidebar.Menu';

interface SidebarMenuItemProps extends React.ComponentPropsWithoutRef<'li'> {}

const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(({ className, ...props }, forwardedRef) => (
  <li {...props} ref={forwardedRef} className={classNames('kui-SidebarMenuItem', className)} />
));
SidebarMenuItem.displayName = 'Sidebar.MenuItem';

interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
  isActive?: boolean;
  shortcut?: React.ReactNode;
  badge?: string | BadgeConfig;
}

// Extracted to module scope to avoid re-creation on every render
function separateIconsAndLabels(node: React.ReactNode): { icons: React.ReactNode[]; labels: React.ReactNode[] } {
  const icons: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];

  React.Children.forEach(node, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      labels.push(<span key={labels.length} className="kui-SidebarMenuLabel">{child}</span>);
    } else if (React.isValidElement(child)) {
      const el = child as React.ReactElement<any>;
      if (el.type === 'svg' || (el.props && el.props.icon) || (typeof el.type === 'function' && ((el.type as any).displayName?.includes('Icon') || (el.type as any).name?.includes('Icon')))) {
        icons.push(child);
      } else {
        labels.push(child);
      }
    } else if (child) {
      labels.push(child);
    }
  });

  return { icons, labels };
}

function wrapTextNodes(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'string' || typeof node === 'number') {
    return <span className="kui-SidebarMenuLabel">{node}</span>;
  }
  if (Array.isArray(node)) {
    return node.map((child, index) => <React.Fragment key={index}>{wrapTextNodes(child)}</React.Fragment>);
  }
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<any>;
    const className: string = (el.props && (el.props as any).className) || '';
    const isAlreadyLabel = typeof el.type === 'string' && className.split(' ').includes('kui-SidebarMenuLabel');
    if (isAlreadyLabel) return el;
    const newChildren = wrapTextNodes((el.props as any)?.children);
    return React.cloneElement(el, { ...(el.props as any) }, newChildren);
  }
  return node;
}

// Arrow Up and Down move between the visible buttons of the same sidebar, as a
// convenience on top of Tab. Sub-menu triggers take part, so the one-item Accordion
// behind each sub-menu doesn't keep focus on its own trigger.
function focusAdjacentSidebarButton(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const scope = event.currentTarget.closest('.kui-SidebarContent, .kui-SidebarSearchPopover');
  const buttons = scope
    ? Array.from(scope.querySelectorAll<HTMLElement>('.kui-SidebarMenuButton')).filter((el) => el.offsetParent !== null)
    : [];
  const index = buttons.indexOf(event.currentTarget);
  const next = buttons[index + (event.key === 'ArrowDown' ? 1 : -1)];
  if (index !== -1 && next) {
    event.preventDefault();
    next.focus();
  }
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ asChild = false, isActive = false, shortcut, badge, className, children, onKeyDown, ...props }, forwardedRef) => {
    const visual = useSidebarVisual();
    const sidebarSize = visual?.size ?? '2';
    const isThinMode = visual?.presentation === 'thin';

    const Comp = asChild ? Slot : 'button';

    // Enter and Space are left to the native button or link.
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        focusAdjacentSidebarButton(event);
        onKeyDown?.(event);
      },
      [onKeyDown],
    );

    // Memoize child processing to avoid re-traversal on every render
    const processedChildren = React.useMemo(() => wrapTextNodes(children), [children]);

    // For thin mode, separate icons into a wrapper for targeted background styling
    const { icons, labels } = React.useMemo(
      () => isThinMode ? separateIconsAndLabels(children) : { icons: [] as React.ReactNode[], labels: [] as React.ReactNode[] },
      [isThinMode, children],
    );

    // When rendering asChild, Slot expects a single child element. We still want to
    // append optional badge/shortcut inside that element so they render with Link.
    const slottedChildren = React.useMemo(() => {
      if (!asChild) return null;
      try {
        const onlyChild = React.Children.only(processedChildren as React.ReactElement<any>) as React.ReactElement<any>;
        const originalInnerChildren = (onlyChild.props as any)?.children;
        const enhancedInnerChildren = (
          <>
            {originalInnerChildren}
            {badge && (
              <div className="kui-SidebarMenuBadge">
                {typeof badge === 'string' ? (
                  <Chip size={sidebarSize} variant="soft">
                    {badge}
                  </Chip>
                ) : (
                  <Chip size={badge.size || sidebarSize} variant={badge.variant || 'soft'} color={badge.color} radius={badge.radius}>
                    {badge.content}
                  </Chip>
                )}
              </div>
            )}
            {shortcut && (
              <div className="kui-BaseMenuShortcut kui-SidebarMenuShortcut">
                <Kbd size={sidebarSize}>{shortcut}</Kbd>
              </div>
            )}
          </>
        );
        return React.cloneElement(onlyChild, { ...(onlyChild.props as any) }, enhancedInnerChildren);
      } catch {
        // Fallback: if multiple children were passed incorrectly, just return processedChildren
        return processedChildren as React.ReactNode;
      }
    }, [asChild, processedChildren, badge, shortcut, sidebarSize]);

    return (
      <Comp
        {...props}
        ref={forwardedRef}
        aria-current={isActive ? 'page' : undefined}
        className={classNames('kui-reset', 'kui-BaseMenuItem', 'kui-SidebarMenuButton', className)}
        data-active={isActive || undefined}
        onKeyDown={handleKeyDown}
      >
        {asChild ? (
          slottedChildren
        ) : isThinMode && icons.length > 0 ? (
          <>
            <span className="kui-SidebarMenuIconWrapper">{icons}</span>
            {labels.map((label, index) => (
              <React.Fragment key={index}>
                {typeof label === 'string' || typeof label === 'number' ? (
                  <span className="kui-SidebarMenuLabel">{label}</span>
                ) : (
                  label
                )}
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            {processedChildren}
            {badge && (
              <div className="kui-SidebarMenuBadge">
                {typeof badge === 'string' ? (
                  <Chip size={sidebarSize} variant="soft">
                    {badge}
                  </Chip>
                ) : (
                  <Chip size={badge.size || sidebarSize} variant={badge.variant || 'soft'} color={badge.color} radius={badge.radius}>
                    {badge.content}
                  </Chip>
                )}
              </div>
            )}
            {shortcut && (
              <div className="kui-BaseMenuShortcut kui-SidebarMenuShortcut">
                <Kbd size={sidebarSize}>{shortcut}</Kbd>
              </div>
            )}
          </>
        )}
      </Comp>
    );
  },
);
SidebarMenuButton.displayName = 'Sidebar.MenuButton';

// Sub-menu components: Accordion in expanded, Dropdown in thin
const SidebarSubMenuModeContext = React.createContext<'accordion' | 'dropdown'>('accordion');
interface SidebarMenuSubProps extends React.ComponentPropsWithoutRef<'div'> {
  defaultOpen?: boolean;
}

const SidebarMenuSub = React.forwardRef<HTMLDivElement, SidebarMenuSubProps>(({ defaultOpen = false, children, ...props }, forwardedRef) => {
  const visual = useSidebarVisual();
  const mode: 'accordion' | 'dropdown' = visual?.presentation === 'thin' ? 'dropdown' : 'accordion';

  if (mode === 'dropdown') {
    return (
      <div {...props} ref={forwardedRef}>
        <DropdownMenu.Root>
          <SidebarSubMenuModeContext.Provider value="dropdown">{children}</SidebarSubMenuModeContext.Provider>
        </DropdownMenu.Root>
      </div>
    );
  }

  return (
    <div {...props} ref={forwardedRef}>
      <SidebarSubMenuModeContext.Provider value="accordion">
        <Accordion.Root type="single" collapsible defaultValue={defaultOpen ? 'item' : undefined}>
          <Accordion.Item value="item">{children}</Accordion.Item>
        </Accordion.Root>
      </SidebarSubMenuModeContext.Provider>
    </div>
  );
});
SidebarMenuSub.displayName = 'Sidebar.MenuSub';

interface SidebarMenuSubTriggerProps extends React.ComponentPropsWithoutRef<typeof Accordion.Trigger> {
  asChild?: boolean;
}

const SidebarMenuSubTrigger = React.forwardRef<React.ElementRef<typeof Accordion.Trigger>, SidebarMenuSubTriggerProps>(
  ({ asChild = false, className, children, onKeyDown, ...props }, forwardedRef) => {
    const mode = React.useContext(SidebarSubMenuModeContext);

    if (mode === 'dropdown') {
      return (
        <DropdownMenu.Trigger>
          <button
            {...(props as any)}
            onKeyDown={onKeyDown}
            ref={forwardedRef as any}
            type="button"
            aria-haspopup="menu"
            className={classNames('kui-reset', 'kui-BaseMenuItem', 'kui-SidebarMenuButton', 'kui-SidebarMenuSubTrigger', className)}
          >
            {children}
          </button>
        </DropdownMenu.Trigger>
      );
    }

    return (
      <Accordion.Header asChild>
        <div>
          <Accordion.Trigger
            {...props}
            onKeyDown={(event) => {
              // Runs before the Accordion's own arrow handling, which would keep focus here.
              focusAdjacentSidebarButton(event);
              onKeyDown?.(event);
            }}
            ref={forwardedRef}
            asChild={asChild}
            className={classNames('kui-reset', 'kui-BaseMenuItem', 'kui-SidebarMenuButton', 'kui-SidebarMenuSubTrigger', className)}
          >
            {asChild ? (
              children
            ) : (
              <>
                {children}
                <ThickChevronRightIcon className={classNames('kui-BaseMenuSubTriggerIcon', 'kui-SidebarMenuSubTriggerIcon')} />
              </>
            )}
          </Accordion.Trigger>
        </div>
      </Accordion.Header>
    );
  },
);
SidebarMenuSubTrigger.displayName = 'Sidebar.MenuSubTrigger';

interface SidebarMenuSubContentProps extends React.ComponentPropsWithoutRef<typeof Accordion.Content> {}

const SidebarMenuSubContent = React.forwardRef<React.ElementRef<typeof Accordion.Content>, SidebarMenuSubContentProps>(({ className, children, ...props }, forwardedRef) => {
  const visual = useSidebarVisual();
  const mode = React.useContext(SidebarSubMenuModeContext);

  if (mode === 'dropdown') {
    const unwrapMenuButton = (node: React.ReactNode): React.ReactNode => {
      if (Array.isArray(node)) {
        return node.map((n, i) => <React.Fragment key={i}>{unwrapMenuButton(n)}</React.Fragment>);
      }
      if (React.isValidElement(node)) {
        const typeDisplay = (node.type as any)?.displayName;
        if (typeDisplay === 'Sidebar.MenuButton') {
          return (node.props as any)?.children;
        }
        const child = (node.props as any)?.children;
        if (child !== undefined) {
          return React.cloneElement(node as any, { ...(node.props as any), children: unwrapMenuButton(child) });
        }
      }
      return node;
    };

    const normalized = React.Children.map(children as React.ReactNode, (child, index) => {
      if (React.isValidElement(child) && (child.type as any)?.displayName === 'Sidebar.MenuItem') {
        const itemChildren = (child.props as any)?.children;
        const content = unwrapMenuButton(itemChildren);
        return (
          <DropdownMenu.Item key={index} asChild>
            {content as any}
          </DropdownMenu.Item>
        );
      }
      // Fallback: wrap raw nodes too for consistent menu styling
      return (
        <DropdownMenu.Item key={index} asChild>
          {unwrapMenuButton(child) as any}
        </DropdownMenu.Item>
      );
    });

    return (
      <DropdownMenu.Content size={visual?.size} className={classNames(className)}>
        <DropdownMenu.Group>{normalized}</DropdownMenu.Group>
      </DropdownMenu.Content>
    );
  }

  return (
    <Accordion.Content {...props} ref={forwardedRef} className={classNames('kui-SidebarMenuSubContent', className)}>
      <ul className="kui-SidebarMenuSubList">{children}</ul>
    </Accordion.Content>
  );
});
SidebarMenuSubContent.displayName = 'Sidebar.MenuSubContent';

// Group components. The label is plain text: no role, so it isn't announced as an empty group.
interface SidebarGroupProps extends React.ComponentPropsWithoutRef<'div'> {}

const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(({ className, ...props }, forwardedRef) => (
  <div {...props} ref={forwardedRef} className={classNames('kui-BaseMenuGroup', 'kui-SidebarGroup', className)} />
));
SidebarGroup.displayName = 'Sidebar.Group';

interface SidebarGroupLabelProps extends React.ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
}

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(({ asChild = false, className, ...props }, forwardedRef) => {
  const Comp = asChild ? Slot : 'div';

  return <Comp {...props} ref={forwardedRef} className={classNames('kui-BaseMenuLabel', 'kui-SidebarGroupLabel', className)} />;
});
SidebarGroupLabel.displayName = 'Sidebar.GroupLabel';

interface SidebarGroupContentProps extends React.ComponentPropsWithoutRef<'div'> {}

const SidebarGroupContent = React.forwardRef<HTMLDivElement, SidebarGroupContentProps>(({ className, ...props }, forwardedRef) => (
  <div {...props} ref={forwardedRef} className={classNames('kui-SidebarGroupContent', className)} />
));
SidebarGroupContent.displayName = 'Sidebar.GroupContent';

// Search component: inline input in expanded, popover trigger in thin
interface SidebarSearchProps extends React.ComponentPropsWithoutRef<'div'> {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClearIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SidebarSearch = React.forwardRef<HTMLDivElement, SidebarSearchProps>(
  ({ value, onValueChange, placeholder = 'Search...', children, className, ...props }, forwardedRef) => {
    const visual = useSidebarVisual();
    const isThin = visual?.presentation === 'thin';
    const inputRef = React.useRef<HTMLInputElement>(null);
    const popoverRef = React.useRef<HTMLDivElement>(null);
    const searchId = React.useId();
    const resultsId = `${searchId}-results`;

    // Stable refs for values used in callbacks — avoids recreating handlers on every keystroke
    const valueRef = React.useRef(value);
    valueRef.current = value;
    const onValueChangeRef = React.useRef(onValueChange);
    onValueChangeRef.current = onValueChange;

    // Derive a clean aria-label from placeholder (strip trailing dots/ellipsis)
    const searchLabel = placeholder.replace(/\.+$/, '');

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape' && valueRef.current) {
          e.preventDefault();
          e.stopPropagation();
          onValueChangeRef.current('');
          inputRef.current?.focus();
        }
      },
      [],
    );

    // Arrow key navigation within the popover (input ↔ results)
    const handlePopoverKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const container = popoverRef.current;
        if (!container) return;

        const resultsGroup = container.querySelector('[role="group"]');
        if (!resultsGroup) return;

        const items = Array.from(
          resultsGroup.querySelectorAll<HTMLElement>('a, button'),
        );
        if (items.length === 0) return;

        const active = document.activeElement as HTMLElement;
        const isOnInput = active === inputRef.current;
        const currentIndex = items.indexOf(active);

        // Typing while a result is focused → redirect focus to input
        if (
          e.key.length === 1 &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey &&
          !isOnInput &&
          currentIndex !== -1
        ) {
          inputRef.current?.focus();
          return;
        }

        switch (e.key) {
          case 'ArrowDown': {
            e.preventDefault();
            if (isOnInput || currentIndex === -1) {
              items[0]?.focus();
            } else if (currentIndex < items.length - 1) {
              items[currentIndex + 1]?.focus();
            }
            break;
          }
          case 'ArrowUp': {
            e.preventDefault();
            if (currentIndex <= 0) {
              inputRef.current?.focus();
            } else {
              items[currentIndex - 1]?.focus();
            }
            break;
          }
          case 'Home': {
            // Only intercept when focused on a result, not the input (where Home moves cursor)
            if (!isOnInput) {
              e.preventDefault();
              items[0]?.focus();
            }
            break;
          }
          case 'End': {
            if (!isOnInput) {
              e.preventDefault();
              items[items.length - 1]?.focus();
            }
            break;
          }
        }
      },
      [],
    );

    if (isThin) {
      return (
        <div {...props} ref={forwardedRef} className={classNames('kui-SidebarSearch', 'kui-SidebarSearch--thin', className)}>
          <Popover.Root>
            <Popover.Trigger>
              <button
                type="button"
                className={classNames('kui-reset', 'kui-BaseMenuItem', 'kui-SidebarMenuButton', 'kui-SidebarSearchTrigger')}
                aria-label={searchLabel}
              >
                <span className="kui-SidebarMenuIconWrapper">
                  <SearchIcon />
                </span>
                <span className="kui-SidebarMenuLabel">Search</span>
              </button>
            </Popover.Trigger>
            <Popover.Content side="right" align="start" size="2" width="280px" aria-label={searchLabel}>
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- keyDown manages arrow-key navigation between input and results, which is accessibility-enhancing */}
              <div
                ref={popoverRef}
                className="kui-SidebarSearchPopover"
                role="search"
                onKeyDown={handlePopoverKeyDown}
              >
                <div className="kui-SidebarSearchInputWrapper">
                  <SearchIcon className="kui-SidebarSearchIcon" />
                  <input
                    ref={inputRef}
                    type="search"
                    className="kui-SidebarSearchInput"
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    aria-label={searchLabel}
                    aria-controls={children ? resultsId : undefined}
                    // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: popover opens on user action, focusing the input is expected UX
                    autoFocus
                  />
                  {value && (
                    <button
                      type="button"
                      className="kui-reset kui-SidebarSearchClear"
                      onClick={() => {
                        onValueChange('');
                        inputRef.current?.focus();
                      }}
                      aria-label="Clear search"
                    >
                      <ClearIcon />
                    </button>
                  )}
                </div>
                {children && (
                  <div id={resultsId} role="group" aria-label="Search results">
                    {children}
                  </div>
                )}
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>
      );
    }

    // Expanded mode: inline input
    return (
      <div {...props} ref={forwardedRef} className={classNames('kui-SidebarSearch', 'kui-SidebarSearch--expanded', 'kui-ShellPaneChrome', `kui-r-size-${visual?.size ?? '2'}`, className)} role="search">
        <div className="kui-SidebarSearchInputWrapper">
          <SearchIcon className="kui-SidebarSearchIcon" />
          <input
            ref={inputRef}
            type="search"
            className="kui-SidebarSearchInput"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={searchLabel}
          />
          {value && (
            <button
              type="button"
              className="kui-reset kui-SidebarSearchClear"
              onClick={() => {
                onValueChange('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>
    );
  },
);
SidebarSearch.displayName = 'Sidebar.Search';

// Export all components following shadcn's pattern
export {
  SidebarSeparator as Separator,
  SidebarMenu as Menu,
  SidebarMenuItem as MenuItem,
  SidebarMenuButton as MenuButton,
  SidebarMenuSub as MenuSub,
  SidebarMenuSubTrigger as MenuSubTrigger,
  SidebarMenuSubContent as MenuSubContent,
  SidebarGroup as Group,
  SidebarGroupLabel as GroupLabel,
  SidebarGroupContent as GroupContent,
  SidebarSearch as Search,
};

export type { BadgeConfig };
