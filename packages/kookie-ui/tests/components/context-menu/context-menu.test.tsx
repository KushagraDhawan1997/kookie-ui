import * as React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, render, screen, fireEvent } from '../../test-utils';
import * as ContextMenu from '../../../src/components/context-menu';
import { Theme } from '../../../src/components/theme';
import { VirtualMenu } from '../../../src/components/virtual-menu';

function renderContextMenu(content: React.ReactNode, contentProps: Partial<ContextMenu.ContentProps> = {}) {
  const user = userEvent.setup();
  renderWithProviders(
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div data-testid="area">Right-click here</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content {...contentProps}>{content}</ContextMenu.Content>
    </ContextMenu.Root>,
  );
  return user;
}

async function openAt(x = 100, y = 100) {
  fireEvent.contextMenu(screen.getByTestId('area'), { clientX: x, clientY: y });
  return screen.findByRole('menu');
}

function propWarnings(error: ReturnType<typeof vi.spyOn>) {
  return error.mock.calls.filter(([message]) =>
    /does not recognize|Unknown prop|non-boolean attribute|Invalid value for prop/i.test(String(message)),
  );
}

describe('ContextMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens on right-click and calls onSelect', async () => {
    const onSelect = vi.fn();
    const user = renderContextMenu(<ContextMenu.Item onSelect={onSelect}>Rename</ContextMenu.Item>);

    expect(screen.queryByRole('menu')).toBeNull();
    await openAt();
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('applies surface props and does not leak submenuBehavior or color to the DOM', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderContextMenu(<ContextMenu.Item>One</ContextMenu.Item>, {
      size: '1',
      variant: 'soft',
      color: 'red',
      material: 'solid',
    });

    const menu = await openAt();
    expect(menu).toHaveClass('rt-r-size-1', 'rt-variant-soft');
    expect(menu).toHaveAttribute('data-accent-color', 'red');
    expect(menu).toHaveAttribute('data-material', 'solid');
    expect(menu).not.toHaveAttribute('submenubehavior');
    expect(menu).not.toHaveAttribute('color');
    expect(propWarnings(error)).toEqual([]);
  });

  it('follows the nearest Theme material', async () => {
    render(
      <Theme material="translucent">
        <Theme material="solid">
          <ContextMenu.Root>
            <ContextMenu.Trigger>
              <div data-testid="area">Area</div>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Item>One</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
        </Theme>
      </Theme>,
    );
    expect(await openAt()).toHaveAttribute('data-material', 'solid');
  });

  it('never produces a NaN offset for a responsive size', async () => {
    renderContextMenu(<ContextMenu.Item>One</ContextMenu.Item>, { size: { initial: '1', md: '2' } });
    const menu = await openAt();
    expect((menu.parentElement as HTMLElement).getAttribute('style')).not.toContain('NaN');
  });

  it('exposes shortcuts through aria-keyshortcuts', async () => {
    renderContextMenu(
      <>
        <ContextMenu.Item shortcut="⌘ ⇧ P">Command palette</ContextMenu.Item>
        <ContextMenu.CheckboxItem shortcut="⌥ G" checked>
          Grid
        </ContextMenu.CheckboxItem>
      </>,
    );
    await openAt();
    const item = screen.getByRole('menuitem', { name: 'Command palette' });
    expect(item).toHaveAttribute('aria-keyshortcuts', 'Meta+Shift+P');
    expect(item.querySelector('.rt-BaseMenuShortcut')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Grid' })).toHaveAttribute('aria-keyshortcuts', 'Alt+G');
  });

  it('toggles checkbox items and selects radio items with indicators', async () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    const user = renderContextMenu(
      <>
        <ContextMenu.CheckboxItem checked onCheckedChange={onCheckedChange}>
          Show rulers
        </ContextMenu.CheckboxItem>
        <ContextMenu.RadioGroup value="fit" onValueChange={onValueChange}>
          <ContextMenu.RadioItem value="fit">Fit</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="fill">Fill</ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>
      </>,
    );
    await openAt();

    const checkbox = screen.getByRole('menuitemcheckbox', { name: 'Show rulers' });
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(checkbox.querySelector('.rt-BaseMenuItemIndicatorIcon')).not.toBeNull();
    const fit = screen.getByRole('menuitemradio', { name: 'Fit' });
    expect(fit).toHaveAttribute('aria-checked', 'true');
    expect(fit.querySelector('.rt-BaseMenuItemIndicatorIcon')).not.toBeNull();

    await user.click(screen.getByRole('menuitemradio', { name: 'Fill' }));
    expect(onValueChange).toHaveBeenCalledWith('fill');
  });

  it('opens submenus that inherit the surface and accept overrides', async () => {
    const user = renderContextMenu(
      <ContextMenu.Sub>
        <ContextMenu.SubTrigger>Arrange</ContextMenu.SubTrigger>
        <ContextMenu.SubContent color="red" data-testid="sub">
          <ContextMenu.Item>Bring to front</ContextMenu.Item>
        </ContextMenu.SubContent>
      </ContextMenu.Sub>,
      { size: '1', variant: 'soft', color: 'blue' },
    );
    await openAt();

    screen.getByRole('menuitem', { name: 'Arrange' }).focus();
    await user.keyboard('{ArrowRight}');
    const sub = await screen.findByTestId('sub');
    expect(sub).toHaveClass('rt-r-size-1', 'rt-variant-soft');
    expect(sub).toHaveAttribute('data-accent-color', 'red');
    expect(sub).not.toHaveAttribute('color');
    expect(screen.getByRole('menuitem', { name: 'Bring to front' })).toBeInTheDocument();
  });

  it('supports virtualized content with a single menu role', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderContextMenu(<VirtualMenu items={['a', 'b']} itemLabel={(item: string) => item} aria-label="Letters" />, {
      virtualized: true,
    });

    const menu = await openAt();
    expect(menu.querySelector('.rt-ScrollAreaRoot')).toBeNull();
    expect(menu.querySelector('.rt-virtualized')).not.toBeNull();
    expect(screen.getAllByRole('menu')).toHaveLength(1);
    expect(propWarnings(error)).toEqual([]);
  });

  it('accepts the deprecated submenuBehavior prop without rendering it', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderContextMenu(<ContextMenu.Item>One</ContextMenu.Item>, { submenuBehavior: 'drill-down' });
    const menu = await openAt();
    expect(menu).not.toHaveAttribute('submenubehavior');
    expect(propWarnings(error)).toEqual([]);
  });
});
