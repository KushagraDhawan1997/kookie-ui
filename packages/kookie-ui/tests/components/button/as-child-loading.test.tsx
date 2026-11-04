import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Button } from '../../../src/components/index';

// asChild merges onto one child, so loading has to put its spinner and label copy inside that
// child, not hand Slot a fragment of siblings.
describe('<Button asChild loading>', () => {
  it('keeps one link carrying the button props, and blocks the click', () => {
    const onClick = vi.fn();
    const ref = React.createRef<HTMLAnchorElement>();
    const { container } = renderWithProviders(
      <Button asChild loading onClick={onClick} ref={ref as React.Ref<HTMLButtonElement>}>
        <a href="/save">Save</a>
      </Button>,
    );
    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(1);
    const link = links[0]!;
    expect(link).toHaveClass('kui-BaseButton');
    expect(link).toHaveAttribute('aria-busy', 'true');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('href', '/save');
    expect(ref.current).toBe(link);
    expect(link.querySelector('.kui-BaseButtonContent')).not.toBeNull();
    expect(link.querySelector('.kui-Spinner')).not.toBeNull();

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps the same link element when loading starts and stops', () => {
    const { rerender, container } = renderWithProviders(
      <Button asChild loading={false}>
        <a href="/save">Save</a>
      </Button>,
    );
    const link = container.querySelector('a')!;
    rerender(
      <Button asChild loading>
        <a href="/save">Save</a>
      </Button>,
    );
    expect(container.querySelector('a')).toBe(link);
    expect(screen.getAllByText('Save').length).toBeGreaterThan(0);
  });
});
