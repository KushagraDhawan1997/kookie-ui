'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Slot } from './slot.js';
import { Accordion } from 'radix-ui';

import { sidebarPropDefs } from './sidebar.props.js';
import { useThemeContext } from './theme.js';
// import { IconButton } from './icon-button.js';
import { ScrollArea } from './scroll-area.js';
import { Separator } from './separator.js';
import { ThickChevronRightIcon } from './icons.js';
import { extractProps } from '../helpers/extract-props.js';
import { Kbd } from './kbd.js';
import { Badge } from './badge.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';
import type { BadgeProps } from './badge.js';

// Badge configuration type for sidebar menu buttons
type BadgeConfig = {
  content: React.ReactNode;
  variant?: BadgeProps['variant'];
  size?: BadgeProps['size'];
  color?: BadgeProps['color'];
  highContrast?: BadgeProps['highContrast'];
  radius?: BadgeProps['radius'];
};

// Internal presentational context (not exported) for size/menu variant
type SidebarVisualContextValue = {
  size: '1' | '2';
  menuVariant: 'solid' | 'soft';
};
const SidebarVisualContext = React.createContext<SidebarVisualContextValue | null>(null);
function useSidebarVisual() {
  return React.useContext(SidebarVisualContext);
}

// Sidebar is now independent of Shell - no integration needed

// Main Sidebar component
type SidebarOwnProps = GetPropDefTypes<typeof sidebarPropDefs>;
interface SidebarProps extends ComponentPropsWithout<'div', RemovedProps>, SidebarOwnProps {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>((props, forwardedRef) => {
  const themeContext = useThemeContext();

  const {
    size = sidebarPropDefs.size.default,
    variant = sidebarPropDefs.variant.default,
    menuVariant = sidebarPropDefs.menuVariant.default,
    layout = sidebarPropDefs.layout.default,
    // type = sidebarPropDefs.type.default,
    // side = sidebarPropDefs.side.default,
    // collapsible = sidebarPropDefs.collapsible.default,
    panelBackground,
    color,
    highContrast = sidebarPropDefs.highContrast.default,
  } = props;

  const { className, children, ...rootProps } = extractProps(props, sidebarPropDefs);
  const { asChild: _, panelBackground: __, ...safeRootProps } = rootProps; // Remove asChild and panelBackground from DOM props
  const resolvedColor = color || themeContext.accentColor;

  // Resolve layout (default to 'panel')
  const resolvedLayout = layout || 'panel';

  // Update context with current props - we'll pass the resolved values
  const resolvedSize = typeof size === 'object' ? size.initial || '2' : size;
  return (
    <div
      {...safeRootProps}
      ref={forwardedRef}
      data-accent-color={resolvedColor}
      className={classNames('rt-SidebarRoot', className)}
    >
      <SidebarVisualContext.Provider value={{ size: resolvedSize, menuVariant }}>
        <div
          className={classNames(
            'rt-SidebarContainer',
            `rt-variant-${variant}`,
            `rt-r-size-${resolvedSize}`,
            `rt-menu-variant-${menuVariant}`,
            resolvedLayout && `rt-layout-${resolvedLayout}`,
          )}
          data-accent-color={resolvedColor}
          data-high-contrast={highContrast || undefined}
          data-panel-background={panelBackground}
          data-layout={resolvedLayout}
        >
          {children}
        </div>
      </SidebarVisualContext.Provider>
    </div>
  );
});
Sidebar.displayName = 'Sidebar.Root';

// Sidebar content area
interface SidebarContentProps extends React.ComponentPropsWithoutRef<'div'> {
  id?: string;
  role?: 'navigation' | 'none';
  'aria-label'?: string;
}

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  (
    {
      className,
      children,
      role = 'navigation',
      'aria-label': ariaLabel = 'Main navigation',
      id,
      ...props
    },
    forwardedRef,
  ) => {
    const visual = useSidebarVisual();
    const size = visual?.size ?? '2';
    const menuVariant = visual?.menuVariant ?? 'soft';

    return (
      <ScrollArea type="hover">
        <div
          {...props}
          ref={forwardedRef}
          id={id}
          role={role}
          aria-label={ariaLabel}
          className={classNames(
            'rt-BaseMenuContent',
            'rt-SidebarContent',
            `rt-r-size-${size}`,
            `rt-menu-variant-${menuVariant}`,
            className,
          )}
        >
          {children}
        </div>
      </ScrollArea>
    );
  },
);
SidebarContent.displayName = 'Sidebar.Content';

