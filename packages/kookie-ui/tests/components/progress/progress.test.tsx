import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { Progress } from '../../../src/components/index';

const root = (container: HTMLElement) => container.querySelector<HTMLElement>('.kui-ProgressRoot')!;

describe('Progress', () => {
  it('keeps a custom duration when value is undefined', () => {
    const { container } = renderWithProviders(<Progress value={undefined} duration="5s" />);
    expect(root(container).style.getPropertyValue('--progress-duration')).toBe('5s');
    expect(root(container)).toHaveAttribute('data-state', 'indeterminate');
  });

  it('keeps a custom duration when value is null', () => {
    const { container } = renderWithProviders(<Progress value={null} duration="5s" />);
    expect(root(container).style.getPropertyValue('--progress-duration')).toBe('5s');
  });

  it('writes the value, not the duration, when determinate', () => {
    const { container } = renderWithProviders(<Progress value={40} max={80} duration="5s" />);
    expect(root(container).style.getPropertyValue('--progress-duration')).toBe('');
    expect(root(container).style.getPropertyValue('--progress-value')).toBe('40');
    expect(root(container).style.getPropertyValue('--progress-max')).toBe('80');
  });
});
