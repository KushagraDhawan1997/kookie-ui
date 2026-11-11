import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TextArea, TextField, Theme } from '../../../src/components/index';

const isTransparent = (color: string) => color === 'transparent' || /\/\s*0\)$|,\s*0\)$/.test(color);
const variants = ['raised', 'outline', 'soft', 'ghost', 'surface'] as const;

function look(kind: 'field' | 'area', variant: (typeof variants)[number], state: 'readOnly' | 'disabled' | 'plain') {
  const props = { variant, defaultValue: 'kookie.design/share/abc', readOnly: state === 'readOnly', disabled: state === 'disabled' };
  const { container, unmount } = render(<Theme>{kind === 'field' ? <TextField.Root {...props} /> : <TextArea {...props} />}</Theme>);
  const input = container.querySelector<HTMLElement>(kind === 'field' ? '.kui-TextFieldInput' : '.kui-TextAreaInput')!;
  const root = input.closest<HTMLElement>(kind === 'field' ? '.kui-TextFieldRoot' : '.kui-TextAreaRoot')!;
  const out = {
    fill: getComputedStyle(root).backgroundColor,
    image: getComputedStyle(root).backgroundImage,
    edge: getComputedStyle(root).boxShadow,
    ink: getComputedStyle(input).color,
  };
  unmount();
  return out;
}

/**
 * A read-only field is not a disabled one: its value is still there to select and copy. In every
 * variant it drops the fill, keeps the variant's edge and keeps the value in the read-only ink.
 */
for (const kind of ['field', 'area'] as const) {
  describe(`a read-only text ${kind}`, () => {
    for (const variant of variants) {
      it(`${variant}: no fill, the plain edge, and not the disabled ink`, () => {
        const readOnly = look(kind, variant, 'readOnly');
        const disabled = look(kind, variant, 'disabled');
        const plain = look(kind, variant, 'plain');
        expect(isTransparent(readOnly.fill)).toBe(true);
        expect(readOnly.image).toBe('none');
        expect(readOnly.edge).toBe(plain.edge);
        expect(readOnly.ink).not.toBe(disabled.ink);
      });
    }
  });
}
