import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Heading } from '../../../src/components/heading';
import { headingPropDefs } from '../../../src/components/heading.props';
import * as Dialog from '../../../src/components/dialog';

describe('Heading level', () => {
  it('renders an h2 by default, so a page does not get a second h1', () => {
    renderWithProviders(<Heading>Section</Heading>);
    expect(screen.getByRole('heading', { name: 'Section' }).tagName).toBe('H2');
    expect(headingPropDefs.as.default).toBe('h2');
  });

  it('renders an h1 when asked', () => {
    renderWithProviders(<Heading as="h1">Page</Heading>);
    expect(screen.getByRole('heading', { level: 1, name: 'Page' })).toBeInTheDocument();
  });

  it('keeps any level passed through as', () => {
    renderWithProviders(<Heading as="h4">Group</Heading>);
    expect(screen.getByRole('heading', { level: 4, name: 'Group' })).toBeInTheDocument();
  });

  it('gives a Dialog title the default h2', () => {
    renderWithProviders(
      <Dialog.Root open>
        <Dialog.Content aria-describedby={undefined}>
          <Dialog.Title>Rename file</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(screen.getByRole('heading', { name: 'Rename file' }).tagName).toBe('H2');
  });
});
