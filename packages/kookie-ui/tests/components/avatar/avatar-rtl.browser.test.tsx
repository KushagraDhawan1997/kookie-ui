import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Avatar, Theme } from '../../../src/components/index';

describe('Avatar status in right-to-left', () => {
  it('sits on the inline end, which is the left edge', () => {
    const { container } = render(
      <Theme>
        <div dir="rtl">
          <Avatar fallback="AB" status="green" />
        </div>
      </Theme>,
    );
    const root = container.querySelector('.kui-AvatarRoot')!.getBoundingClientRect();
    const dot = container.querySelector('.kui-AvatarStatus')!.getBoundingClientRect();
    expect(dot.left).toBeLessThan(root.left + 4);
    expect(dot.right).toBeLessThan(root.left + root.width / 2);
  });
});
