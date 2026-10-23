import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { renderWithProviders, screen } from '../test-utils';
import { Button } from '../../src/components/index';

let observed: number;
let RealMutationObserver: typeof MutationObserver;

beforeEach(() => {
  observed = 0;
  RealMutationObserver = window.MutationObserver;
  class Counting extends RealMutationObserver {
    constructor(callback: MutationCallback) {
      super(callback);
      observed++;
    }
  }
  vi.stubGlobal('MutationObserver', Counting);
});

afterEach(() => {
  vi.stubGlobal('MutationObserver', RealMutationObserver);
  vi.restoreAllMocks();
});

/**
 * Buttons are the most numerous interactive element on a page. Anything a
 * single button does on mount is multiplied by however many are on screen, so
 * per-instance observers and forced style reads are worth keeping out.
 */
describe('Button mounts cheaply', () => {
  test('creates no MutationObserver', () => {
    renderWithProviders(
      <>
        {Array.from({ length: 40 }, (_, i) => (
          <Button key={i}>{i}</Button>
        ))}
      </>,
    );

    expect(observed).toBe(0);
  });

  test('does not write will-change inline', () => {
    // An inline write is per-instance DOM mutation that buys nothing.
    renderWithProviders(<Button data-testid="btn">a</Button>);

    expect(screen.getByTestId('btn').style.willChange).toBe('');
  });

  test('does not call getComputedStyle while mounting', () => {
    const spy = vi.spyOn(window, 'getComputedStyle');

    renderWithProviders(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <Button key={i}>{i}</Button>
        ))}
      </>,
    );

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('Button refs', () => {
  test('the forwarded ref is attached once, not on every render', () => {
    // A ref rebuilt inline on each render makes React detach and reattach it
    // every time, for every button on the page.
    const attachments: Array<HTMLElement | null> = [];
    const ref = (node: HTMLElement | null) => attachments.push(node);

    const { rerender } = renderWithProviders(<Button ref={ref}>a</Button>);
    expect(attachments.filter(Boolean)).toHaveLength(1);

    rerender(<Button ref={ref}>b</Button>);
    rerender(<Button ref={ref}>c</Button>);

    expect(attachments.filter(Boolean)).toHaveLength(1);
    expect(attachments.filter((node) => node === null)).toHaveLength(0);
  });

  test('the ref points at the rendered button', () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithProviders(
      <Button ref={ref} data-testid="btn">
        a
      </Button>,
    );

    expect(ref.current).toBe(screen.getByTestId('btn'));
  });

  test('an icon-only Button forwards its ref too', () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithProviders(<Button iconOnly ref={ref} aria-label="act" data-testid="icon" />);

    expect(ref.current).toBe(screen.getByTestId('icon'));
  });
});

describe('Button attributes', () => {
  test('a button carries no material attribute', () => {
    // v1 is solid only; nothing keys off a material.
    renderWithProviders(<Button data-testid="btn">a</Button>);
    expect(screen.getByTestId('btn')).not.toHaveAttribute('data-material');
  });

  test('a button defaults to type="button"', () => {
    // A native button defaults to submit, which submits surrounding forms.
    renderWithProviders(<Button data-testid="btn">a</Button>);
    expect(screen.getByTestId('btn')).toHaveAttribute('type', 'button');
  });

  test('an explicit type is respected', () => {
    renderWithProviders(
      <Button data-testid="btn" type="submit">
        a
      </Button>,
    );
    expect(screen.getByTestId('btn')).toHaveAttribute('type', 'submit');
  });
});
