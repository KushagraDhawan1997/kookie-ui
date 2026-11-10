import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Avatar, Combobox, Navbar, Select, Shell, Theme, VirtualMenu } from '../../src/components/index';

/**
 * What the server HTML says before any effect runs. Each of these was wrong once: the markup was
 * only corrected after hydration, or carried an attribute it should not.
 */
describe('server markup', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('an avatar with no picture shows its fallback', () => {
    const html = renderToString(
      <Theme>
        <Avatar fallback="KD" />
      </Theme>,
    );
    expect(html).toContain('>KD<');
  });

  test('an avatar with a picture waits for it', () => {
    const html = renderToString(
      <Theme>
        <Avatar fallback="KD" src="/a.png" alt="Kushagra" />
      </Theme>,
    );
    expect(html).not.toContain('>KD<');
  });

  test('Select.Trigger leaves error and loading off when they are false', () => {
    const html = renderToString(
      <Theme>
        <Select.Root>
          <Select.Trigger aria-label="Fruit" error={false} loading={false} />
        </Select.Root>
      </Theme>,
    );
    expect(html).not.toContain('data-error');
    expect(html).not.toContain('data-loading');
  });

  test('Combobox.Trigger leaves error and loading off when they are false', () => {
    const html = renderToString(
      <Theme>
        <Combobox.Root>
          <Combobox.Trigger aria-label="Fruit" error={false} loading={false} />
        </Combobox.Root>
      </Theme>,
    );
    expect(html).not.toContain('data-error');
    expect(html).not.toContain('data-loading');
  });

  test('Navbar.Root writes position and size as data attributes only', () => {
    const html = renderToString(
      <Theme>
        <Navbar.Root position="sticky" size="3" />
      </Theme>,
    );
    const header = html.match(/<header[^>]*>/)?.[0] ?? '';
    expect(header).toContain('data-position="sticky"');
    expect(header).toContain('data-size="3"');
    expect(header).not.toMatch(/\sposition="/);
    expect(header).not.toMatch(/\ssize="/);
  });

  test('VirtualMenu.Item keeps the row props a renderItem spreads off the element', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const rowProps = { isHighlighted: true, index: 3, item: { name: 'a' } } as object;
    const html = renderToString(
      <VirtualMenu.Item {...rowProps} id="row" data-index={3}>
        Row
      </VirtualMenu.Item>,
    );
    expect(html).not.toMatch(/\sindex="/);
    expect(html).not.toMatch(/\sitem="/);
    expect(html).toContain('data-index="3"');
    expect(error).not.toHaveBeenCalled();
  });

  test('a resize handle states its value', () => {
    const html = renderToString(
      <Theme>
        <Shell.Root>
          <Shell.Sidebar resizable presentation="fixed" defaultState="expanded" defaultSize={300}>
            rows
          </Shell.Sidebar>
          <Shell.Content>page</Shell.Content>
        </Shell.Root>
      </Theme>,
    );
    const handle = html.match(/<div[^>]*kui-ShellResizer[^>]*>/)?.[0] ?? '';
    expect(handle).toContain('role="separator"');
    expect(handle).toContain('aria-valuenow="300"');
  });
});
