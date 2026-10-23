import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../../test-utils';
import { Button, Chatbar, Confirmation, Notice } from '../../../src/components/index';

describe('Notice', () => {
  it('announces politely and never floats', () => {
    renderWithProviders(<Notice>Approaching your usage limit</Notice>);
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('Approaching your usage limit');
    expect(notice).toHaveAttribute('aria-live', 'polite');
    expect(notice.style.position).toBe('');
  });

  it('shows a dismiss button only when the app handles dismissal', async () => {
    const { rerender } = renderWithProviders(<Notice>Saved offline</Notice>);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();

    const onDismiss = vi.fn();
    rerender(<Notice onDismiss={onDismiss}>Saved offline</Notice>);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('names the dismiss button in the app’s words', () => {
    renderWithProviders(
      <Notice onDismiss={() => {}} dismissLabel="Schließen">
        Gespeichert
      </Notice>,
    );
    expect(screen.getByRole('button', { name: 'Schließen' })).toBeInTheDocument();
  });

  it('renders the one action that fixes the condition', () => {
    renderWithProviders(<Notice action={<Button>Add credits</Button>}>You are out of credits</Notice>);
    expect(screen.getByRole('button', { name: 'Add credits' })).toBeInTheDocument();
  });

  it('defaults to gray and size 2', () => {
    renderWithProviders(<Notice>Hello</Notice>);
    const notice = screen.getByRole('status');
    expect(notice).toHaveAttribute('data-accent-color', 'gray');
    expect(notice.className).toContain('kui-r-size-2');
  });
});

describe('Confirmation', () => {
  it('has a no and a yes, and no dismiss button', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderWithProviders(
      <Confirmation confirmLabel="Run" onConfirm={onConfirm} onCancel={onCancel}>
        Run 4 nodes for $0.32?
      </Confirmation>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['Not now', 'Run']);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Not now' }));
    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('kills the no while the yes is busy', () => {
    renderWithProviders(
      <Confirmation confirmLabel="Run" busy onConfirm={() => {}} onCancel={() => {}}>
        Run?
      </Confirmation>,
    );
    expect(screen.getByRole('button', { name: 'Not now' })).toBeDisabled();
  });

  it('does not take focus when it appears', () => {
    renderWithProviders(
      <Confirmation confirmLabel="Run" onConfirm={() => {}} onCancel={() => {}}>
        Run?
      </Confirmation>,
    );
    expect(document.activeElement).toBe(document.body);
  });
});

describe('Notices in a Chatbar', () => {
  function Fixture({ onSubmit }: { onSubmit: () => void }) {
    const [value, setValue] = React.useState('draft');
    return (
      <Chatbar.Root
        size="3"
        defaultOpen
        value={value}
        onValueChange={setValue}
        onSubmit={onSubmit}
        notices={<Notice action={<Button>Open</Button>}>This chat last worked in Desk set</Notice>}
        context="Standard · 640 of 2,000 credits"
      >
        <Chatbar.Textarea aria-label="Message" />
        <Chatbar.Row>
          <Chatbar.Send />
        </Chatbar.Row>
      </Chatbar.Root>
    );
  }

  it('stand outside the box and take the chatbar’s size', () => {
    renderWithProviders(<Fixture onSubmit={() => {}} />);
    const notice = screen.getByText('This chat last worked in Desk set').closest('.kui-NoticeRoot');
    expect(notice).not.toBeNull();
    expect(notice?.closest('.kui-ChatbarBox')).toBeNull();
    expect(notice?.closest('.kui-ChatbarRoot')).not.toBeNull();
    expect(notice?.className).toContain('kui-r-size-3');
  });

  it('never submit the message when their button is pressed', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<Fixture onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the context below the box', () => {
    renderWithProviders(<Fixture onSubmit={() => {}} />);
    const context = screen.getByText('Standard · 640 of 2,000 credits');
    expect(context).toHaveClass('kui-ChatbarContext');
    const box = document.querySelector('.kui-ChatbarBox');
    expect(box?.compareDocumentPosition(context) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
