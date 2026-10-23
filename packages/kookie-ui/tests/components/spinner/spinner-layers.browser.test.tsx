import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner, Theme } from '../../../src/components/index';

/**
 * A running transform animation that nothing clips makes Chromium promote everything painted
 * after it that it might overlap. One Spinner above 50 mixed rows: 106 layers and 33.7 MB of
 * layer area with the rotation on the unclipped root; 5 layers and 20.2 MB with the rotation on
 * an inner wheel inside a root with `contain: paint` (CDP LayerTree, 1280x800).
 */
describe('the Spinner keeps its rotation inside its own box', () => {
  it('rotates an inner wheel; the root clips and does not animate', () => {
    const { container } = render(
      <Theme>
        <Spinner />
      </Theme>,
    );
    const root = container.querySelector<HTMLElement>('.kui-Spinner')!;
    const wheel = root.querySelector<HTMLElement>(':scope > .kui-SpinnerWheel')!;
    expect(wheel).not.toBeNull();
    expect(wheel.querySelectorAll(':scope > .kui-SpinnerLeaf')).toHaveLength(8);

    const rootStyle = getComputedStyle(root);
    expect(rootStyle.animationName).toBe('none');
    expect(rootStyle.contain).toContain('paint');
    // Opacity on the clipping root would cost a second layer per spinner.
    expect(rootStyle.opacity).toBe('1');
    // The anti-aliased leaf edges on the diagonal steps stay unclipped.
    expect(rootStyle.overflowClipMargin).toBe('4px');

    const wheelStyle = getComputedStyle(wheel);
    expect(wheelStyle.animationName).toBe('kui-spinner-rotate');
    expect(wheelStyle.opacity).toBe('0.65');
    expect(wheel.getBoundingClientRect().toJSON()).toEqual(root.getBoundingClientRect().toJSON());
  });
});

describe('Spinner with children', () => {
  it('hides its children with a class, not an inline style', () => {
    const { container } = render(
      <Theme>
        <Spinner>Save</Spinner>
      </Theme>,
    );
    const hidden = container.querySelector('.kui-SpinnerHiddenChildren')!;
    expect(hidden.getAttribute('style')).toBeNull();
    expect(getComputedStyle(hidden).display).toBe('contents');
    expect(getComputedStyle(hidden).visibility).toBe('hidden');
  });
});
