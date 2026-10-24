'use client';

import * as React from 'react';
import classNames from 'classnames';
import { Flex } from './flex.js';

import type { FlexProps } from './flex.js';
import type { MarginProps } from '../props/margin.props.js';

// Navbar slots are parts, not layout primitives: the bar owns their spacing.
type NavbarSlotFlexProps = Omit<FlexProps, keyof MarginProps>;

import { navbarRootPropDefs } from './navbar.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

/**
 * Navbar Component
 *
 * A horizontal navigation bar component with semantic slots for organizing
 * content. Follows the Shell and Sidebar compound component patterns.
 *
 * @example
 * <Navbar.Root>
 *   <Navbar.Logo>Brand/logo content</Navbar.Logo>
 *   <Navbar.Navigation>Navigation links</Navbar.Navigation>
 *   <Navbar.Actions>CTAs, user menu, etc</Navbar.Actions>
 * </Navbar.Root>
 */

// Root Component
type NavbarRootElement = React.ElementRef<'header'>;
type NavbarRootOwnProps = GetPropDefTypes<typeof navbarRootPropDefs>;
interface NavbarRootProps
  extends ComponentPropsWithout<'header', RemovedProps>,
    NavbarRootOwnProps {}

const NavbarRoot = React.forwardRef<NavbarRootElement, NavbarRootProps>(
  (ownProps, forwardedRef) => {
    const props = useThemeSizeProps(ownProps, navbarRootPropDefs.size);
    const { children, className, ...rootProps } = extractProps(
      props,
      navbarRootPropDefs,
    );

    const position = props.position ?? 'fixed';
    const size = props.size ?? '2';

    return (
      <header
        {...rootProps}
        ref={forwardedRef}
        className={classNames('kui-NavbarRoot', className)}
        data-position={position}
        data-size={size}
      >
        <div className="kui-NavbarContainer">{children}</div>
      </header>
    );
  },
);
NavbarRoot.displayName = 'Navbar.Root';

// Logo Slot - extends FlexProps
type NavbarLogoProps = NavbarSlotFlexProps & {
  asChild?: boolean;
};

// With `asChild`, Flex renders the child, so the layout props become classes on it, not attributes.
const NavbarLogo = React.forwardRef<HTMLDivElement, NavbarLogoProps>(
  ({ gap = '2', align = 'center', justify = 'start', className, ...props }, ref) => (
    <Flex
      ref={ref}
      gap={gap}
      align={align}
      justify={justify}
      className={classNames('kui-NavbarLogo', className)}
      {...props}
    />
  ),
);
NavbarLogo.displayName = 'Navbar.Logo';

// Navigation Slot - extends FlexProps
type NavbarNavigationProps = NavbarSlotFlexProps & {
  asChild?: boolean;
};

const NavbarNavigation = React.forwardRef<HTMLDivElement, NavbarNavigationProps>(
  ({ gap = '4', align = 'center', justify = 'center', className, ...props }, ref) => (
    <Flex
      ref={ref}
      gap={gap}
      align={align}
      justify={justify}
      className={classNames('kui-NavbarNavigation', className)}
      role="navigation"
      // A landmark needs a name to be told apart from other navigation on the page.
      aria-label={props['aria-labelledby'] === undefined ? 'Main' : undefined}
      {...props}
    />
  ),
);
NavbarNavigation.displayName = 'Navbar.Navigation';

// Actions Slot - extends FlexProps
type NavbarActionsProps = NavbarSlotFlexProps & {
  asChild?: boolean;
};

const NavbarActions = React.forwardRef<HTMLDivElement, NavbarActionsProps>(
  ({ gap = '4', align = 'center', justify = 'end', className, ...props }, ref) => (
    <Flex
      ref={ref}
      gap={gap}
      align={align}
      justify={justify}
      className={classNames('kui-NavbarActions', className)}
      {...props}
    />
  ),
);
NavbarActions.displayName = 'Navbar.Actions';

export {
  NavbarRoot as Root,
  NavbarLogo as Logo,
  NavbarNavigation as Navigation,
  NavbarActions as Actions,
};

export type {
  NavbarRootProps as RootProps,
  NavbarLogoProps as LogoProps,
  NavbarNavigationProps as NavigationProps,
  NavbarActionsProps as ActionsProps,
};
