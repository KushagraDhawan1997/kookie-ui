import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Code } from '../../../src/components/index';

describe('Code colour', () => {
  it('a ghost Code with no colour takes the surrounding text colour', () => {
    renderWithProviders(<Code variant="ghost">npm install</Code>);
    expect(screen.getByText('npm install')).not.toHaveAttribute('data-accent-color');
  });

  it('a ghost Code with a colour uses it', () => {
    renderWithProviders(
      <Code variant="ghost" color="red">
        npm install
      </Code>,
    );
    expect(screen.getByText('npm install')).toHaveAttribute('data-accent-color', 'red');
  });

  it('a filled Code rests gray', () => {
    renderWithProviders(<Code>npm install</Code>);
    expect(screen.getByText('npm install')).toHaveAttribute('data-accent-color', 'gray');
  });
});
