import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../../test-utils';
import { Chatbar } from '../../../src/components/index';

type Status = React.ComponentProps<typeof Chatbar.Send>['status'];

function Fixture({ status, onSubmit, onStop, onRetry, initial = '' }: { status: Status; onSubmit?: () => void; onStop?: () => void; onRetry?: () => void; initial?: string }) {
  const [value, setValue] = React.useState(initial);
  return (
    <Chatbar.Root defaultOpen value={value} onValueChange={setValue} {...(onSubmit ? { onSubmit } : {})}>
      <Chatbar.Textarea aria-label="Message" />
      <Chatbar.Row>
        <Chatbar.Send status={status} {...(onStop ? { onStop } : {})} {...(onRetry ? { onRetry } : {})} />
      </Chatbar.Row>
    </Chatbar.Root>
  );
}

describe('Chatbar.Send status', () => {
  it('stops a running reply when the box is empty', async () => {
    const onStop = vi.fn();
    const onSubmit = vi.fn();
    renderWithProviders(<Fixture status="streaming" onStop={onStop} onSubmit={onSubmit} />);
    const button = screen.getByRole('button', { name: 'Stop' });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('data-mode', 'stop');
    await userEvent.click(button);
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('stops while submitted, too', () => {
    renderWithProviders(<Fixture status="submitted" onStop={() => {}} />);
    expect(screen.getByRole('button', { name: 'Stop' })).toBeEnabled();
  });

  it('sends a draft during a run, and leaves interrupting to the app', async () => {
    const onStop = vi.fn();
    const onSubmit = vi.fn();
    renderWithProviders(<Fixture status="streaming" initial="also make it blue" onStop={onStop} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onStop).not.toHaveBeenCalled();
  });

  it('retries after an error when the box is empty', async () => {
    const onRetry = vi.fn();
    renderWithProviders(<Fixture status="error" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('is an ordinary send when ready', () => {
    renderWithProviders(<Fixture status="ready" />);
    const button = document.querySelector('.rt-ChatbarSend');
    expect(button).toHaveAttribute('data-mode', 'send');
    expect(button).toBeDisabled();
  });
});
