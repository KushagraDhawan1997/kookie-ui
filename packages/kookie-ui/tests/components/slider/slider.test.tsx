import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders, screen } from '../../test-utils';
import { Slider } from '../../../src/components/index';

describe('Slider', () => {
  it('gives the caller’s name to the handle', () => {
    renderWithProviders(<Slider defaultValue={[40]} aria-label="Volume" />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  });

  it('gives the caller’s name to both handles of a range', () => {
    renderWithProviders(<Slider defaultValue={[20, 80]} aria-label="Price" />);
    expect(screen.getAllByRole('slider', { name: 'Price' })).toHaveLength(2);
  });

  it('passes aria-labelledby to the handle', () => {
    renderWithProviders(
      <>
        <span id="volume-label">Volume</span>
        <Slider defaultValue={[40]} aria-labelledby="volume-label" />
      </>,
    );
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  });

  it('puts no value ARIA or name on the root, which has no role', () => {
    const { container } = renderWithProviders(<Slider defaultValue={[40]} aria-label="Volume" />);
    const root = container.querySelector('.kui-SliderRoot')!;
    for (const attr of ['aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext', 'aria-label']) {
      expect(root).not.toHaveAttribute(attr);
    }
    expect(root).not.toHaveAttribute('unit');
  });

  it('draws one handle when given neither value nor defaultValue', () => {
    renderWithProviders(<Slider aria-label="Volume" min={10} />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuenow', '10');
  });

  it('keeps aria-valuetext current when uncontrolled', () => {
    renderWithProviders(<Slider defaultValue={[40]} unit="%" aria-label="Volume" />);
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    expect(thumb).toHaveAttribute('aria-valuetext', '40 %');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb).toHaveAttribute('aria-valuenow', '41');
    expect(thumb).toHaveAttribute('aria-valuetext', '41 %');
  });

  it('hides tick text with the kui-sr-only class and unique ids', () => {
    const { container } = renderWithProviders(
      <>
        <Slider defaultValue={[0]} ticks={[{ value: 50 }]} aria-label="A" />
        <Slider defaultValue={[0]} ticks={[{ value: 50 }]} aria-label="B" />
      </>,
    );
    const spans = container.querySelectorAll('.kui-SliderTick span');
    expect(spans).toHaveLength(2);
    spans.forEach((span) => expect(span).toHaveClass('kui-sr-only'));
    expect(spans[0].id).not.toBe(spans[1].id);
  });

  it('moves only the nearest handle when a tick is clicked on a range', () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    renderWithProviders(
      <Slider
        defaultValue={[20, 80]}
        ticks={[{ value: 90, label: 'High' }]}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
        aria-label="Price"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Set to High' }));
    expect(onValueChange).toHaveBeenLastCalledWith([20, 90]);
    expect(onValueCommit).toHaveBeenLastCalledWith([20, 90]);
    const [low, high] = screen.getAllByRole('slider');
    expect(low).toHaveAttribute('aria-valuenow', '20');
    expect(high).toHaveAttribute('aria-valuenow', '90');
  });
});
