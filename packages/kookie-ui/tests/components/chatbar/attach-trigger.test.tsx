import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Chatbar } from '../../../src/components/index';

describe('Chatbar.AttachTrigger', () => {
  it('renders a quiet icon-only Button with a paperclip when used bare', () => {
    renderWithProviders(
      <Chatbar.Root size="3" defaultOpen>
        <Chatbar.Textarea aria-label="Message" />
        <Chatbar.Row>
          <Chatbar.RowStart>
            <Chatbar.AttachTrigger />
          </Chatbar.RowStart>
        </Chatbar.Row>
      </Chatbar.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Add attachments' });
    expect(trigger).toHaveClass('kui-Button', 'kui-ChatbarAttachTrigger', 'kui-r-size-3');
    expect(trigger).toHaveAttribute('data-accent-color', 'gray');
    expect(trigger.querySelector('svg')).not.toBeNull();
  });

  it('keeps the child as the trigger with asChild', () => {
    renderWithProviders(
      <Chatbar.Root defaultOpen>
        <Chatbar.Textarea aria-label="Message" />
        <Chatbar.Row>
          <Chatbar.AttachTrigger asChild>
            <button className="own">Attach</button>
          </Chatbar.AttachTrigger>
        </Chatbar.Row>
      </Chatbar.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Add attachments' });
    expect(trigger).toHaveClass('own', 'kui-ChatbarAttachTrigger');
    expect(trigger).not.toHaveClass('kui-Button');
  });
});
