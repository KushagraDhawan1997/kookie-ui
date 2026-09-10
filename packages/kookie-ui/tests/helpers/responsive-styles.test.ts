import { describe, expect, test } from 'vitest';

import { getResponsiveClassNames, getResponsiveCustomProperties, getResponsiveStyles } from '../../src/helpers/get-responsive-styles.js';
import { getMarginStyles } from '../../src/helpers/get-margin-styles.js';
import { isResponsiveObject } from '../../src/helpers/is-responsive-object.js';
import { mergeStyles } from '../../src/helpers/merge-styles.js';

const SCALE = ['1', '2', '3'] as const;

describe('getResponsiveClassNames', () => {
  const base = { className: 'rt-r-gap', propValues: SCALE } as const;

  test('a scale value is suffixed onto the class', () => {
    expect(getResponsiveClassNames({ ...base, value: '2' })).toBe('rt-r-gap-2');
  });

  test('an unknown value is rejected unless arbitrary values are allowed', () => {
    expect(getResponsiveClassNames({ ...base, value: '13px' })).toBeUndefined();
    expect(getResponsiveClassNames({ ...base, value: '13px', allowArbitraryValues: true })).toBe('rt-r-gap');
  });

  test('an empty value yields nothing', () => {
    expect(getResponsiveClassNames({ ...base, value: undefined })).toBeUndefined();
    expect(getResponsiveClassNames({ ...base, value: '' })).toBeUndefined();
  });

  test('breakpoints other than initial are prefixed', () => {
    expect(getResponsiveClassNames({ ...base, value: { initial: '1', md: '3' } })).toBe('rt-r-gap-1 md:rt-r-gap-3');
  });

  test('non-breakpoint keys are skipped', () => {
    expect(getResponsiveClassNames({ ...base, value: { md: '3', bogus: '1' } as never })).toBe('md:rt-r-gap-3');
  });

  test('undefined breakpoint values are skipped', () => {
    expect(getResponsiveClassNames({ ...base, value: { initial: undefined, md: '3' } })).toBe('md:rt-r-gap-3');
  });

  test('a value set gives the same answer as scanning the array', () => {
    const withSet = getResponsiveClassNames({ ...base, value: '2', propValueSet: new Set(SCALE) });
    const withArray = getResponsiveClassNames({ ...base, value: '2' });
    expect(withSet).toBe(withArray);

    const missSet = getResponsiveClassNames({
      ...base,
      value: '9',
      propValueSet: new Set(SCALE),
      allowArbitraryValues: true,
    });
    expect(missSet).toBe(getResponsiveClassNames({ ...base, value: '9', allowArbitraryValues: true }));
  });

  test('parseValue rewrites the suffix and negatives move outside the class', () => {
    expect(
      getResponsiveClassNames({
        className: 'rt-r-mt',
        propValues: ['-2'],
        value: '-2',
        parseValue: (v) => v,
      }),
    ).toBe('-rt-r-mt-2');
  });
});

describe('getResponsiveCustomProperties', () => {
  const base = { customProperties: ['--gap'] as `--${string}`[], propValues: SCALE };

  test('a scale value produces no custom property', () => {
    expect(getResponsiveCustomProperties({ ...base, value: '2' })).toBeUndefined();
  });

  test('an arbitrary value produces one property per name', () => {
    expect(
      getResponsiveCustomProperties({
        ...base,
        customProperties: ['--ml', '--mr'],
        value: '13px',
      }),
    ).toEqual({ '--ml': '13px', '--mr': '13px' });
  });

  test('breakpoints other than initial are suffixed onto the property', () => {
    expect(getResponsiveCustomProperties({ ...base, value: { initial: '13px', lg: '20px' } })).toEqual({ '--gap': '13px', '--gap-lg': '20px' });
  });

  test('scale values inside a responsive object are skipped', () => {
    expect(getResponsiveCustomProperties({ ...base, value: { initial: '2', lg: '20px' } })).toEqual({
      '--gap-lg': '20px',
    });
  });

  test('an undefined breakpoint value does not emit an empty property', () => {
    // An emitted `undefined` would win over an earlier real value once merged.
    const result = getResponsiveCustomProperties({ ...base, value: { md: undefined, lg: '20px' } });
    expect(result).toEqual({ '--gap-lg': '20px' });
    expect(mergeStyles({ '--gap-md': '5px' }, result)).toEqual({
      '--gap-md': '5px',
      '--gap-lg': '20px',
    });
  });
});

describe('getResponsiveStyles', () => {
  test('returns class names and custom properties together', () => {
    const [classNames, customProperties] = getResponsiveStyles({
      className: 'rt-r-gap',
      customProperties: ['--gap'],
      propValues: SCALE,
      value: { initial: '2', lg: '20px' },
    });

    expect(classNames).toBe('rt-r-gap-2 lg:rt-r-gap');
    expect(customProperties).toEqual({ '--gap-lg': '20px' });
  });
});

describe('getMarginStyles', () => {
  test('no margin props produce no classes and no styles', () => {
    expect(getMarginStyles({})).toEqual(['', undefined]);
  });

  test('each margin prop maps to its own class', () => {
    const [classNames] = getMarginStyles({ m: '1', mx: '2', my: '3', mt: '4', mr: '5', mb: '6', ml: '7' });
    expect(classNames.split(' ').sort()).toEqual(['rt-r-m-1', 'rt-r-mb-6', 'rt-r-ml-7', 'rt-r-mr-5', 'rt-r-mt-4', 'rt-r-mx-2', 'rt-r-my-3'].sort());
  });

  test('arbitrary margins emit the matching custom properties', () => {
    const [classNames, style] = getMarginStyles({ mx: '13px' });
    expect(classNames).toBe('rt-r-mx');
    expect(style).toEqual({ '--margin-left': '13px', '--margin-right': '13px' });
  });

  test('responsive margins are supported', () => {
    const [classNames] = getMarginStyles({ mt: { initial: '1', md: '4' } });
    expect(classNames).toBe('rt-r-mt-1 md:rt-r-mt-4');
  });

  test('only the props that were passed do any work', () => {
    expect(getMarginStyles({ mt: '2' })[0]).toBe('rt-r-mt-2');
  });
});

describe('isResponsiveObject', () => {
  test('recognises objects keyed by breakpoint', () => {
    expect(isResponsiveObject({ initial: '1' })).toBe(true);
    expect(isResponsiveObject({ md: '1' })).toBe(true);
  });

  test('rejects anything else', () => {
    expect(isResponsiveObject(undefined)).toBe(false);
    expect(isResponsiveObject('3')).toBe(false);
    expect(isResponsiveObject({ nope: '1' } as never)).toBe(false);
    expect(isResponsiveObject(null as never)).toBe(false);
  });
});

describe('mergeStyles', () => {
  test('later styles win and empties are skipped', () => {
    expect(mergeStyles(undefined, { a: '1' }, undefined, { a: '2', b: '3' })).toEqual({
      a: '2',
      b: '3',
    });
  });

  test('returns undefined when there is nothing to merge', () => {
    expect(mergeStyles(undefined, undefined)).toBeUndefined();
  });

  test('does not mutate its inputs', () => {
    const first = { a: '1' };
    mergeStyles(first, { b: '2' });
    expect(first).toEqual({ a: '1' });
  });
});
