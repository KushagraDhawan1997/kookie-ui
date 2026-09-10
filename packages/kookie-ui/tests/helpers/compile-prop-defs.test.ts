import { describe, expect, test } from 'vitest';

import { getCompiledPropDefs } from '../../src/helpers/compile-prop-defs.js';
import { extractProps } from '../../src/helpers/extract-props.js';
import { flexPropDefs } from '../../src/components/flex.props.js';
import { layoutPropDefs } from '../../src/props/layout.props.js';
import { marginPropDefs } from '../../src/props/margin.props.js';

import type { PropDef } from '../../src/props/prop-def.js';

type Defs = Record<string, PropDef>;

const flex = flexPropDefs as Defs;
const layout = layoutPropDefs as Defs;
const margin = marginPropDefs as Defs;

/**
 * Compiled prop defs are cached on the identity of the prop def objects, which
 * is what makes prop extraction cheap after a component's first render. A cache
 * keyed wrongly would not fail loudly — it would quietly return another
 * component's prop defs — so the keying is asserted directly.
 */
describe('getCompiledPropDefs caching', () => {
  test('the same prop defs return the same compiled object', () => {
    expect(getCompiledPropDefs([flex, layout, margin])).toBe(getCompiledPropDefs([flex, layout, margin]));
  });

  test('a different array wrapping the same prop defs still hits the cache', () => {
    // Components pass a fresh rest-args array on every render; only the prop def
    // objects inside it are stable.
    const a = [flex, margin];
    const b = [flex, margin];
    expect(a).not.toBe(b);
    expect(getCompiledPropDefs(a)).toBe(getCompiledPropDefs(b));
  });

  test('a different set of prop defs compiles separately', () => {
    expect(getCompiledPropDefs([flex, margin])).not.toBe(getCompiledPropDefs([flex, layout]));
  });

  test('order is part of the cache key', () => {
    // Later records override earlier ones, so [a, b] and [b, a] are not the same
    // compilation and must not share an entry.
    expect(getCompiledPropDefs([flex, margin])).not.toBe(getCompiledPropDefs([margin, flex]));
  });

  test('a prefix does not collide with a longer set', () => {
    expect(getCompiledPropDefs([flex])).not.toBe(getCompiledPropDefs([flex, margin]));
  });

  test('an empty set compiles to something usable', () => {
    const compiled = getCompiledPropDefs([]);
    expect(compiled.styling).toEqual([]);
    expect(compiled.passthrough).toEqual([]);
    expect(compiled.stylingKeys.size).toBe(0);
  });
});

describe('getCompiledPropDefs output', () => {
  test('styling and passthrough are disjoint, and styling keys match', () => {
    const { styling, passthrough, stylingKeys } = getCompiledPropDefs([flex, layout, margin]);

    const stylingNames = styling.map((d) => d.key);
    const passthroughNames = passthrough.map((d) => d.key);

    expect(new Set(stylingNames).size).toBe(stylingNames.length);
    expect(stylingNames.filter((k) => passthroughNames.includes(k))).toEqual([]);
    expect([...stylingKeys].sort()).toEqual([...stylingNames].sort());
  });

  test('every styling def carries a class name', () => {
    for (const def of getCompiledPropDefs([flex, layout, margin]).styling) {
      expect(def.className, `${def.key} is in styling but has no className`).toBeTruthy();
    }
  });

  test('enum defs get a membership set that includes the default', () => {
    const compiled = getCompiledPropDefs([flex]);
    const direction = compiled.styling.find((d) => d.key === 'direction');

    expect(direction?.enumValueSet).toBeDefined();
    expect(direction?.enumValueSet?.has('row')).toBe(true);
    expect(direction?.enumValueSet?.has('nonsense')).toBe(false);

    const as = compiled.passthrough.find((d) => d.key === 'as');
    expect(as?.enumValueSet?.has(as?.default)).toBe(true);
  });

  test('enum | string defs are not given a coercion set', () => {
    // Coercing them would reject the arbitrary CSS values they exist to accept.
    const gap = getCompiledPropDefs([flex]).styling.find((d) => d.key === 'gap');
    expect(gap?.type).toBe('enum | string');
    expect(gap?.enumValueSet).toBeUndefined();
    expect(gap?.valueSet.has('3')).toBe(true);
  });

  test('the value set matches the prop def values', () => {
    for (const def of getCompiledPropDefs([flex, layout, margin]).styling) {
      expect([...def.valueSet].sort(), `${def.key}`).toEqual([...def.values].sort());
    }
  });

  test('passthrough only holds defs that need a default or a coercion', () => {
    // Anything else is already correct as passed, so touching it is wasted work.
    for (const def of getCompiledPropDefs([flex, layout, margin]).passthrough) {
      expect(def.hasDefault || def.type === 'enum', `${def.key}`).toBe(true);
    }
  });
});

describe('caching does not leak between components', () => {
  test('two prop def sets sharing a record keep their own results', () => {
    const shared: Defs = { size: { type: 'enum', values: ['1', '2'], default: '1' } as PropDef };
    const withVariant: Defs = {
      variant: { type: 'enum', values: ['solid'], className: 'rt-variant' } as PropDef,
    };

    const a = extractProps({ variant: 'solid' } as never, shared, withVariant) as Record<string, unknown>;
    const b = extractProps({ variant: 'solid' } as never, shared) as Record<string, unknown>;

    expect(a.className).toBe('rt-variant-solid');
    // `variant` is not a prop def here, so it passes straight through.
    expect(b.className).toBe('');
    expect(b.variant).toBe('solid');
  });
});
