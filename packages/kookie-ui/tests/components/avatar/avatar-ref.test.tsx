import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { Avatar } from '../../../src/components/index';

describe('Avatar root', () => {
  it('puts ref, className and style on the outer span', () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { container } = renderWithProviders(<Avatar ref={ref} fallback="MK" className="custom" style={{ marginTop: 7 }} />);
    const root = container.querySelector('.kui-AvatarRoot');
    expect(ref.current).toBe(root);
    expect(ref.current?.tagName).toBe('SPAN');
    expect(root).toHaveClass('custom');
    expect(root).toHaveStyle({ marginTop: '7px' });
  });
});

describe('Avatar asChild', () => {
  it('renders onto its child with a status dot inside it', () => {
    const { container } = renderWithProviders(
      <Avatar asChild fallback="KD" status="green" statusLabel="Online">
        <button type="button">Open profile</button>
      </Avatar>,
    );
    const root = container.querySelector('button.kui-AvatarRoot');
    expect(root).not.toBeNull();
    expect(root?.querySelector('.kui-AvatarStatus')).not.toBeNull();
  });
});
