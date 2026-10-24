import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, renderWithProviders, screen } from '../../test-utils';
import * as Combobox from '../../../src/components/combobox';

function Fruit({ triggerProps, children }: { triggerProps?: Combobox.TriggerProps; children?: React.ReactElement }) {
  return (
    <Combobox.Root>
      <Combobox.Trigger aria-label="Fruit" data-testid="trigger" {...triggerProps}>
        {children}
      </Combobox.Trigger>
      <Combobox.Content>
        <Combobox.List>
          <Combobox.Item value="apple">Apple</Combobox.Item>
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  );
}

describe('Combobox.Trigger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it("keeps a caller's aria-invalid, aria-busy, aria-disabled and aria-readonly", () => {
    renderWithProviders(
      <Fruit triggerProps={{ 'aria-invalid': true, 'aria-busy': true, 'aria-disabled': true, 'aria-readonly': true }} />,
    );
    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-busy', 'true');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(trigger).toHaveAttribute('aria-readonly', 'true');
  });

  it('still sets aria-invalid from error, and leaves it off by default', () => {
    const { unmount } = renderWithProviders(<Fruit triggerProps={{ error: true }} />);
    expect(screen.getByTestId('trigger')).toHaveAttribute('aria-invalid', 'true');
    unmount();
    renderWithProviders(<Fruit />);
    expect(screen.getByTestId('trigger')).not.toHaveAttribute('aria-invalid');
  });

  it('opens on ArrowUp as well as ArrowDown', () => {
    renderWithProviders(<Fruit />);
    const trigger = screen.getByTestId('trigger');
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the spinner with custom children while loading', () => {
    renderWithProviders(
      <Fruit triggerProps={{ loading: true }}>
        <Combobox.Value placeholder="Pick a fruit" />
      </Fruit>,
    );
    const trigger = screen.getByTestId('trigger');
    expect(trigger.querySelector('.kui-SelectLoadingIcon .kui-Spinner')).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Pick a fruit');
  });

  it('draws no chevron of its own over custom children', () => {
    renderWithProviders(
      <Fruit>
        <Combobox.Value placeholder="Pick a fruit" />
      </Fruit>,
    );
    expect(screen.getByTestId('trigger').querySelector('.kui-SelectIcon')).not.toBeInTheDocument();
  });
});
