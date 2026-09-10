import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { renderWithProviders, screen } from '../test-utils';
import { Button, IconButton } from '../../src/components/index';

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
  test('creates no MutationObserver, translucent or not', () => {
    renderWithProviders(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <Button key={i} material="translucent">
            {i}
          </Button>
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <Button key={`solid-${i}`} material="solid">
            {i}
          </Button>
        ))}
      </>,
    );

    expect(observed).toBe(0);
  });

  test('does not write will-change inline', () => {
    // The blur already promotes the element; the inline write was per-instance
    // DOM mutation buying nothing.
    renderWithProviders(
      <>
        <Button data-testid="translucent" material="translucent">
          a
        </Button>
        <Button data-testid="solid" material="solid">
          b
        </Button>
      </>,
    );

    expect(screen.getByTestId('translucent').style.willChange).toBe('');
    expect(screen.getByTestId('solid').style.willChange).toBe('');
  });

  test('does not call getComputedStyle while mounting', () => {
    const spy = vi.spyOn(window, 'getComputedStyle');

    renderWithProviders(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <Button key={i} material="translucent">
            {i}
          </Button>
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

  test('IconButton forwards its ref too', () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithProviders(<IconButton ref={ref} aria-label="act" data-testid="icon" />);

    expect(ref.current).toBe(screen.getByTestId('icon'));
  });
});

describe('Button still renders its material attributes', () => {
  test('material is reflected for CSS to key off', () => {
    renderWithProviders(
      <Button data-testid="btn" material="translucent">
        a
      </Button>,
    );
    const button = screen.getByTestId('btn');

    expect(button.dataset.material).toBe('translucent');
    expect(button.dataset.panelBackground).toBe('translucent');
  });

  test('panelBackground still feeds material for backwards compatibility', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithProviders(
      <Button data-testid="btn" panelBackground="solid">
        a
      </Button>,
    );

    expect(screen.getByTestId('btn').dataset.material).toBe('solid');
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
