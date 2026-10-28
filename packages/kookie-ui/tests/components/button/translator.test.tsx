import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import { Button } from '../../../src/components/index';

// A page translator (Chrome / Google Translate) swaps a label's text node for its own <font>
// nodes. React then holds a text node that is no longer in the DOM, and must never try to
// remove or move it, or it throws NotFoundError and takes the app down.
function translate(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  for (const t of texts) {
    if (!t.data.trim()) continue;
    const font = document.createElement('font');
    font.textContent = t.data.toUpperCase();
    t.parentNode!.replaceChild(font, t);
  }
}

describe('Button under a page translator', () => {
  for (const start of [false, true]) {
    it(`survives loading toggling from ${start} after the label was translated`, () => {
      function Harness({ loading }: { loading: boolean }) {
        return <Button loading={loading}>Continue</Button>;
      }
      const { container, rerender } = render(<Harness loading={start} />);
      translate(container);
      expect(() => {
        act(() => rerender(<Harness loading={!start} />));
        act(() => rerender(<Harness loading={start} />));
        act(() => rerender(<Harness loading={!start} />));
      }).not.toThrow();
      expect(container.querySelector('button')).toBeTruthy();
    });
  }

  it('survives an icon-and-label button toggling loading', () => {
    function Harness({ loading }: { loading: boolean }) {
      return (
        <Button loading={loading}>
          <svg />
          Sign in
        </Button>
      );
    }
    const { container, rerender } = render(<Harness loading={false} />);
    translate(container);
    expect(() => {
      act(() => rerender(<Harness loading />));
      translate(container);
      act(() => rerender(<Harness loading={false} />));
    }).not.toThrow();
  });
});
