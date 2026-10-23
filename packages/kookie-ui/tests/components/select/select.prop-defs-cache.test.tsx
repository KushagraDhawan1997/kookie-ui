import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test-utils';

/**
 * extractProps caches compiled prop defs on the identity of each prop def record it is given.
 * Select used to pass `{ size: selectRootPropDefs.size }` written at the call site, a new record
 * every render, so every render of Trigger and Content recompiled (about 8.5 KB of garbage and
 * 3 µs per Select render in Node). Every record Select passes must be the same object on every render.
 */
const seen = vi.hoisted(() => new Set<object>());
vi.mock('../../../src/helpers/compile-prop-defs.js', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../../src/helpers/compile-prop-defs.js')>();
  return {
    ...mod,
    getCompiledPropDefs: (defs: readonly object[]) => {
      defs.forEach((d) => seen.add(d));
      return mod.getCompiledPropDefs(defs as never);
    },
  };
});

const Select = await import('../../../src/components/select');

function Fruit({ tick }: { tick: number }) {
  return (
    <Select.Root defaultValue="a">
      <Select.Trigger aria-label={`Fruit ${tick}`} />
      <Select.Content>
        <Select.Item value="a">Apple</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}

describe('Select prop defs', () => {
  it('passes the same prop def records on every render', () => {
    const { rerender } = renderWithProviders(<Fruit tick={0} />);
    const afterMount = seen.size;
    expect(afterMount).toBeGreaterThan(0);
    for (let i = 1; i <= 5; i++) rerender(<Fruit tick={i} />);
    expect(seen.size).toBe(afterMount);
  });
});
