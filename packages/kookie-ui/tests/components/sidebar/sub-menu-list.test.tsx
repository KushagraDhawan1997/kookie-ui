import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { Sidebar } from '../../../src/components/index';

describe('Sidebar sub-menu list', () => {
  it('nests its rows in a list, so no list item sits directly in another', () => {
    const { container } = renderWithProviders(
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuSub defaultOpen>
            <Sidebar.MenuSubTrigger>Projects</Sidebar.MenuSubTrigger>
            <Sidebar.MenuSubContent>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>Atlas</Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.MenuSubContent>
          </Sidebar.MenuSub>
        </Sidebar.MenuItem>
      </Sidebar.Menu>,
    );
    const inner = container.querySelectorAll('li li');
    expect(inner.length).toBeGreaterThan(0);
    for (const li of inner) expect(li.parentElement?.tagName).toMatch(/^(UL|OL)$/);
  });
});