// Sidebar header
interface SidebarHeaderProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Whether to use the default flex container layout.
   * @default true
   */
  asContainer?: boolean;
}

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, asContainer = true, ...props }, forwardedRef) => {
    const visual = useSidebarVisual();
    const size = visual?.size ?? '2';
    const menuVariant = visual?.menuVariant ?? 'soft';

    return (
      <div
        {...props}
        ref={forwardedRef}
        className={classNames(
          'rt-SidebarHeader',
          `rt-r-size-${size}`,
          `rt-menu-variant-${menuVariant}`,
          {
            'rt-SidebarHeader--container': asContainer,
          },
          className,
        )}
      />
    );
  },
);
SidebarHeader.displayName = 'Sidebar.Header';

// Sidebar footer
interface SidebarFooterProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Whether to use the default flex container layout.
   * @default true
   */
  asContainer?: boolean;
}

const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, asContainer = true, ...props }, forwardedRef) => {
    const visual = useSidebarVisual();
    const size = visual?.size ?? '2';
    const menuVariant = visual?.menuVariant ?? 'soft';

    return (
      <div
        {...props}
        ref={forwardedRef}
        className={classNames(
          'rt-SidebarFooter',
          `rt-r-size-${size}`,
          `rt-menu-variant-${menuVariant}`,
          {
            'rt-SidebarFooter--container': asContainer,
          },
          className,
        )}
      />
    );
  },
);
SidebarFooter.displayName = 'Sidebar.Footer';

// Sidebar trigger button
// removed Trigger in presentational-only Sidebar

// Removed SidebarInset - not needed

// Sidebar separator
interface SidebarSeparatorProps extends ComponentPropsWithout<typeof Separator, RemovedProps> {}

const SidebarSeparator = React.forwardRef<
  React.ComponentRef<typeof Separator>,
  SidebarSeparatorProps
>(({ className, ...props }, forwardedRef) => (
  <Separator
    {...props}
    ref={forwardedRef}
    className={classNames('rt-SidebarSeparator', className)}
  />
));
SidebarSeparator.displayName = 'Sidebar.Separator';

// Menu components - reusing dropdown menu structure
interface SidebarMenuProps extends React.ComponentPropsWithoutRef<'ul'> {}

const SidebarMenu = React.forwardRef<HTMLUListElement, SidebarMenuProps>(
  ({ className, ...props }, forwardedRef) => (
    <ul
      {...props}
      ref={forwardedRef}
      role="menu"
      className={classNames('rt-BaseMenuViewport', 'rt-SidebarMenu', className)}
    />
  ),
);
SidebarMenu.displayName = 'Sidebar.Menu';

interface SidebarMenuItemProps extends React.ComponentPropsWithoutRef<'li'> {}

const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, ...props }, forwardedRef) => (
    <li {...props} ref={forwardedRef} className={classNames('rt-SidebarMenuItem', className)} />
  ),
);
SidebarMenuItem.displayName = 'Sidebar.MenuItem';

interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
  isActive?: boolean;
  shortcut?: React.ReactNode;
  badge?: string | BadgeConfig;
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  (
    {
      asChild = false,
      isActive = false,
      shortcut,
      badge,
      className,
      children,
      onMouseEnter,
      onMouseLeave,
      onKeyDown,
      ...props
    },
    forwardedRef,
  ) => {
    const [isHighlighted, setIsHighlighted] = React.useState(false);
    const visual = useSidebarVisual();
    const sidebarSize = visual?.size ?? '2';

    const Comp = asChild ? Slot : 'button';

    const { onClick } = props;
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        switch (event.key) {
          case 'Enter':
          case ' ':
            event.preventDefault();
            if (onClick) onClick(event as any);
            break;
          case 'ArrowDown': {
            event.preventDefault();
            // Focus next menu item
            const nextItem = (event.currentTarget as HTMLElement).nextElementSibling?.querySelector(
              '[role="menuitem"]',
            ) as HTMLElement;
            if (nextItem) nextItem.focus();
            break;
          }
          case 'ArrowUp': {
            event.preventDefault();
            // Focus previous menu item
            const prevItem = (
              event.currentTarget as HTMLElement
            ).previousElementSibling?.querySelector('[role="menuitem"]') as HTMLElement;
            if (prevItem) prevItem.focus();
            break;
          }
        }
        onKeyDown?.(event);
      },
      [onClick, onKeyDown],
    );

    return (
      <Comp
        {...props}
        ref={forwardedRef}
        role="menuitem"
        aria-current={isActive ? 'page' : undefined}
        className={classNames('rt-reset', 'rt-BaseMenuItem', 'rt-SidebarMenuButton', className)}
        data-active={isActive || undefined}
        data-highlighted={isHighlighted || undefined}
        onKeyDown={handleKeyDown}
        onMouseEnter={(event) => {
          setIsHighlighted(true);
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          setIsHighlighted(false);
          onMouseLeave?.(event);
        }}
      >
        {asChild ? (
          children
        ) : (
          <>
            {children}
            {/* Badge with soft variant default and size mapping to sidebar size */}
            {badge && (
              <div className="rt-SidebarMenuBadge">
                {typeof badge === 'string' ? (
                  <Badge size={sidebarSize} variant="soft">
                    {badge}
                  </Badge>
                ) : (
                  <Badge
                    size={badge.size || sidebarSize}
                    variant={badge.variant || 'soft'}
                    color={badge.color}
                    highContrast={badge.highContrast}
                    radius={badge.radius}
                  >
                    {badge.content}
                  </Badge>
                )}
              </div>
            )}
            {shortcut && (
              <div className="rt-BaseMenuShortcut rt-SidebarMenuShortcut">
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

// Sub-menu components using Radix Accordion
interface SidebarMenuSubProps extends React.ComponentPropsWithoutRef<'div'> {
  defaultOpen?: boolean;
}

const SidebarMenuSub = React.forwardRef<HTMLDivElement, SidebarMenuSubProps>(
  ({ defaultOpen = false, children, ...props }, forwardedRef) => {
    return (
      <div {...props} ref={forwardedRef}>
        <Accordion.Root type="single" collapsible defaultValue={defaultOpen ? 'item' : undefined}>
          <Accordion.Item value="item">{children}</Accordion.Item>
        </Accordion.Root>
      </div>
    );
  },
);
SidebarMenuSub.displayName = 'Sidebar.MenuSub';

interface SidebarMenuSubTriggerProps
  extends React.ComponentPropsWithoutRef<typeof Accordion.Trigger> {
  asChild?: boolean;
}

const SidebarMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof Accordion.Trigger>,
  SidebarMenuSubTriggerProps
>(
  (
    { asChild = false, className, children, onMouseEnter, onMouseLeave, ...props },
    forwardedRef,
  ) => {
    const [isHighlighted, setIsHighlighted] = React.useState(false);

    return (
      <Accordion.Header asChild>
        <div>
          <Accordion.Trigger
            {...props}
            ref={forwardedRef}
            asChild={asChild}
            role="menuitem"
            aria-haspopup="true"
            className={classNames(
              'rt-reset',
              'rt-BaseMenuItem',
              'rt-SidebarMenuButton',
              'rt-SidebarMenuSubTrigger',
              className,
            )}
            data-highlighted={isHighlighted || undefined}
            onMouseEnter={(event) => {
              setIsHighlighted(true);
              onMouseEnter?.(event);
            }}
            onMouseLeave={(event) => {
              setIsHighlighted(false);
              onMouseLeave?.(event);
            }}
          >
            {asChild ? (
              children
            ) : (
              <>
                {children}
                <ThickChevronRightIcon
                  className={classNames(
                    'rt-BaseMenuSubTriggerIcon',
                    'rt-SidebarMenuSubTriggerIcon',
                  )}
                />
              </>
            )}
          </Accordion.Trigger>
        </div>
      </Accordion.Header>
    );
  },
);
SidebarMenuSubTrigger.displayName = 'Sidebar.MenuSubTrigger';

interface SidebarMenuSubContentProps
  extends React.ComponentPropsWithoutRef<typeof Accordion.Content> {}

const SidebarMenuSubContent = React.forwardRef<
  React.ElementRef<typeof Accordion.Content>,
  SidebarMenuSubContentProps
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <Accordion.Content
      {...props}
      ref={forwardedRef}
      className={classNames('rt-SidebarMenuSubContent', className)}
    >
      <div className="rt-SidebarMenuSubList">{children}</div>
    </Accordion.Content>
  );
});
SidebarMenuSubContent.displayName = 'Sidebar.MenuSubContent';

// Group components
interface SidebarGroupProps extends React.ComponentPropsWithoutRef<'div'> {}

const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, ...props }, forwardedRef) => (
    <div
      {...props}
      ref={forwardedRef}
      className={classNames('rt-BaseMenuGroup', 'rt-SidebarGroup', className)}
    />
  ),
);
SidebarGroup.displayName = 'Sidebar.Group';

