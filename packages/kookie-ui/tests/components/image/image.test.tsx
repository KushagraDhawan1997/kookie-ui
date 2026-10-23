import * as React from 'react';
import { describe, expect, test } from 'vitest';

import { fireEvent, render, renderWithProviders, screen } from '../../test-utils';
import { Image } from '../../../src/components/index';

describe('Image', () => {
  test('is one img with no wrapper, lazy and async by default', () => {
    const { container } = render(<Image src="/a.jpg" alt="A chair" className="mine" />);
    const img = screen.getByRole('img', { name: 'A chair' });

    expect(container.firstElementChild).toBe(img);
    expect(img).toHaveClass('kui-Image', 'mine');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  test('a caller can load eagerly', () => {
    renderWithProviders(<Image src="/a.jpg" alt="" loading="eager" />);
    expect(screen.getByRole('presentation')).toHaveAttribute('loading', 'eager');
  });

  test('fit and radius resolve to a class and the radius attribute', () => {
    renderWithProviders(<Image src="/a.jpg" alt="x" fit="contain" radius="none" />);
    const img = screen.getByRole('img');

    expect(img).toHaveClass('kui-r-fit-contain');
    expect(img).toHaveAttribute('data-radius', 'none');
  });

  test('fit rests at cover', () => {
    renderWithProviders(<Image src="/a.jpg" alt="x" />);
    expect(screen.getByRole('img')).toHaveClass('kui-r-fit-cover');
  });

  test('width and height land on the img as layout classes', () => {
    renderWithProviders(<Image src="/a.jpg" alt="x" width="120px" height="80px" />);
    const img = screen.getByRole('img');

    expect(img).toHaveClass('kui-r-w', 'kui-r-h');
    expect(img).not.toHaveAttribute('width');
    expect(img).not.toHaveAttribute('height');
  });

  test('status moves from loading to loaded and calls the caller', () => {
    let loaded = 0;
    renderWithProviders(<Image src="/a.jpg" alt="x" onLoad={() => loaded++} />);
    const img = screen.getByRole('img');

    expect(img).toHaveAttribute('data-status', 'loading');
    fireEvent.load(img);
    expect(img).toHaveAttribute('data-status', 'loaded');
    expect(loaded).toBe(1);
  });

  test('a failed load reads as error and calls the caller', () => {
    let failed = 0;
    renderWithProviders(<Image src="/missing.jpg" alt="x" onError={() => failed++} />);
    const img = screen.getByRole('img');

    fireEvent.error(img);
    expect(img).toHaveAttribute('data-status', 'error');
    expect(failed).toBe(1);
  });

  test('a new src starts loading again', () => {
    const { rerender } = renderWithProviders(<Image src="/a.jpg" alt="x" />);
    fireEvent.load(screen.getByRole('img'));
    rerender(<Image src="/b.jpg" alt="x" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-status', 'loading');
  });

  test('forwards its ref to the img', () => {
    const ref = React.createRef<HTMLImageElement>();
    renderWithProviders(<Image ref={ref} src="/a.jpg" alt="x" />);
    expect(ref.current).toBe(screen.getByRole('img'));
  });
});
