import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { TextArea, TextField } from '../../../src/components/index';

// An error message that comes and goes as a person types must not remount the field: a remount
// drops focus mid-word, resets the caret and an uncontrolled value, and swaps the ref's node.
describe.each([
  ['TextField', (message?: string) => <TextField.Root aria-label="Name" defaultValue="" errorMessage={message} />],
  ['TextArea', (message?: string) => <TextArea aria-label="Name" defaultValue="" errorMessage={message} />],
] as const)('%s with a toggling error message', (_name, field) => {
  it('keeps the same input, its focus and its value', () => {
    const { rerender } = renderWithProviders(field());
    const input = screen.getByRole('textbox') as HTMLInputElement;
    input.focus();
    input.value = 'Ada';

    rerender(field('Required'));
    expect(screen.getByRole('textbox')).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('Ada');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');

    rerender(field());
    expect(screen.getByRole('textbox')).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('Ada');
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