interface SidebarGroupLabelProps extends React.ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
}

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ asChild = false, className, ...props }, forwardedRef) => {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        {...props}
        ref={forwardedRef}
        role="group"
        className={classNames('rt-BaseMenuLabel', 'rt-SidebarGroupLabel', className)}
      />
    );
  },
);
SidebarGroupLabel.displayName = 'Sidebar.GroupLabel';

interface SidebarGroupContentProps extends React.ComponentPropsWithoutRef<'div'> {}

const SidebarGroupContent = React.forwardRef<HTMLDivElement, SidebarGroupContentProps>(
  ({ className, ...props }, forwardedRef) => (
    <div
      {...props}
      ref={forwardedRef}
      className={classNames('rt-SidebarGroupContent', className)}
    />
  ),
);
SidebarGroupContent.displayName = 'Sidebar.GroupContent';

// Export all components following shadcn's pattern
export {
  Sidebar as Root,
  SidebarContent as Content,
  SidebarHeader as Header,
  SidebarFooter as Footer,
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
};

/**
 * Enhanced Sidebar Header and Footer Usage Examples:
 *
 * 1. Simple default container (backwards compatible):
 * <Sidebar.Header>
 *   <Logo />
 *   <span>App Name</span>
 * </Sidebar.Header>
 *
 * 2. Custom flex layout:
 * <Sidebar.Header className="rt-justify-between rt-gap-3">
 *   <Logo />
 *   <Sidebar.MenuButton>
 *     <SettingsIcon />
 *   </Sidebar.MenuButton>
 * </Sidebar.Header>
 *
 * 3. Column layout for multiple rows:
 * <Sidebar.Header className="rt-flex-col rt-gap-2" asContainer={false}>
 *   <div className="rt-flex rt-items-center rt-gap-2">
 *     <Logo />
 *     <span>App Name</span>
 *   </div>
 *   <Sidebar.MenuButton>
 *     <UserAvatar />
 *     <span>John Doe</span>
 *   </Sidebar.MenuButton>
 * </Sidebar.Header>
 *
 * 4. Interactive footer with menu button:
 * <Sidebar.Footer>
 *   <Sidebar.MenuButton>
 *     <UserIcon />
 *     <span>Settings</span>
 *     <ChevronUpIcon />
 *   </Sidebar.MenuButton>
 * </Sidebar.Footer>
 *
 * 5. Custom footer layout:
 * <Sidebar.Footer className="rt-justify-between">
 *   <span>v1.0.0</span>
 *   <Sidebar.MenuButton>
 *     <HelpIcon />
 *   </Sidebar.MenuButton>
 * </Sidebar.Footer>
 *
 * Available utility classes:
 * - Layout: rt-flex-row, rt-flex-col
 * - Alignment: rt-items-center, rt-items-start, rt-items-end
 * - Justification: rt-justify-between, rt-justify-center, rt-justify-start, rt-justify-end
 * - Gap: rt-gap-1, rt-gap-2, rt-gap-3, rt-gap-4
 */

export type {
  SidebarProps as RootProps,
  SidebarContentProps as ContentProps,
  SidebarHeaderProps as HeaderProps,
  SidebarFooterProps as FooterProps,
  BadgeConfig,
};
