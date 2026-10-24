import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, default: { ...actual, version: '18.3.1' }, version: '18.3.1' };
});

describe('MessageScroller on React 18', () => {
  it('warns once in development that it needs React 19', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { renderWithProviders } = await import('../../test-utils');
    const { MessageScroller } = await import('../../../src/components/index');
    const ui = (
      <MessageScroller.Root>
        <MessageScroller.Viewport aria-label="Conversation">
          <MessageScroller.Content />
        </MessageScroller.Viewport>
      </MessageScroller.Root>
    );
    renderWithProviders(ui).unmount();
    renderWithProviders(ui);
    const messages = warn.mock.calls.map((call) => String(call[0])).filter((m) => m.includes('MessageScroller needs React 19'));
    expect(messages).toHaveLength(1);
    expect(React.version).toBe('18.3.1');
  });
});
