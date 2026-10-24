import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Chip, Theme } from '../../../src/components/index';

describe('Chip', () => {
  it('joins the tab order only when it has a tooltip', () => {
    render(
      <Theme>
        <Chip>Plain</Chip>
        <Chip tooltip="Saved 2 minutes ago">Saved</Chip>
      </Theme>,
    );
    expect(screen.getByText('Plain')).not.toHaveAttribute('tabindex');
    expect(screen.getByText('Saved')).toHaveAttribute('tabindex', '0');
  });
});
