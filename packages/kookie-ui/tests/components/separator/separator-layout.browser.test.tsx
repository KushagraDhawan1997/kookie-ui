import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Flex, Separator, Theme } from '../../../src/components/index';

const rect = (el: Element) => el.getBoundingClientRect();

describe('a vertical separator takes the height of its row', () => {
  it('in a centred auto-height Flex', () => {
    const { container } = render(
      <Theme>
        <Flex align="center">
          <div style={{ height: 40, width: 10 }} />
          <Separator orientation="vertical" />
        </Flex>
      </Theme>,
    );
    expect(rect(container.querySelector('.kui-Separator')!).height).toBe(40);
  });

  it('in a default auto-height Flex', () => {
    const { container } = render(
      <Theme>
        <Flex>
          <div style={{ height: 40, width: 10 }} />
          <Separator orientation="vertical" />
        </Flex>
      </Theme>,
    );
    expect(rect(container.querySelector('.kui-Separator')!).height).toBe(40);
  });

  it('in a block parent with a set height', () => {
    const { container } = render(
      <Theme>
        <div style={{ height: 60 }}>
          <Separator orientation="vertical" />
        </div>
      </Theme>,
    );
    expect(rect(container.querySelector('.kui-Separator')!).height).toBe(60);
  });

  it('when the orientation turns vertical at a breakpoint', () => {
    expect(window.innerWidth).toBeGreaterThanOrEqual(520);
    const { container } = render(
      <Theme>
        <Flex>
          <div style={{ height: 40, width: 10 }} />
          <Separator orientation={{ initial: 'horizontal', xs: 'vertical' }} />
        </Flex>
      </Theme>,
    );
    const r = rect(container.querySelector('.kui-Separator')!);
    expect([r.width, r.height]).toEqual([1, 40]);
  });
});

describe('a squeezed flex parent keeps the line 1px thick', () => {
  it('horizontal in a short column', () => {
    const { container } = render(
      <Theme>
        <Flex direction="column" style={{ height: 20 }}>
          <div style={{ height: 40 }} />
          <Separator />
          <div style={{ height: 40 }} />
        </Flex>
      </Theme>,
    );
    expect(rect(container.querySelector('.kui-Separator')!).height).toBe(1);
  });

  it('vertical in a narrow row', () => {
    const { container } = render(
      <Theme>
        <Flex style={{ width: 50, height: 20 }}>
          <div style={{ width: 80 }} />
          <Separator orientation="vertical" />
          <div style={{ width: 80 }} />
        </Flex>
      </Theme>,
    );
    expect(rect(container.querySelector('.kui-Separator')!).width).toBe(1);
  });

  it('horizontal rules in a row still share it instead of overflowing', () => {
    const { container } = render(
      <Theme>
        <Flex align="center" gap="2" style={{ width: 200 }}>
          <Separator />
          <span>or</span>
          <Separator />
        </Flex>
      </Theme>,
    );
    const [a, b] = container.querySelectorAll('.kui-Separator');
    expect(rect(a).width).toBeLessThan(100);
    expect(rect(b).right).toBeLessThanOrEqual(rect(container.querySelector('.kui-Flex')!).right);
  });
});
