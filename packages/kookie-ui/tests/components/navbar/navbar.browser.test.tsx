import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Navbar, Theme } from '../../../src/components/index';

describe('Navbar layout', () => {
  it('centres Navigation when there is no Logo', () => {
    const { container } = render(
      <Theme>
        <Navbar.Root position="static">
          <Navbar.Navigation>
            <a href="#docs">Docs</a>
          </Navbar.Navigation>
          <Navbar.Actions>
            <button type="button">Sign in</button>
          </Navbar.Actions>
        </Navbar.Root>
      </Theme>,
    );
    const box = container.querySelector('.kui-NavbarContainer')!.getBoundingClientRect();
    const nav = container.querySelector('.kui-NavbarNavigation')!.getBoundingClientRect();
    expect(Math.abs(nav.left + nav.width / 2 - (box.left + box.width / 2))).toBeLessThan(1);
  });
});
