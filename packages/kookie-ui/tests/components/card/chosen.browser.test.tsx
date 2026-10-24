import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Card, Checkbox, Flex, RadioGroup, Theme } from '../../../src/components/index';

const ring = (el: Element) => getComputedStyle(el, '::after').boxShadow;
const tint = (el: Element) => getComputedStyle(el, '::before').backgroundImage;

describe('a Card holding a checked choice reads as chosen', () => {
  it('a checkbox: the card lights when checked and not when unchecked', () => {
    const { container } = render(
      <Theme>
        <Card asChild>
          <label>
            <Flex gap="3">
              <Checkbox defaultChecked />A
            </Flex>
          </label>
        </Card>
        <Card asChild>
          <label>
            <Flex gap="3">
              <Checkbox />B
            </Flex>
          </label>
        </Card>
      </Theme>,
    );
    const [on, off] = container.querySelectorAll('.kui-Card');
    expect(ring(on)).toContain('inset');
    expect(tint(on)).toContain('gradient');
    expect(ring(on)).not.toBe(ring(off));
    expect(tint(off)).not.toBe(tint(on));
  });

  it('a radio group: only the chosen option card lights', () => {
    const { container } = render(
      <Theme>
        <RadioGroup.Root defaultValue="b">
          {['a', 'b'].map((v) => (
            <Card asChild key={v}>
              <label>
                <RadioGroup.Item value={v}>{v}</RadioGroup.Item>
              </label>
            </Card>
          ))}
        </RadioGroup.Root>
      </Theme>,
    );
    const [a, b] = container.querySelectorAll('.kui-Card');
    expect(ring(b)).toContain('inset');
    expect(ring(a)).not.toBe(ring(b));
  });
});

describe('only a Card that is the label of its choice reads as chosen', () => {
  it('a plain Card holding a checked checkbox stays plain', () => {
    const { container } = render(
      <Theme>
        <Card>
          <label>
            <Checkbox defaultChecked /> Email me
          </label>
        </Card>
      </Theme>,
    );
    const card = container.querySelector('.kui-Card')!;
    expect(ring(card)).not.toContain('inset');
    expect(tint(card)).not.toContain('gradient');
  });

  it('an outer Card around a chosen card stays plain', () => {
    const { container } = render(
      <Theme>
        <Card data-outer>
          <Card asChild>
            <label>
              <Checkbox defaultChecked />A
            </label>
          </Card>
        </Card>
      </Theme>,
    );
    const outer = container.querySelector('[data-outer]')!;
    const inner = outer.querySelector('.kui-Card')!;
    expect(ring(inner)).toContain('inset');
    expect(ring(outer)).not.toContain('inset');
  });
});
