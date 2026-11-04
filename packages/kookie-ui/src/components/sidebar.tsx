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
import { ShellSizeContext, useSidebarVisual } from './_internal/pane-chrome.js';

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

// The name a component type goes by: a function, or the function inside forwardRef or memo.
function componentName(type: unknown): string | undefined {
  if (typeof type === 'function') {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName || fn.name;
  }
  if (type && typeof type === 'object') {
    const wrapped = type as { displayName?: string; render?: unknown; type?: unknown };
    return wrapped.displayName || componentName(wrapped.render) || componentName(wrapped.type);
  }
  return undefined;
}

function isIconElement(el: React.ReactElement<{ icon?: unknown }>): boolean {
  if (el.type === 'svg') return true;
  if (el.props?.icon) return true;
  return componentName(el.type)?.includes('Icon') ?? false;
}

function isText(node: React.ReactNode): node is string | number {
  return typeof node === 'string' || typeof node === 'number';
}

// Thin mode puts the row's icon in a wrapper that carries the hover and active tile. An icon is
// an svg, a HugeiconsIcon, or a component named *Icon. Failing that, the first element ahead of
// other content is taken as the icon (Lucide and other icon sets).
function separateIconsAndLabels(node: React.ReactNode): { icons: React.ReactNode[]; labels: React.ReactNode[] } {
  const children = React.Children.toArray(node);
  const icons: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];

  for (const child of children) {
    if (React.isValidElement<{ icon?: unknown }>(child) && isIconElement(child)) icons.push(child);
    else labels.push(isText(child) ? <span key={labels.length} className="kui-SidebarMenuLabel">{child}</span> : child);
  }

  if (icons.length === 0 && children.length > 1 && React.isValidElement(children[0])) {
    icons.push(children[0]);
    labels.shift();
  }

  return { icons, labels };
}

// Wraps the row's own text in a label span. Text inside the caller's elements is left alone.
function wrapTextNodes(node: React.ReactNode): React.ReactNode {
  return React.Children.map(node, (child) => (isText(child) ? <span className="kui-SidebarMenuLabel">{child}</span> : child));
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
    // A pane with no scope (Inspector, Bottom) still takes the Shell's index.
    const shellSize = React.useContext(ShellSizeContext);
    const sidebarSize = visual?.size ?? shellSize;
    const isThinMode = visual?.presentation === 'thin';

    const Comp = asChild ? Slot : 'button';

    // Enter and Space are left to the native button or link. The caller's handler runs first,
    // so it can preventDefault to keep the arrow keys for itself.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented) focusAdjacentSidebarButton(event);
    };

    const extras = isThinMode ? null : (
      <>
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

    const renderContent = (content: React.ReactNode): React.ReactNode => {
      if (isThinMode) {
        const { icons, labels } = separateIconsAndLabels(content);
        if (icons.length > 0) {
          return (
            <>
              <span className="kui-SidebarMenuIconWrapper">{icons}</span>
              {labels}
            </>
          );
        }
      }
      return (
        <>
          {wrapTextNodes(content)}
          {extras}
        </>
      );
    };

    // When rendering asChild, Slot expects a single child element. The row's content goes
    // inside that element, so a Link gets the label, icon tile, badge and shortcut.
    let body: React.ReactNode;
    if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children) && React.Children.count(children) === 1) {
      body = React.cloneElement(children, undefined, renderContent(children.props.children));
    } else if (asChild) {
      body = children;
    } else {
      body = renderContent(children);
    }

    return (
      <Comp
        type={asChild ? undefined : 'button'}
        {...props}
        ref={forwardedRef}
        aria-current={isActive ? 'page' : undefined}
        className={classNames('kui-reset', 'kui-BaseMenuItem', 'kui-SidebarMenuButton', className)}
        data-active={isActive || undefined}
        onKeyDown={handleKeyDown}
      >
        {body}
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

// In a Rail a sub-menu is a dropdown. Each row becomes a menu item: a MenuButton hands the item
// its props (onClick, disabled, active), and an asChild one hands it its link.
function toDropdownItem(node: React.ReactNode, key: React.Key): React.ReactNode {
  if (React.isValidElement<SidebarMenuButtonProps>(node) && node.type === SidebarMenuButton) {
    // The badge and shortcut have no place in a dropdown row; `type` belongs to a button only.
    const { asChild, isActive, shortcut, badge, type, children, ...rest } = node.props;
    const itemProps = {
      ...(rest as Omit<React.ComponentPropsWithoutRef<typeof DropdownMenu.Item>, 'color'>),
      'data-active': isActive || undefined,
      'aria-current': isActive ? ('page' as const) : undefined,
    };
    if (asChild && React.isValidElement(children) && React.Children.count(children) === 1) {
      return (
        <DropdownMenu.Item key={key} {...itemProps} asChild>
          {children}
        </DropdownMenu.Item>
      );
    }
    return (
      <DropdownMenu.Item key={key} {...itemProps}>
        {children}
      </DropdownMenu.Item>
    );
  }
  if (React.isValidElement(node)) {
    return (
      <DropdownMenu.Item key={key} asChild>
        {node}
      </DropdownMenu.Item>
    );
  }
  return <DropdownMenu.Item key={key}>{node}</DropdownMenu.Item>;
}

// The sub-list is a <ul>, so each row needs its own <li>. A MenuButton written straight into
// MenuSubContent gets a MenuItem around it, rather than leaving an <a> or <button> in the list.
function wrapBareMenuButtons(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child, index) =>
    React.isValidElement(child) && child.type === SidebarMenuButton ? (
      <SidebarMenuItem key={child.key ?? index}>{child}</SidebarMenuItem>
    ) : (
      child
    ),
  );
}

