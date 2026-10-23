import * as React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Theme, useThemeContext } from '../../../src/components/theme';
import { Button } from '../../../src/components/button';
import * as TextField from '../../../src/components/text-field';
import * as DropdownMenu from '../../../src/components/dropdown-menu';
import { Chip } from '../../../src/components/chip';

function button(container: HTMLElement, name = 'Go') {
  return Array.from(container.querySelectorAll('button')).find((el) => el.textContent?.includes(name)) as HTMLElement;
}

function textField(container: HTMLElement) {
  return container.querySelector('.kui-TextFieldRoot') as HTMLElement;
}

describe('Theme size', () => {
  test('defaults to 2', () => {
    const { container } = render(
      <Theme>
        <Button>Go</Button>
        <TextField.Root aria-label="Name" />
      </Theme>,
    );
    expect(button(container).classList.contains('kui-r-size-2')).toBe(true);
    expect(textField(container).classList.contains('kui-r-size-2')).toBe(true);
  });

  test('controls with no size take the theme size', () => {
    const { container } = render(
      <Theme size="3">
        <Button>Go</Button>
        <TextField.Root aria-label="Name" />
      </Theme>,
    );
    expect(button(container).classList.contains('kui-r-size-3')).toBe(true);
    expect(button(container).classList.contains('kui-r-size-2')).toBe(false);
    expect(textField(container).classList.contains('kui-r-size-3')).toBe(true);
  });

  test('an explicit size wins, a responsive one included', () => {
    const { container } = render(
      <Theme size="3">
        <Button size="1">Go</Button>
        <Button size={{ initial: '4', md: '1' }}>Wide</Button>
        <TextField.Root size="4" aria-label="Name" />
      </Theme>,
    );
    expect(button(container).classList.contains('kui-r-size-1')).toBe(true);
    expect(button(container).classList.contains('kui-r-size-3')).toBe(false);
    const responsive = button(container, 'Wide');
    expect(responsive.classList.contains('kui-r-size-4')).toBe(true);
    expect(responsive.classList.contains('md:kui-r-size-1')).toBe(true);
    expect(textField(container).classList.contains('kui-r-size-4')).toBe(true);
  });

  test('a nested theme overrides for its subtree', () => {
    const { container } = render(
      <Theme size="3">
        <Button>Outer</Button>
        <Theme size="1">
          <Button>Inner</Button>
        </Theme>
        <Theme>
          <Button>Inherited</Button>
        </Theme>
      </Theme>,
    );
    expect(button(container, 'Outer').classList.contains('kui-r-size-3')).toBe(true);
    expect(button(container, 'Inner').classList.contains('kui-r-size-1')).toBe(true);
    expect(button(container, 'Inherited').classList.contains('kui-r-size-3')).toBe(true);
  });

  test('the size is carried on the theme context', () => {
    const seen: string[] = [];
    function Probe() {
      seen.push(useThemeContext().size);
      return null;
    }
    render(
      <Theme size="4">
        <Probe />
        <Theme>
          <Probe />
        </Theme>
      </Theme>,
    );
    expect(seen).toEqual(['4', '4']);
  });

  test('a menu follows the theme size across its full 1-4 range', () => {
    const { baseElement } = render(
      <Theme size="4">
        <DropdownMenu.Root open>
          <DropdownMenu.Trigger>
            <Button>Menu</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>One</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Theme>,
    );
    const content = baseElement.querySelector('.kui-DropdownMenuContent') as HTMLElement;
    expect(content.classList.contains('kui-r-size-4')).toBe(true);
  });

  test('chip rests at 2 and does not follow the theme', () => {
    const { container } = render(
      <Theme size="4">
        <Chip>New</Chip>
      </Theme>,
    );
    const chip = container.querySelector('.kui-Chip') as HTMLElement;
    expect(chip.classList.contains('kui-r-size-2')).toBe(true);
  });
});
