import { describe, expect, test } from 'vitest';

import { extractProps } from '../../src/helpers/extract-props.js';
import { baseButtonPropDefs } from '../../src/components/_internal/base-button.props.js';
import { flexPropDefs } from '../../src/components/flex.props.js';
import { textPropDefs } from '../../src/components/text.props.js';
import { layoutPropDefs } from '../../src/props/layout.props.js';
import { marginPropDefs } from '../../src/props/margin.props.js';

import type { PropDef } from '../../src/props/prop-def.js';

type Defs = Record<string, PropDef>;

const FLEX = [flexPropDefs as Defs, layoutPropDefs as Defs, marginPropDefs as Defs] as const;

/** `extractProps` is variadic over prop def records; the casts are only to satisfy that. */
function flex(props: Record<string, unknown>) {
  return extractProps(props as never, ...(FLEX as unknown as Defs[])) as Record<string, unknown>;
}

function classesOf(result: Record<string, unknown>) {
  return String(result.className ?? '')
    .split(' ')
    .filter(Boolean);
}

describe('extractProps: class names', () => {
  test('a scale value becomes a value-suffixed class', () => {
    expect(classesOf(flex({ gap: '3' }))).toContain('rt-r-gap-3');
    expect(classesOf(flex({ direction: 'column' }))).toContain('rt-r-fd-column');
  });

  test('an arbitrary value becomes a bare class plus a custom property', () => {
    const result = flex({ gap: '13px' });
    expect(classesOf(result)).toContain('rt-r-gap');
    expect(classesOf(result)).not.toContain('rt-r-gap-13px');
    expect(result.style).toMatchObject({ '--gap': '13px' });
  });

  test('a negative scale value keeps the minus outside the class name', () => {
    expect(classesOf(flex({ mt: '-3' }))).toContain('-rt-r-mt-3');
  });

  test('several props each contribute their own class', () => {
    const classes = classesOf(flex({ direction: 'column', align: 'center', gap: '3', p: '4' }));
    expect(classes).toEqual(expect.arrayContaining(['rt-r-fd-column', 'rt-r-ai-center', 'rt-r-gap-3', 'rt-r-p-4']));
  });

  test('boolean props contribute a flag class only when true', () => {
    expect(classesOf(extractProps({ truncate: true } as never, textPropDefs as Defs))).toContain('rt-truncate');
    expect(classesOf(extractProps({ truncate: false } as never, textPropDefs as Defs))).not.toContain('rt-truncate');
  });

  test('emphasis contributes a non-responsive class and no class when unset', () => {
    expect(classesOf(extractProps({ emphasis: 'quiet' } as never, textPropDefs as Defs))).toContain('rt-emphasis-quiet');
    expect(classesOf(extractProps({ color: 'red' } as never, textPropDefs as Defs)).some((c) => c.startsWith('rt-emphasis'))).toBe(false);
  });

  test('an unset prop contributes nothing', () => {
    expect(classesOf(flex({}))).toEqual([]);
    expect(flex({}).className).toBe('');
  });

  test('the caller className is preserved and comes last', () => {
    const result = flex({ gap: '2', className: 'mine other' });
    expect(result.className).toBe('rt-r-gap-2 mine other');
  });

  test('a caller className survives even with no styling props', () => {
    expect(flex({ className: 'mine' }).className).toBe('mine');
  });
});

describe('extractProps: enum validation', () => {
  test('an invalid enum value is dropped rather than emitted as a class', () => {
    const classes = classesOf(flex({ direction: 'sideways', align: 'center' }));
    expect(classes).toContain('rt-r-ai-center');
    expect(classes.some((c) => c.startsWith('rt-r-fd'))).toBe(false);
  });

  test('an invalid enum value falls back to the prop def default', () => {
    // `as` has a default of 'div' and is not a styling prop, so it passes through.
    expect(flex({ as: 'section' }).as).toBe('div');
    expect(flex({ as: 'span' }).as).toBe('span');
  });

  test('defaults are applied to props that were not passed', () => {
    expect(flex({}).as).toBe('div');
  });

  test('an enum | string prop accepts arbitrary strings without coercion', () => {
    const result = flex({ width: 'clamp(10rem, 50%, 40rem)' });
    expect(result.style).toMatchObject({ '--width': 'clamp(10rem, 50%, 40rem)' });
  });
});

