import * as React from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { usePropSyncedState } from '../../src/hooks/use-prop-synced-state.js';

function setup(initial: string) {
  /** Values the component actually rendered, including passes React discards. */
  const renders: string[] = [];
  /** Values that reached a commit. Only these can be seen or painted. */
  const commits: string[] = [];
  let setValue!: (value: string) => void;

  function Probe({ value }: { value: string }) {
    const [current, set] = usePropSyncedState(value);
    setValue = set;
    renders.push(current);
    React.useEffect(() => {
      commits.push(current);
    }, [current]);
    return <span data-testid="value">{current}</span>;
  }

  const utils = render(<Probe value={initial} />);
  return {
    renders,
    commits,
    setValue: (v: string) => setValue(v),
    rerender: (v: string) => utils.rerender(<Probe value={v} />),
  };
}

describe('usePropSyncedState', () => {
  test('starts at the prop value in a single render', () => {
    const { renders, commits } = setup('a');
    expect(renders).toEqual(['a']);
    expect(commits).toEqual(['a']);
  });

  test('follows the prop, committing only the new value', () => {
    const { commits, rerender } = setup('a');
    commits.length = 0;

    act(() => rerender('b'));

    // Adopting the prop during render re-runs the component once, but React
    // throws that pass away: only 'b' is ever committed. Syncing in an effect
    // instead would commit the stale 'a' first — which for a provider means
    // every consumer renders twice and the browser can paint the old value.
    expect(commits).toEqual(['b']);
  });

  test('can still be set independently of the prop', () => {
    const { commits, setValue } = setup('a');
    commits.length = 0;

    act(() => setValue('manual'));

    expect(commits).toEqual(['manual']);
  });

  test('a later prop change overrides an independent set', () => {
    const { commits, setValue, rerender } = setup('a');
    act(() => setValue('manual'));
    commits.length = 0;

    act(() => rerender('b'));

    expect(commits).toEqual(['b']);
  });

  test('re-rendering with an unchanged prop keeps an independent value', () => {
    const { commits, setValue, rerender } = setup('a');
    act(() => setValue('manual'));
    commits.length = 0;

    act(() => rerender('a'));

    expect(commits).toEqual([]);
  });

  test('a prop set back to a previous value is still adopted', () => {
    const { commits, setValue, rerender } = setup('a');
    act(() => setValue('manual'));
    commits.length = 0;

    // The prop did not change between renders, but it differs from the current
    // value; tracking the previous prop rather than comparing to state is what
    // makes this behave.
    act(() => rerender('b'));
    expect(commits.at(-1)).toBe('b');

    act(() => rerender('a'));
    expect(commits.at(-1)).toBe('a');
  });
});
