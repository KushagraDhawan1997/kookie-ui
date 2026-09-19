import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Theme } from '../../src/components/theme';
import * as DropdownMenu from '../../src/components/dropdown-menu';
import * as ContextMenu from '../../src/components/context-menu';

const HYDRATION_NOISE = /hydrat|did not match|server (html|rendered)|mismatch/i;

function Menus() {
  return (
    <Theme>
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>
          <button type="button">Actions</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content size={{ initial: '1', md: '2' }} submenuBehavior={{ initial: 'drill-down', md: 'cascade' }}>
          <DropdownMenu.Item shortcut="⌘ E">Edit</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Email</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div>Canvas</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content size={{ initial: '1', md: '2' }}>
          <ContextMenu.Item>Paste</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    </Theme>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('menus on the server', () => {
  test('render the triggers without throwing', () => {
    const html = renderToString(<Menus />);
    expect(html).toContain('Actions');
    expect(html).toContain('Canvas');
  });

  test('hydrate without mismatches and then open on the client', async () => {
    const html = renderToString(<Menus />);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    let root: ReturnType<typeof hydrateRoot> | undefined;
    act(() => {
      root = hydrateRoot(container, <Menus />);
    });

    const messages = [...error.mock.calls, ...warn.mock.calls].map((call) => String(call[0]));
    expect(messages.filter((message) => HYDRATION_NOISE.test(message))).toEqual([]);
    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();

    act(() => root?.unmount());
  });
});