describe('extractProps: responsive values', () => {
  test('each breakpoint gets a prefixed class', () => {
    const classes = classesOf(flex({ direction: { initial: 'column', md: 'row' } }));
    expect(classes).toContain('rt-r-fd-column');
    expect(classes).toContain('md:rt-r-fd-row');
  });

  test('arbitrary values at a breakpoint get a suffixed custom property', () => {
    const result = flex({ gap: { initial: '2', lg: '17px' } });
    expect(classesOf(result)).toContain('rt-r-gap-2');
    expect(classesOf(result)).toContain('lg:rt-r-gap');
    expect(result.style).toMatchObject({ '--gap-lg': '17px' });
  });

  test('keys that are not breakpoints are ignored', () => {
    const classes = classesOf(flex({ direction: { md: 'row', nonsense: 'row' } }));
    expect(classes).toContain('md:rt-r-fd-row');
    expect(classes.some((c) => c.includes('nonsense'))).toBe(false);
  });

  test('a responsive value on a non-responsive styling prop def emits no class', () => {
    const defs: Defs = {
      tone: { type: 'enum', values: ['a', 'b'], className: 'rt-tone' } as PropDef,
    };
    const result = extractProps({ tone: { initial: 'a', md: 'b' } } as never, defs) as Record<string, unknown>;

    expect(result.className).toBe('');
    expect(result).not.toHaveProperty('tone');
  });

  test('a responsive value on a non-styling enum passes through unchanged', () => {
    // Long-standing behaviour, kept deliberately: the enum coercion skips
    // responsive objects, and a non-styling prop def has no class-name branch to
    // reject them in. Nothing in the library passes a responsive object to a
    // non-responsive prop, but the passthrough is asserted so a change to it is
    // a deliberate one.
    expect(flex({ as: { initial: 'span' } }).as).toEqual({ initial: 'span' });
  });

  test('the caller object is never mutated', () => {
    // Call sites routinely hoist responsive values to module scope; writing the
    // resolved `initial` back into them would corrupt every later render.
    const direction = { md: 'row' };
    const gap = { lg: '4' };
    flex({ direction, gap });
    flex({ direction, gap });

    expect(direction).toEqual({ md: 'row' });
    expect(gap).toEqual({ lg: '4' });
  });

  test('a prop def default is not written back into the caller object', () => {
    // This is the case that actually reaches the write: resolving `initial` from
    // the prop def default only happens when the def has one. `size` does.
    const size = { md: '3' };

    const first = extractProps({ size } as never, baseButtonPropDefs as Defs) as Record<string, unknown>;

    expect(size).toEqual({ md: '3' });
    expect(classesOf(first)).toContain('rt-r-size-2');
    expect(classesOf(first)).toContain('md:rt-r-size-3');
  });

  test('repeated calls with the same hoisted object give the same result', () => {
    const direction = { md: 'row' };
    expect(flex({ direction }).className).toBe(flex({ direction }).className);

    const size = { md: '3' };
    const a = extractProps({ size } as never, baseButtonPropDefs as Defs) as Record<string, unknown>;
    const b = extractProps({ size } as never, baseButtonPropDefs as Defs) as Record<string, unknown>;
    expect(b.className).toBe(a.className);
  });
});

describe('extractProps: styles', () => {
  test('the caller style is merged over generated custom properties', () => {
    const result = flex({ gap: '13px', style: { color: 'red' } });
    expect(result.style).toEqual({ '--gap': '13px', color: 'red' });
  });

  test('the caller style wins on conflict', () => {
    const result = flex({ gap: '13px', style: { '--gap': '99px' } as never });
    expect(result.style).toMatchObject({ '--gap': '99px' });
  });

  test('style is undefined when nothing produced one', () => {
    expect(flex({ gap: '3' }).style).toBeUndefined();
  });
});

describe('extractProps: what reaches the element', () => {
  test('styling props are consumed and never passed through', () => {
    const result = flex({ direction: 'column', gap: '3', p: '4', width: '50%', mt: '2' });
    for (const key of ['direction', 'gap', 'p', 'width', 'mt']) {
      expect(result, `${key} must not reach the element`).not.toHaveProperty(key);
    }
  });

  test('unrelated props pass through untouched', () => {
    const onClick = () => {};
    const result = flex({ gap: '3', id: 'x', 'data-testid': 'y', onClick, children: 'hi' });
    expect(result.id).toBe('x');
    expect(result['data-testid']).toBe('y');
    expect(result.onClick).toBe(onClick);
    expect(result.children).toBe('hi');
  });

  test('prop def keys that were never passed and have no default are not added', () => {
    // Adding a key with an undefined value is invisible to React but makes
    // `'x' in props` checks lie, which components do rely on.
    const result = flex({ gap: '3' });
    expect('asChild' in result).toBe(false);
    expect('overflow' in result).toBe(false);
  });
});

describe('extractProps: prop def precedence', () => {
  test('later prop def records override earlier ones', () => {
    const first: Defs = { size: { type: 'enum', values: ['1'], default: '1' } as PropDef };
    const second: Defs = { size: { type: 'enum', values: ['9'], default: '9' } as PropDef };

    expect(extractProps({} as never, first, second).size).toBe('9');
    expect(extractProps({} as never, second, first).size).toBe('1');
  });
});
