import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { Shell } from '../../../src/components/index';

// 0.8.0: the Rail is its own pane. The Left wrapper that used to carry
// `data-open` for Rail+Panel no longer exists.
describe('Rail (stacked) data-open', () => {
  it('has data-open when stacked and expanded (via Rail defaultOpen)', async () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Rail presentation={{ initial: 'stacked' }} defaultOpen />
        <Shell.Panel>panel</Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );

    const left = document.querySelector('.kui-ShellRail') as HTMLElement;
    expect(left).toBeTruthy();
    expect(left.hasAttribute('data-open')).toBe(true);
  });

  it('does not have data-open when stacked and collapsed', async () => {
    renderWithProviders(
      <Shell.Root>
        {/* Rail defaults to open, so explicitly set defaultOpen={false} to test collapsed state */}
        <Shell.Rail presentation={{ initial: 'stacked' }} defaultOpen={false} />
        <Shell.Panel>panel</Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );

    const left = document.querySelector('.kui-ShellRail') as HTMLElement;
    expect(left).toBeTruthy();
    expect(left.hasAttribute('data-open')).toBe(false);
  });
});
