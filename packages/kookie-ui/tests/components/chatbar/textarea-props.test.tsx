import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Chatbar } from '../../../src/components/index';

describe('Chatbar.Textarea', () => {
  it('puts className and style on the textarea, with every other attribute', () => {
    renderWithProviders(
      <Chatbar.Root>
        <Chatbar.Textarea aria-label="Message" className="custom" style={{ fontStyle: 'italic' }} />
      </Chatbar.Root>,
    );
    const textarea = screen.getByRole('textbox', { name: 'Message' });
    expect(textarea).toHaveClass('kui-ChatbarInput', 'custom');
    expect(textarea.style.fontStyle).toBe('italic');
    expect(textarea.parentElement).not.toHaveClass('custom');
  });

  it('does not warn when a <label htmlFor> names it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithProviders(
      <Chatbar.Root>
        <label htmlFor="message">Message</label>
        <Chatbar.Textarea id="message" />
      </Chatbar.Root>,
    );
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeInTheDocument();
    expect(warn.mock.calls.filter(([msg]) => String(msg).includes('Chatbar.Textarea'))).toHaveLength(0);
  });

  it('still warns when nothing names it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithProviders(
      <Chatbar.Root>
        <Chatbar.Textarea />
      </Chatbar.Root>,
    );
    expect(warn.mock.calls.filter(([msg]) => String(msg).includes('Chatbar.Textarea'))).toHaveLength(1);
  });
});
