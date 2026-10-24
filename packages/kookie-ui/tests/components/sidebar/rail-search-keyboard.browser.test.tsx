import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Shell, Sidebar, Theme } from '../../../src/components/index';

function RailSearch() {
  const [value, setValue] = React.useState('');
  return (
    <Theme>
      <Shell.Root height="400px">
        <Shell.Rail defaultOpen presentation="fixed">
          <Sidebar.Search value={value} onValueChange={setValue}>
            <Sidebar.Menu>
              {['One', 'Two', 'Three'].map((name) => (
                <Sidebar.MenuItem key={name}>
                  <Sidebar.MenuButton>{name}</Sidebar.MenuButton>
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar.Search>
        </Shell.Rail>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>
    </Theme>
  );
}

// The results take one step per arrow press: the row's own arrow handling and the popover's
// must not both move focus.
describe('Rail search popover', () => {
  it('arrow keys walk the results one at a time', async () => {
    render(<RailSearch />);
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    const input = await screen.findByRole('searchbox');
    await waitFor(() => expect(document.activeElement).toBe(input));

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'One' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Two' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Three' }));
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Two' }));
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(document.activeElement).toBe(input);
  });
});
