import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { MessageScroller } from '../../../src/components/index';

function Transcript({ label }: { label?: string }) {
  return (
    <MessageScroller.Root style={{ height: 300 }}>
      <MessageScroller.Viewport {...(label ? { 'aria-label': label } : {})}>
        <MessageScroller.Content>
          <MessageScroller.Item messageId="u1" scrollAnchor>
            Hello
          </MessageScroller.Item>
          <MessageScroller.Item messageId="a1">Hi there</MessageScroller.Item>
        </MessageScroller.Content>
      </MessageScroller.Viewport>
      <MessageScroller.Button />
    </MessageScroller.Root>
  );
}

describe('MessageScroller', () => {
  it('renders the transcript in a named scroll region', () => {
    renderWithProviders(<Transcript label="Conversation" />);
    const region = screen.getByRole('region', { name: 'Conversation' });
    expect(region).toHaveClass('kui-MessageScrollerViewport');
    expect(region).toHaveTextContent('Hello');
    expect(region).toHaveTextContent('Hi there');
  });

  it('says no English word when the app names nothing', () => {
    renderWithProviders(<Transcript />);
    const viewport = document.querySelector('.kui-MessageScrollerViewport');
    expect(viewport?.getAttribute('aria-label')).toBe('');
  });

  it('wears Kookie class names on every part', () => {
    renderWithProviders(<Transcript label="Conversation" />);
    expect(document.querySelector('.kui-MessageScrollerRoot')).not.toBeNull();
    expect(document.querySelector('.kui-MessageScrollerContent')).not.toBeNull();
    expect(document.querySelectorAll('.kui-MessageScrollerItem')).toHaveLength(2);
  });

  it('puts the jump button to sleep while the reader is at the end', () => {
    renderWithProviders(<Transcript label="Conversation" />);
    const button = document.querySelector('.kui-MessageScrollerButton');
    expect(button).toHaveAttribute('data-active', 'false');
    expect(button).toHaveAttribute('inert');
    expect(button).toHaveAttribute('tabindex', '-1');
    expect(button).toHaveAttribute('aria-label', 'Jump to the latest');
  });
});
