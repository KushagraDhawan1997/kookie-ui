import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Accordion, Tabs, Theme } from '../../../src/components/index';

// A disabled trigger reads like a disabled menu item: --gray-a8 text and a default cursor.
const resolve = (value: string) => {
  const probe = document.createElement('span');
  probe.style.color = value;
  document.querySelector('.radix-themes')!.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

describe('disabled triggers in a browser', () => {
  it('a disabled tab and a disabled accordion trigger share the menu treatment', () => {
    render(
      <Theme>
        <Tabs.Root defaultValue="a">
          <Tabs.List>
            <Tabs.Trigger value="a">A</Tabs.Trigger>
            <Tabs.Trigger value="b" disabled>
              B
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
        <Accordion.Root type="single">
          <Accordion.Item value="x" disabled>
            <Accordion.Trigger>X</Accordion.Trigger>
            <Accordion.Content>Body</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </Theme>,
    );
    const gray = resolve('var(--gray-a8)');
    const tab = screen.getByRole('tab', { name: 'B' });
    const trigger = screen.getByRole('button', { name: 'X' });
    for (const el of [tab, trigger]) {
      expect(getComputedStyle(el).color).toBe(gray);
      expect(getComputedStyle(el).cursor).toBe('default');
    }
  });
});
