import { describe, expect, test } from 'vitest';

import { extractProps } from '../../src/helpers/extract-props.js';
import { legacyExtractProps } from './legacy/extract-props.js';

import { baseButtonPropDefs } from '../../src/components/_internal/base-button.props.js';
import { badgePropDefs } from '../../src/components/badge.props.js';
import { boxPropDefs } from '../../src/components/box.props.js';
import { flexPropDefs } from '../../src/components/flex.props.js';
import { gridPropDefs } from '../../src/components/grid.props.js';
import { headingPropDefs } from '../../src/components/heading.props.js';
import { textPropDefs } from '../../src/components/text.props.js';
import { layoutPropDefs } from '../../src/props/layout.props.js';
import { marginPropDefs } from '../../src/props/margin.props.js';

import type { PropDef } from '../../src/props/prop-def.js';

type PropDefs = Record<string, PropDef>;

const DEF_SETS: Array<[string, PropDefs[]]> = [
  ['button', [baseButtonPropDefs as PropDefs, marginPropDefs as PropDefs]],
  ['badge', [badgePropDefs as PropDefs, marginPropDefs as PropDefs]],
  ['box', [boxPropDefs as PropDefs, layoutPropDefs as PropDefs, marginPropDefs as PropDefs]],
  ['flex', [flexPropDefs as PropDefs, layoutPropDefs as PropDefs, marginPropDefs as PropDefs]],
  ['grid', [gridPropDefs as PropDefs, layoutPropDefs as PropDefs, marginPropDefs as PropDefs]],
  ['heading', [headingPropDefs as PropDefs, marginPropDefs as PropDefs]],
  ['text', [textPropDefs as PropDefs, marginPropDefs as PropDefs]],
];

const BREAKPOINTS = ['initial', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

// Deterministic PRNG so a failure is always reproducible from the seed.
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/**
 * Builds a value for `propDef` that exercises a specific branch of the
 * extraction logic: a valid enum member, an arbitrary CSS string, a responsive
 * object, a deliberately invalid value, or nothing at all.
 */
function makeValue(propDef: PropDef & { values?: readonly string[] }, random: () => number) {
  const values = propDef.values ?? [];
  const roll = random();

  if (roll < 0.2) return undefined;
  if (roll < 0.35) return '__not_a_valid_value__';
  if (roll < 0.45) return propDef.type === 'boolean' ? false : '';
  if (roll < 0.55) return '13.5rem';
  if (roll < 0.62) return 'calc(100% - var(--space-3))';

  if (roll < 0.8) {
    if (propDef.type === 'boolean') return random() < 0.5;
    if (values.length > 0) return values[Math.floor(random() * values.length)];
    return '42px';
  }

  // Responsive object across a random subset of breakpoints.
  const object: Record<string, unknown> = {};
  for (const bp of BREAKPOINTS) {
    if (random() < 0.45) continue;
    const inner = random();
    if (inner < 0.15) {
      object[bp] = '__not_a_valid_value__';
    } else if (inner < 0.3) {
      object[bp] = '7px';
    } else if (values.length > 0) {
      object[bp] = values[Math.floor(random() * values.length)];
    } else {
      object[bp] = '3em';
    }
  }
  // A stray non-breakpoint key must be ignored by both implementations.
  if (random() < 0.15) object.notABreakpoint = 'x';
  return object;
}

function makeProps(defSets: PropDefs[], random: () => number) {
  const merged: PropDefs = Object.assign({}, ...defSets);
  const props: Record<string, unknown> = {};

  for (const key in merged) {
    // Only set roughly a third of the available props: real call sites are sparse.
    if (random() < 0.66) continue;
    const value = makeValue(merged[key] as PropDef & { values?: readonly string[] }, random);
    if (value !== undefined) props[key] = value;
  }

  props.children = 'content';
  if (random() < 0.4) props.className = 'user-class other-class';
  if (random() < 0.4) props.style = { color: 'red', '--custom': '1px' };
  if (random() < 0.3) props.onClick = () => {};
  if (random() < 0.3) props['data-testid'] = 'x';
  return props;
}

/** Shallow clone plus a copy of any nested responsive object, so the two runs
 * cannot see each other's mutations. `structuredClone` is no use here: the
 * generated props include event handlers. */
function clone(props: Record<string, unknown>) {
  const copy: Record<string, unknown> = {};
  for (const key in props) {
    const value = props[key];
    copy[key] = value && typeof value === 'object' ? { ...(value as object) } : value;
  }
  return copy;
}

/** Class name order is an implementation detail; the resulting set is not. */
function normalize(result: Record<string, unknown>) {
  const { className, style, ...rest } = result;
  const classes = typeof className === 'string' ? className.split(' ').filter(Boolean).sort() : className;

  // The legacy implementation wrote `undefined` for every prop def key it did
  // not consume; the rewrite simply omits those keys. Both are invisible to
  // React, so compare only keys that actually carry a value.
  const defined: Record<string, unknown> = {};
  for (const key in rest) {
    if (rest[key] !== undefined) defined[key] = rest[key];
  }

  const definedStyle: Record<string, unknown> | undefined = style ? Object.fromEntries(Object.entries(style as Record<string, unknown>).filter(([, v]) => v !== undefined)) : (style as undefined);

  return { classes, style: definedStyle, props: defined };
}

describe('extractProps parity with the previous implementation', () => {
  for (const [name, defSets] of DEF_SETS) {
    test(`${name}: 2000 randomised prop combinations`, () => {
      const random = makeRandom(0xc0ffee);

      for (let i = 0; i < 2000; i++) {
        const props = makeProps(defSets, random);
        // Each implementation gets its own copy: the legacy one mutates
        // responsive objects in place, which would otherwise leak across runs.
        const expected = legacyExtractProps(clone(props) as never, ...defSets);
        const actual = extractProps(clone(props) as never, ...defSets);

        expect(normalize(actual as never), `iteration ${i}, props ${JSON.stringify(props)}`).toEqual(normalize(expected as never));
      }
    });
  }

  test('does not mutate responsive values passed by the caller', () => {
    const direction = { md: 'row' } as const;
    extractProps({ direction } as never, flexPropDefs as PropDefs);
    expect(direction).toEqual({ md: 'row' });
  });
});
