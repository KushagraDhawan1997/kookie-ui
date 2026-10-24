import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { TextArea } from '../../../src/components/index';

describe('TextArea', () => {
  it('renders with default size (2)', () => {
    const { container } = renderWithProviders(<TextArea />);
    expect(container.querySelector('.kui-TextAreaRoot')).toHaveClass('kui-r-size-2');
  });

  it('sets aria-invalid from the error prop', () => {
    renderWithProviders(<TextArea error />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('passes a caller aria-invalid through', () => {
    renderWithProviders(<TextArea aria-invalid />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('leaves aria-invalid off when valid', () => {
    renderWithProviders(<TextArea />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('links the error message', () => {
    renderWithProviders(<TextArea error errorMessage="Required" />);
    const message = screen.getByText('Required');
    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toContain(message.id);
  });

  it('passes required to the textarea', () => {
    renderWithProviders(<TextArea required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('leaves required off by default', () => {
    renderWithProviders(<TextArea />);
    expect(screen.getByRole('textbox')).not.toBeRequired();
  });
});

