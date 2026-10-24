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

  it('moves a snapping handle to the next tick with the arrow keys', () => {
    const onValueChange = vi.fn();
    renderWithProviders(
      <Slider defaultValue={[25]} snapToTicks ticks={[{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }]} onValueChange={onValueChange} aria-label="Volume" />,
    );
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb).toHaveAttribute('aria-valuenow', '75');
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
    fireEvent.keyDown(thumb, { key: 'PageUp' });
    expect(thumb).toHaveAttribute('aria-valuenow', '75');
    fireEvent.keyDown(thumb, { key: 'Home' });
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    expect(onValueChange.mock.calls.map(([value]) => value[0])).toEqual([50, 75, 50, 75, 0]);
  });

  it('disables the tick buttons of a disabled slider', () => {
    const onValueChange = vi.fn();
    renderWithProviders(<Slider disabled defaultValue={[10]} ticks={[{ value: 50, label: 'Half' }]} onValueChange={onValueChange} aria-label="Volume" />);
    const tick = screen.getByRole('button', { name: 'Set to Half' });
    expect(tick).toBeDisabled();
    fireEvent.click(tick);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuenow', '10');
  });

  it('announces a tick press but leaves key presses to the handle', () => {
    const { container } = renderWithProviders(<Slider defaultValue={[10]} min={10} max={20} ticks={[{ value: 15, label: 'Mid' }]} aria-label="Volume" />);
    const live = container.querySelector('[aria-live="polite"]')!;
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Volume' }), { key: 'ArrowRight' });
    expect(live).toHaveTextContent('');
    fireEvent.click(screen.getByRole('button', { name: 'Set to Mid' }));
    expect(live).toHaveTextContent('15 out of 20');
  });

  it('puts no class on the root for showTickLabels or snapToTicks', () => {
    const { container } = renderWithProviders(<Slider defaultValue={[0]} snapToTicks showTickLabels ticks={[{ value: 50 }]} aria-label="Volume" />);
    const root = container.querySelector('.kui-SliderRoot')!;
    expect(root.className).not.toMatch(/tick|snap/);
    expect(root).not.toHaveAttribute('showTickLabels');
    expect(root).not.toHaveAttribute('snapToTicks');
  });
});
