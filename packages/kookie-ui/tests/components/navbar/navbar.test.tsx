import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Navbar } from '../../../src/components/index';

describe('Navbar.Navigation', () => {
  it('is named "Main" by default', () => {
    renderWithProviders(
      <Navbar.Root>
        <Navbar.Navigation>
          <a href="/docs">Docs</a>
        </Navbar.Navigation>
      </Navbar.Root>,
    );
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('takes its own aria-label or aria-labelledby instead', () => {
    renderWithProviders(
      <Navbar.Root>
        <Navbar.Navigation aria-label="Product">x</Navbar.Navigation>
        <span id="lbl">Account</span>
        <Navbar.Navigation aria-labelledby="lbl">y</Navbar.Navigation>
      </Navbar.Root>,
    );
    expect(screen.getByRole('navigation', { name: 'Product' })).toBeInTheDocument();
    const account = screen.getByRole('navigation', { name: 'Account' });
    expect(account).not.toHaveAttribute('aria-label');
  });
});

describe('Navbar slots with asChild', () => {
  it('turn Flex props into classes, not attributes on the child', () => {
    renderWithProviders(
      <Navbar.Root>
        <Navbar.Logo asChild gap="3" display="none">
          <a href="/">Acme</a>
        </Navbar.Logo>
        <Navbar.Navigation asChild direction="column" aria-label="Main">
          <nav>links</nav>
        </Navbar.Navigation>
        <Navbar.Actions asChild wrap="wrap">
          <div>actions</div>
        </Navbar.Actions>
      </Navbar.Root>,
    );
    const logo = screen.getByText('Acme');
    expect(logo.tagName).toBe('A');
    expect(logo).toHaveClass('kui-NavbarLogo', 'kui-Flex', 'kui-r-gap-3', 'kui-r-display-none');
    expect(logo).not.toHaveAttribute('gap');
    expect(logo).not.toHaveAttribute('display');

    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav.tagName).toBe('NAV');
    expect(nav).toHaveClass('kui-NavbarNavigation', 'kui-r-fd-column');
    expect(nav).not.toHaveAttribute('direction');

    const actions = screen.getByText('actions');
    expect(actions).toHaveClass('kui-NavbarActions');
    expect(actions).not.toHaveAttribute('wrap');
  });
});