const SidebarMenuSubContent = React.forwardRef<React.ElementRef<typeof Accordion.Content>, SidebarMenuSubContentProps>(({ className, children, ...props }, forwardedRef) => {
  const visual = useSidebarVisual();
  const mode = React.useContext(SidebarSubMenuModeContext);

  if (mode === 'dropdown') {
    const items = React.Children.map(children, (child, index) => {
      if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === SidebarMenuItem) {
        const rows = React.Children.toArray(child.props.children);
        return toDropdownItem(rows.length === 1 ? rows[0] : rows, index);
      }
      return toDropdownItem(child, index);
    });

    return (
      <DropdownMenu.Content
        {...(props as Omit<React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>, 'color'>)}
        ref={forwardedRef}
        size={visual?.size}
        className={classNames(className)}
      >
        <DropdownMenu.Group>{items}</DropdownMenu.Group>
      </DropdownMenu.Content>
    );
  }

  return (
    <Accordion.Content {...props} ref={forwardedRef} className={classNames('kui-SidebarMenuSubContent', className)}>
      <ul className="kui-SidebarMenuSubList">{wrapBareMenuButtons(children)}</ul>
    </Accordion.Content>
  );
});
SidebarMenuSubContent.displayName = 'Sidebar.MenuSubContent';

// Group components. A group with a label is a named group; one without stays a plain div, so it
// isn't announced as an empty group.
type SidebarGroupContextValue = { labelId: string; setLabelId: (id: string | null) => void };
const SidebarGroupContext = React.createContext<SidebarGroupContextValue | null>(null);

interface SidebarGroupProps extends React.ComponentPropsWithoutRef<'div'> {}

const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(({ className, ...props }, forwardedRef) => {
  const labelId = React.useId();
  const [renderedLabelId, setLabelId] = React.useState<string | null>(null);
  const context = React.useMemo(() => ({ labelId, setLabelId }), [labelId]);
  return (
    <SidebarGroupContext.Provider value={context}>
      <div
        role={renderedLabelId ? 'group' : undefined}
        aria-labelledby={renderedLabelId ?? undefined}
        {...props}
        ref={forwardedRef}
        className={classNames('kui-BaseMenuGroup', 'kui-SidebarGroup', className)}
      />
    </SidebarGroupContext.Provider>
  );
});
SidebarGroup.displayName = 'Sidebar.Group';

interface SidebarGroupLabelProps extends React.ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
}

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(({ asChild = false, className, id, ...props }, forwardedRef) => {
  const Comp = asChild ? Slot : 'div';
  const group = React.useContext(SidebarGroupContext);
  const labelId = id ?? group?.labelId;
  const setLabelId = group?.setLabelId;

  React.useEffect(() => {
    if (!setLabelId || !labelId) return;
    setLabelId(labelId);
    return () => setLabelId(null);
  }, [setLabelId, labelId]);

  return <Comp {...props} id={labelId} ref={forwardedRef} className={classNames('kui-BaseMenuLabel', 'kui-SidebarGroupLabel', className)} />;
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
        // A result row already moved focus with its own arrow handling (focusAdjacentSidebarButton
        // scopes to this popover); moving again would skip a row.
        if (e.defaultPrevented) return;
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
